document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const intervalInput = document.getElementById('interval');
  const statusDiv = document.getElementById('status');

  // Carrega intervalo salvo
  chrome.storage.local.get('clickInterval', (data) => {
    if (data.clickInterval) {
      intervalInput.value = data.clickInterval;
    }
  });

  function isAccessibleUrl(url) {
    if (!url) return false;
    const blocked = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'data:', 'javascript:'];
    return !blocked.some(p => url.startsWith(p));
  }

  startBtn.addEventListener('click', async () => {
    const interval = parseInt(intervalInput.value, 10);
    if (isNaN(interval) || interval <= 0) {
      statusDiv.innerText = 'Intervalo inválido (deve ser positivo)';
      return;
    }

    chrome.storage.local.set({ clickInterval: interval });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!isAccessibleUrl(tab.url)) {
      statusDiv.innerText = 'Erro: Página interna não suportada.';
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'start',
        interval: interval
      });
      if (response && response.buttonFound === false) {
        statusDiv.innerText = 'Botão #bigCookie não encontrado. Ele pode aparecer depois?';
      } else {
        statusDiv.innerText = 'Auto clicker ATIVO (passe o mouse sobre o botão)';
      }
    } catch (error) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'start',
          interval: interval
        });
        if (response && response.buttonFound === false) {
          statusDiv.innerText = 'Botão #bigCookie não encontrado.';
        } else {
          statusDiv.innerText = 'Auto clicker ATIVO (passe o mouse sobre o botão)';
        }
      } catch (injectError) {
        statusDiv.innerText = 'Erro ao iniciar. Recarregue a página e tente.';
      }
    }
  });

  stopBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!isAccessibleUrl(tab.url)) {
      statusDiv.innerText = 'Erro: Página interna não suportada.';
      return;
    }
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
      statusDiv.innerText = 'Parado';
    } catch (error) {
      statusDiv.innerText = 'Erro ao parar.';
    }
  });
});
