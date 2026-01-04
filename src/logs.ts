let appLogs = [];

export function addLog(message) {
  const logList = document.getElementById('log-list');
  const timestamp = new Date().toLocaleTimeString();
  
  appLogs.push({ timestamp, message });

  if (!logList) return; 

  // Clear "No logs" placeholder on first log
  if (appLogs.length === 1) logList.innerHTML = ''; 

  const item = document.createElement('md-list-item');
  const content = document.createElement('div');
  content.slot = 'headline';
  
  
  content.innerHTML = `<span style="opacity:0.6; margin-right:2px">[${timestamp}]</span> ${message}`;
  
  item.appendChild(content);
  logList.appendChild(item);
  logList.appendChild(document.createElement('md-divider'));
  
  // Auto-scroll to bottom
  const container = document.querySelector('.log-container');
  if(container) container.scrollTop = container.scrollHeight;
}

export function removeLastLog() {
  if (appLogs.length === 0) return;

  appLogs.pop();

  const logList = document.getElementById('log-list');
  if (logList) {
    if (logList.lastElementChild) logList.lastElementChild.remove();
    if (logList.lastElementChild) logList.lastElementChild.remove();

    // empty
    if (appLogs.length === 0) {
      logList.innerHTML = '<md-list-item><div slot="headline">No logs yet.</div></md-list-item>';
    }
  }
}

export function initLogger() {
  const bugBtn = document.getElementById('debug-btn');
  const logDialog = document.getElementById('log-dialog');
  const clearBtn = document.getElementById('clear-logs-btn');
  const closeBtn = document.getElementById('close-logs-btn');

  bugBtn.addEventListener('click', () => logDialog.show());

  clearBtn.addEventListener('click', () => {
    appLogs = [];
    const list = document.getElementById('log-list');
    if(list) list.innerHTML = '<md-list-item><div slot="headline">Logs cleared.</div></md-list-item>';
  });
  
  closeBtn.addEventListener('click', () => logDialog.close());
}