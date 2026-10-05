const mongoose = require('mongoose');

let isConnected = false;
let memoryLogs = [];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api_security_db', {
      serverSelectionTimeoutMS: 2000 // Quick timeout if MongoDB is not running locally
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Local MongoDB connection unavailable (${error.message}).`);
    console.warn(`[MongoDB] Operating in hybrid fallback mode with In-Memory Log Store so demo works seamlessly!`);
  }
};

const isDbConnected = () => isConnected;

const getMemoryLogs = () => memoryLogs;

const addMemoryLog = (logEntry) => {
  memoryLogs.unshift(logEntry);
  if (memoryLogs.length > 500) {
    memoryLogs.pop();
  }
};

const clearMemoryLogs = () => {
  memoryLogs = [];
};

module.exports = {
  connectDB,
  isDbConnected,
  getMemoryLogs,
  addMemoryLog,
  clearMemoryLogs
};
