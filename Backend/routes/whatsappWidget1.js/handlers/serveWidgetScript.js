const logger = require('../config/logger');
const { readWidgets } = require('../utils/fileUtils');
const { sanitizeInput } = require('../utils/sanitize');

async function serveWidgetScript(req, res) {
  const widgetId = sanitizeInput(req.query.widgetId);
  if (!widgetId) {
    logger.warn('Widget ID not provided in /api/whatsapp/widget.js');
    return res.status(400).json({ error: 'Widget ID is required' });
  }

  const widgets = await readWidgets();
  const widget = widgets.find((w) => w.widgetId === widgetId);
  if (!widget) {
    logger.warn(`Widget not found for script: ${widgetId}`);
    return res.status(404).json({ error: 'Widget not found' });
  }

  res.set('Content-Type', 'application/javascript');
  res.send(`
    (function() {
      const widgetId = "${widgetId}";
      const container = document.getElementById("whatsapp-widget-${widgetId}");
      if (!container) {
        console.error("Widget container not found: whatsapp-widget-${widgetId}");
        return;
      }

      // Add styles to the head
      const styleSheet = document.createElement("style");
      styleSheet.innerText = \`
        #whatsapp-widget-${widgetId} {
          position: relative;
          font-family: 'Segoe UI', Helvetica Neue, Helvetica, Arial, sans-serif;
        }
        #whatsapp-widget-${widgetId} .chat-popup {
          display: none;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.2);
          width: min(90vw, 360px);
          max-height: calc(100vh - 60px);
          overflow: hidden;
          position: fixed;
          z-index: 1001;
          border: 1px solid #e9edef;
          transform: translateY(100%);
          opacity: 0;
          box-sizing: border-box;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        #whatsapp-widget-${widgetId} .chat-popup.open {
          transform: translateY(0);
          opacity: 1;
        }
        @media (max-width: 360px) {
          #whatsapp-widget-${widgetId} .chat-popup {
            width: calc(100vw - 20px);
            left: 10px !important;
            right: 10px !important;
          }
        }
        @media (max-height: 500px) {
          #whatsapp-widget-${widgetId} .chat-popup {
            max-height: calc(100vh - 40px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #whatsapp-widget-${widgetId} .chat-popup {
            transition: none;
          }
        }
        #whatsapp-widget-${widgetId} .agent-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #111b21;
        }
        #whatsapp-widget-${widgetId} .floating-button {
          background-color: ${widget.buttonColor || '#25D366'};
          width: clamp(50px, 15vw, 60px);
          height: clamp(50px, 15vw, 60px);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          position: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background-color 0.2s ease;
          z-index: 1002;
        }
        #whatsapp-widget-${widgetId} .floating-button:hover {
          transform: scale(1.05);
        }
        #whatsapp-widget-${widgetId} .floating-button:focus {
          outline: 2px solid ${widget.buttonColor || '#25D366'};
          outline-offset: 2px;
        }
        #whatsapp-widget-${widgetId} .floating-button.active {
          transform: scale(1.1);
        }
        #whatsapp-widget-${widgetId} .red-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 12px;
          height: 12px;
          background-color: #ff0000;
          border-radius: 50%;
          border: 2px solid ${widget.buttonColor || '#25D366'};
          transition: opacity 0.3s ease;
        }
        #whatsapp-widget-${widgetId} .chat-header {
          background-color: #008069;
          color: #fff;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        #whatsapp-widget-${widgetId} .profile-pic {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 12px;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
        #whatsapp-widget-${widgetId} .header-text {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          overflow: hidden;
        }
        #whatsapp-widget-${widgetId} .header-text p:first-child {
          font-weight: 600;
          font-size: 16px;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        #whatsapp-widget-${widgetId} .header-text p:last-child {
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          margin: 2px 0 0 0;
          display: flex;
          align-items: center;
        }
        #whatsapp-widget-${widgetId} .online-status {
          width: 8px;
          height: 8px;
          background-color: #00a884;
          border-radius: 50%;
          margin-right: 6px;
        }
        #whatsapp-widget-${widgetId} .chat-area {
          padding: 12px 8px;
          height: calc(100% - 100px);
          max-height: calc(100vh - 160px);
          overflow-y: auto;
          box-sizing: border-box;
          background-color: #e5ddd5;
          background-image: url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be8c74.png');
          background-repeat: repeat;
          display: flex;
          flex-direction: column;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        #whatsapp-widget-${widgetId} .chat-area::-webkit-scrollbar {
          display: none;
        }
        #whatsapp-widget-${widgetId} .chat-message {
          border-radius: 7.5px;
          max-width: 70%;
          margin-bottom: 4px;
          word-break: break-word;
          overflow-wrap: break-word;
          font-size: 14px;
          color: #111b21;
          white-space: pre-wrap;
          position: relative;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }
        #whatsapp-widget-${widgetId} .chat-message:has(img) {
          box-shadow: none;
          padding: 4px;
        }
        #whatsapp-widget-${widgetId} .chat-message img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 4px;
          object-fit: contain;
          display: block;
        }
        #whatsapp-widget-${widgetId} .chat-message.incoming {
          background-color: #fff;
          align-self: flex-start;
          border-top-left-radius: 0;
          max-width: 50%;
          font-size: 12px;
          padding: 4px 8px;
        }
        #whatsapp-widget-${widgetId} .chat-message.incoming::before {
          content: '';
          position: absolute;
          top: 0;
          left: -7px;
          border-right: 7px solid #fff;
          border-top: 7px solid transparent;
        }
        #whatsapp-widget-${widgetId} .chat-message.outgoing {
          background-color: #d9fdd3;
          align-self: flex-end;
          border-top-right-radius: 0;
        }
        #whatsapp-widget-${widgetId} .chat-message.outgoing::before {
          content: '';
          position: absolute;
          top: 0;
          right: -7px;
          border-left: 7px solid #d9fdd3;
          border-top: 7px solid transparent;
        }
        #whatsapp-widget-${widgetId} .chat-message p {
          margin: 0;
          line-height: 1.4;
        }
        #whatsapp-widget-${widgetId} .chat-message .timestamp {
          font-size: 10px;
          color: #667781;
          text-align: right;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        #whatsapp-widget-${widgetId} .chat-message .timestamp span {
          margin-left: 4px;
          font-size: 11px;
          line-height: 1;
        }
        #whatsapp-widget-${widgetId} .input-area {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: #f0f2f5;
          border-top: 1px solid #e9edef;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
        #whatsapp-widget-${widgetId} .input-area button {
          background: none;
          border: none;
          color: #8696a0;
          margin-right: 8px;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        #whatsapp-widget-${widgetId} .input-area button:hover {
          background-color: #e9edef;
        }
        #whatsapp-widget-${widgetId} .input-area button:focus {
          outline: 2px solid ${widget.buttonColor || '#25D366'};
          outline-offset: 2px;
        }
        #whatsapp-widget-${widgetId} .input-area input {
          flex: 1;
          border: none;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 14px;
          background-color: #fff;
          outline: none;
          box-shadow: none;
        }
        #whatsapp-widget-${widgetId} .input-area input:focus {
          box-shadow: 0 0 0 2px ${widget.buttonColor || '#25D366'};
        }
        #whatsapp-widget-${widgetId} .input-area input::placeholder {
          color: #8696a0;
        }
        #whatsapp-widget-${widgetId} .send-btn {
          background-color: ${widget.buttonColor || '#25D366'};
          border: none;
          color: #fff;
          margin-left: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }
        #whatsapp-widget-${widgetId} .send-btn:hover {
          background-color: #017561;
        }
        #whatsapp-widget-${widgetId} .send-btn:focus {
          outline: 2px solid ${widget.buttonColor || '#25D366'};
          outline-offset: 2px;
        }
        #whatsapp-widget-${widgetId} .attachment-btn {
          background: none;
          border: none;
          color: #8696a0;
          margin-right: 8px;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        #whatsapp-widget-${widgetId} .attachment-btn:hover {
          background-color: #e9edef;
        }
        #whatsapp-widget-${widgetId} .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #fff;
          font-size: 20px;
          padding: 4px;
          margin-left: 12px;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        #whatsapp-widget-${widgetId} .close-btn:hover {
          opacity: 1;
        }
        #whatsapp-widget-${widgetId} .close-btn:focus {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
        #whatsapp-widget-${widgetId} .file-input {
          display: none;
        }
        #whatsapp-widget-${widgetId} .chat-popup-arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #008069;
          bottom: -8px;
          right: clamp(10px, 5vw, 20px);
        }
        #whatsapp-widget-${widgetId} .typing-indicator {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          align-self: flex-start;
          background-color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          border-top-left-radius: 0;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.1);
        }
        #whatsapp-widget-${widgetId} .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #8696a0;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          animation: bounce 1.5s infinite ease-in-out;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        #whatsapp-widget-${widgetId} .error-message {
          display: none;
          color: #d32f2f;
          font-size: 14px;
          text-align: center;
          padding: 20px;
          height: 100%;
          align-items: center;
          justify-content: center;
        }
        #whatsapp-widget-${widgetId} .chat-message.error {
          background-color: #ffebee;
          color: #d32f2f;
          align-self: center;
          border-radius: 8px;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      \`;
      document.head.appendChild(styleSheet);

      // WhatsApp SVG
      const whatsappSvg = '<svg width="28" height="28" viewBox="0 0 24 24"><path fill="#fff" d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S22.2 10.845 22.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z"/></svg>';

      // Fetch widget config
      fetch("${process.env.BASE_URL}/api/whatsapp/widgets/${widgetId}")
        .then(response => {
          if (!response.ok) throw new Error(\`Failed to fetch widget config: \${response.status}\`);
          return response.json();
        })
        .then(config => {
          // Create widget container
          const widgetContainer = document.createElement("div");
          widgetContainer.id = "whatsapp-widget-${widgetId}";
          widgetContainer.setAttribute('role', 'region');
          widgetContainer.setAttribute('aria-label', 'WhatsApp Chat Widget');

          // Create floating button
          const button = document.createElement("button");
          button.className = "floating-button";
          button.style.backgroundColor = config.buttonColor || "#25D366";
          button.style[config.position.includes("right") ? "right" : "left"] = "clamp(10px, 5vw, 20px)";
          button.style[config.position.includes("bottom") ? "bottom" : "top"] = "clamp(10px, 5vh, 20px)";
          button.style.zIndex = "1002";
          button.innerHTML = whatsappSvg;
          button.setAttribute('aria-label', 'Toggle WhatsApp Chat');
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-controls', \`chat-popup-${widgetId}\`);

          // Red dot notification
          const redDot = document.createElement("span");
          redDot.className = "red-dot";
          button.appendChild(redDot);

          // Create chat popup
          const chatPopup = document.createElement("div");
          chatPopup.className = "chat-popup";
          chatPopup.id = \`chat-popup-${widgetId}\`;
          chatPopup.style.display = "none";
          chatPopup.style[config.position.includes("right") ? "right" : "left"] = "clamp(10px, 5vw, 20px)";
          chatPopup.style[config.position.includes("bottom") ? "bottom" : "top"] = "clamp(80px, 15vh, 100px)";
          chatPopup.setAttribute('role', 'dialog');
          chatPopup.setAttribute('aria-hidden', 'true');
          const defaultImage = 'https://cdn-icons-png.flaticon.com/512/3011/3011270.png';
          chatPopup.innerHTML = \`
            <div class="chat-header">
              <div style="display: flex; align-items: center;">
                <div class="profile-pic" style="background-image: url('\${config.greetingImage || defaultImage}');"></div>
                <div class="header-text">
                  <p>\${config.agentName || "Jane Doe"}</p>
                  <p><span class="online-status"></span>\${config.replyTime || "Online"}</p>
                </div>
              </div>
              <button class="close-btn" id="close-btn-${widgetId}" aria-label="Close WhatsApp Chat">×</button>
            </div>
            <div class="chat-area" id="chat-area-${widgetId}" role="log" aria-live="polite"></div>
            <div class="input-area" id="input-area-${widgetId}">
              <button class="attachment-btn" id="attachment-btn-${widgetId}" title="Attach file" aria-label="Attach file">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </button>
              <input
                id="whatsapp-input-${widgetId}"
                type="text"
                placeholder="Type a message..."
                aria-label="Type your message"
              />
              <button class="send-btn" id="send-btn-${widgetId}" title="Send" aria-label="Send message">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
              <input
                type="file"
                id="image-upload-${widgetId}"
                class="file-input"
                accept="image/jpeg,image/png"
                aria-label="Upload image"
              />
            </div>
            <div class="chat-popup-arrow"></div>
            <div class="error-message" id="error-message-${widgetId}" role="alert">Failed to load widget. Please try again later.</div>
          \`;

          // Add image error handling
          const profilePic = chatPopup.querySelector('.profile-pic');
          if (config.greetingImage) {
            const img = new Image();
            img.src = config.greetingImage;
            img.onerror = () => {
              console.warn(\`Failed to load greeting image: \${config.greetingImage}\`);
              profilePic.style.backgroundImage = \`url('\${defaultImage}')\`;
            };
          }

          // Message persistence
          const storageKey = \`whatsapp-chat-${widgetId}\`;
          const getStoredMessages = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
          const saveMessages = (messages) => localStorage.setItem(storageKey, JSON.stringify(messages));

          // Animate popup
          const animatePopup = (open) => {
            const keyframes = open
              ? [
                  { transform: 'translateY(100%)', opacity: 0 },
                  { transform: 'translateY(0)', opacity: 1 }
                ]
              : [
                  { transform: 'translateY(0)', opacity: 1 },
                  { transform: 'translateY(100%)', opacity: 0 }
                ];
            chatPopup.animate(keyframes, {
              duration: 300,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              fill: 'forwards'
            });
          };

          // Focus trap for accessibility
          const focusableElements = chatPopup.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
          const firstFocusable = focusableElements[0];
          const lastFocusable = focusableElements[focusableElements.length - 1];

          const trapFocus = (e) => {
            if (e.key === 'Tab') {
              if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
              } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
              }
            }
          };

          // Toggle chat popup
          let isChatOpen = false;
          button.onclick = () => {
            isChatOpen = !isChatOpen;
            chatPopup.style.display = isChatOpen ? "block" : "none";
            chatPopup.classList.toggle('open', isChatOpen);
            chatPopup.setAttribute('aria-hidden', !isChatOpen);
            button.classList.toggle('active', isChatOpen);
            button.setAttribute('aria-expanded', isChatOpen);
            redDot.style.opacity = isChatOpen ? '0' : '1';

            if (isChatOpen) {
              animatePopup(true);
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const inputArea = chatPopup.querySelector("#input-area-${widgetId}");
              inputArea.style.display = "flex";
              chatPopup.addEventListener('keydown', trapFocus);

              // Load stored messages
              const storedMessages = getStoredMessages();
              chatArea.innerHTML = '';
              storedMessages.forEach(msg => {
                const messageDiv = document.createElement("div");
                messageDiv.className = \`chat-message \${msg.type}\`;
                messageDiv.innerHTML = \`
                  \${msg.content.includes('<img') ? msg.content : \`<p>\${msg.content}</p>\`}
                  <p class="timestamp">\${msg.timestamp} <span>\${msg.type === 'outgoing' ? '✓✓' : ''}</span></p>
                \`;
                if (msg.type === 'outgoing' && msg.delivered) {
                  messageDiv.querySelector('.timestamp span').style.color = '#53bdeb';
                }
                chatArea.appendChild(messageDiv);
              });

              // Show greeting if no messages
              if (!storedMessages.length) {
                const greetingMessage = document.createElement("div");
                greetingMessage.className = "chat-message incoming";
                greetingMessage.innerHTML = \`
                  <p>\${config.greetingMessage || "Welcome to our chat!"}</p>
                  <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                \`;
                chatArea.appendChild(greetingMessage);
                saveMessages([{ type: 'incoming', content: config.greetingMessage || "Welcome to our chat!", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

                setTimeout(() => {
                  const typingIndicator = document.createElement("div");
                  typingIndicator.className = "typing-indicator";
                  typingIndicator.innerHTML = \`
                    <span></span>
                    <span></span>
                    <span></span>
                  \`;
                  chatArea.appendChild(typingIndicator);
                  chatArea.scrollTop = chatArea.scrollHeight;

                  setTimeout(() => {
                    typingIndicator.remove();
                    const welcomeMsg = document.createElement("div");
                    welcomeMsg.className = "chat-message incoming";
                    welcomeMsg.innerHTML = \`
                      <p>\${config.welcomeMessage || "Hi there 🥰 How can I help you?"}</p>
                      <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    \`;
                    chatArea.appendChild(welcomeMsg);
                    chatArea.scrollTop = chatArea.scrollHeight;
                    saveMessages([...getStoredMessages(), { type: 'incoming', content: config.welcomeMessage || "Hi there 🥰 How can I help you?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                  }, Math.random() * 1000 + 1500);
                }, Math.random() * 500 + 1000);
              }

              chatArea.scrollTop = chatArea.scrollHeight;
              const input = chatPopup.querySelector("#whatsapp-input-${widgetId}");
              requestAnimationFrame(() => input.focus());
            } else {
              animatePopup(false);
              setTimeout(() => {
                chatPopup.style.display = "none";
              }, 300);
              chatPopup.removeEventListener('keydown', trapFocus);
            }
          };

          // Keyboard accessibility
          button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              button.click();
            }
          });

          chatPopup.querySelector("#close-btn-${widgetId}").onclick = (e) => {
            e.stopPropagation();
            isChatOpen = false;
            chatPopup.classList.remove('open');
            chatPopup.setAttribute('aria-hidden', 'true');
            button.classList.remove('active');
            button.setAttribute('aria-expanded', 'false');
            redDot.style.opacity = '1';
            animatePopup(false);
            setTimeout(() => {
              chatPopup.style.display = "none";
            }, 300);
            const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
            const inputArea = chatPopup.querySelector("#input-area-${widgetId}");
            inputArea.style.display = "none";
            chatPopup.removeEventListener('keydown', trapFocus);
          };

          chatPopup.querySelector("#close-btn-${widgetId}").addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              chatPopup.querySelector("#close-btn-${widgetId}").click();
            }
          });

          const attachmentBtn = chatPopup.querySelector("#attachment-btn-${widgetId}");
          const imageUploadInput = chatPopup.querySelector("#image-upload-${widgetId}");
          attachmentBtn.onclick = () => {
            console.log('Attachment button clicked');
            imageUploadInput.click();
          };

          imageUploadInput.onchange = (event) => {
            console.log('File input changed');
            const file = event.target.files[0];
            if (!file) {
              console.log('No file selected');
              return;
            }

            const validTypes = ['image/jpeg', 'image/png'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (!validTypes.includes(file.type)) {
              console.log('Invalid file type:', file.type);
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const errorMessage = document.createElement("div");
              errorMessage.className = "chat-message error";
              errorMessage.innerHTML = \`
                <p>Only JPEG or PNG images are allowed.</p>
                <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              \`;
              chatArea.appendChild(errorMessage);
              chatArea.scrollTop = chatArea.scrollHeight;
              imageUploadInput.value = '';
              return;
            }
            if (file.size > maxSize) {
              console.log('File too large:', file.size);
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const errorMessage = document.createElement("div");
              errorMessage.className = "chat-message error";
              errorMessage.innerHTML = \`
                <p>Image size must be less than 5MB.</p>
                <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              \`;
              chatArea.appendChild(errorMessage);
              chatArea.scrollTop = chatArea.scrollHeight;
              imageUploadInput.value = '';
              return;
            }

            console.log('Processing file:', file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
              console.log('FileReader loaded, data URL length:', e.target.result.length);
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const imageMessage = document.createElement("div");
              imageMessage.className = "chat-message outgoing";
              const imgContent = \`<img src="\${e.target.result}" style="max-width: 100%; border-radius: 4px; max-height: 200px; object-fit: contain; display: block;" alt="Uploaded image" />\`;
              imageMessage.innerHTML = \`
                \${imgContent}
                <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span>✓✓</span></p>
              \`;
              chatArea.appendChild(imageMessage);
              chatArea.scrollTop = chatArea.scrollHeight;
              console.log('Image message appended to chat area');
              saveMessages([...getStoredMessages(), { type: 'outgoing', content: imgContent, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), delivered: false }]);

              setTimeout(() => {
                const ticks = imageMessage.querySelector('.timestamp span');
                if (ticks) {
                  ticks.style.color = '#53bdeb';
                  const messages = getStoredMessages();
                  messages[messages.length - 1].delivered = true;
                  saveMessages(messages);
                  console.log('Message marked as delivered');
                }
              }, 1000);

              // Open WhatsApp with image placeholder message
              window.open("https://wa.me/" + config.phoneNumber + "?text=" + encodeURIComponent("Check out this image!"), "_blank");
              imageUploadInput.value = "";
            };
            reader.onerror = () => {
              console.error('FileReader error');
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const errorMessage = document.createElement("div");
              errorMessage.className = "chat-message error";
              errorMessage.innerHTML = \`
                <p>Failed to read the image file.</p>
                <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              \`;
              chatArea.appendChild(errorMessage);
              chatArea.scrollTop = chatArea.scrollHeight;
              imageUploadInput.value = '';
            };
            reader.readAsDataURL(file);
          };

          const sendMessage = () => {
            const input = chatPopup.querySelector("#whatsapp-input-${widgetId}");
            const message = input.value.trim();
            const imageUploadInput = chatPopup.querySelector("#image-upload-${widgetId}");

            if (message || imageUploadInput.files.length > 0) {
              if (message) {
                const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
                const userMessage = document.createElement("div");
                userMessage.className = "chat-message outgoing";
                userMessage.innerHTML = \`
                  <p>\${message}</p>
                  <p class="timestamp">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span>✓✓</span></p>
                \`;
                chatArea.appendChild(userMessage);
                chatArea.scrollTop = chatArea.scrollHeight;
                saveMessages([...getStoredMessages(), { type: 'outgoing', content: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), delivered: false }]);

                setTimeout(() => {
                  const ticks = userMessage.querySelector('.timestamp span');
                  if (ticks) {
                    ticks.style.color = '#53bdeb';
                    const messages = getStoredMessages();
                    messages[messages.length - 1].delivered = true;
                    saveMessages(messages);
                  }
                }, 1000);
              }

              window.open("https://wa.me/" + config.phoneNumber + "?text=" + encodeURIComponent(message || "Check out this image!"), "_blank");
              input.value = "";
              imageUploadInput.value = "";
            }
          };

          chatPopup.querySelector("#send-btn-${widgetId}").onclick = sendMessage;

          chatPopup.querySelector("#send-btn-${widgetId}").addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              sendMessage();
            }
          });

          chatPopup.querySelector("#whatsapp-input-${widgetId}").addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          });

          // Adjust popup height and handle mobile keyboard
          const adjustPopupHeight = () => {
            const popup = chatPopup;
            const maxHeight = window.innerHeight - 60;
            popup.style.maxHeight = \`\${maxHeight}px\`;
            const chatArea = popup.querySelector("#chat-area-${widgetId}");
            const inputArea = popup.querySelector("#input-area-${widgetId}");
            const header = popup.querySelector('.chat-header');
            const headerHeight = header ? header.offsetHeight : 60;
            const inputHeight = inputArea ? inputArea.offsetHeight : 40;
            chatArea.style.height = \`calc(100% - \${headerHeight + inputHeight}px)\`;
            chatArea.style.maxHeight = \`calc(\${maxHeight}px - \${headerHeight + inputHeight}px)\`;
            chatArea.scrollTop = chatArea.scrollHeight;
          };

          const handleKeyboard = () => {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
              window.addEventListener('resize', () => {
                const vh = window.innerHeight;
                chatPopup.style.maxHeight = \`\${vh - 60}px\`;
                const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
                const inputArea = chatPopup.querySelector("#input-area-${widgetId}");
                const header = chatPopup.querySelector('.chat-header');
                const headerHeight = header ? header.offsetHeight : 60;
                const inputHeight = inputArea ? inputArea.offsetHeight : 40;
                chatArea.style.height = \`calc(100% - \${headerHeight + inputHeight}px)\`;
                chatArea.scrollTop = chatArea.scrollHeight;
              });
            }
          };

          window.addEventListener('resize', adjustPopupHeight);
          adjustPopupHeight();
          handleKeyboard();

          widgetContainer.appendChild(button);
          widgetContainer.appendChild(chatPopup);
          container.appendChild(widgetContainer);
        })
        .catch(err => {
          console.error("Failed to load widget:", err);
          const chatPopup = container.querySelector(".chat-popup");
          const errorMessage = container.querySelector("#error-message-${widgetId}");
          if (chatPopup && errorMessage) {
            chatPopup.querySelector("#chat-area-${widgetId}").style.display = "none";
            chatPopup.querySelector("#input-area-${widgetId}").style.display = "none";
            errorMessage.style.display = "flex";
          }
        });
    })();
  `);
}

module.exports = serveWidgetScript;