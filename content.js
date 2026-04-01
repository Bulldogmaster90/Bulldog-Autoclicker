let clickIntervalId = null;
let currentInterval = 1000;
let currentMultiplier = 1;
let targetButton = null;
let isActive = false;
let isMouseOver = false;

function findButton() {
  return document.getElementById('bigCookie');
}

function clickButton() {
  if (targetButton && targetButton.isConnected) {
    // Executa o número de cliques definido pelo multiplicador
    for (let i = 0; i < currentMultiplier; i++) {
      targetButton.click();
      // Também dispara um evento de clique para garantir compatibilidade
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      targetButton.dispatchEvent(event);
    }
  }
}

function startClicking() {
  if (clickIntervalId !== null) stopClicking();
  clickIntervalId = setInterval(clickButton, currentInterval);
}

function stopClicking() {
  if (clickIntervalId !== null) {
    clearInterval(clickIntervalId);
    clickIntervalId = null;
  }
}

function onMouseEnter() {
  if (isActive && targetButton && targetButton.isConnected) {
    isMouseOver = true;
    startClicking();
    targetButton.style.outline = '2px solid red';
  }
}

function onMouseLeave() {
  if (targetButton) {
    isMouseOver = false;
    stopClicking();
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

function activate(intervalMs, multiplier) {
  currentInterval = intervalMs;
  currentMultiplier = multiplier;
  isActive = true;

  targetButton = findButton();
  if (targetButton) {
    setupListeners(targetButton);
    if (targetButton.matches(':hover')) {
      isMouseOver = true;
      startClicking();
    }
  } else {
    observeForButton();
  }
}

function deactivate() {
  isActive = false;
  stopClicking();
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
        startClicking();
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.buttonObserver = observer;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    activate(request.interval, request.multiplier);
    const buttonExists = !!findButton();
    sendResponse({ status: 'started', buttonFound: buttonExists });
  } else if (request.action === 'stop') {
    deactivate();
    sendResponse({ status: 'stopped' });
  }
  return true;
});
