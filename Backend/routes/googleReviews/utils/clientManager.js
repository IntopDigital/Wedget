const fs = require('fs').promises;
const logger = require('../config/logger');
const { CONFIG_FILE } = require('../config/constants');

let CLIENTS = {};

async function loadClients() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    CLIENTS = JSON.parse(data);
    logger.info('Loaded clients:', Object.keys(CLIENTS));
  } catch (err) {
    logger.warn('No clients file found, initializing empty CLIENTS:', err.message);
    CLIENTS = {};
  }
}

async function saveClients() {
  try {
    logger.info('Saving clients:', Object.keys(CLIENTS));
    await fs.writeFile(CONFIG_FILE, JSON.stringify(CLIENTS, null, 2));
    logger.info('Saved clients to file');
  } catch (err) {
    logger.error('Error saving clients:', err.message);
  }
}

function getClients() {
  return CLIENTS;
}

function setClient(clientId, clientData) {
  CLIENTS[clientId] = clientData;
}

module.exports = {
  loadClients,
  saveClients,
  getClients,
  setClient
};