import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WidgetForm = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    buttonColor: '#25D366',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can we help you?',
    agentName: 'Support Team',
    replyTime: 'Online',
    greetingMessage: 'Greetings,\n\nIf you would like us to contact you, please provide your name, phone number, and email in a brief message. Thank you.\n\nRegards,\nOur Team',
  });
  const [greetingImage, setGreetingImage] = useState(null);
  const [greetingImageUrl, setGreetingImageUrl] = useState('');
  const [widgetCode, setWidgetCode] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [widgetId, setWidgetId] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const filetypes = /jpeg|jpg|png/;
      const isValidType = filetypes.test(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) {
        setError('Only JPEG/PNG images are allowed');
        return;
      }
      if (!isValidSize) {
        setError('Image size must be less than 5MB');
        return;
      }
      setGreetingImage(file);
      setError('');
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid phone number (e.g., +919884098840)');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (greetingImage) {
      data.append('greetingImage', greetingImage);
    }

    // Log FormData entries for debugging
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post('http://www.dash.intopdigital.com/api/whatsapp/widgets', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Backend Response:', response.data); // Log response
      setWidgetCode(response.data.embedCode);
      setWidgetId(response.data.widgetId);
      setGreetingImageUrl(response.data.greetingImageUrl || ''); // Set image URL
      setError('');
      setIsPreviewVisible(true);
      setActiveTab('code');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Something went wrong');
      setWidgetCode('');
      setWidgetId('');
      setGreetingImageUrl('');
      setIsPreviewVisible(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(widgetCode);
    alert('Code copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({
      phoneNumber: '',
      buttonColor: '#25D366',
      position: 'bottom-right',
      welcomeMessage: 'Hi! How can we help you?',
      agentName: 'Support Team',
      replyTime: 'Online',
      greetingMessage: 'Greetings,\n\nIf you would like us to contact you, please provide your name, phone number, and email in a brief message. Thank you.\n\nRegards,\nOur Team',
    });
    setGreetingImage(null);
    setGreetingImageUrl('');
    setImagePreview('');
    setWidgetCode('');
    setWidgetId('');
    setError('');
    setIsPreviewVisible(false);
    setActiveTab('settings');
  };

  useEffect(() => {
    if (widgetId && isPreviewVisible) {
      const existingScript = document.querySelector(`script[data-widget-id="${widgetId}"]`);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `http://www.dash.intopdigital.com/api/whatsapp/widget.js?widgetId=${widgetId}`;
      script.async = true;
      script.setAttribute('data-widget-id', widgetId);
      script.onerror = () => {
        console.error('Failed to load widget script');
        setError('Failed to load widget preview');
      };
      document.body.appendChild(script);
      return () => {
        const scriptToRemove = document.querySelector(`script[data-widget-id="${widgetId}"]`);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
        const widgetContainer = document.getElementById(`whatsapp-widget-${widgetId}`);
        if (widgetContainer) {
          widgetContainer.remove();
        }
      };
    }
  }, [widgetId, isPreviewVisible]);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-xl">
      <header className="text-center mb-6 pb-4 border-b border-white/20">
        <h1 className="text-xl font-semibold text-yellow-400">WhatsApp Chat Widget</h1>
        <p className="mt-1 text-xs text-white/70">Customize your WhatsApp chat widget</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Form Section */}
        <div className="flex-1 bg-gray-900/80 rounded-lg p-4 shadow-md">
          <div className="flex border-b border-white/20 mb-4">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-1 text-sm font-medium rounded-t-md transition ${
                activeTab === 'settings' ? 'bg-yellow-400 text-black' : 'text-white/50 hover:text-cyan-400'
              }`}
            >
              Settings
            </button>
            {widgetCode && (
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-1 text-sm font-medium rounded-t-md transition ${
                  activeTab === 'code' ? 'bg-cyan-400 text-white' : 'text-white/50 hover:text-cyan-400'
                }`}
              >
                Embed Code
              </button>
            )}
          </div>

          {activeTab === 'settings' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="phoneNumber" className="block mb-1 text-xs font-medium text-white">WhatsApp Number*</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleTextChange}
                    className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
                    placeholder="e.g., +919884098840"
                    required
                  />
                  <div className="text-[10px] text-white/50 mt-1">Include country code (e.g., +1, +91)</div>
                </div>

                <div className="form-group">
                  <label htmlFor="agentName" className="block mb-1 text-xs font-medium text-white">Agent Name</label>
                  <input
                    id="agentName"
                    type="text"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleTextChange}
                    className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
                    placeholder="Support Team"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="buttonColor" className="block mb-1 text-xs font-medium text-white">Button Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="buttonColor"
                      type="color"
                      name="buttonColor"
                      value={formData.buttonColor}
                      onChange={handleTextChange}
                      className="w-10 h-8 rounded-md border border-white/30 cursor-pointer"
                    />
                    <span className="text-xs text-white">{formData.buttonColor}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="position" className="block mb-1 text-xs font-medium text-white">Button Position</label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleTextChange}
                    className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="welcomeMessage" className="block mb-1 text-xs font-medium text-white">Welcome Message</label>
                <input
                  id="welcomeMessage"
                  type="text"
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleTextChange}
                  className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
                  placeholder="Hi! How can we help you?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="replyTime" className="block mb-1 text-xs font-medium text-white">Reply Time Status</label>
                <input
                  id="replyTime"
                  type="text"
                  name="replyTime"
                  value={formData.replyTime}
                  onChange={handleTextChange}
                  className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
                  placeholder="e.g., Online, Typically replies within 1 hour"
                />
              </div>

              <div className="form-group">
                <label htmlFor="greetingMessage" className="block mb-1 text-xs font-medium text-white">Greeting Message</label>
                <textarea
                  id="greetingMessage"
                  name="greetingMessage"
                  value={formData.greetingMessage}
                  onChange={handleTextChange}
                  className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 h-24 text-sm"
                  placeholder="Enter your greeting message..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="greetingImage" className="block mb-1 text-xs font-medium text-white">Agent Photo (Optional)</label>
                <input
                  id="greetingImage"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="greetingImage"
                    className="flex-1 p-2 bg-gray-900/50 text-white border border-dashed border-white/30 rounded-md text-center cursor-pointer hover:bg-gray-900/70 transition text-xs"
                  >
                    Choose Image (max 5MB)
                  </label>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                    />
                  )}
                </div>
                <div className="text-[10px] text-white/50 mt-1">JPEG or PNG, recommended size: 200x200px</div>
              </div>

              {error && (
                <div className="p-2 bg-orange-400/20 text-orange-400 rounded-md text-center border border-orange-400/50 text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 p-2 bg-yellow-400 text-black rounded-md font-medium hover:bg-orange-400 hover:text-white transition text-sm"
                >
                  Generate Widget
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 p-2 bg-gray-900/50 text-white border border-white/30 rounded-md font-medium hover:bg-gray-900/70 transition text-sm"
                >
                  Reset Form
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="text-base text-white mb-3">Your Embed Code</h3>
              <p className="text-xs text-white/70 mb-4">
                Copy and paste this code into your website's HTML.
              </p>

              <div className="relative bg-gray-900/50 rounded-md p-3 border border-white/20">
                <textarea
                  value={widgetCode}
                  readOnly
                  className="w-full h-24 p-2 bg-gray-900/30 text-white border border-white/30 rounded-md font-mono text-xs resize-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 px-2 py-1 bg-cyan-400 text-white rounded-md flex items-center gap-1 hover:bg-cyan-400/80 transition text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1h-1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                  </svg>
                  Copy
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm text-white mb-3">Widget Preview</h4>
                <div className="border border-dashed border-white/30 rounded-lg p-4 min-h-[150px] flex items-center justify-center bg-gray-900/30">
                  <div id={`whatsapp-widget-${widgetId}`} className="relative"></div>
                  {!isPreviewVisible && (
                    <p className="text-xs text-white/50 text-center">
                      Widget preview will appear here
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="w-full lg:w-64 bg-gray-900/80 rounded-lg p-4 shadow-md">
          <h3 className="text-base text-white mb-4 pb-2 border-b border-white/20">Live Preview</h3>

          <div className="border border-white/20 rounded-lg p-4 bg-gray-900/30 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-900/50 flex items-center justify-center overflow-hidden">
                {greetingImageUrl || imagePreview ? (
                  <img
                    src={greetingImageUrl || imagePreview}
                    alt="Agent"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="text-white/50"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{formData.agentName || 'Support Team'}</div>
                <div className="text-xs text-cyan-400">{formData.replyTime || 'Online'}</div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-2 mb-3 border border-white/20">
              <div className="text-xs text-white whitespace-pre-line">
                {formData.welcomeMessage || 'Hi! How can we help you?'}
              </div>
            </div>

            <div className="flex justify-end">
              <div
                style={{ backgroundColor: formData.buttonColor }}
                className="px-3 py-1 text-white rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition"
              >
                Start Chat
              </div>
            </div>
          </div>

          <div className="bg-orange-400/20 rounded-lg p-3 border border-orange-400/50">
            <h4 className="text-xs text-orange-400 mb-2">Quick Tips</h4>
            <ul className="list-disc pl-4 text-[10px] text-white/80">
              <li>Test your widget before deploying</li>
              <li>Place code before &lt;/body&gt;</li>
              <li>Use high-quality agent photo</li>
              <li>Keep messages concise</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetForm;