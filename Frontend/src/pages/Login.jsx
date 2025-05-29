import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { FiMail, FiPhone, FiLock, FiArrowLeft, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [showEmailSlide, setShowEmailSlide] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError('');
      console.log('Google Login Success:', credentialResponse);
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/');
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error('Google login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError('Google login failed. Please try again.');
    console.log('Google Login Failed');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    return /^\+?\d{10,15}$/.test(phone);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (usePhone) {
      if (!phone || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (!validatePhone(phone)) {
        setError('Please enter a valid phone number');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', usePhone ? '' : email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const payload = usePhone ? { phone, password } : { email, password };
      console.log('Login payload:', payload);
      const response = await axios.post('https://wedget.onrender.com/api/login', payload);
      console.log('Login response:', response.data);

      // Store JWT token (e.g., in localStorage or context)
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err.response || err.message);
      const errorMessage = err.response?.data?.message || 
                         (typeof err.response?.data === 'object' ? JSON.stringify(err.response?.data) : err.message) || 
                         'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password clicked');
    if (usePhone) {
      if (!phone) {
        setError('Please enter your phone number first');
        return;
      }
      if (!validatePhone(phone)) {
        setError('Please enter a valid phone number');
        return;
      }
      alert(`Password reset link sent to phone ${phone}`);
    } else {
      if (!email) {
        setError('Please enter your email first');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      alert(`Password reset link sent to ${email}`);
    }
  };

  if (!isMounted) return null;

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-xs sm:text-sm flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-hidden">
            <div
              className={`flex transition-transform duration-300 ease-in-out`}
              style={{
                width: '200%',
                transform: showEmailSlide ? 'translateX(-50%)' : 'translateX(0)',
              }}
            >
              <div className="w-1/2 px-2 sm:px-4 flex-shrink-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Welcome Back</h2>
                
                <div className="space-y-4">
                  <div className="mb-2">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleFailure}
                      text="continue_with"
                      shape="pill"
                      width="100%"
                      size="large"
                      useOneTap
                    />
                  </div>

                  <div className="flex items-center my-4 sm:my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-xs sm:text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <button
                    onClick={() => { setShowEmailSlide(true); setUsePhone(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 sm:py-3 px-4 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition duration-200 shadow-sm text-xs sm:text-sm"
                  >
                    <FiMail className="text-lg" />
                    Continue with Email
                  </button>

                  <button
                    onClick={() => { setShowEmailSlide(true); setUsePhone(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 sm:py-3 px-4 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition duration-200 shadow-sm text-xs sm:text-sm"
                  >
                    <FiPhone className="text-lg" />
                    Continue with Phone
                  </button>
                </div>

                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </div>

              <div className="w-1/2 px-2 sm:px-4 flex-shrink-0">
                <button
                  onClick={() => setShowEmailSlide(false)}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 transition duration-200 text-xs sm:text-sm"
                  aria-label="Go back"
                >
                  <FiArrowLeft />
                  Back
                </button>

                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
                  Sign in with {usePhone ? 'Phone' : 'Email'}
                </h2>
                
                <form onSubmit={handleEmailLogin} className="space-y-3 sm:space-y-4">
                  {usePhone ? (
                    <div>
                      <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (123) 456-7890"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your@email.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                        minLength="6"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs sm:text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 text-xs sm:text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;