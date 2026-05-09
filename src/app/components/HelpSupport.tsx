import { useState } from 'react';
import { useNavigate } from 'react-router';
import { HelpCircle, ChevronDown, Phone, Mail, MessageCircle, FileText, Video, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export function HelpSupport() {
  const navigate = useNavigate();

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs: FAQ[] = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I schedule my first e-waste pickup?',
      answer: 'Navigate to the "Schedule Pickup" section, select the type of e-waste, provide your address, choose a convenient date and time, and submit your request. A collector will be assigned to your pickup.'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What types of e-waste can I recycle?',
      answer: 'We accept computers, laptops, mobile phones, tablets, printers, monitors, keyboards, cables, batteries, and other electronic devices. Please ensure items are ready for collection.'
    },
    {
      id: 3,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on your profile icon, select "Settings", then "Security Settings", and click "Change Password". Follow the prompts to update your password securely.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Can I update my profile information?',
      answer: 'Yes! Go to your profile page by clicking on your profile icon and selecting "View Profile". Click the "Edit Profile" button to update your information.'
    },
    {
      id: 5,
      category: 'pickups',
      question: 'How long does it take for a collector to arrive?',
      answer: 'Typically, a collector will be assigned within 24 hours of your request. You can track the real-time status of your pickup in the "Track Pickup" section.'
    },
    {
      id: 6,
      category: 'pickups',
      question: 'What happens if I miss my scheduled pickup?',
      answer: 'If you miss your pickup, you can reschedule through the "Track Pickup" section. Click on the request and select a new date and time that works for you.'
    },
    {
      id: 7,
      category: 'rewards',
      question: 'How do I earn reward points?',
      answer: 'You earn reward points for each successful e-waste collection. Points are automatically credited to your account after the collector confirms the pickup.'
    },
    {
      id: 8,
      category: 'rewards',
      question: 'How can I withdraw my earnings?',
      answer: 'Go to the "Earnings" section, click "Withdraw Earnings", select your preferred payment method (bKash, Nagad, Rocket, or Bank), enter your account details, and confirm the withdrawal.'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'account', label: 'Account' },
    { value: 'pickups', label: 'Pickups' },
    { value: 'rewards', label: 'Rewards' }
  ];

  const filteredFAQs = categoryFilter === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === categoryFilter);

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Support Ticket Submitted', {
      description: 'Our team will respond to your inquiry within 24 hours.'
    });
    setSupportForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft className="size-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 mb-6 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center ring-4 ring-white/30">
              <HelpCircle className="size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
              <p className="text-green-100">We're here to help you</p>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => toast.info('Email Support', { description: 'support@ewaste.com' })}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="size-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
            <p className="text-sm text-gray-600">support@ewaste.com</p>
          </button>

          <button
            onClick={() => toast.info('Phone Support', { description: '+880-1234-567890' })}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="size-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
            <p className="text-sm text-gray-600">+880-1234-567890</p>
          </button>

          <button
            onClick={() => toast.info('Live Chat', { description: 'Chat feature coming soon' })}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="size-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600">Available 24/7</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

              {/* Category Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setCategoryFilter(category.value)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      categoryFilter === category.value
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-green-300 transition-all"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
                    >
                      <span className="font-bold text-gray-900 flex-1 pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`size-5 text-gray-500 flex-shrink-0 transition-transform ${
                          expandedFAQ === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-5 pb-5 pt-2 bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form & Resources */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Support</h2>

              <form onSubmit={handleSubmitSupport} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium resize-none"
                    rows={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Send className="size-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>

              <div className="space-y-3">
                <button
                  onClick={() => toast.info('Documentation', { description: 'Opening documentation...' })}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="size-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-900 text-sm">Documentation</p>
                    <p className="text-xs text-gray-600">View user guides</p>
                  </div>
                </button>

                <button
                  onClick={() => toast.info('Video Tutorials', { description: 'Opening tutorials...' })}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Video className="size-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-900 text-sm">Video Tutorials</p>
                    <p className="text-xs text-gray-600">Watch how-to videos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
