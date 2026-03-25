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

  // Função auxiliar para verificar se a aba é válida (não é chrome://, etc.)
  function isAccessibleUrl(url) {
    if (!url) return false;
    const blockedProtocols = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'data:', 'javascript:'];
    return !blockedProtocols.some(protocol => url.startsWith(protocol));
  }

  // Iniciar
  startBtn.addEventListener('click', async () => {
    const interval = parseInt(intervalInput.value, 10);
    // Agora permite qualquer valor maior que 0
    if (isNaN(interval) || interval <= 0) {
      statusDiv.innerText = 'Intervalo inválido (deve ser um número positivo)';
      return;
    }

    // Salva intervalo
    chrome.storage.local.set({ clickInterval: interval });

    // Obtém a aba ativa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!isAccessibleUrl(tab.url)) {
      statusDiv.innerText = 'Erro: Página interna do navegador não suportada.';
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'start', interval });
      statusDiv.innerText = 'Auto clicker ATIVO';
    } catch (error) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        await chrome.tabs.sendMessage(tab.id, { action: 'start', interval });
        statusDiv.innerText = 'Auto clicker ATIVO';
      } catch (injectError) {
        console.error(injectError);
        statusDiv.innerText = 'Erro: Não foi possível iniciar. Recarregue a página e tente novamente.';
      }
    }
  });

  // Parar
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
      statusDiv.innerText = 'Erro ao parar. Recarregue a página se necessário.';
    }
  });
});
