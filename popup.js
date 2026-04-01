document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const intervalInput = document.getElementById('interval');
  const numMiceInput = document.getElementById('numMice');
  const statusDiv = document.getElementById('status');

  // Carrega configurações salvas
  chrome.storage.local.get(['clickInterval', 'clickNumMice'], (data) => {
    if (data.clickInterval) intervalInput.value = data.clickInterval;
    if (data.clickNumMice) numMiceInput.value = data.clickNumMice;
  });

  function isAccessibleUrl(url) {
    if (!url) return false;
    const blocked = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'data:', 'javascript:'];
    return !blocked.some(p => url.startsWith(p));
  }

  startBtn.addEventListener('click', async () => {
    const interval = parseInt(intervalInput.value, 10);
    const numMice = parseInt(numMiceInput.value, 10);

    if (isNaN(interval) || interval <= 0) {
      statusDiv.innerText = 'Intervalo inválido (positivo)';
      return;
    }
    if (isNaN(numMice) || numMice < 1 || numMice > 50) {
      statusDiv.innerText = 'Número de mouses deve estar entre 1 e 50';
      return;
    }

    // Salva configurações
    chrome.storage.local.set({ clickInterval: interval, clickNumMice: numMice });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!isAccessibleUrl(tab.url)) {
      statusDiv.innerText = 'Erro: Página interna não suportada.';
      return;
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'start',
        interval: interval,
        numMice: numMice
      });
      if (response && response.buttonFound === false) {
        statusDiv.innerText = 'Botão #bigCookie não encontrado. Ele pode aparecer depois?';
      } else {
        statusDiv.innerText = `${numMice} mouse(s) ativo(s) (clique a cada ${interval}ms) - Passe o mouse sobre o botão`;
      }
    } catch (error) {
      // Injeta o content script se necessário
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'start',
          interval: interval,
          numMice: numMice
        });
        if (response && response.buttonFound === false) {
          statusDiv.innerText = 'Botão #bigCookie não encontrado.';
        } else {
          statusDiv.innerText = `${numMice} mouse(s) ativo(s) (clique a cada ${interval}ms) - Passe o mouse sobre o botão`;
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
