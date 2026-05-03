const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'FuturesCalculator.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all $ characters that are not immediately followed by {
content = content.replace(/\$(?!\{)/g, 'USDT ');

fs.writeFileSync(filePath, content);
console.log('Successfully replaced all $ with USDT in FuturesCalculator.jsx');
