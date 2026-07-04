// scripts/test-collision-tracking.js
import puppeteer from 'puppeteer';

async function testCollisionTracking() {
  console.log('🧪 Iniciando teste do sistema de rastreamento de colisões...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 800, height: 600 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Interceptar logs do console
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('📊 Colisão registrada') || 
          text.includes('💥 collide') || 
          text.includes('🏓 Bola bateu') ||
          text.includes('💀 BOLA PERDIDA')) {
        console.log(`🎮 ${text}`);
      }
    });
    
    // Navegar para o jogo
    await page.goto('http://localhost:5173');
    console.log('✅ Página carregada');
    
    // Aguardar o carregamento dos assets
    await page.waitForFunction(() => {
      return document.querySelector('canvas') && 
             !document.body.textContent.includes('Loading...');
    }, { timeout: 10000 });
    console.log('✅ Assets carregados');
    
    // Aguardar um pouco para o jogo inicializar
    await page.waitForTimeout(2000);
    
    // Simular cliques para iniciar o jogo
    const canvas = await page.$('canvas');
    const canvasBox = await canvas.boundingBox();
    
    // Clicar no centro do canvas para iniciar
    await page.mouse.click(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + canvasBox.height / 2
    );
    
    console.log('🎮 Jogo iniciado, aguardando colisões...');
    
    // Aguardar algumas colisões acontecerem
    await page.waitForTimeout(5000);
    
    // Verificar se há dados no IndexedDB
    const collisionData = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const request = indexedDB.open('BrikayaCollisions', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['collisions'], 'readonly');
          const store = transaction.objectStore('collisions');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const collisions = getAllRequest.result;
            resolve({
              total: collisions.length,
              byType: collisions.reduce((acc, collision) => {
                acc[collision.type] = (acc[collision.type] || 0) + 1;
                return acc;
              }, {}),
              recent: collisions.slice(-10).map(c => ({
                type: c.type,
                timestamp: c.timestamp,
                position: c.ballPosition
              }))
            });
          };
          
          getAllRequest.onerror = () => {
            resolve({ error: 'Erro ao ler IndexedDB' });
          };
        };
        
        request.onerror = () => {
          resolve({ error: 'Erro ao abrir IndexedDB' });
        };
      });
    });
    
    console.log('📊 Dados de colisões coletados:');
    console.log(JSON.stringify(collisionData, null, 2));
    
    // Verificar se o botão de estatísticas está presente
    const statsButton = await page.$('button[title="Ver estatísticas de colisões"]');
    if (statsButton) {
      console.log('✅ Botão de estatísticas encontrado');
      
      // Clicar no botão para abrir as estatísticas
      await statsButton.click();
      await page.waitForTimeout(1000);
      
      // Verificar se o modal de estatísticas apareceu
      const statsModal = await page.$('.collision-stats-modal');
      if (statsModal) {
        console.log('✅ Modal de estatísticas aberto');
        
        // Capturar screenshot do modal
        await statsModal.screenshot({ path: 'tmp/collision-stats-modal.png' });
        console.log('📸 Screenshot do modal salvo em tmp/collision-stats-modal.png');
      } else {
        console.log('❌ Modal de estatísticas não encontrado');
      }
    } else {
      console.log('❌ Botão de estatísticas não encontrado');
    }
    
    // Aguardar mais um pouco para ver mais colisões
    await page.waitForTimeout(3000);
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
  }
}

// Executar o teste
testCollisionTracking().catch(console.error); 