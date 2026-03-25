let clickIntervalId = null;
let currentInterval = 1000;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

console.log('✅ Content script do Auto Clicker carregado');

// Atualiza coordenadas do mouse
document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Simula um clique
function simulateClick() {
  console.log(`🖱️ Tentando clicar em (${mouseX}, ${mouseY})`);
  const element = document.elementFromPoint(mouseX, mouseY);
  if (element) {
    console.log(`🎯 Elemento: ${element.tagName}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className : ''}`);
    // Dispara eventos completos
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: mouseX,
      clientY: mouseY
    });
    element.dispatchEvent(clickEvent);
    // Fallback: chama o método click() nativo
    element.click();
  } else {
    console.warn('⚠️ Nenhum elemento encontrado na posição');
  }
}

function startAutoClicker(intervalMs) {
  if (clickIntervalId !== null) stopAutoClicker();
  currentInterval = intervalMs;
  clickIntervalId = setInterval(simulateClick, currentInterval);
  console.log(`✅ Auto clicker iniciado com intervalo ${intervalMs}ms`);
}

function stopAutoClicker() {
  if (clickIntervalId !== null) {
    clearInterval(clickIntervalId);
    clickIntervalId = null;
    console.log('⏹️ Auto clicker parado');
  }
}

// Listener de mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Mensagem recebida:', request);
  if (request.action === 'start') {
    startAutoClicker(request.interval);
    sendResponse({ status: 'started' });
  } else if (request.action === 'stop') {
    stopAutoClicker();
    sendResponse({ status: 'stopped' });
  }
  return true; // Necessário para sendResponse assíncrono
});
