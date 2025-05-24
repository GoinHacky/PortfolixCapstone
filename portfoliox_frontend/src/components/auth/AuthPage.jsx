import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

const API_BASE = "http://localhost:8080/api/auth";

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
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
        // Login
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "error", text: data.error || "Login failed" });
        } else {
          setMessage({ type: "success", text: "Login successful!" });
          // Save auth data
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("username", data.username);
          localStorage.setItem("role", data.role);
          
          // Redirect based on role
          if (data.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (data.role === 'FACULTY') {
            navigate('/faculty/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        // Signup
        const res = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fname: formData.firstName,
            lname: formData.lastName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "error", text: data.error || "Signup failed" });
        } else {
          setMessage({ type: "success", text: data.message });
          // If faculty registration, show pending approval message
          if (formData.role === "FACULTY") {
            setMessage({ type: "success", text: "Faculty account created. Awaiting admin approval." });
          } else {
            // For students, automatically redirect to login
            setTimeout(() => {
              setIsLogin(true);
            }, 2000);
          }
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50 overflow-hidden relative flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-r from-[#D4AF37]/10 to-[#800000]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-l from-[#800000]/10 to-[#D4AF37]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-transparent via-[#D4AF37]/5 to-transparent rounded-full animate-spin opacity-50" style={{animationDuration: '45s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-50 w-full py-6 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${goldBgSolid} rounded-lg flex items-center justify-center shadow-lg`}>
                <Sparkles className={`w-6 h-6 ${maroonText}`} />
              </div>
              <h1 className={`text-2xl font-black tracking-tight ${maroonText}`}>
                PortfolioX
              </h1>
            </div>
            <button 
              onClick={() => window.history.back()} 
              className="text-gray-600 hover:text-[#800000] transition-colors font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-6">
          {/* Auth Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Card Header */}
            <div className={`${maroon} p-8 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000]"></div>
              <div className="relative z-10">
                <div className={`inline-flex p-3 ${goldBgSolid} rounded-xl text-white mb-4`}>
                  {isLogin ? <Lock className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <h2 className={`text-3xl font-black text-white mb-2`}>
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
                <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#D4AF37] hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
                  <span>Continue with Google</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold">G</div>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
                </div>
              </div>

              {/* Error/Success Message */}
              {message.text && (
                <div className={`mb-4 text-center text-sm font-semibold ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
                  {message.text}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field (always) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                    required
                  />
                </div>

                {/* Name Fields (Sign Up Only) */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                        required
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email Field (Sign Up Only) */}
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email address"
                      className="w-full py-3 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                      required
                    />
                  </div>
                )}

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full py-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full py-3 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                )}

                {/* Role Dropdown (Sign Up Only) */}
                {!isLogin && (
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 font-medium"
                      required
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                    </select>
                  </div>
                )}

                {/* Additional Options */}
                <div className="flex items-center justify-between text-sm">
                  {isLogin ? (
                    <>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]" />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <button type="button" className={`${goldText} hover:text-[#B8860B] font-semibold transition-colors`}>
                        Forgot password?
                      </button>
                    </>
                  ) : (
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                        required
                      />
                      <span className="text-gray-600 leading-relaxed">
                        I agree to the{" "}
                        <button type="button" className={`${goldText} hover:text-[#B8860B] font-semibold transition-colors`}>
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" className={`${goldText} hover:text-[#B8860B] font-semibold transition-colors`}>
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`group w-full py-4 ${goldBg} text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/30 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2`}
                  disabled={loading}
                >
                  <span>{loading ? (isLogin ? "Signing In..." : "Creating...") : (isLogin ? 'Sign In' : 'Create Account')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Benefits (Sign Up Only) */}
              {!isLogin && (
                <div className="mt-6 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#800000]/10 rounded-xl">
                  <h4 className={`font-bold ${maroonText} mb-2 text-center`}>What you'll get:</h4>
                  <div className="space-y-2 text-sm">
                    {[
                      'Unlimited project showcases',
                      'Professional portfolio templates',
                      'Achievement tracking & verification',
                      'Easy sharing with educators & employers'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle Auth Mode */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className={`ml-2 ${goldText} hover:text-[#B8860B] font-bold transition-colors`}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
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