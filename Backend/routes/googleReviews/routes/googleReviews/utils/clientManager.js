const { MongoClient } = require('mongodb');
const logger = require('../config/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://apiintopdigital:Intopdigital%40123@cluster0.1x3fywt.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'mydatabase';
const COLLECTION_NAME = 'clients';

let CLIENTS = {};
let client; // MongoDB client instance

// Initialize MongoDB connection
async function connectToMongo() {
  try {
    client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

// Load clients from MongoDB
async function loadClients() {
  try {
    await connectToMongo();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const clients = await collection.find({}).toArray();
    CLIENTS = clients.reduce((acc, client) => {
      acc[client.clientId] = client.data;
      return acc;
    }, {});
    logger.info('Loaded clients from MongoDB:', Object.keys(CLIENTS));
  } catch (err) {
    logger.warn('Error loading clients from MongoDB, initializing empty CLIENTS:', err.message);
    CLIENTS = {};
  }
}

// Save a single client to MongoDB
async function saveClient(clientId, clientData) {
  try {
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    await collection.updateOne(
      { clientId },
      { $set: { clientId, data: clientData } },
      { upsert: true }
    );
    logger.info(`Saved client ${clientId} to MongoDB`);
  } catch (err) {
    logger.error('Error saving client to MongoDB:', err.message);
    throw err;
  }
}

// Get all clients
function getClients() {
  return CLIENTS;
}

// Set a client in memory and save to MongoDB
async function setClient(clientId, clientData) {
  CLIENTS[clientId] = clientData;
  await saveClient(clientId, clientData);
}

// Close MongoDB connection (optional, for cleanup)
async function closeConnection() {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
}

module.exports = {
  loadClients,
  saveClient,
  getClients,
  setClient,
  closeConnection,
};