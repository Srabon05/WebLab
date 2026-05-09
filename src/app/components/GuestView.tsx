import { useNavigate } from "react-router";
import { 
  Recycle, TrendingUp, Building2, Truck, Users, 
  CheckCircle, Clock, Package, ArrowRight, Lightbulb,
  Leaf, Laptop, Smartphone, Tv, Battery, Cable, Zap,
  Mail, Phone, MapPin, MessageSquare, Info, Award
} from "lucide-react";
import { 
  getCategoryLabel,
  getStatusColor
} from "../lib/data";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

export function GuestView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'awareness' | 'contact'>('overview');

  const [collectionRequests, setCollectionRequests] = useState<any[]>([]);
  const [recyclingCenters, setRecyclingCenters] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [campaignsData, setCampaignsData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [reqs, centers, cols, camps, cats] = await Promise.all([
          apiRequest("/collection-requests/"),
          apiRequest("/recycling-centers/"),
          apiRequest("/collectors/"),
          apiRequest("/campaigns/"),
          apiRequest("/categories/"),
        ]);
        setCollectionRequests(reqs as any[]);
        setRecyclingCenters(centers as any[]);
        setCollectors(cols as any[]);
        setCampaignsData(camps as any[]);
        setCategories(cats as any[]);
      } catch {
        // ignore
      }
    })();
  }, []);

  const totalCollections = collectionRequests.length;
  const completedCollections = collectionRequests.filter(r => r.status === 'completed').length;
  const activeCollections = collectionRequests.filter(
    r => r.status === 'pending' || r.status === 'assigned' || r.status === 'in_progress'
  ).length;

  const stats = [
    {
      icon: Package,
      label: 'Total Collections',
      value: totalCollections.toString(),
      color: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: 'Active Pickups',
      value: activeCollections.toString(),
      color: 'bg-orange-500',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completedCollections.toString(),
      color: 'bg-green-500',
    },
    {
      icon: Building2,
      label: 'Recycling Centers',
      value: recyclingCenters.length.toString(),
      color: 'bg-purple-500',
    },
  ];

  const categoryIcons: Record<string, any> = {
    computers: Laptop,
    mobile_devices: Smartphone,
    televisions: Tv,
    appliances: Zap,
    batteries: Battery,
    cables: Cable,
    other: Package,
  };

  const awarenessContent = [
    {
      icon: Leaf,
      title: 'Environmental Impact',
      description: 'E-waste contains toxic materials like lead, mercury, and cadmium. Proper recycling prevents these from contaminating soil and water.',
      tips: [
        'One million recycled laptops save energy equivalent to electricity used by 3,657 US homes in a year',
        'Recycling one million cell phones can recover 35,274 lbs of copper, 772 lbs of silver, 75 lbs of gold, and 33 lbs of palladium',
        'E-waste represents 2% of trash in landfills, but equals 70% of overall toxic waste',
      ],
    },
    {
      icon: Recycle,
      title: 'Why Recycle E-Waste?',
      description: 'Electronic waste is the fastest growing waste stream. Recycling helps recover valuable materials and reduces environmental harm.',
      tips: [
        'Prevents toxic chemicals from entering the environment',
        'Conserves natural resources by recovering precious metals',
        'Reduces the need for mining raw materials',
        'Creates jobs in the recycling and refurbishing industries',
      ],
    },
    {
      icon: CheckCircle,
      title: 'What Can Be Recycled?',
      description: 'Almost all electronic devices can be recycled, from small gadgets to large appliances.',
      tips: [
        'Computers, laptops, and tablets',
        'Mobile phones and accessories',
        'TVs, monitors, and displays',
        'Printers, scanners, and copiers',
        'Batteries and power banks',
        'Cables, chargers, and adapters',
      ],
    },
    {
      icon: Award,
      title: 'Recycling Best Practices',
      description: 'Follow these guidelines to ensure safe and effective e-waste recycling.',
      tips: [
        'Remove all personal data before recycling devices',
        'Keep batteries separate from other electronics',
        'Do not break or disassemble devices yourself',
        'Remove accessories and packaging materials',
        'Schedule pickup rather than disposing in regular trash',
      ],
    },
  ];

  const campaigns = campaignsData.filter(
    c => c.active && (c.targetAudience === 'all' || c.targetAudience === 'users')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Recycle className="size-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">E-Waste Management System</h1>
              <p className="text-sm text-gray-500">Public Overview & Information</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-lg shadow-xl p-8 mb-6 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Making E-Waste Recycling Easy</h2>
            <p className="text-lg text-green-50 mb-6">
              Join our platform to schedule e-waste pickups, track collections, and contribute to a sustainable future. 
              Our network of certified recycling centers ensures your electronic waste is handled responsibly.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 font-medium"
            >
              Get Started
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex gap-6 px-6 min-w-max">
              {[
                { key: 'overview', label: 'System Overview', icon: TrendingUp },
                { key: 'categories', label: 'Recyclable Items', icon: Package },
                { key: 'awareness', label: 'Awareness & Tips', icon: Lightbulb },
                { key: 'contact', label: 'Contact & Campaigns', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${stat.color} p-3 rounded-lg`}>
                            <Icon className="size-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Collections */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="size-6 text-green-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Recent Collections</h2>
                    </div>
                    <div className="space-y-3">
                      {collectionRequests.slice(0, 5).map((request: any) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{request.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {request.scheduledDate || 'Date pending'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recycling Centers */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="size-6 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Recycling Centers</h2>
                    </div>
                    <div className="space-y-3">
                      {recyclingCenters.map((center: any) => (
                        <div key={center.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{center.name}</h3>
                              <p className="text-sm text-gray-600">{center.city}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Rating: ⭐ {center.rating}</span>
                            <span className="text-gray-600">Capacity: {Math.round((center.currentLoad / center.capacity) * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Collectors */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="size-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Active Collectors</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collectors.map((collector: any) => (
                      <div key={collector.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{collector.name}</h3>
                            <p className="text-sm text-gray-600">{collector.vehicleType} - {collector.vehicleNumber}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            collector.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : collector.status === 'busy'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {collector.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rating:</span>
                            <span className="font-medium">⭐ {collector.rating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium">{collector.completedCollections}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Recyclable Item Categories</h2>
                  <p className="text-gray-600">
                    We accept a wide range of electronic waste items. Each category has specific handling and recycling procedures
                    to ensure environmental safety and maximum material recovery.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categories.map((category: any) => {
                    const IconComponent = categoryIcons[category.id] || Package;
                    return (
                      <div key={category.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                            <IconComponent className="size-8 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.label}</h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Reward Points</span>
                            <span className="font-semibold text-purple-600">{category.rewardPoints} pts</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pickup Charge</span>
                            <span className="font-semibold text-gray-900">${category.pickupCharge}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {category.active ? 'Accepting' : 'Not Accepting'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            <strong>Examples:</strong> This category includes items like {category.description.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <Info className="size-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li>• All items must be in reasonable condition for safe handling</li>
                        <li>• Remove all personal data from devices before recycling</li>
                        <li>• Batteries should be removed when possible and recycled separately</li>
                        <li>• Reward points are credited after successful collection and processing</li>
                        <li>• Pickup charges cover transportation and handling costs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Awareness Tab */}
            {activeTab === 'awareness' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">E-Waste Awareness & Tips</h2>
                  <p className="text-gray-600">
                    Learn about the importance of proper e-waste recycling and how you can make a positive impact on the environment.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {awarenessContent.map((content, index) => {
                    const IconComponent = content.icon;
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-green-100 p-3 rounded-lg">
                            <IconComponent className="size-6 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-4">{content.description}</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <ul className="space-y-2">
                            {content.tips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Did You Know Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Did You Know?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-4xl font-bold mb-2">50M</p>
                      <p className="text-sm">Metric tons of e-waste generated globally each year</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-4xl font-bold mb-2">70%</p>
                      <p className="text-sm">Of toxic waste in landfills comes from e-waste</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-4xl font-bold mb-2">৳62B</p>
                      <p className="text-sm">Worth of recoverable materials in e-waste annually</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Us & Active Campaigns</h2>
                  <p className="text-gray-600">
                    Get in touch with us or stay updated with our latest campaigns and initiatives.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Contact Information */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                          <Mail className="size-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                          <p className="text-sm text-gray-600">support@ewaste-manager.com</p>
                          <p className="text-sm text-gray-600">info@ewaste-manager.com</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                          <Phone className="size-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
                          <p className="text-sm text-gray-600">Main Office: +1-555-EWASTE (39278)</p>
                          <p className="text-sm text-gray-600">Support: +1-555-RECYCLE (732-9253)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                          <MapPin className="size-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Head Office</h4>
                          <p className="text-sm text-gray-600">123 Green Technology Plaza</p>
                          <p className="text-sm text-gray-600">EcoCity, EC 12345</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                          <Clock className="size-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Business Hours</h4>
                          <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                          <p className="text-sm text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                          <p className="text-sm text-gray-600">Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact Form */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Us a Message</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                          rows={4}
                          placeholder="How can we help you?"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>

                {/* Active Campaigns */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns & Initiatives</h3>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className={`border-2 rounded-lg p-5 ${
                          campaign.type === 'promotion' ? 'border-green-200 bg-green-50' :
                          campaign.type === 'awareness' ? 'border-blue-200 bg-blue-50' :
                          'border-yellow-200 bg-yellow-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg flex-shrink-0 ${
                            campaign.type === 'promotion' ? 'bg-green-200' :
                            campaign.type === 'awareness' ? 'bg-blue-200' :
                            'bg-yellow-200'
                          }`}>
                            <Lightbulb className={`size-6 ${
                              campaign.type === 'promotion' ? 'text-green-700' :
                              campaign.type === 'awareness' ? 'text-blue-700' :
                              'text-yellow-700'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                campaign.type === 'promotion' ? 'bg-green-200 text-green-800' :
                                campaign.type === 'awareness' ? 'bg-blue-200 text-blue-800' :
                                'bg-yellow-200 text-yellow-800'
                              }`}>
                                {campaign.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{campaign.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>📅 Posted: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                              {campaign.expiresAt && (
                                <span>⏰ Expires: {new Date(campaign.expiresAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white text-center">
                  <h3 className="text-xl font-bold mb-3">Follow Us on Social Media</h3>
                  <p className="mb-4">Stay updated with our latest news, tips, and initiatives</p>
                  <div className="flex justify-center gap-4">
                    <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-md transition-colors">
                      Facebook
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-md transition-colors">
                      Twitter
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-md transition-colors">
                      Instagram
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-md transition-colors">
                      LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="size-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Make a Difference?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our platform today and be part of the solution. Schedule your e-waste pickups, 
            become a collector, or register your recycling center.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/register?role=user")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Sign Up as User
            </button>
            <button
              onClick={() => navigate("/register?role=collector")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Become a Collector
            </button>
            <button
              onClick={() => navigate("/register?role=recycling_center")}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Register Your Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
