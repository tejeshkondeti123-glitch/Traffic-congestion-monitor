import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = 'C:\\Users\\Tejesh\\.gemini\\antigravity-ide\\brain\\8f5d5465-d389-491d-9947-b6ac1cbacb8d\\.user_uploaded\\media_1788604213376.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');
const data = lines.slice(1).map(line => {
  const values = line.split(',');
  return headers.reduce((obj, header, index) => {
    obj[header.trim()] = isNaN(values[index]) ? values[index].trim() : Number(values[index]);
    return obj;
  }, {});
});

fs.mkdirSync(path.join(__dirname, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src/data/traffic.json'), JSON.stringify(data, null, 2));
console.log('Successfully created src/data/traffic.json');
