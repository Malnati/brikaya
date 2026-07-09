// scripts/test-game-logging.js
// Script para testar o sistema de logging do jogo

console.log('🧪 Iniciando teste do sistema de logging do jogo...');

// Simular alguns eventos de teste
async function testGameLogging() {
  try {
    // Aguardar um pouco para o IndexedDB inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📊 Verificando se o GameLogger está disponível...');
    
    // Verificar se o gameLogger está disponível no window
    if (typeof window !== 'undefined' && window.gameLogger) {
      console.log('✅ GameLogger encontrado no window');
      
      // Testar recuperação de eventos
      const events = await window.gameLogger.getRecentEvents(10);
      console.log(`📋 Eventos recentes encontrados: ${events.length}`);
      
      if (events.length > 0) {
        console.log('📊 Primeiro evento:', events[0]);
      }
      
      // Testar estatísticas
      const stats = await window.gameLogger.getGameStats();
      console.log('📈 Estatísticas do jogo:', stats);
      
    } else {
      console.log('⚠️ GameLogger não encontrado no window');
      
      // Tentar acessar via import dinâmico
      try {
        const { gameLogger } = await import('../src/storage/gameLogger.ts');
        console.log('✅ GameLogger importado com sucesso');
        
        // Testar recuperação de eventos
        const events = await gameLogger.getRecentEvents(10);
        console.log(`📋 Eventos recentes encontrados: ${events.length}`);
        
        if (events.length > 0) {
          console.log('📊 Primeiro evento:', events[0]);
        }
        
        // Testar estatísticas
        const stats = await gameLogger.getGameStats();
        console.log('📈 Estatísticas do jogo:', stats);
        
      } catch (importError) {
        console.error('❌ Erro ao importar GameLogger:', importError);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Função para limpar logs de teste
async function clearTestLogs() {
  try {
    if (typeof window !== 'undefined' && window.gameLogger) {
      await window.gameLogger.clearAllEvents();
      console.log('🗑️ Logs de teste limpos');
    }
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error);
  }
}

// Função para criar eventos de teste
async function createTestEvents() {
  try {
    if (typeof window !== 'undefined' && window.gameLogger) {
      const testGameState = {
        score: 100,
        ballsCount: 1,
        componentsRemaining: 5,
        gameWon: false,
        gameOver: false,
        level: 1
      };
      
      const testBallPositions = [
        { x: 240, y: 160, velocity: { dx: 3, dy: -3 } }
      ];
      
      const testPaddlePosition = {
        x: 200,
        y: 300,
        width: 80,
        height: 10
      };
      
      // Criar alguns eventos de teste
      await window.gameLogger.logGameStart(testGameState, testBallPositions, testPaddlePosition);
      await window.gameLogger.logScoreUpdate(testGameState, testBallPositions, testPaddlePosition, 10, 'test_component_destroyed');
      await window.gameLogger.logComponentDestroyed(
        testGameState,
        testBallPositions,
        testPaddlePosition,
        { x: 100, y: 50, width: 40, height: 20 },
        { col: 2, row: 1 },
        0,
        { x: 240, y: 160 }
      );
      await window.gameLogger.logCollision(
        testGameState,
        testBallPositions,
        testPaddlePosition,
        {
          type: 'wall',
          ballPosition: { x: 240, y: 160 },
          wallType: 'right'
        }
      );
      await window.gameLogger.logGameEnd(testGameState, testBallPositions, testPaddlePosition, 'win');
      
      console.log('✅ Eventos de teste criados com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao criar eventos de teste:', error);
  }
}

// Expor funções para uso no console do navegador
if (typeof window !== 'undefined') {
  window.testGameLogging = testGameLogging;
  window.clearTestLogs = clearTestLogs;
  window.createTestEvents = createTestEvents;
  
  console.log('🔧 Funções de teste disponíveis:');
  console.log('  - testGameLogging() - Testar o sistema de logging');
  console.log('  - clearTestLogs() - Limpar logs de teste');
  console.log('  - createTestEvents() - Criar eventos de teste');
}

// Executar teste automaticamente se estiver em ambiente de teste
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  testGameLogging();
}

export { testGameLogging, clearTestLogs, createTestEvents }; 