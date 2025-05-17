const path = require('path');

// Move 3 directories up from the current file to get to project root
const projectRoot = path.join(__dirname, '..', '..', '..');

module.exports = {
  UPLOADS_DIR: path.join(projectRoot, 'uploads'),
  JSON_FILE_PATH: path.join(projectRoot, 'uploads', 'whatsapp.json'),
  DEFAULT_POSITION: 'bottom-right',
  DEFAULT_BUTTON_COLOR: '#25D366',
  DEFAULT_AGENT_NAME: 'Jane Doe',
  DEFAULT_REPLY_TIME: 'Online',
  DEFAULT_GREETING_MESSAGE: ' ',
  DEFAULT_WELCOME_MESSAGE: 'Hi there 🥰 How can I help you?',
  PHONE_REGEX: /^\+\d{10,15}$/,
};
