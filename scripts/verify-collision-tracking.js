// scripts/verify-collision-tracking.js
import puppeteer from 'puppeteer';

async function verifyCollisionTracking() {
  console.log('🔍 Verificando sistema de rastreamento de colisões...');
  
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
          text.includes('🧱 Colisão') ||
          text.includes('🏓 Colisão') ||
          text.includes('🏠 Colisão') ||
          text.includes('💀 BOLA PERDIDA') ||
          text.includes('💀 Registrando bola perdida')) {
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
    
    // Verificar se o IndexedDB foi inicializado
    const dbStatus = await page.evaluate(() => {
      return new Promise((resolve) => {
        const request = indexedDB.open('BrikayaCollisions', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          resolve({
            dbExists: true,
            storeNames: Array.from(db.objectStoreNames),
            version: db.version
          });
        };
        
        request.onerror = () => {
          resolve({ dbExists: false, error: request.error });
        };
      });
    });
    
    console.log('📊 Status do IndexedDB:', dbStatus);
    
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
    await page.waitForTimeout(8000);
    
    // Verificar dados no IndexedDB
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
            const byType = collisions.reduce((acc, collision) => {
              acc[collision.type] = (acc[collision.type] || 0) + 1;
              return acc;
            }, {});
            
            resolve({
              total: collisions.length,
              byType,
              recent: collisions.slice(-5).map(c => ({
                type: c.type,
                timestamp: new Date(c.timestamp).toLocaleTimeString('pt-BR'),
                position: `(${Math.round(c.ballPosition.x)}, ${Math.round(c.ballPosition.y)})`
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
    
    // Verificar se todos os tipos de colisão foram registrados
    const expectedTypes = ['wall', 'paddle', 'component', 'ceiling', 'ball_lost'];
    const missingTypes = expectedTypes.filter(type => !collisionData.byType[type]);
    
    if (missingTypes.length > 0) {
      console.log(`⚠️ Tipos de colisão não registrados: ${missingTypes.join(', ')}`);
    } else {
      console.log('✅ Todos os tipos de colisão foram registrados!');
    }
    
    // Testar o botão de estatísticas
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
        
        // Verificar se as estatísticas estão sendo exibidas
        const statsText = await page.evaluate(() => {
          const modal = document.querySelector('.collision-stats-modal');
          return modal ? modal.textContent : '';
        });
        
        if (statsText.includes('Total de Colisões:')) {
          console.log('✅ Estatísticas sendo exibidas corretamente');
        } else {
          console.log('❌ Estatísticas não estão sendo exibidas');
        }
      } else {
        console.log('❌ Modal de estatísticas não encontrado');
      }
    } else {
      console.log('❌ Botão de estatísticas não encontrado');
    }
    
    console.log('✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await browser.close();
  }
}

// Executar a verificação
verifyCollisionTracking().catch(console.error); 