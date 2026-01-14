// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';
import { HiMail, HiShieldCheck, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Slideshow images
  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Real-time Analytics",
      description: "Monitor your application performance in real-time"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "User Management",
      description: "Easily manage all your users from one dashboard"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Data Insights",
      description: "Get valuable insights from your application data"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Secure Access",
      description: "Enterprise-grade security for your data"
    }
  ];

  // Your logo URL
  const logoUrl = "https://play-lh.googleusercontent.com/UOGpk5_SOc9SfmhOt2iHKULwVVlRzDwIZzTM0XXrkpfbXn6YyugxWk2lA-Y6Y-WkriF3dFBk7_hqjZz2NbMh=w240-h480-rw";

  // Auto-rotate slides every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-credential':
          toast.error('Invalid email or password');
          break;
        case 'auth/user-not-found':
          toast.error('No account found with this email');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Try again later');
          break;
        default:
          toast.error('Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Images */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
            </div>
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="max-w-lg text-white">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                    <HiShieldCheck className="h-8 w-8" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-xl text-white/80">{slide.description}</p>
                </div>
                
                {/* Slide Indicators */}
                <div className="flex space-x-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Branding with Your Logo */}
        <div className="absolute top-8 left-8 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
              <img 
                src={logoUrl} 
                alt="Theka Online Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Theka Online</h1>
              <p className="text-white/80 text-sm">Admin Portal</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="absolute bottom-8 left-8 right-8 z-10">
          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center space-x-4">
              <HiShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm">© {new Date().getFullYear()} Theka Online</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo with Your Image */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg border border-gray-200">
                <img 
                  src={logoUrl} 
                  alt="Theka Online Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Theka Online</h1>
                <p className="text-gray-600 text-sm">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your admin account</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="admin@theka.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Demo Credentials */}
           
            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
             <p className="text-sm text-gray-600">
              <span className="block mt-1 text-xs text-gray-500">
                Version 1.0.0
              </span>
            </p>
             </div>
               </div>

          {/* Footer for Mobile */}
            
        </div>
      </div>
    </div>
  );
};

export default Login;