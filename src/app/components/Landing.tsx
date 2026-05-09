import { useNavigate } from "react-router";
import { 
  Recycle, Users, Truck, Building2, Eye, ShieldCheck, 
  Award, TrendingUp, CheckCircle, ArrowRight, Star,
  Leaf, Zap, Globe
} from "lucide-react";

export function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Recycle,
      title: "Easy E-Waste Disposal",
      description: "Schedule pickups for your electronic waste with just a few clicks",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Truck,
      title: "Real-time Tracking",
      description: "Track your collection request from pickup to recycling completion",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Building2,
      title: "Certified Centers",
      description: "All recycling centers are certified and environmentally compliant",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Safe",
      description: "Your data is protected and recycled according to industry standards",
      color: "from-orange-500 to-red-600",
    },
  ];

  const roles = [
    {
      icon: Users,
      title: "User",
      description: "Schedule e-waste pickups from your home or office",
      route: "/register?role=user",
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      benefits: ["Earn reward points", "Track pickups", "Get certificates"],
    },
    {
      icon: Truck,
      title: "Collector",
      description: "Join our network of collection professionals",
      route: "/register?role=collector",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      benefits: ["Flexible schedule", "Earn income", "Help environment"],
    },
    {
      icon: Building2,
      title: "Recycling Center",
      description: "Partner with us to receive and process e-waste",
      route: "/register?role=recycling_center",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      benefits: ["Increase capacity", "Digital tools", "Network access"],
    },
  ];

  const stats = [
    { value: "10,000+", label: "Collections Completed", icon: CheckCircle },
    { value: "500+", label: "Active Users", icon: Users },
    { value: "50+", label: "Recycling Centers", icon: Building2 },
    { value: "98%", label: "Satisfaction Rate", icon: Star },
  ];

  const benefits = [
    {
      icon: Award,
      title: "Reward Points",
      description: "Earn points for every collection and redeem for rewards",
    },
    {
      icon: TrendingUp,
      title: "Impact Tracking",
      description: "See your environmental impact with detailed analytics",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connected to certified recyclers worldwide",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="relative">
                <Recycle className="size-8 text-green-600 transition-transform group-hover:rotate-180 duration-500" />
                <div className="absolute inset-0 bg-green-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                E-Waste Manager
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/guest")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <Eye className="size-4" />
                <span className="hidden sm:inline">Guest View</span>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6 animate-slide-in-down">
              <Leaf className="size-4" />
              <span className="text-sm font-medium">Sustainable E-Waste Solutions</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-slide-in-up">
              Responsible E-Waste Management
              <br />
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-in-up animation-delay-100">
              Join thousands of users, collectors, and recycling centers in creating a sustainable future. 
              Schedule pickups, track collections, and ensure your electronic waste is recycled properly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-in-up animation-delay-200">
              <button
                onClick={() => navigate("/register")}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg font-medium flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/guest")}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-lg font-medium border-2 border-gray-200"
              >
                Explore Platform
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-up animation-delay-300">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center card-hover"
                >
                  <Icon className="size-8 text-green-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive features designed to make e-waste recycling effortless and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 card-hover"
                >
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="size-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Join as...
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your role and start making a positive environmental impact today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden card-hover"
                >
                  <div className={`${role.color} p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <Icon className="size-12 mb-4 relative z-10" />
                    <h3 className="text-2xl font-bold mb-2 relative z-10">{role.title}</h3>
                    <p className="text-white/90 relative z-10">{role.description}</p>
                  </div>
                  <div className="p-8">
                    <ul className="space-y-3 mb-6">
                      {role.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle className="size-5 text-green-600 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate(role.route)}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-all font-medium group-hover:scale-105"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                More Than Just Recycling
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our platform offers comprehensive features to track, manage, and reward your environmental contributions.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Icon className="size-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Award className="size-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">165 Points</div>
                      <div className="text-sm text-gray-600">Current Balance</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">E-Waste Collected</span>
                    <Zap className="size-5 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">45.8 kg</div>
                  <div className="text-sm text-green-600">+12% from last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-green-50 mb-10 leading-relaxed">
            Join our community of environmentally conscious individuals and organizations. 
            Start your e-waste recycling journey today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-green-600 px-8 py-4 rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg font-medium"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-800 text-white px-8 py-4 rounded-xl hover:bg-green-900 hover:scale-105 transition-all text-lg font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Recycle className="size-6 text-green-500" />
                <span className="text-white font-bold text-lg">E-Waste Manager</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making e-waste recycling simple, efficient, and rewarding for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate("/register?role=user")} className="hover:text-white transition-colors">For Users</button></li>
                <li><button onClick={() => navigate("/register?role=collector")} className="hover:text-white transition-colors">For Collectors</button></li>
                <li><button onClick={() => navigate("/register?role=recycling_center")} className="hover:text-white transition-colors">For Centers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate("/guest")} className="hover:text-white transition-colors">Guest View</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 E-Waste Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
