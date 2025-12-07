import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import PortfolioLogo from '../../assets/images/Portfolio.svg';
import api, { getApiBaseUrl } from "../../api/apiConfig";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    role: "STUDENT"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  React.useEffect(() => {
    setIsLogin(mode === "login");
    setMessage({ type: "", text: "" });
  }, [mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

   const handleGitHubLogin = async () => {
    try {
      // Redirect to GitHub OAuth2 authorization URL
      window.location.href = `${getApiBaseUrl()}/oauth2/authorization/github`;
    } catch (error) {
      setMessage({ type: "error", text: "Failed to initiate GitHub login" });
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // ✅ LOGIN with axios
        const res = await api.post("/api/auth/login", {
          username: formData.username,
          password: formData.password,
        });

        const data = res.data;

        setMessage({ type: "success", text: "Login successful!" });

        // Save auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        localStorage.setItem("fname", data.fname);
        localStorage.setItem("lname", data.lname);

        // Fetch user profile
        try {
          const userRes = await api.get(`/api/users/${data.userId}`);
          const userData = userRes.data;
          if (userData.profilePic) {
            const profilePicPath = userData.profilePic.startsWith("/uploads/")
              ? userData.profilePic
              : `/uploads/${userData.profilePic.replace(/^.*[\\\/]/, "")}`;
            const fullProfilePicUrl = `${getApiBaseUrl()}${profilePicPath}`;
            localStorage.setItem("profilePic", fullProfilePicUrl);
            window.dispatchEvent(new Event("storage"));
          }
        } catch {
          /* ignore */
        }

        // Redirect based on role
        if (data.role === "ADMIN") navigate("/admin/dashboard");
        else if (data.role === "FACULTY") navigate("/faculty/dashboard");
        else navigate("/dashboard");
      } else {
        // ✅ SIGNUP with axios
        const res = await api.post("/api/auth/signup", {
          fname: formData.firstName,
          lname: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        const data = res.data;
        setMessage({ type: "success", text: data.message });

        if (formData.role === "FACULTY") {
          setMessage({
            type: "success",
            text: "Faculty account created. Awaiting admin approval.",
          });
        } else {
          setTimeout(() => setIsLogin(true), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };


  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      role: "STUDENT"
    });
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden relative flex flex-col transition-colors duration-200">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-r from-[#D4AF37]/10 to-[#800000]/10 dark:from-[#D4AF37]/5 dark:to-[#800000]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-l from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/5 dark:to-[#D4AF37]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent rounded-full animate-spin opacity-50" style={{animationDuration: '45s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-50 w-full py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow overflow-hidden bg-transparent">
                <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#800000]" style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '-0.03em', position: 'relative', display: 'inline-block' }}>
                  PortfolioX
                </h1>
                <span className="text-sm font-semibold text-gray-200 mt-0.5" style={{fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif'}}>Student Portfolio Tracker</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="text-gray-600 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-6">
          {/* Auth Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Card Header */}
            <div className={`${darkMode ? 'bg-[#D4AF37]' : maroon} p-8 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000] dark:from-[#D4AF37] dark:via-[#B8860B] dark:to-[#D4AF37]"></div>
              <div className="relative z-10">
                <div className={`inline-flex p-3 ${darkMode ? maroon : goldBgSolid} rounded-xl text-white mb-4`}>
                  {isLogin ? <Lock className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <h2 className="text-3xl font-black text-white mb-2">
                  {isLogin ? 'Welcome Back!' : 'Join PortfolioX'}
                </h2>
                <p className="text-white/80">
                  {isLogin 
                    ? 'Sign in to continue your academic journey' 
                    : 'Start showcasing your academic achievements'
                  }
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleGitHubLogin}
                  className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                >
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold">G</div>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Form Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#800000] dark:focus:ring-[#D4AF37] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="FACULTY">Faculty</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        required
                        className="h-4 w-4 text-[#800000] dark:text-[#D4AF37] focus:ring-[#800000] dark:focus:ring-[#D4AF37] border-gray-300 dark:border-gray-600 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        I agree to the Terms and Privacy Policy
                      </label>
                    </div>
                  </>
                )}

                {message.text && (
                  <div className={`p-3 rounded-lg ${
                    message.type === "error" 
                      ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" 
                      : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  }`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 ${darkMode ? 'bg-[#D4AF37] hover:bg-[#B8860B]' : 'bg-[#800000] hover:bg-[#600000]'} text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50`}
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Auth Mode */}
              <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleAuthMode}
                  className={`font-semibold ${maroonText} dark:text-[#D4AF37] hover:underline`}
                >
                  {isLogin ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Trusted by 10K+ students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}