import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; // Import social media icons

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 md:py-8 mt-auto">
      <div className="container mx-auto px-4">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Company</h3>
            <ul>
              <li><a href="/about" className="text-sm hover:text-accent-cyan">About Us</a></li>
              <li><a href="/contact" className="text-sm hover:text-accent-cyan">Contact Us</a></li>
              <li><a href="/privacy" className="text-sm hover:text-accent-cyan">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm hover:text-accent-cyan">Terms of Service</a></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Support</h3>
            <ul>
              <li><a href="/faq" className="text-sm hover:text-accent-cyan">FAQ</a></li>
              <li><a href="/help" className="text-sm hover:text-accent-cyan">Help Center</a></li>
              <li><a href="/feedback" className="text-sm hover:text-accent-cyan">Feedback</a></li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-2xl hover:text-accent-cyan"><FaTwitter /></a>
              <a href="https://facebook.com" className="text-2xl hover:text-accent-cyan"><FaFacebookF /></a>
              <a href="https://instagram.com" className="text-2xl hover:text-accent-cyan"><FaInstagram /></a>
              <a href="https://linkedin.com" className="text-2xl hover:text-accent-cyan"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Newsletter Subscription */}
         {/* Newsletter Subscription */}
<div>
  <h3 className="text-xl font-semibold mb-3">Subscribe to our Newsletter</h3>
  <input
    type="email"
    placeholder="Enter your email"
    className="w-full p-2 text-gray-800 bg-gray-200 rounded-md mb-3" // Adjusted colors
  />
  <button className="w-full bg-accent-cyan text-white py-2 rounded-md">Subscribe</button>
</div>

        </div>

        {/* Footer Bottom Section */}
        <div className="text-center">
          <p className="text-sm sm:text-base md:text-lg">© 2025 MyApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
