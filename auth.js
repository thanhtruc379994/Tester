const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = path.resolve(__dirname, '23130350_HuynhThiThanhTruc', '.chrome_profile');

if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

// Đóng các tiến trình Chrome cũ để tránh xung đột user-data-dir
try {
    execSync('taskkill /f /im chrome.exe', { stdio: 'ignore' });
} catch (e) {}

console.log('Đang mở Google Chrome gốc của máy tính...');
console.log('Profile lưu tại:', profileDir);

const command = `start "" "${chromePath}" --user-data-dir="${profileDir}" "https://admin-demo.nopcommerce.com/login?ReturnUrl=%2FAdmin"`;
execSync(command, { shell: 'cmd.exe' });

console.log('\n==============================================================');
console.log('Google Chrome đã mở lên màn hình!');
console.log('BÂY GIỜ BẠN HÃY:');
console.log('1. Nhấp tick chọn "Tôi không phải người máy" (Cloudflare)');
console.log('2. Nhấn nút "Log in" để vào trang Admin Dashboard');
console.log('3. Khi thấy trang Dashboard, bạn ĐÓNG CỬA SỔ CHROME ĐÓ LẠI!');
console.log('==============================================================\n');
