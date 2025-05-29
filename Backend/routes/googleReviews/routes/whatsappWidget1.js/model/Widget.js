const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  widgetId: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  welcomeMessage: { type: String, default: 'Hi there 🥰 How can I help you?' },
  buttonColor: { type: String, default: '#25D366' },
  position: { type: String, default: 'bottom-right' },
  agentName: { type: String, default: 'Jane Doe' },
  replyTime: { type: String, default: 'Online' },
  greetingMessage: { type: String, default: null },
  greetingImage: { type: String, default: null }, // Base64 string for image
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Widget', widgetSchema);