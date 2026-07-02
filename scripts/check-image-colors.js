#!/usr/bin/env node

/**
 * Script para verificar as cores exatas das imagens dos blocos
 * Executa: node scripts/check-image-colors.js
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageColorChecker {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🔍 Iniciando verificação de cores das imagens...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 800, height: 600 });
  }

  async checkImageColors() {
    try {
      // Criar uma página HTML simples para testar as imagens
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teste de Cores das Imagens</title>
          <style>
            body { margin: 20px; font-family: Arial, sans-serif; }
            .image-test { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
            canvas { border: 1px solid #000; margin: 10px 0; }
            .color-info { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Teste de Cores das Imagens dos Blocos</h1>
          
          <div class="image-test">
            <h3>Brick Vermelho</h3>
            <img id="red" src="/assets/bricks/brick-red.svg" width="64" height="32">
            <canvas id="redCanvas" width="64" height="32"></canvas>
            <div id="redInfo" class="color-info"></div>
          </div>
          
          <div class="image-test">
            <h3>Brick Azul</h3>
            <img id="blue" src="/assets/bricks/brick-blue.svg" width="64" height="32">
            <canvas id="blueCanvas" width="64" height="32"></canvas>
            <div id="blueInfo" class="color-info"></div>
          </div>
          
          <div class="image-test">
            <h3>Brick Verde</h3>
            <img id="green" src="/assets/bricks/brick-green.svg" width="64" height="32">
            <canvas id="greenCanvas" width="64" height="32"></canvas>
            <div id="greenInfo" class="color-info"></div>
          </div>
          
          <div class="image-test">
            <h3>Brick Amarelo</h3>
            <img id="yellow" src="/assets/bricks/brick-yellow.svg" width="64" height="32">
            <canvas id="yellowCanvas" width="64" height="32"></canvas>
            <div id="yellowInfo" class="color-info"></div>
          </div>
          
          <div class="image-test">
            <h3>Brick Roxo</h3>
            <img id="purple" src="/assets/bricks/brick-purple.svg" width="64" height="32">
            <canvas id="purpleCanvas" width="64" height="32"></canvas>
            <div id="purpleInfo" class="color-info"></div>
          </div>
          
          <script>
            function analyzeImage(imgId, canvasId, infoId) {
              const img = document.getElementById(imgId);
              const canvas = document.getElementById(canvasId);
              const info = document.getElementById(infoId);
              const ctx = canvas.getContext('2d');
              
              img.onload = function() {
                // Desenhar imagem no canvas
                ctx.drawImage(img, 0, 0, 64, 32);
                
                // Analisar cores
                const imageData = ctx.getImageData(0, 0, 64, 32);
                const data = imageData.data;
                
                const colors = {};
                let totalPixels = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  const a = data[i + 3];
                  
                  if (a > 0) { // Pixel não transparente
                    totalPixels++;
                    const colorKey = \`\${r},\${g},\${b}\`;
                    colors[colorKey] = (colors[colorKey] || 0) + 1;
                  }
                }
                
                // Encontrar cores dominantes
                const sortedColors = Object.entries(colors)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);
                
                let infoText = \`Total de pixels não transparentes: \${totalPixels}<br>\`;
                infoText += '<strong>Cores dominantes:</strong><br>';
                
                sortedColors.forEach(([color, count]) => {
                  const [r, g, b] = color.split(',').map(Number);
                  const percentage = ((count / totalPixels) * 100).toFixed(1);
                  const hexColor = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
                  infoText += \`• RGB(\${r},\${g},\${b}) = \${hexColor} (\${percentage}%)\<br>\`;
                });
                
                info.innerHTML = infoText;
              };
            }
            
            // Analisar cada imagem
            analyzeImage('red', 'redCanvas', 'redInfo');
            analyzeImage('blue', 'blueCanvas', 'blueInfo');
            analyzeImage('green', 'greenCanvas', 'greenInfo');
            analyzeImage('yellow', 'yellowCanvas', 'yellowInfo');
            analyzeImage('purple', 'purpleCanvas', 'purpleInfo');
          </script>
        </body>
        </html>
      `;
      
      // Navegar para o servidor local
      await this.page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Injetar o conteúdo de teste
      await this.page.evaluate((html) => {
        document.body.innerHTML = html;
      }, htmlContent);
      await this.page.waitForTimeout(3000);
      
      // Capturar informações das cores
      const colorAnalysis = await this.page.evaluate(() => {
        const results = {};
        ['red', 'blue', 'green', 'yellow', 'purple'].forEach(color => {
          const info = document.getElementById(color + 'Info');
          if (info) {
            results[color] = info.innerHTML;
          }
        });
        return results;
      });
      
      // Exibir resultados
      console.log('\n📊 ANÁLISE DE CORES DAS IMAGENS:');
      console.log('=' .repeat(60));
      
      Object.entries(colorAnalysis).forEach(([color, info]) => {
        console.log(`\n🎨 ${color.toUpperCase()}:`);
        console.log(info.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''));
      });
      
      // Capturar screenshot
      await this.page.screenshot({ 
        path: 'tmp/image-color-analysis.png',
        fullPage: true 
      });
      console.log('\n📸 Screenshot salvo em: tmp/image-color-analysis.png');
      
    } catch (error) {
      console.error('❌ Erro durante análise:', error.message);
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
  const checker = new ImageColorChecker();
  
  try {
    await checker.init();
    await checker.checkImageColors();
  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  } finally {
    await checker.cleanup();
  }
}

// Executar análise
main();

export default ImageColorChecker; 