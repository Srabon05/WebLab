import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Recycle, LogOut, Plus, Package, Award, History,
  MapPin, Download, MessageSquare, Send, Lightbulb,
  CheckCircle, Clock, TrendingUp, X, User, Calendar,
  Weight, FileText, Bell, Star, Trophy, Gift, Zap,
  ArrowRight, Phone, Mail as MailIcon, Circle, Sparkles,
  ShieldCheck, Paperclip, Mic, Search, Smile, MoreVertical,
  Image as ImageIcon, File, ThumbsUp, Heart, Check, CheckCheck,
  ChevronDown, UserCircle, Settings, HelpCircle, FileCheck
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUser, logout } from "../lib/auth";
import { apiRequest } from "../lib/api";
import { 
  getCategoryLabel,
  getStatusColor,
  getTierColor,
  getTierIcon,
  EWasteCategory
} from "../lib/data";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";

export function UserDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new' | 'track' | 'rewards' | 'messages' | 'tips' | 'certificates'>('dashboard');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // OTP state
  const [receivedOTP, setReceivedOTP] = useState<string | null>(null);
  const [showOTPNotification, setShowOTPNotification] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);

  // New request form state
  const [newRequest, setNewRequest] = useState({
    category: 'computers' as EWasteCategory,
    items: '',
    quantity: 1,
    estimatedWeight: '',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  // Backend data
  const [collectionRequests, setCollectionRequests] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [rewardTransactions, setRewardTransactions] = useState<any[]>([]);
  const [rewardRedemptions, setRewardRedemptions] = useState<any[]>([]);
  const [rewardProfile, setRewardProfile] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Filter requests for this user - compute before early return
  const myRequests = collectionRequests.filter(r => r.userId === user?.id);
  const activeRequests = myRequests.filter(r => 
    r.status === 'pending' || r.status === 'assigned' || r.status === 'in_progress'
  );
  const completedRequests = myRequests.filter(r => r.status === 'completed');

  // Calculate reward points
  const totalRewardPoints = rewardProfile?.totalPoints ?? 0;
  const pendingPoints = activeRequests.reduce((sum, r) => sum + (r.rewardPoints || 0), 0);

  // User campaigns
  const userCampaigns = campaigns.filter(
    c => c.active && (c.targetAudience === 'all' || c.targetAudience === 'users')
  );

  // User conversations
  const userConversations = conversations.filter(
    c => c.participants.some(p => p.id === user?.id && p.role === 'user')
  );
  const totalUnreadMessages = userConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Define these before useEffect hooks to avoid initialization errors
  const selectedReq = collectionRequests.find(r => r.id === selectedRequest);
  const selectedConv = userConversations.find(c => c.id === selectedConversation);
  const conversationMessages = chatMessages.filter(m => m.conversationId === selectedConversation);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  // Load backend data for this user
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [
          myReqs,
          allCampaigns,
          allConversations,
          allCategories,
          myTransactions,
          allRedemptions,
          myProfile,
          allLeaderboard,
        ] = await Promise.all([
          apiRequest("/collection-requests/mine/"),
          apiRequest("/campaigns/"),
          apiRequest("/conversations/"),
          apiRequest("/categories/"),
          apiRequest("/reward-transactions/mine/"),
          apiRequest("/reward-redemptions/"),
          apiRequest("/reward-profile/mine/"),
          apiRequest("/leaderboard/"),
        ]);

        setCollectionRequests(myReqs as any[]);
        setCampaigns(allCampaigns as any[]);
        setConversations(allConversations as any[]);
        setCategories(allCategories as any[]);
        setRewardTransactions(myTransactions as any[]);
        setRewardRedemptions(allRedemptions as any[]);
        setRewardProfile(myProfile as any);
        setLeaderboard(allLeaderboard as any[]);
      } catch {
        // keep UI usable even if backend is down
      }
    })();
  }, [user?.id]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    (async () => {
      try {
        const msgs = await apiRequest(`/chat-messages/?conversationId=${selectedConversation}`);
        setChatMessages(msgs as any[]);
      } catch {
        setChatMessages([]);
      }
    })();
  }, [selectedConversation]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulate typing indicator
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [newMessage]);

  // Check authentication with useEffect to avoid setState during render
  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      toast.success('Voice message recorded!');
      setIsRecording(false);
      // In a real app, this would save the recording
    } else {
      setIsRecording(true);
      toast.info('Recording started...');
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessageReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji],
    }));
    toast.success('Reaction added!');
  };

  const quickReplies = [
    "Thank you!",
    "I'll be there on time",
    "Please call me",
    "What's the status?",
    "Confirmed",
    "Can we reschedule?",
  ];

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/collection-requests/", {
        method: "POST",
        body: JSON.stringify({
          userName: user?.name || "User",
          userPhone: (user as any)?.phone || "",
          userAddress: (user as any)?.address || "",
          category: newRequest.category,
          items: newRequest.items,
          quantity: newRequest.quantity,
          estimatedWeight: newRequest.estimatedWeight || null,
          scheduledDate: newRequest.scheduledDate || null,
          scheduledTime: newRequest.scheduledTime || null,
          notes: newRequest.notes || null,
          status: "pending",
          createdAt: new Date().toISOString(),
          trackingHistory: [
            {
              status: "pending",
              timestamp: new Date().toISOString(),
              message: "Request submitted successfully",
            },
          ],
        }),
      });

      const myReqs = await apiRequest("/collection-requests/mine/");
      setCollectionRequests(myReqs as any[]);

      toast.success("Pickup request submitted successfully!", {
        description: "Your request is saved in the database.",
      });
      setNewRequest({
        category: "computers",
        items: "",
        quantity: 1,
        estimatedWeight: "",
        scheduledDate: "",
        scheduledTime: "",
        notes: "",
      });
      setActiveTab("dashboard");
    } catch {
      toast.error("Failed to submit request", {
        description: "Backend error. Please try again.",
      });
    }
  };

  const handleTrackRequest = (requestId: string) => {
    setSelectedRequest(requestId);
    setShowTrackingModal(true);
  };

  const handleDownloadCertificate = (requestId: string) => {
    toast.success('Downloading recycling certificate...', {
      description: 'Your certificate will be downloaded shortly.'
    });
  };

  const handleSendMessage = () => {
    if ((newMessage.trim() || attachedFiles.length > 0) && selectedConversation) {
      toast.success('Message sent');
      setNewMessage('');
      setAttachedFiles([]);
      setShowEmojiPicker(false);
      setShowQuickReplies(false);
    }
  };

  // Simulate receiving OTP from collector
  const simulateReceiveOTP = (requestId: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setReceivedOTP(otp);
    setOtpRequestId(requestId);
    setShowOTPNotification(true);
    toast.success('OTP received from collector!', {
      description: `Your verification code is: ${otp}`
    });
  };

  const copyOTP = () => {
    if (receivedOTP) {
      navigator.clipboard.writeText(receivedOTP);
      toast.success('OTP copied to clipboard!');
    }
  };

  const stats = [
    {
      icon: Clock,
      label: 'Active Requests',
      value: activeRequests.length.toString(),
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completedRequests.length.toString(),
      color: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      icon: Award,
      label: 'Total Points',
      value: totalRewardPoints.toString(),
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      label: 'Pending Points',
      value: pendingPoints.toString(),
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const sidebarMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Package },
    { key: 'new', label: 'New Request', icon: Plus },
    { key: 'track', label: 'Track Pickup', icon: MapPin },
    { key: 'rewards', label: 'Rewards', icon: Award },
    { key: 'certificates', label: 'Certificates', icon: FileCheck },
    { key: 'messages', label: 'Messages', icon: MessageSquare, badge: totalUnreadMessages },
    { key: 'tips', label: 'Tips', icon: Lightbulb },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
      <Sidebar
        user={user}
        menuItems={sidebarMenuItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        gradientFrom="from-green-500"
        gradientTo="to-emerald-600"
        title="User Dashboard"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100 lg:ml-0 ml-16">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'new' && 'New Request'}
                  {activeTab === 'track' && 'Track Pickup'}
                  {activeTab === 'rewards' && 'Rewards'}
                  {activeTab === 'certificates' && 'Certificates'}
                  {activeTab === 'messages' && 'Messages'}
                  {activeTab === 'tips' && 'Tips'}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  Welcome back, <span className="font-semibold text-gray-900">{user.name}</span>
                  <Sparkles className="size-3 text-yellow-500" />
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="size-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="p-6">
        {/* Dashboard Stats and Quick Actions - Only visible on dashboard tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-slide-in-up">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 card-hover group animate-stagger-${index + 1}"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bgLight} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className={`size-6 ${stat.textColor}`} />
                      </div>
                      <div className={`px-2 py-1 rounded-lg ${stat.bgLight}`}>
                        <TrendingUp className={`size-4 ${stat.textColor}`} />
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setActiveTab('new')}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-green-100 text-sm mb-1">Quick Action</p>
                  <p className="font-bold text-lg">Schedule Pickup</p>
                </div>
                <Plus className="size-8 opacity-75 group-hover:rotate-90 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('track')}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-blue-100 text-sm mb-1">Monitor</p>
                  <p className="font-bold text-lg">Track Pickups</p>
                </div>
                <MapPin className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-purple-100 text-sm mb-1">Your Rewards</p>
                  <p className="font-bold text-lg">{totalRewardPoints} Points</p>
                </div>
                <Trophy className="size-8 opacity-75 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </>
        )}

        {/* Content Area */}
        <div>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">My Collection Requests</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                      All ({myRequests.length})
                    </button>
                    <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                      Active ({activeRequests.length})
                    </button>
                    <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                      Completed ({completedRequests.length})
                    </button>
                  </div>
                </div>
                
                {myRequests.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="size-12 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No collection requests yet</h4>
                    <p className="text-gray-600 mb-6">Start your recycling journey by scheduling your first pickup</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium inline-flex items-center gap-2"
                    >
                      <Plus className="size-5" />
                      Schedule Your First Pickup
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((request, index) => (
                      <div 
                        key={request.id} 
                        className="border-2 border-gray-100 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50 card-hover"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{request.id}</h3>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                              {request.status === 'completed' && (
                                <CheckCircle className="size-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Package className="size-4" />
                              <p className="font-semibold">{getCategoryLabel(request.category)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {request.status === 'completed' && (
                              <button
                                onClick={() => handleDownloadCertificate(request.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-medium"
                              >
                                <Download className="size-4" />
                                Certificate
                              </button>
                            )}
                            <button
                              onClick={() => handleTrackRequest(request.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-medium"
                            >
                              <MapPin className="size-4" />
                              Track
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Items</p>
                            <p className="font-semibold text-gray-900">{request.items}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Quantity</p>
                            <p className="font-semibold text-gray-900">{request.quantity || 'N/A'} items</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Weight</p>
                            <p className="font-semibold text-gray-900">{request.weight || request.estimatedWeight || 'Not specified'}</p>
                          </div>
                        </div>

                        {request.scheduledDate && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 text-blue-900">
                              <Calendar className="size-4" />
                              <span className="font-semibold">Scheduled:</span>
                              <span>{request.scheduledDate} at {request.scheduledTime}</span>
                            </div>
                          </div>
                        )}

                        {request.rewardPoints && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 inline-flex items-center gap-2">
                            <Trophy className="size-5 text-purple-600" />
                            <span className="font-bold text-purple-900">{request.rewardPoints} Reward Points</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}</div>
            )}

            {/* New Request Tab */}
            {activeTab === 'new' && (
              <div className="animate-slide-in-up">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="size-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Schedule E-Waste Pickup</h3>
                    <p className="text-gray-600">Fill in the details below to schedule your e-waste collection</p>
                    
                    {/* Process Flow Info */}
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                          <span className="font-semibold text-gray-700">Submit Request</span>
                        </div>
                        <ArrowRight className="size-5 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                          <span className="font-semibold text-gray-700">Recycling Center</span>
                        </div>
                        <ArrowRight className="size-5 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                          <span className="font-semibold text-gray-700">Collector Assigned</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitRequest} className="space-y-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Package className="size-5 text-green-600" />
                        Item Details
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            E-Waste Category *
                          </label>
                          <select
                            value={newRequest.category}
                            onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value as EWasteCategory })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            required
                          >
                            {categories.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            value={newRequest.quantity}
                            onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            min="1"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Item Description *
                          </label>
                          <textarea
                            value={newRequest.items}
                            onChange={(e) => setNewRequest({ ...newRequest, items: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none font-medium"
                            placeholder="E.g., Dell Laptop, iPhone 12, LED Monitor"
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Estimated Weight
                          </label>
                          <input
                            type="text"
                            value={newRequest.estimatedWeight}
                            onChange={(e) => setNewRequest({ ...newRequest, estimatedWeight: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            placeholder="E.g., 5 kg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="size-5 text-blue-600" />
                        Pickup Schedule
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preferred Date *
                          </label>
                          <input
                            type="date"
                            value={newRequest.scheduledDate}
                            onChange={(e) => setNewRequest({ ...newRequest, scheduledDate: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Preferred Time *
                          </label>
                          <select
                            value={newRequest.scheduledTime}
                            onChange={(e) => setNewRequest({ ...newRequest, scheduledTime: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                            required
                          >
                            <option value="">Select time</option>
                            <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                            <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                            <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                            <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Notes
                          </label>
                          <textarea
                            value={newRequest.notes}
                            onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none font-medium"
                            placeholder="Any special instructions or notes for the collector"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="size-5 text-green-700" />
                        </div>
                        <div>
                          <h5 className="font-bold text-green-900 mb-2">Earn Reward Points!</h5>
                          <p className="text-sm text-green-800">
                            You'll earn reward points based on the category and weight of your e-waste. 
                            Points can be redeemed for gift cards, donations, or discounts on future pickups.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold text-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="size-6" />
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('dashboard')}
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Track Tab */}
            {activeTab === 'track' && (
              <div className="animate-slide-in-up">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeRequests.length === 0 ? (
                    <div className="lg:col-span-2 text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <MapPin className="size-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No active pickups to track</p>
                    </div>
                  ) : (
                    activeRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-blue-300 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">{request.id}</h4>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <Package className="size-5 text-gray-400" />
                            <span className="text-gray-700">{getCategoryLabel(request.category)}</span>
                          </div>
                          {request.scheduledDate && (
                            <div className="flex items-center gap-3">
                              <Calendar className="size-5 text-gray-400" />
                              <span className="text-gray-700">{request.scheduledDate} at {request.scheduledTime}</span>
                            </div>
                          )}
                          {request.collectorName && (
                            <div className="flex items-center gap-3">
                              <User className="size-5 text-gray-400" />
                              <span className="text-gray-700">{request.collectorName}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleTrackRequest(request.id)}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          View Details
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="animate-slide-in-up">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Rewards Summary Card */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy className="size-12" />
                        <div>
                          <p className="text-purple-200 text-sm">Your Tier</p>
                          <p className="text-2xl font-bold">
                            {getTierIcon(rewardProfile?.tier || "bronze")} {(rewardProfile?.tier || "bronze").toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-purple-200 text-sm mb-2">Available Points</p>
                          <p className="text-5xl font-bold">{rewardProfile?.totalPoints ?? 0}</p>
                        </div>
                        <div className="pt-4 border-t border-purple-400/30">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-purple-200">Lifetime Earned</span>
                            <span className="font-bold">{rewardProfile?.lifetimePoints ?? 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-200">Total Redeemed</span>
                            <span className="font-bold">{rewardProfile?.redeemedPoints ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 mt-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="size-5 text-yellow-500" />
                        Leaderboard
                      </h4>
                      <div className="space-y-2">
                        {leaderboard.slice(0, 5).map((entry: any) => (
                          <div
                            key={entry.rank}
                            className={`flex items-center justify-between p-3 rounded-xl ${
                              entry.userId === user.id ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">#{entry.rank}</span>
                              <span className={entry.userId === user.id ? 'font-bold text-green-700' : 'text-gray-700'}>
                                {entry.name}
                              </span>
                            </div>
                            <span className="font-bold text-purple-600">{entry.points}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Redemption Catalog */}
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Redeem Your Points</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rewardRedemptions.map((reward: any) => (
                        <div
                          key={reward.id}
                          className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-purple-300 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{reward.icon}</div>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                              {reward.pointsRequired} pts
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-2">{reward.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                          <button
                            disabled={(rewardProfile?.totalPoints ?? 0) < reward.pointsRequired}
                            className={`w-full py-3 rounded-xl font-medium transition-all ${
                              (rewardProfile?.totalPoints ?? 0) >= reward.pointsRequired
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {(rewardProfile?.totalPoints ?? 0) >= reward.pointsRequired ? 'Redeem Now' : 'Not Enough Points'}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Transaction History */}
                    <div className="mt-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h3>
                      <div className="space-y-3">
                        {rewardTransactions.slice(0, 5).map((transaction: any) => (
                          <div key={transaction.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'earned' ? 'bg-green-100' :
                                transaction.type === 'bonus' ? 'bg-blue-100' :
                                'bg-red-100'
                              }`}>
                                {transaction.type === 'earned' ? <TrendingUp className="size-5 text-green-600" /> :
                                 transaction.type === 'bonus' ? <Zap className="size-5 text-blue-600" /> :
                                 <Gift className="size-5 text-red-600" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{transaction.description}</p>
                                <p className="text-xs text-gray-500">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Recycling Certificates</h3>
                  <p className="text-gray-600">Download certificates for your completed recycling contributions</p>
                </div>

                {completedRequests.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <FileCheck className="size-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Certificates Yet</h4>
                    <p className="text-gray-600 mb-6">Complete your first recycling pickup to earn a certificate</p>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium inline-flex items-center gap-2"
                    >
                      <Plus className="size-5" />
                      Schedule a Pickup
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedRequests.map((request, index) => (
                      <div
                        key={request.id}
                        className="bg-gradient-to-br from-white to-green-50 rounded-2xl border-2 border-green-200 p-6 hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="size-5 text-green-600" />
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <FileCheck className="size-8 text-white" />
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="bg-white/60 rounded-xl p-3 border border-green-200">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Weight</p>
                                <p className="font-semibold text-gray-900">{request.weight || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Points Earned</p>
                                <p className="font-semibold text-green-600">{request.rewardPoints || 0}</p>
                              </div>
                            </div>
                          </div>

                          {request.scheduledDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="size-4" />
                              <span>Recycled on: {request.scheduledDate}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Star className="size-5 text-green-700 mt-0.5" />
                            <div>
                              <p className="font-semibold text-green-900 mb-1">Environmental Impact</p>
                              <p className="text-sm text-green-800">
                                Thank you for contributing to a cleaner environment!
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadCertificate(request.id)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Download className="size-5" />
                          Download Certificate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Messages</h3>
                  {activeRequests.length > 0 && (
                    <button
                      onClick={() => simulateReceiveOTP(activeRequests[0].id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-medium flex items-center gap-2"
                    >
                      <ShieldCheck className="size-4" />
                      Request OTP from Collector
                    </button>
                  )}
                </div>

                {/* OTP Notification */}
                {showOTPNotification && receivedOTP && (
                  <div className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl animate-slide-in-down">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <ShieldCheck className="size-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">OTP Received from Collector</h4>
                            <p className="text-blue-100 text-sm">Request ID: {otpRequestId}</p>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
                          <p className="text-blue-100 text-sm mb-2">Your verification code:</p>
                          <div className="flex items-center gap-3">
                            <p className="text-4xl font-bold tracking-widest font-mono">{receivedOTP}</p>
                            <button
                              onClick={copyOTP}
                              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <FileText className="size-4" />
                              Copy
                            </button>
                          </div>
                        </div>
                        <p className="text-blue-100 text-sm">
                          Use this code to verify the pickup with your collector. Valid for 10 minutes.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOTPNotification(false)}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ml-4"
                      >
                        <X className="size-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Conversations List */}
                  <div className="lg:col-span-1 bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Conversations</h4>
                    <div className="space-y-2">
                      {userConversations.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No messages yet</p>
                      ) : (
                        userConversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all ${
                              selectedConversation === conv.id
                                ? 'bg-white shadow-md border-2 border-green-300'
                                : 'bg-white hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">{conv.relatedRequestId}</span>
                              {conv.unreadCount > 0 && (
                                <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden flex flex-col" style={{ height: '600px' }}>
                    {selectedConversation ? (
                      <>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900">{selectedConv?.relatedRequestId}</h4>
                              <p className="text-sm text-gray-600">Chat with collector</p>
                            </div>
                            <button
                              onClick={() => selectedConv && simulateReceiveOTP(selectedConv.relatedRequestId)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm font-medium flex items-center gap-2"
                            >
                              <ShieldCheck className="size-4" />
                              Request OTP
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          {conversationMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-md px-4 py-3 rounded-2xl ${
                                  msg.senderId === user.id
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                }`}
                              >
                                <p className="font-medium">{msg.message}</p>
                                <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-green-100' : 'text-gray-500'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="Type your message..."
                            />
                            <button
                              onClick={handleSendMessage}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                              <Send className="size-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <MessageSquare className="size-16 mx-auto mb-4" />
                          <p>Select a conversation to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">E-Waste Awareness Tips</h3>
                  <p className="text-gray-600">Learn how to properly handle and recycle electronic waste</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    {
                      icon: Recycle,
                      title: "Why Recycle E-Waste?",
                      tips: [
                        "Prevents toxic chemicals from entering the environment",
                        "Conserves natural resources by recovering precious metals",
                        "Reduces the need for mining raw materials",
                        "Creates jobs in recycling industries"
                      ],
                      color: "from-green-500 to-emerald-600"
                    },
                    {
                      icon: CheckCircle,
                      title: "What Can Be Recycled?",
                      tips: [
                        "Computers, laptops, and tablets",
                        "Mobile phones and accessories",
                        "TVs, monitors, and displays",
                        "Printers, scanners, and copiers"
                      ],
                      color: "from-blue-500 to-cyan-600"
                    },
                    {
                      icon: ShieldCheck,
                      title: "Data Security",
                      tips: [
                        "Always backup your important data",
                        "Factory reset all devices before recycling",
                        "Remove SIM cards and memory cards",
                        "Use data wiping software for extra security"
                      ],
                      color: "from-purple-500 to-indigo-600"
                    },
                    {
                      icon: Lightbulb,
                      title: "Best Practices",
                      tips: [
                        "Keep batteries separate from other electronics",
                        "Do not break or disassemble devices yourself",
                        "Schedule pickup rather than disposing in trash",
                        "Donate working devices for reuse"
                      ],
                      color: "from-orange-500 to-red-600"
                    }
                  ].map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <div key={index} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
                        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} mb-4`}>
                          <Icon className="size-8 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h4>
                        <ul className="space-y-3">
                          {section.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-gray-700">
                              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Campaigns */}
                {userCampaigns.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Active Campaigns</h3>
                    <div className="space-y-4">
                      {userCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className={`border-2 rounded-2xl p-6 ${
                            campaign.type === 'promotion' ? 'border-green-300 bg-green-50' :
                            campaign.type === 'awareness' ? 'border-blue-300 bg-blue-50' :
                            'border-yellow-300 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-4 rounded-xl ${
                              campaign.type === 'promotion' ? 'bg-green-200' :
                              campaign.type === 'awareness' ? 'bg-blue-200' :
                              'bg-yellow-200'
                            }`}>
                              <Bell className={`size-6 ${
                                campaign.type === 'promotion' ? 'text-green-700' :
                                campaign.type === 'awareness' ? 'text-blue-700' :
                                'text-yellow-700'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{campaign.title}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                  campaign.type === 'promotion' ? 'bg-green-200 text-green-800' :
                                  campaign.type === 'awareness' ? 'bg-blue-200 text-blue-800' :
                                  'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {campaign.type}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-3">{campaign.message}</p>
                              <p className="text-xs text-gray-500">
                                Posted: {new Date(campaign.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Track Pickup</h3>
                  <p className="text-blue-100">{selectedReq.id}</p>
                </div>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Status Timeline */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-6">Tracking Timeline</h4>
                <div className="space-y-4">
                  {selectedReq.trackingHistory?.map((update, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          update.status === 'completed' ? 'bg-green-500' :
                          update.status === 'in_progress' ? 'bg-blue-500' :
                          update.status === 'assigned' ? 'bg-yellow-500' :
                          'bg-gray-300'
                        }`}>
                          <Circle className="size-5 text-white fill-current" />
                        </div>
                        {index < (selectedReq.trackingHistory?.length || 0) - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <p className="font-semibold text-gray-900 capitalize">{update.status.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(update.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="size-12 mx-auto mb-3 text-gray-300" />
                      <p>Tracking information will be available soon</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4">Pickup Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{getCategoryLabel(selectedReq.category)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedReq.status)}`}>
                      {selectedReq.status.toUpperCase()}
                    </span>
                  </div>
                  {selectedReq.scheduledDate && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">{selectedReq.scheduledDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Time</p>
                        <p className="font-semibold text-gray-900">{selectedReq.scheduledTime}</p>
                      </div>
                    </>
                  )}
                  {selectedReq.collectorName && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Collector</p>
                      <p className="font-semibold text-gray-900">{selectedReq.collectorName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
