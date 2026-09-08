const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'cvs.json');

const initialCv = {
  _id: 'default-cv-id',
  name: 'Eslam Yasser - Resume.pdf',
  version: 'v1.0',
  pdfFile: '/assets/pdf/Eslam_Yasser_Resume.pdf',
  originalName: 'Eslam_Yasser_Resume.pdf',
  fileSize: 143708,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function ensureFileExists() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([initialCv], null, 2), 'utf8');
  }
}

function loadCvsFromFile() {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error reading cvs.json:', err);
  }
  return [initialCv];
}

function saveCvsToFile(cvList) {
  ensureFileExists();
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(cvList, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing cvs.json:', err);
  }
}

module.exports = {
  initialCv,
  loadCvsFromFile,
  saveCvsToFile
};
