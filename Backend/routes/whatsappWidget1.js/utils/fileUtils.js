const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
const { UPLOADS_DIR, JSON_FILE_PATH } = require('../config/constants');

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR);
    logger.info('Created uploads directory');
  }
}

async function initializeJsonFile() {
  try {
    await fs.access(JSON_FILE_PATH);
  } catch {
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify([]));
    logger.info('Initialized whatsapp.json file');
  }
}

async function readWidgets() {
  try {
    const data = await fs.readFile(JSON_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    logger.error('Error reading JSON file:', err);
    return [];
  }
}

async function writeWidgets(widgets) {
  try {
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(widgets, null, 2));
  } catch (err) {
    logger.error('Error writing to JSON file:', err);
    throw err;
  }
}

async function deleteOldImage(imagePath) {
  if (imagePath) {
    try {
      const relativePath = imagePath.startsWith('http')
        ? imagePath.replace(`${process.env.BASE_URL}`, '')
        : imagePath;
      const fullPath = path.join(__dirname, '../..', relativePath);
      await fs.unlink(fullPath);
      logger.info(`Deleted old image: ${relativePath}`);
    } catch (err) {
      logger.error(`Error deleting old image ${imagePath}:`, err);
    }
  }
}

module.exports = {
  ensureUploadsDir,
  initializeJsonFile,
  readWidgets,
  writeWidgets,
  deleteOldImage,
};