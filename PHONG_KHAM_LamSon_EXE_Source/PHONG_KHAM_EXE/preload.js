// Preload tối giản – giữ an toàn, không expose Node cho trang HTML
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  isDesktop: true,
  platform: process.platform
});
