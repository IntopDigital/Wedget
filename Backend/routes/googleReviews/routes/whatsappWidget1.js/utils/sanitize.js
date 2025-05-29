const sanitizeHtml = require('sanitize-html');

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

module.exports = { sanitizeInput };