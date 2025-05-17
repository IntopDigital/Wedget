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

      // Add Tailwind CSS
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                whatsapp: {
                  primary: '#008069',
                  secondary: '#25D366',
                  light: '#d9fdd3',
                  dark: '#005c4b',
                  bg: '#e5ddd5',
                  'bg-pattern': 'url(https://web.whatsapp.com/img/bg-chat-tile-light_a4be8c74.png)'
                }
              }
            }
          }
        };
      };
      document.head.appendChild(script);

      const styleSheet = document.createElement("style");
      styleSheet.innerText = \`
        #whatsapp-widget-${widgetId} .chat-popup {
          transform: translateY(100%);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        #whatsapp-widget-${widgetId} .chat-popup.open {
          transform: translateY(0);
        }
        #whatsapp-widget-${widgetId} .chat-message.incoming {
          background-color: #ffffff;
          border-top-left-radius: 0;
        }
        #whatsapp-widget-${widgetId} .chat-message.outgoing {
          background-color: #d9fdd3;
          border-top-right-radius: 0;
        }
        #whatsapp-widget-${widgetId} .chat-message.incoming::before {
          content: '';
          position: absolute;
          top: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 8px 12px 0;
          border-color: transparent #ffffff transparent transparent;
        }
        #whatsapp-widget-${widgetId} .chat-message.outgoing::before {
          content: '';
          position: absolute;
          top: 0;
          right: -8px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 12px 8px;
          border-color: transparent transparent #d9fdd3 transparent;
        }
        #whatsapp-widget-${widgetId} .chat-popup-arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #008069;
          bottom: -8px;
          right: 20px;
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        #whatsapp-widget-${widgetId} .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        #whatsapp-widget-${widgetId} .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #667781;
          margin: 0 2px;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(1) {
          animation: bounce 1.5s infinite ease-in-out;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(2) {
          animation: bounce 1.5s 0.2s infinite ease-in-out;
        }
        #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(3) {
          animation: bounce 1.5s 0.4s infinite ease-in-out;
        }
        #whatsapp-widget-${widgetId} .chat-message {
          box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
        }
        #whatsapp-widget-${widgetId} .chat-header {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      \`;
      document.head.appendChild(styleSheet);

      // WhatsApp SVG
      const whatsappSvg = '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.73.244-1.088 0-.058 0-.144-.03-.215-.1-.172-2.434-1.39-2.678-1.39zm-2.908 7.593c-1.747 0-3.48-.53-4.942-1.49L7.793 24.41l1.132-3.337a8.955 8.955 0 0 1-1.72-5.272c0-4.955 4.04-8.995 8.997-8.995S22.2 10.845 22.2 15.8c0 4.958-4.04 8.998-8.998 8.998zm0-19.798c-5.96 0-10.8 4.842-10.8 10.8 0 1.964.53 3.898 1.546 5.574L5 27.176l5.974-1.92a10.807 10.807 0 0 0 16.03-9.455c0-5.958-4.842-10.8-10.802-10.8z"/></svg>';

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
          widgetContainer.className = "font-sans";
          widgetContainer.setAttribute('role', 'region');
          widgetContainer.setAttribute('aria-label', 'WhatsApp Chat Widget');

          // Create floating button
          const button = document.createElement("button");
          button.className = "fixed flex items-center justify-center rounded-full shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform duration-200 z-[1002]";
          button.style.backgroundColor = config.buttonColor || "#25D366";
          button.style[config.position.includes("right") ? "right" : "left"] = "20px";
          button.style[config.position.includes("bottom") ? "bottom" : "top"] = "20px";
          button.style.width = "60px";
          button.style.height = "60px";
          button.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
          button.innerHTML = whatsappSvg;
          button.setAttribute('aria-label', 'Toggle WhatsApp Chat');
          button.setAttribute('aria-expanded', 'false');
          button.setAttribute('aria-controls', \`chat-popup-${widgetId}\`);

          // Red dot notification
          const redDot = document.createElement("span");
          redDot.className = "absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white transition-opacity duration-300";
          redDot.style.borderColor = config.buttonColor || "#25D366";
          button.appendChild(redDot);

          // Create chat popup
          const chatPopup = document.createElement("div");
          chatPopup.className = "chat-popup hidden fixed z-[1002] bg-white rounded-t-xl shadow-2xl w-[900px] lg:w-[600px] h-[400px] overflow-hidden border border-gray-200 opacity-0";
          chatPopup.id = \`chat-popup-${widgetId}\`;
          chatPopup.style[config.position.includes("right") ? "right" : "left"] = "20px";
          chatPopup.style[config.position.includes("bottom") ? "bottom" : "top"] = "80px";
          chatPopup.setAttribute('role', 'dialog');
          chatPopup.setAttribute('aria-hidden', 'true');
          
          const defaultImage = 'https://cdn-icons-png.flaticon.com/512/3011/3011270.png';
          chatPopup.innerHTML = \`
            <div class="chat-header bg-whatsapp-primary text-white p-3 flex items-center justify-between relative z-10">
              <div class="flex items-center">
                <div class="profile-pic w-9 h-9 rounded-full mr-3 bg-cover bg-center border border-white/30" style="background-image: url('\${config.greetingImage || defaultImage}');"></div>
                <div class="header-text flex flex-col flex-grow overflow-hidden">
                  <p class="font-semibold text-sm m-0 whitespace-nowrap overflow-hidden text-ellipsis">\${config.agentName || "Support Agent"}</p>
                  <p class="text-xs text-white/80 m-0 mt-0.5 flex items-center">
                    <span class="online-status w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>\${config.replyTime || "Online"}
                  </p>
                </div>
              </div>
              <button class="close-btn bg-transparent border-none cursor-pointer text-white text-xl p-1 ml-3 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full transition-opacity" id="close-btn-${widgetId}" aria-label="Close WhatsApp Chat">×</button>
            </div>
            <div class="chat-area p-2 h-[calc(100%-100px)] max-h-[calc(100vh-200px)] overflow-y-auto box-border bg-whatsapp-bg bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be8c74.png')] bg-repeat flex flex-col scrollbar-hidden" id="chat-area-${widgetId}" role="log" aria-live="polite"></div>
            <div class="input-area flex items-center p-3 bg-gray-50 border-t border-gray-200 absolute bottom-0 left-0 right-0" id="input-area-${widgetId}">
              <button class="attachment-btn bg-transparent border-none text-gray-500 mr-2 cursor-pointer p-1.5 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-whatsapp-secondary transition-colors" id="attachment-btn-${widgetId}" title="Attach file" aria-label="Attach file">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </button>
              <input
                id="whatsapp-input-${widgetId}"
                type="text"
                placeholder="Type a message..."
                aria-label="Type your message"
                class="flex-1 border-none rounded-full py-2 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-whatsapp-secondary focus:ring-offset-0 text-gray-800"
              />
              <button class="send-btn border-none text-white ml-2 cursor-pointer p-2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-whatsapp-dark focus:outline-none focus:ring-2 focus:ring-whatsapp-dark transition-colors" id="send-btn-${widgetId}" title="Send" aria-label="Send message" style="background-color: \${config.buttonColor || '#25D366'}">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
              <input
                type="file"
                id="image-upload-${widgetId}"
                class="file-input hidden"
                accept="image/jpeg,image/png"
                aria-label="Upload image"
              />
            </div>
            <div class="chat-popup-arrow"></div>
            <div class="error-message hidden text-red-600 text-sm text-center p-5 h-full flex items-center justify-center" id="error-message-${widgetId}" role="alert">Failed to load widget. Please try again later.</div>
          \`;

          // Media queries for responsiveness
          const mediaStyles = document.createElement("style");
          mediaStyles.innerText = \`
            @media (max-width: 400px) {
              #whatsapp-widget-${widgetId} .chat-popup {
                width: calc(100vw - 40px) !important;
                left: 20px !important;
                right: 20px !important;
              }
            }
            @media (max-height: 500px) {
              #whatsapp-widget-${widgetId} .chat-popup {
                height: calc(100vh - 80px) !important;
              }
            }
          \`;
          document.head.appendChild(mediaStyles);

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
            button.classList.toggle('scale-110', isChatOpen);
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
                messageDiv.className = \`chat-message \${msg.type} rounded-lg mb-2 px-3 py-2 max-w-[80%] text-sm relative\`;
                messageDiv.style.marginLeft = msg.type === 'incoming' ? '8px' : 'auto';
                messageDiv.style.marginRight = msg.type === 'outgoing' ? '8px' : 'auto';
                
                if (msg.content.includes('<img')) {
                  messageDiv.innerHTML = \`
                    \${msg.content}
                    <p class="timestamp text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end">
                      \${msg.timestamp} \${msg.type === 'outgoing' ? '<span class="ml-1 text-xs">✓✓</span>' : ''}
                    </p>
                  \`;
                } else {
                  messageDiv.innerHTML = \`
                    <p class="m-0 text-gray-800">\${msg.content}</p>
                    <p class="timestamp text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end">
                      \${msg.timestamp} \${msg.type === 'outgoing' ? '<span class="ml-1 text-xs">✓✓</span>' : ''}
                    </p>
                  \`;
                }
                
                if (msg.type === 'outgoing' && msg.delivered) {
                  messageDiv.querySelector('.timestamp span').style.color = '#53bdeb';
                }
                chatArea.appendChild(messageDiv);
              });

              // Show greeting if no messages and greetingMessage is non-empty
              if (!storedMessages.length) {
                if (config.greetingMessage) {
                  const greetingMessage = document.createElement("div");
                  greetingMessage.className = "chat-message incoming rounded-lg mb-2 px-3 py-2 max-w-[80%] text-sm relative";
                  greetingMessage.style.marginLeft = '8px';
                  greetingMessage.innerHTML = \`
                    <p class="m-0 text-gray-800">\${config.greetingMessage}</p>
                    <p class="timestamp text-[10px] text-gray-500 text-right mt-1">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  \`;
                  chatArea.appendChild(greetingMessage);
                  saveMessages([{ type: 'incoming', content: config.greetingMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                }

                setTimeout(() => {
                  const typingIndicator = document.createElement("div");
                  typingIndicator.className = "typing-indicator flex items-center mb-2 self-start bg-white p-2 px-3 rounded-lg";
                  typingIndicator.style.marginLeft = '8px';
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
                    welcomeMsg.className = "chat-message incoming rounded-lg mb-2 px-3 py-2 max-w-[80%] text-sm relative";
                    welcomeMsg.style.marginLeft = '8px';
                    welcomeMsg.innerHTML = \`
                      <p class="m-0 text-gray-800">\${config.welcomeMessage || "Hi there! How can I help you today?"}</p>
                      <p class="timestamp text-[10px] text-gray-500 text-right mt-1">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    \`;
                    chatArea.appendChild(welcomeMsg);
                    chatArea.scrollTop = chatArea.scrollHeight;
                    saveMessages([...getStoredMessages(), { type: 'incoming', content: config.welcomeMessage || "Hi there! How can I help you today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
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
            button.classList.remove('scale-110');
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
            imageUploadInput.click();
          };

          imageUploadInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const validTypes = ['image/jpeg', 'image/png'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (!validTypes.includes(file.type)) {
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const errorMessage = document.createElement("div");
              errorMessage.className = "chat-message error bg-red-50 text-red-600 self-center rounded-lg p-2 mb-2 px-3 py-2 text-sm";
              errorMessage.innerHTML = \`
                <p class="m-0">Only JPEG or PNG images are allowed.</p>
                <p class="timestamp text-[10px] text-gray-500 text-right mt-1">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              \`;
              chatArea.appendChild(errorMessage);
              chatArea.scrollTop = chatArea.scrollHeight;
              imageUploadInput.value = '';
              return;
            }
            if (file.size > maxSize) {
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const errorMessage = document.createElement("div");
              errorMessage.className = "chat-message error bg-red-50 text-red-600 self-center rounded-lg p-2 mb-2 px-3 py-2 text-sm";
              errorMessage.innerHTML = \`
                <p class="m-0">Image size must be less than 5MB.</p>
                <p class="timestamp text-[10px] text-gray-500 text-right mt-1">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              \`;
              chatArea.appendChild(errorMessage);
              chatArea.scrollTop = clamp(0, chatArea.scrollHeight, chatArea.scrollHeight);
              imageUploadInput.value = '';
              return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const imageMessage = document.createElement("div");
              imageMessage.className = "chat-message outgoing rounded-lg mb-2 px-3 py-2 max-w-[80%] text-sm relative";
              imageMessage.style.marginRight = '8px';
              const imgContent = \`<img src="\${e.target.result}" class="max-w-full rounded max-h-[200px] object-contain block" alt="Uploaded image" />\`;
              imageMessage.innerHTML = \`
                \${imgContent}
                <p class="timestamp text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end">
                  \${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span class="ml-1 text-xs">✓✓</span>
                </p>
              \`;
              chatArea.appendChild(imageMessage);
              chatArea.scrollTop = chatArea.scrollHeight;
              saveMessages([...getStoredMessages(), { type: 'outgoing', content: imgContent, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), delivered: false }]);

              setTimeout(() => {
                const ticks = imageMessage.querySelector('.timestamp span');
                if (ticks) {
                  ticks.style.color = '#53bdeb';
                  const messages = getStoredMessages();
                  messages[messages.length - 1].delivered = true;
                  saveMessages(messages);
                }
              }, 1000);

              // Open WhatsApp with image placeholder message
              window.open("https://wa.me/" + config.phoneNumber + "?text=" + encodeURIComponent("Check out this image!"), "_blank");
              imageUploadInput.value = "";
            };
            reader.onerror = () => {
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const errorMessage = document.createElement("div");
              errorMessage.className = "chat-message error bg-red-50 text-red-600 self-center rounded-lg p-2 mb-2 px-3 py-2 text-sm";
              errorMessage.innerHTML = \`
                <p class="m-0">Failed to read the image file.</p>
                <p class="timestamp text-[10px] text-gray-500 text-right mt-1">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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

            if (message) {
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              const messageDiv = document.createElement("div");
              messageDiv.className = "chat-message outgoing rounded-lg mb-2 px-3 py-2 max-w-[80%] text-sm relative";
              messageDiv.style.marginRight = '8px';
              messageDiv.innerHTML = \`
                <p class="m-0 text-gray-800">\${message}</p>
                <p class="timestamp text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end">
                  \${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span class="ml-1 text-xs">✓✓</span>
                </p>
              \`;
              chatArea.appendChild(messageDiv);
              chatArea.scrollTop = chatArea.scrollHeight;
              saveMessages([...getStoredMessages(), { type: 'outgoing', content: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), delivered: false }]);

              setTimeout(() => {
                const ticks = messageDiv.querySelector('.timestamp span');
                if (ticks) {
                  ticks.style.color = '#53bdeb';
                  const messages = getStoredMessages();
                  messages[messages.length - 1].delivered = true;
                  saveMessages(messages);
                }
              }, 1000);

              window.open("https://wa.me/" + config.phoneNumber + "?text=" + encodeURIComponent(message), "_blank");
              input.value = "";
            } else if (imageUploadInput.files.length > 0) {
              // Image upload handled separately
              return;
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
            const maxHeight = window.innerHeight - 100;
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
                chatPopup.style.maxHeight = \`\${vh - 100}px\`;
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