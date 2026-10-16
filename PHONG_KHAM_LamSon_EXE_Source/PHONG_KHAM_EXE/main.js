const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// Tắt cảnh báo GPU không cần thiết trên một số máy Windows
app.disableHardwareAcceleration();

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'PHÒNG KHÁM ĐA KHOA LAM SƠN – Chia giờ dịch vụ',
    backgroundColor: '#f1f5f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Cho phép localStorage / file:// hoạt động ổn định
      webSecurity: true
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Mở link ngoài bằng trình duyệt hệ thống
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const template = [
    {
      label: 'Tệp',
      submenu: [
        {
          label: 'Tải lại giao diện',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload()
        },
        {
          label: 'Phóng to / thu nhỏ',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        { type: 'separator' },
        { label: 'Thoát', accelerator: 'Alt+F4', role: 'quit' }
      ]
    },
    {
      label: 'Xem',
      submenu: [
        { role: 'zoomIn', label: 'Phóng to' },
        { role: 'zoomOut', label: 'Thu nhỏ' },
        { role: 'resetZoom', label: 'Cỡ chữ mặc định' },
        { type: 'separator' },
        { role: 'toggledevtools', label: 'Công cụ nhà phát triển' }
      ]
    },
    {
      label: 'Trợ giúp',
      submenu: [
        {
          label: 'Giới thiệu',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Giới thiệu',
              message: 'Phòng khám Đa khoa Lam Sơn – Chia giờ dịch vụ',
              detail:
                'Phiên bản desktop (Electron).\n' +
                'Dữ liệu lưu trên máy (localStorage của ứng dụng).\n' +
                'Xuất/nạp Excel cần kết nối mạng lần đầu để tải thư viện (CDN).'
            });
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
