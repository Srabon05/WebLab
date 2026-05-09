import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Recycle, Mail, Lock, User, Phone, MapPin, Truck, Building2, ArrowLeft, CheckCircle } from "lucide-react";
import { register, UserRole } from "../lib/auth";

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") as UserRole || "user";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: defaultRole,
    phone: "",
    address: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (formData.role === "collector" && !formData.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required for collectors";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate async registration
    setTimeout(() => {
      const user = register(
        formData.email,
        formData.name,
        formData.role as UserRole,
        formData.phone,
        formData.address
      );

      setIsLoading(false);

      if (user) {
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'recycling_center':
            navigate('/recycling-center');
            break;
          case 'collector':
            navigate('/collector');
            break;
          case 'user':
            navigate('/user');
            break;
          default:
            navigate('/');
        }
      }
    }, 1000);
  };

  const roleOptions = [
    {
      value: "user",
      label: "User",
      description: "Schedule e-waste pickups",
      icon: User,
      color: "from-green-500 to-emerald-600",
    },
    {
      value: "collector",
      label: "Collector",
      description: "Collect and transport e-waste",
      icon: Truck,
      color: "from-blue-500 to-cyan-600",
    },
    {
      value: "recycling_center",
      label: "Recycling Center",
      description: "Process and recycle e-waste",
      icon: Building2,
      color: "from-purple-500 to-indigo-600",
    },
  ];

  const selectedRole = roleOptions.find(r => r.value === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2s" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4s" />

      <div className="w-full max-w-5xl relative z-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left Panel - Role Selection */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
              <div className="flex items-center gap-3 mb-8">
                <Recycle className="size-10 text-green-400" />
                <div>
                  <h1 className="text-2xl font-bold">Join Us</h1>
                  <p className="text-gray-300 text-sm">Create your account</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold mb-4">Select Account Type</h3>
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-white/20 border-2 border-white/50 shadow-lg scale-105'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color} flex-shrink-0`}>
                          <Icon className="size-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{role.label}</h4>
                            {isSelected && (
                              <CheckCircle className="size-5 text-green-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{role.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-400" />
                  <span>Free account setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-400" />
                  <span>Start immediately</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="lg:col-span-3 p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Register as {selectedRole?.label}
                  </h2>
                  <p className="text-gray-600">{selectedRole?.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.role === 'recycling_center' ? 'Center Name' : 'Full Name'}
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                          errors.name ? 'border-red-300' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                        errors.email ? 'border-red-300' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                          errors.password ? 'border-red-300' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                      placeholder="Enter your full address"
                      rows={2}
                      required
                    />
                  </div>
                </div>

                {formData.role === 'collector' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type
                      </label>
                      <div className="relative group">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <select
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all ${
                            errors.vehicleType ? 'border-red-300' : 'border-gray-200 focus:border-green-500'
                          }`}
                          required
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
                          <option value="Car">Car</option>
                        </select>
                      </div>
                      {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="ABC-1234"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" 
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" className="text-green-600 hover:text-green-700 font-medium">
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
