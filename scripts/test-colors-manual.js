#!/usr/bin/env node

/**
 * Script para testar manualmente as cores do jogo
 * Executa: node scripts/test-colors-manual.js
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManualColorTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.serverProcess = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async startServer() {
    console.log('🚀 Iniciando servidor HTTP simples...');
    
    // Verificar se o build existe
    if (!fs.existsSync('dist')) {
      throw new Error('Build não encontrado. Execute "npm run build" primeiro.');
    }
    
    // Iniciar servidor HTTP simples
    this.serverProcess = spawn('python3', ['-m', 'http.server', '8080'], {
      cwd: 'dist',
      stdio: 'pipe'
    });
    
    // Aguardar servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Servidor iniciado em http://localhost:8080');
  }

  async init() {
    console.log('🚀 Iniciando teste manual de cores...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Mostrar browser para debug
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Configurar viewport
    await this.page.setViewport({ width: 800, height: 600 });
  }

  async testColors() {
    try {
      // Navegar para o jogo
      const gameUrl = 'http://localhost:8080';
      console.log(`📱 Navegando para: ${gameUrl}`);
      
      await this.page.goto(gameUrl, { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Aguardar o jogo carregar
      console.log('⏳ Aguardando carregamento do jogo...');
      await this.page.waitForTimeout(5000);
      
      // Verificar se o canvas existe
      const canvasExists = await this.page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return !!canvas;
      });
      
      if (!canvasExists) {
        throw new Error('Canvas não encontrado na página');
      }
      
      console.log('✅ Canvas encontrado, verificando cores...');
      
      // Executar validação de cores no browser
      const colorValidation = await this.page.evaluate(async () => {
        const ColorValidator = {
          checkCanvasForColor: (canvas, targetColor, tolerance = 10) => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return false;
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const hexToRgb = (hex) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
              } : null;
            };
            
            const isColorSimilar = (r1, g1, b1, r2, g2, b2, tolerance) => {
              return Math.abs(r1 - r2) <= tolerance &&
                     Math.abs(g1 - g2) <= tolerance &&
                     Math.abs(b1 - b2) <= tolerance;
            };
            
            const targetRGB = hexToRgb(targetColor);
            if (!targetRGB) return false;
            
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              if (isColorSimilar(r, g, b, targetRGB.r, targetRGB.g, targetRGB.b, tolerance)) {
                return true;
              }
            }
            
            return false;
          }
        };
        
        const canvas = document.querySelector('canvas');
        if (!canvas) return { error: 'Canvas não encontrado' };
        
        // Verificar cores com tolerâncias diferentes
        const hasBluePixels = ColorValidator.checkCanvasForColor(canvas, '#00d4ff', 20);
        const hasRedPixels = ColorValidator.checkCanvasForColor(canvas, '#ff0000', 100);
        const hasGreenPixels = ColorValidator.checkCanvasForColor(canvas, '#00ff00', 150);
        const hasYellowPixels = ColorValidator.checkCanvasForColor(canvas, '#ffff00', 100);
        const hasPurplePixels = ColorValidator.checkCanvasForColor(canvas, '#800080', 100);
        
        return {
          hasBluePixels,
          hasRedPixels,
          hasGreenPixels,
          hasYellowPixels,
          hasPurplePixels,
          hasColoredPixels: hasRedPixels || hasGreenPixels || hasYellowPixels || hasPurplePixels
        };
      });
      
      // Analisar resultados
      console.log('🔍 Resultados da validação de cores:');
      console.log('  - Pixels azuis (fallback):', colorValidation.hasBluePixels ? '❌ DETECTADO' : '✅ NÃO DETECTADO');
      console.log('  - Pixels vermelhos:', colorValidation.hasRedPixels ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      console.log('  - Pixels verdes:', colorValidation.hasGreenPixels ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      console.log('  - Pixels amarelos:', colorValidation.hasYellowPixels ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      console.log('  - Pixels roxos:', colorValidation.hasPurplePixels ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      
      // Determinar se o teste passou
      if (colorValidation.hasColoredPixels && !colorValidation.hasBluePixels) {
        console.log('✅ TESTE PASSOU: Components coloridos detectados, sem fallback azul');
        this.results.passed++;
      } else if (colorValidation.hasBluePixels) {
        console.log('❌ TESTE FALHOU: Detectado fallback azul - problema com carregamento de imagens');
        this.results.failed++;
        this.results.errors.push('Fallback azul detectado - imagens não carregaram corretamente');
      } else if (!colorValidation.hasColoredPixels) {
        console.log('❌ TESTE FALHOU: Nenhum component colorido detectado');
        this.results.failed++;
        this.results.errors.push('Nenhum component colorido detectado na tela');
      }
      
      // Capturar screenshot para debug
      await this.page.screenshot({ 
        path: 'tmp/manual-color-test-screenshot.png',
        fullPage: true 
      });
      console.log('📸 Screenshot salvo em: tmp/manual-color-test-screenshot.png');
      
      // Aguardar input do usuário
      console.log('\n⏸️ Pressione Enter para continuar...');
      await new Promise(resolve => {
        process.stdin.once('data', resolve);
      });
      
    } catch (error) {
      console.error('❌ Erro durante o teste:', error.message);
      this.results.failed++;
      this.results.errors.push(error.message);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('🛑 Servidor parado');
    }
  }

  printSummary() {
    console.log('\n📊 RESUMO DO TESTE:');
    console.log(`  ✅ Passou: ${this.results.passed}`);
    console.log(`  ❌ Falhou: ${this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS:');
      this.results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    const exitCode = this.results.failed > 0 ? 1 : 0;
    console.log(`\n🏁 Código de saída: ${exitCode}`);
    
    return exitCode;
  }
}

// Função principal
async function main() {
  const tester = new ManualColorTester();
  
  try {
    await tester.startServer();
    await tester.init();
    await tester.testColors();
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  } finally {
    await tester.cleanup();
    const exitCode = tester.printSummary();
    process.exit(exitCode);
  }
}

// Executar teste
main();

export default ManualColorTester; 