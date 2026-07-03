#!/usr/bin/env node

/**
 * Script para diagnosticar problemas com cores dos blocos
 * Executa: node scripts/diagnose-colors.js
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ColorDiagnostic {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🔍 Iniciando diagnóstico de cores...');
    
    this.browser = await puppeteer.launch({
      headless: true, // Modo headless para evitar problemas
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    
    // Configurar viewport
    await this.page.setViewport({ width: 800, height: 600 });
  }

  async diagnoseColors() {
    try {
      // Navegar para o jogo
      const gameUrl = 'http://localhost:5173'; // URL do Vite
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
      
      // Executar diagnóstico detalhado no browser
      const diagnostic = await this.page.evaluate(async () => {
        // Verificar se as imagens estão carregadas
        const checkImageLoad = (src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ src, loaded: true, error: null });
            img.onerror = (error) => resolve({ src, loaded: false, error: error.message });
            img.src = src;
          });
        };
        
        // Lista de imagens para verificar
        const imagesToCheck = [
          '/assets/visual/bricks/spr-brick-basic-red-normal.svg',
          '/assets/visual/bricks/spr-brick-basic-blue-normal.svg',
          '/assets/visual/bricks/spr-brick-basic-green-normal.svg',
          '/assets/visual/bricks/spr-brick-basic-yellow-normal.svg',
          '/assets/visual/bricks/spr-brick-basic-purple-normal.svg'
        ];
        
        // Verificar carregamento de cada imagem
        const imageResults = await Promise.all(
          imagesToCheck.map(src => checkImageLoad(src))
        );
        
        // Verificar cores no canvas
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Função para verificar cor específica
        const checkColor = (targetColor, tolerance = 20) => {
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
        };
        
        // Verificar cores específicas com tolerâncias ajustadas
        const colorChecks = {
          blue: checkColor('#00d4ff', 20), // Fallback
          red: checkColor('#ff0000', 100),
          green: checkColor('#00ff00', 150),
          yellow: checkColor('#ffff00', 100),
          purple: checkColor('#800080', 100)
        };
        
        return {
          imageResults,
          colorChecks,
          canvasSize: { width: canvas.width, height: canvas.height }
        };
      });
      
      // Analisar resultados
      console.log('\n📊 DIAGNÓSTICO DETALHADO:');
      console.log('\n🖼️  Status das imagens:');
      diagnostic.imageResults.forEach(result => {
        const status = result.loaded ? '✅' : '❌';
        console.log(`  ${status} ${result.src}: ${result.loaded ? 'Carregada' : 'Falha - ' + result.error}`);
      });
      
      console.log('\n🎨 Cores detectadas no canvas:');
      console.log(`  Azul (fallback): ${diagnostic.colorChecks.blue ? '✅ DETECTADO' : '❌ NÃO DETECTADO'}`);
      console.log(`  Vermelho: ${diagnostic.colorChecks.red ? '✅ DETECTADO' : '❌ NÃO DETECTADO'}`);
      console.log(`  Verde: ${diagnostic.colorChecks.green ? '✅ DETECTADO' : '❌ NÃO DETECTADO'}`);
      console.log(`  Amarelo: ${diagnostic.colorChecks.yellow ? '✅ DETECTADO' : '❌ NÃO DETECTADO'}`);
      console.log(`  Roxo: ${diagnostic.colorChecks.purple ? '✅ DETECTADO' : '❌ NÃO DETECTADO'}`);
      
      console.log(`\n📐 Tamanho do canvas: ${diagnostic.canvasSize.width}x${diagnostic.canvasSize.height}`);
      
      // Capturar screenshot para debug
      await this.page.screenshot({ 
        path: 'tmp/diagnostic-screenshot.png',
        fullPage: true 
      });
      console.log('\n📸 Screenshot salvo em: tmp/diagnostic-screenshot.png');
      
      // Fechar browser após diagnóstico
      console.log('\n🔍 Diagnóstico concluído.');
      
    } catch (error) {
      console.error('❌ Erro durante o diagnóstico:', error.message);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Função principal
async function main() {
  const diagnostic = new ColorDiagnostic();
  
  try {
    await diagnostic.init();
    await diagnostic.diagnoseColors();
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  } finally {
    await diagnostic.cleanup();
  }
}

// Executar diagnóstico
main();

export default ColorDiagnostic; 