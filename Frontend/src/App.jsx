import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Widget from './pages/Widget';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Blog from './pages/Blog';
import Signup from './pages/Signup';
import WhatsAppWidget from './components/widgets/WhatsAppWidget';
import GoogleReviewsWidget from './components/widgets/GoogleReviewsWidget';

function AppContent() {
  const location = useLocation();
  // Hide Navbar and Footer for /dashboard and /whatsapp
  const hideLayout = location.pathname === '/dashboard' || location.pathname === '/whatsapp';

  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/widgets" element={<Widget />} />
          <Route path="/whatsapp" element={<WhatsAppWidget />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/google-reviews' element={<GoogleReviewsWidget/>}/>
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;