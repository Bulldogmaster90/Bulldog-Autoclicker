let mouseIntervalIds = [];        // armazena os intervalos de cada mouse
let currentInterval = 1000;
let currentNumMice = 1;
let targetButton = null;
let isActive = false;
let isMouseOver = false;

function findButton() {
  return document.getElementById('bigCookie');
}

function clickButton() {
  if (targetButton && targetButton.isConnected) {
    targetButton.click();
    // Dispara um evento de clique para garantir compatibilidade
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    targetButton.dispatchEvent(event);
  }
}

// Inicia todos os mouses (cria um setInterval para cada)
function startAllMice() {
  stopAllMice(); // limpa qualquer timer anterior
  for (let i = 0; i < currentNumMice; i++) {
    const id = setInterval(clickButton, currentInterval);
    mouseIntervalIds.push(id);
  }
}

// Para todos os mouses
function stopAllMice() {
  for (const id of mouseIntervalIds) {
    clearInterval(id);
  }
  mouseIntervalIds = [];
}

function onMouseEnter() {
  if (isActive && targetButton && targetButton.isConnected) {
    isMouseOver = true;
    startAllMice();
    targetButton.style.outline = '2px solid red';
  }
}

function onMouseLeave() {
  if (targetButton) {
    isMouseOver = false;
    stopAllMice();
    targetButton.style.outline = '';
  }
}

function setupListeners(button) {
  if (!button) return false;
  button.removeEventListener('mouseenter', onMouseEnter);
  button.removeEventListener('mouseleave', onMouseLeave);
  button.addEventListener('mouseenter', onMouseEnter);
  button.addEventListener('mouseleave', onMouseLeave);
  return true;
}

function clearListeners(button) {
  if (button) {
    button.removeEventListener('mouseenter', onMouseEnter);
    button.removeEventListener('mouseleave', onMouseLeave);
    button.style.outline = '';
  }
}

function activate(intervalMs, numMice) {
  currentInterval = intervalMs;
  currentNumMice = numMice;
  isActive = true;

  targetButton = findButton();
  if (targetButton) {
    setupListeners(targetButton);
    if (targetButton.matches(':hover')) {
      isMouseOver = true;
      startAllMice();
    }
  } else {
    observeForButton();
  }
}

function deactivate() {
  isActive = false;
  stopAllMice();
  if (targetButton) {
    clearListeners(targetButton);
    targetButton = null;
  }
  if (window.buttonObserver) {
    window.buttonObserver.disconnect();
    window.buttonObserver = null;
  }
}

function observeForButton() {
  if (window.buttonObserver) return;
  const observer = new MutationObserver((mutations, obs) => {
    const button = findButton();
    if (button && isActive) {
      targetButton = button;
      setupListeners(targetButton);
      obs.disconnect();
      window.buttonObserver = null;
      if (targetButton.matches(':hover')) {
        isMouseOver = true;
        startAllMice();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.buttonObserver = observer;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    activate(request.interval, request.numMice);
    const buttonExists = !!findButton();
    sendResponse({ status: 'started', buttonFound: buttonExists });
  } else if (request.action === 'stop') {
    deactivate();
    sendResponse({ status: 'stopped' });
  }
  return true;
});
