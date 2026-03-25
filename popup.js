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

  // Iniciar
  startBtn.addEventListener('click', async () => {
    const interval = parseInt(intervalInput.value, 10);
    if (isNaN(interval) || interval < 50) {
      statusDiv.innerText = 'Intervalo inválido (mínimo 50ms)';
      return;
    }

    // Salva intervalo
    chrome.storage.local.set({ clickInterval: interval });

    // Obtém a aba ativa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Envia mensagem para iniciar
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'start', interval });
      statusDiv.innerText = 'Auto clicker ATIVO';
    } catch (error) {
      // Se o content script não estiver carregado, injeta
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // Tenta novamente
      await chrome.tabs.sendMessage(tab.id, { action: 'start', interval });
      statusDiv.innerText = 'Auto clicker ATIVO';
    }
  });

  // Parar
  stopBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'stop' });
      statusDiv.innerText = 'Parado';
    } catch (error) {
      statusDiv.innerText = 'Erro ao parar';
    }
  });
});
