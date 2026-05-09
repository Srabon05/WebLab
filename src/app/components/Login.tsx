import { useState } from "react";
import { useNavigate } from "react-router";
import { Recycle, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { login } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const user = await login(email, password);
      setIsLoading(false);

      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "recycling_center":
          navigate("/recycling-center");
          break;
        case "collector":
          navigate("/collector");
          break;
        case "user":
          navigate("/user");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setIsLoading(false);
      setError("Invalid email or password");
    }
  };

  const quickLogins = [
    { email: "admin@ewaste.com", role: "Admin", color: "from-red-500 to-pink-600" },
    { email: "center@ewaste.com", role: "Recycling Center", color: "from-purple-500 to-indigo-600" },
    { email: "collector@ewaste.com", role: "Collector", color: "from-blue-500 to-cyan-600" },
    { email: "user@ewaste.com", role: "User", color: "from-green-500 to-emerald-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2s" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4s" />

      <div className="w-full max-w-6xl relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 active:text-gray-700 mb-6 transition-colors group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="max-w-md mx-auto w-full">
          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 animate-slide-in-left">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <Recycle className="size-16 text-green-600 animate-spin-slow" />
                <Sparkles className="size-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 animate-slide-in-down">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-green-600 hover:text-green-700 active:text-green-800 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-green-600 hover:text-green-700 active:text-green-800 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Example Email Formats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Sample Login Credentials</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-gray-900">Admin:</span>
                  <span className="font-mono text-green-600">admin@ewaste.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-gray-900">User:</span>
                  <span className="font-mono text-green-600">user@ewaste.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-gray-900">Collector:</span>
                  <span className="font-mono text-green-600">collector@ewaste.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-gray-900">Recycling Center:</span>
                  <span className="font-mono text-green-600">center@ewaste.com</span>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  All demo passwords: <span className="font-mono bg-gray-100 px-2 py-1 rounded">password123</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
