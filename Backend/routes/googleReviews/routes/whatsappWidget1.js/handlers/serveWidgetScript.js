const logger = require('../config/logger');
const { sanitizeInput } = require('../utils/sanitize');
const Widget = require('../model/Widget');

async function serveWidgetScript(req, res) {
  const widgetId = sanitizeInput(req.query.widgetId);
  if (!widgetId) {
    logger.warn('Widget ID not provided in /api/whatsapp/widget.js');
    return res.status(400).json({ error: 'Widget ID is required' });
  }

  try {
    const widget = await Widget.findOne({ widgetId });
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

        // Set root font size for consistent 14px text
        document.documentElement.style.setProperty('font-size', '14px');

        // Add Tailwind CSS
        const script = document.createElement("script");
        script.src = "https://cdn.tailwindcss.com";
        script.onload = () => {
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  whatsapp: {
                    primary: '#075E54',
                    secondary: '#25D366',
                    light: '#DCF8C6',
                    dark: '#005C4B',
                    bg: '#ECE5DD',
                    'bg-pattern': 'url(https://web.whatsapp.com/img/bg-chat-tile_9e8a2898.png)'
                  }
                },
                fontFamily: {
                  whatsapp: ['"Helvetica Neue"', '-apple-system', 'Arial', 'sans-serif']
                }
              }
            }
          };
        };
        document.head.appendChild(script);

        const styleSheet = document.createElement("style");
        styleSheet.innerText = \`
          #whatsapp-widget-${widgetId} {
            font-family: 'Helvetica Neue', -apple-system, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
          }
          #whatsapp-widget-${widgetId} .chat-popup {
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            overflow: hidden;
          }
          #whatsapp-widget-${widgetId} .chat-popup.open {
            transform: translateY(0);
            opacity: 1;
          }
          #whatsapp-widget-${widgetId} .chat-message.incoming {
            background-color: #fff;
            border-radius: 0 7.5px 7.5px 7.5px;
            margin-left: 8px;
          }
          #whatsapp-widget-${widgetId} .chat-message.incoming::before {
            content: '';
            position: absolute;
            top: 0;
            left: -6px;
            width: 6px;
            height: 10px;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 10"><path fill="%23fff" d="M6 0H0c0 2.2 1.8 4 4 4V0z"/></svg>') no-repeat;
          }
          #whatsapp-widget-${widgetId} .chat-popup-arrow {
            display: none;
          }
          @keyframes bounce {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-3px); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
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
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background-color: #8696A0;
            margin: 0 1.5px;
          }
          #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(1) {
            animation: bounce 1.2s infinite ease-in-out;
          }
          #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(2) {
            animation: bounce 1.2s 0.2s infinite ease-in-out;
          }
          #whatsapp-widget-${widgetId} .typing-indicator span:nth-child(3) {
            animation: bounce 1.2s 0.4s infinite ease-in-out;
          }
          #whatsapp-widget-${widgetId} .chat-message {
            box-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.08);
          }
          #whatsapp-widget-${widgetId} .chat-header {
            background: linear-gradient(90deg, #075E54, #128C7E);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          #whatsapp-widget-${widgetId} .whatsapp-logo {
            filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
          }
          #whatsapp-widget-${widgetId} .pulse-effect {
            animation: pulse 1.8s infinite;
          }
          #whatsapp-widget-${widgetId} .notification-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 16px;
            height: 16px;
            background-color: #FF3B30;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          #whatsapp-widget-${widgetId} .input-area {
            background: #F0F0F0;
            border-top: 1px solid #D9D9D9;
          }
          #whatsapp-widget-${widgetId} .send-btn:hover {
            filter: brightness(0.95);
          }
          #whatsapp-widget-${widgetId} .timestamp {
            font-size: 14px;
            color: #8696A0;
          }
          #whatsapp-widget-${widgetId} .chat-message p {
            font-size: 14px;
          }
          #whatsapp-widget-${widgetId} .header-text p {
            font-size: 14px;
          }
          #whatsapp-widget-${widgetId} .error-message {
            font-size: 14px;
          }
          #whatsapp-widget-${widgetId} input {
            font-size: 14px;
          }
        \`;
        document.head.appendChild(styleSheet);

        // Official WhatsApp SVG logo
        const whatsappSvg = \`
          <svg class="whatsapp-logo" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        \`;

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
            widgetContainer.className = "font-whatsapp";
            widgetContainer.setAttribute('role', 'region');
            widgetContainer.setAttribute('aria-label', 'WhatsApp Chat Widget');

            // Create floating button
            const button = document.createElement("button");
            button.className = "fixed flex items-center justify-center rounded-full shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-whatsapp-secondary focus:ring-offset-2 transition-transform duration-200 z-[1002]";
            button.style.backgroundColor = config.buttonColor || "#25D366";
            button.style[config.position.includes("right") ? "right" : "left"] = "16px";
            button.style[config.position.includes("bottom") ? "bottom" : "top"] = "16px";
            button.style.width = "56px";
            button.style.height = "56px";
            button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            button.innerHTML = whatsappSvg;
            button.setAttribute('aria-label', 'Open WhatsApp Chat');
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-controls', \`chat-popup-${widgetId}\`);

            // Notification badge
            const notificationBadge = document.createElement("span");
            notificationBadge.className = "notification-badge hidden";
            notificationBadge.id = "notification-badge-${widgetId}";
            button.appendChild(notificationBadge);

            // Create chat popup
            const chatPopup = document.createElement("div");
            chatPopup.className = "chat-popup hidden fixed z-[1002] bg-white rounded-t-xl w-[360px] h-[480px] overflow-hidden border border-gray-100 opacity-0";
            chatPopup.id = \`chat-popup-${widgetId}\`;
            chatPopup.style[config.position.includes("right") ? "right" : "left"] = "16px";
            chatPopup.style[config.position.includes("bottom") ? "bottom" : "top"] = "80px";
            chatPopup.setAttribute('role', 'dialog');
            chatPopup.setAttribute('aria-hidden', 'true');
            chatPopup.setAttribute('aria-labelledby', \`chat-header-${widgetId}\`);

            const defaultImage = 'https://cdn-icons-png.flaticon.com/512/3011/3011270.png';
            chatPopup.innerHTML = \`
              <div class="chat-header bg-whatsapp-primary text-white p-3 flex items-center justify-between relative z-10" id="chat-header-${widgetId}">
                <div class="flex items-center">
                  <div class="profile-pic w-8 h-8 rounded-full mr-2 bg-cover bg-center border border-white/20" style="background-image: url('\${config.greetingImage || defaultImage}');"></div>
                  <div class="header-text flex flex-col flex-grow overflow-hidden">
                    <p class="font-medium m-0 whitespace-nowrap overflow-hidden text-ellipsis">\${config.agentName || "Support Agent"}</p>
                    <p class="text-white/70 m-0 mt-0.5 flex items-center">
                      <span class="online-status w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>\${config.replyTime || "Typically replies within minutes"}
                    </p>
                  </div>
                </div>
                <button class="close-btn bg-transparent border-none cursor-pointer text-white text-lg p-1 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full transition-opacity" id="close-btn-${widgetId}" aria-label="Close WhatsApp Chat">×</button>
              </div>
              <div class="chat-area p-3 h-[calc(100%-108px)] overflow-y-auto box-border bg-whatsapp-bg bg-[url('https://web.whatsapp.com/img/bg-chat-tile_9e8a2898.png')] bg-repeat flex flex-col scrollbar-hidden" id="chat-area-${widgetId}" role="log" aria-live="polite"></div>
              <div class="input-area flex items-center p-2 bg-[#F0F0F0] border-t border-gray-200 absolute bottom-0 left-0 right-0" id="input-area-${widgetId}">
                <input
                  id="whatsapp-input-${widgetId}"
                  type="text"
                  placeholder="Enter Your Message..."
                  aria-label="Type your message"
                  class="flex-1 border-none rounded-full py-1.5 px-3 bg-white outline-none focus:ring-1 focus:ring-whatsapp-secondary text-gray-800"
                />
                <button class="send-btn border-none text-white ml-1.5 cursor-pointer p-1.5 rounded-full w-8 h-8 flex items-center justify-center hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-whatsapp-dark transition-colors" id="send-btn-${widgetId}" title="Send message" aria-label="Send message" style="background-color: \${config.buttonColor || '#25D366'}">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
              <div class="error-message hidden text-red-600 text-center p-4 h-full flex items-center justify-center" id="error-message-${widgetId}" role="alert">Failed to load chat. Please try again.</div>
            \`;

            // Media queries for responsiveness
            const mediaStyles = document.createElement("style");
            mediaStyles.innerText = \`
              @media (max-width: 400px) {
                #whatsapp-widget-${widgetId} .chat-popup {
                  width: calc(100vw - 32px) !important;
                  left: 16px !important;
                  right: 16px !important;
                  border-radius: 8px;
                }
              }
              @media (max-height: 600px) {
                #whatsapp-widget-${widgetId} .chat-popup {
                  height: calc(100vh - 96px) !important;
                }
              }
            \`;
            document.head.appendChild(mediaStyles);

            // Image error handling
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
            const getStoredMessages = () => {
              const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');
              const filteredMessages = messages.filter(msg => msg.type === 'incoming');
              if (filteredMessages.length !== messages.length) {
                localStorage.setItem(storageKey, JSON.stringify(filteredMessages));
              }
              return filteredMessages;
            };
            const saveMessages = (messages) => {
              const filteredMessages = messages.filter(msg => msg.type === 'incoming');
              try {
                localStorage.setProperty(storageKey, JSON.stringify(filteredMessages));
              } catch (e) {
                console.warn("Failed to save messages to localStorage:", e);
              }
            };

            // Animate popup
            const animatePopup = (open) => {
              const keyframes = open
                ? [
                    { transform: 'translateY(20px)', opacity: 0 },
                    { transform: 'translateY(0)', opacity: 1 }
                  ]
                : [
                    { transform: 'translateY(0)', opacity: 1 },
                    { transform: 'translateY(20px)', opacity: 0 }
                  ];
              chatPopup.animate(keyframes, {
                duration: 250,
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
              button.classList.toggle('scale-105', isChatOpen);
              button.setAttribute('aria-expanded', isChatOpen);

              if (isChatOpen) {
                animatePopup(true);
                const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
                const inputArea = chatPopup.querySelector("#input-area-${widgetId}");
                inputArea.style.display = "flex";
                chatPopup.addEventListener('keydown', trapFocus);

                // Load stored messages (only incoming)
                const storedMessages = getStoredMessages();
                chatArea.innerHTML = '';
                storedMessages.forEach((msg, index) => {
                  const messageDiv = document.createElement("div");
                  messageDiv.className = "chat-message incoming rounded-lg mb-1 px-2.5 py-1.5 max-w-[70%] relative";
                  messageDiv.style.marginLeft = '8px';

                  const prevMsg = storedMessages[index - 1];
                  if (prevMsg && prevMsg.type === msg.type && new Date(msg.timestamp).getMinutes() === new Date(prevMsg.timestamp).getMinutes()) {
                    messageDiv.style.marginTop = '1px';
                  }

                  if (msg.content.includes('<img')) {
                    messageDiv.innerHTML = \`
                      \${msg.content}
                      <p class="timestamp text-right mt-0.5">\${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    \`;
                  } else {
                    messageDiv.innerHTML = \`
                      <p class="m-0 text-gray-900">\${msg.content}</p>
                      <p class="timestamp text-right mt-0.5">\${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    \`;
                  }
                  chatArea.appendChild(messageDiv);
                });

                // Show greeting if no messages
                if (!storedMessages.length && config.greetingMessage) {
                  const greetingMessage = document.createElement("div");
                  greetingMessage.className = "chat-message incoming rounded-lg mb-1 px-2.5 py-1.5 max-w-[70%] relative";
                  greetingMessage.style.marginLeft = '8px';
                  greetingMessage.innerHTML = \`
                    <p class="m-0 text-gray-900">\${config.greetingMessage}</p>
                    <p class="timestamp text-right mt-0.5">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  \`;
                  chatArea.appendChild(greetingMessage);
                  saveMessages([{ type: 'incoming', content: config.greetingMessage, timestamp: new Date().toISOString() }]);
                }

                // Show welcome message with typing animation
                if (!storedMessages.some(msg => msg.content === (config.welcomeMessage || "Hi there! How can I help you today?"))) {
                  setTimeout(() => {
                    const typingIndicator = document.createElement("div");
                    typingIndicator.className = "typing-indicator flex items-center mb-1 self-start bg-white p-1.5 px-2.5 rounded-lg";
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
                      welcomeMsg.className = "chat-message incoming rounded-lg mb-1 px-2.5 py-1.5 max-w-[70%] relative";
                      welcomeMsg.style.marginLeft = '8px';
                      welcomeMsg.innerHTML = \`
                        <p class="m-0 text-gray-900">\${config.welcomeMessage || "Hi there! How can I help you today?"}</p>
                        <p class="timestamp text-right mt-0.5">\${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      \`;
                      welcomeMsg.style.opacity = '0';
                      welcomeMsg.style.transform = 'translateY(10px)';
                      chatArea.appendChild(welcomeMsg);
                      welcomeMsg.animate([
                        { opacity: 0, transform: 'translateY(10px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                      ], { duration: 200, fill: 'forwards' });
                      chatArea.scrollTop = chatArea.scrollHeight;
                      saveMessages([...getStoredMessages(), { type: 'incoming', content: config.welcomeMessage || "Hi there! How can I help you today?", timestamp: new Date().toISOString() }]);
                    }, 1200);
                  }, 800);
                }

                chatArea.scrollTop = chatArea.scrollHeight;
                const input = chatPopup.querySelector("#whatsapp-input-${widgetId}");
                requestAnimationFrame(() => input.focus());
              } else {
                animatePopup(false);
                setTimeout(() => {
                  chatPopup.style.display = "none";
                }, 250);
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
              button.classList.remove('scale-105');
              button.setAttribute('aria-expanded', 'false');
              animatePopup(false);
              setTimeout(() => {
                chatPopup.style.display = "none";
              }, 250);
              chatPopup.removeEventListener('keydown', trapFocus);
            };

            chatPopup.querySelector("#close-btn-${widgetId}").addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                chatPopup.querySelector("#close-btn-${widgetId}").click();
              }
            });

            const sendMessage = () => {
              const input = chatPopup.querySelector("#whatsapp-input-${widgetId}");
              const message = input.value.trim();
              if (!message) return;

              window.open("https://wa.me/" + config.phoneNumber + "?text=" + encodeURIComponent(message), "_blank");
              input.value = "";
              chatPopup.style.display = "block";
              chatPopup.classList.add('open');
              chatPopup.setAttribute('aria-hidden', 'false');
              button.setAttribute('aria-expanded', 'true');
              const chatArea = chatPopup.querySelector("#chat-area-${widgetId}");
              chatArea.scrollTop = chatArea.scrollHeight;
              input.focus();
            };

            const sendBtn = chatPopup.querySelector("#send-btn-${widgetId}");
            if (sendBtn) {
              sendBtn.onclick = () => {
                sendMessage();
                sendBtn.animate([
                  { transform: 'scale(1)' },
                  { transform: 'scale(0.9)' },
                  { transform: 'scale(1)' }
                ], { duration: 150 });
              };

              sendBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  sendMessage();
                }
              });
            } else {
              console.warn("Send button not found for widget:", widgetId);
            }

            const inputElement = chatPopup.querySelector("#whatsapp-input-${widgetId}");
            if (inputElement) {
              inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              });
            } else {
              console.warn("Input element not found for widget:", widgetId);
            }

            // Adjust popup height and handle mobile keyboard
            const adjustPopupHeight = () => {
              const popup = chatPopup;
              const maxHeight = window.innerHeight - 96;
              popup.style.maxHeight = \`\${maxHeight}px\`;
              const chatArea = popup.querySelector("#chat-area-${widgetId}");
              const inputArea = popup.querySelector("#input-area-${widgetId}");
              const header = popup.querySelector('.chat-header');
              const headerHeight = header.offsetHeight;
              const inputHeight = inputArea.offsetHeight;
              chatArea.style.height = \`calc(100% - \${headerHeight + inputHeight}px)\`;
              chatArea.style.maxHeight = \`calc(\${maxHeight}px - \${headerHeight + inputHeight}px)\`;
              chatArea.scrollTop = chatArea.scrollHeight;
            };

            const handleKeyboard = () => {
              const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
              if (isMobile) {
                window.addEventListener('resize', () => {
                  const vh = window.innerHeight;
                  chatPopup.style.maxHeight = \`\${vh - 96}px\`;
                  adjustPopupHeight();
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
  } catch (err) {
    logger.error('Error in /api/whatsapp/widget.js:', err);
    res.status(500).json({ error: 'Failed to serve widget script' });
  }
}

module.exports = serveWidgetScript;