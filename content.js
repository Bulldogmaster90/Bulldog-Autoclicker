let clickIntervalId = null;
let currentInterval = 1000;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Atualiza coordenadas do mouse
document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Simula um clique nas coordenadas atuais
function simulateClick() {
  const element = document.elementFromPoint(mouseX, mouseY);
  if (element) {
    // Dispara um evento de clique completo
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: mouseX,
      clientY: mouseY
    });
    element.dispatchEvent(event);
    // Opcional: também chama o método click() para garantir
    element.click();
  }
}

// Inicia o autoclicker
function startAutoClicker(intervalMs) {
  if (clickIntervalId !== null) stopAutoClicker();
  currentInterval = intervalMs;
  clickIntervalId = setInterval(simulateClick, currentInterval);
}

// Para o autoclicker
function stopAutoClicker() {
  if (clickIntervalId !== null) {
    clearInterval(clickIntervalId);
    clickIntervalId = null;
  }
}

// Escuta mensagens do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    startAutoClicker(request.interval);
    sendResponse({ status: 'started' });
  } else if (request.action === 'stop') {
    stopAutoClicker();
    sendResponse({ status: 'stopped' });
  }
});
