#!/usr/bin/env node

/**
 * Script para testar o jogo manualmente
 * Executa: node scripts/test-game-manual.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class GameTester {
  constructor() {
    this.devProcess = null;
    this.testProcess = null;
  }

  async start() {
    console.log('🎮 Iniciando teste manual do jogo...');
    
    try {
      // Iniciar servidor de desenvolvimento
      console.log('🚀 Iniciando servidor de desenvolvimento...');
      this.devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        cwd: join(__dirname, '..')
      });

      // Aguardar servidor inicializar
      console.log('⏳ Aguardando servidor inicializar...');
      await this.waitForServer();

      // Executar teste de cores
      console.log('🧪 Executando teste de cores...');
      this.testProcess = spawn('node', ['scripts/test-colors.js'], {
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });

      // Aguardar teste terminar
      await new Promise((resolve, reject) => {
        this.testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Teste concluído com sucesso!');
            resolve();
          } else {
            console.log(`❌ Teste falhou com código: ${code}`);
            reject(new Error(`Test failed with code: ${code}`));
          }
        });
      });

    } catch (error) {
      console.error('❌ Erro durante o teste:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async waitForServer() {
    return new Promise((resolve) => {
      let output = '';
      
      this.devProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Local:') || output.includes('localhost:')) {
          console.log('✅ Servidor iniciado!');
          resolve();
        }
      });

      // Timeout de 30 segundos
      setTimeout(() => {
        console.log('⚠️  Timeout aguardando servidor, continuando...');
        resolve();
      }, 30000);
    });
  }

  async cleanup() {
    console.log('🛑 Limpando processos...');
    
    if (this.devProcess) {
      this.devProcess.kill('SIGTERM');
    }
    
    if (this.testProcess) {
      this.testProcess.kill('SIGTERM');
    }

    // Aguardar processos terminarem
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Forçar kill se necessário
    if (this.devProcess) {
      this.devProcess.kill('SIGKILL');
    }
    
    if (this.testProcess) {
      this.testProcess.kill('SIGKILL');
    }
  }
}

// Executar teste
const tester = new GameTester();
tester.start().catch(console.error); 