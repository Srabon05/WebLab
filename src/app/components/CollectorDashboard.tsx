import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Recycle, LogOut, Truck, MapPin, CheckCircle,
  Clock, Navigation, Phone, MessageSquare, Send,
  Award, Calendar, Package, User,
  Bell, Sparkles, TrendingUp, Star, Route, Zap,
  AlertCircle, Eye, X, Check, XCircle, ChevronDown,
  UserCircle, HelpCircle, Settings, Mail, BookOpen,
  Search, MoreVertical, Image, Paperclip, Smile,
  CheckCheck, Circle, Mic, FileText, Download, Video,
  ThumbsUp, Heart, Laugh, Building2
} from "lucide-react";

// Bangladeshi Taka Icon Component
const TakaIcon = ({ className = "size-5" }: { className?: string }) => (
  <span className={`font-bold ${className}`} style={{ fontFamily: 'Arial, sans-serif' }}>৳</span>
);
import { getCurrentUser, logout } from "../lib/auth";
import { apiRequest } from "../lib/api";
import { WithdrawModal } from "./WithdrawModal";
import { DumpingConfirmationModal } from "./DumpingConfirmationModal";
import { 
  getCategoryLabel,
  getStatusColor,
  CollectionRequest,
  CollectionStatus
} from "../lib/data";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";

export function CollectorDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // State Declarations
  const [activeTab, setActiveTab] = useState<'dashboard' | 'available' | 'assigned' | 'deliveries' | 'completed' | 'earnings' | 'messages'>('dashboard');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [showDumpingModal, setShowDumpingModal] = useState(false);
  const [selectedDumpRequest, setSelectedDumpRequest] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [collectionRequests, setCollectionRequests] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    void logout();
    navigate('/');
  };

  // Check authentication with useEffect to avoid setState during render
  useEffect(() => {
    if (!user || user.role !== 'collector') {
      navigate('/login');
    }
  }, [user, navigate]);

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

  const loadConversations = async () => {
    try {
      const convs = await apiRequest("/conversations/");
      setConversations(convs as any[]);
    } catch {
      // ignore refresh errors
    }
  };

  useEffect(() => {
    if (activeTab !== "messages") return;
    void loadConversations();
    const intervalId = setInterval(() => {
      void loadConversations();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (activeTab !== "messages" || !selectedConversation) return;
    const intervalId = setInterval(async () => {
      try {
        const msgs = await apiRequest(`/chat-messages/?conversationId=${selectedConversation}`);
        setChatMessages(msgs as any[]);
      } catch {
        // ignore refresh errors
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [activeTab, selectedConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedConversation]);


  // Load backend data - MUST BE BEFORE EARLY RETURNS
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [reqs, cols, convs] = await Promise.all([
          apiRequest("/collection-requests/"),
          apiRequest("/collectors/"),
          apiRequest("/conversations/"),
        ]);
        setCollectionRequests(reqs as any[]);
        setCollectors(cols as any[]);
        setConversations(convs as any[]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);


  
  // Quick replies
  const quickReplies = [
    "I'm on my way",
    "Running 5 mins late",
    "Arrived at location",
    "Please come outside",
    "Thank you!"
  ];

  // Emoji options for picker
  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '🙏', '👏', '✅', '🚚', '♻️', '⭐', '💯'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Get collector data
  const collector = collectors.find(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
  
  // Early return if not authorized
  if (!user || user.role !== 'collector') {
    return null; // Let useEffect handle navigation
  }

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle case where collector profile is missing
  if (!collector) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="size-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collector Profile Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find a collector profile associated with {user.email}. Please contact support.</p>
          <button 
            onClick={handleLogout}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Filter collections for this collector
  const myCollections = collectionRequests.filter(
    r => String(r.collectorId) === String(collector?.id)
  );
  
  const availableRequests = collectionRequests.filter(
    r => r.status === 'pending' && !r.collectorId
  );
  
  const assignedCollections = myCollections.filter(
    r => r.status === 'assigned' || r.status === 'in_progress'
  );
  
  const completedCollections = myCollections.filter(
    r => r.status === 'completed'
  );

  const toDeliverCollections = myCollections.filter(
    r => r.status === 'picked_up' || r.status === 'received'
  );

  // 1-on-1 Conversation Logic: Map everything to individuals
  const visibleRequests = [...myCollections, ...availableRequests];
  const getIndividualContacts = () => {
    const contacts: any[] = [];
    const seenIds = new Set();

    // 1. Add people from existing conversations
    conversations.forEach(conv => {
      const others = (conv.participants || []).filter(
        (p: any) => String(p.id) !== String(user?.id) && String(p.id) !== String(collector?.id)
      );
      others.forEach((p: any) => {
        if (!seenIds.has(String(p.id))) {
          contacts.push({
            id: conv.id,
            realConvId: conv.id,
            targetId: String(p.id),
            displayName: p.name,
            role: p.role,
            lastMessage: conv.last_message || "No messages",
            lastMessageTime: conv.last_message_time || new Date().toISOString(),
            unreadCount: conv.unread_count || 0,
            isPotential: false
          });
          seenIds.add(String(p.id));
        }
      });
    });

    // 2. Add people from visible requests (who don't have a conversation yet)
    visibleRequests.forEach(req => {
      const participants = [
        { id: String(req.userId), name: req.userName, role: 'user' },
        req.recyclingCenterId ? { id: String(req.recyclingCenterId), name: req.recyclingCenterName, role: 'recycling_center' } : null
      ].filter(Boolean);

      participants.forEach(p => {
        if (p && !seenIds.has(p.id)) {
          contacts.push({
            id: `potential-${p.id}`,
            targetId: p.id,
            displayName: p.name,
            role: p.role,
            relatedRequestId: req.id,
            lastMessage: "Start a conversation",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isPotential: true
          });
          seenIds.add(p.id);
        }
      });
    });

    return contacts;
  };

  const finalSidebarList = getIndividualContacts();
  const filteredConversations = finalSidebarList.filter(conv =>
    (conv.displayName || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    (conv.targetId || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  const selectedReq = collectionRequests.find(r => String(r.id) === String(selectedRequest));
  const selectedConv = finalSidebarList.find(c => String(c.id) === String(selectedConversation));
  const conversationMessages = chatMessages.filter(m => String(m.conversationId) === String(selectedConversation));
  
  // Scroll to bottom of messages

  
  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
  };
  
  const handleSettings = () => {
    setShowProfileDropdown(false);
    setShowSettingsModal(true);
  };
  
  const handleHelp = () => {
    setShowProfileDropdown(false);
    setShowHelpModal(true);
  };

  const handleAcceptRequest = (requestId: string) => {
    (async () => {
      try {
        await apiRequest(`/collection-requests/${requestId}/`, {
          method: "PATCH",
          body: JSON.stringify({
            collectorId: collector?.id,
            status: "assigned",
            assignedAt: new Date().toISOString(),
          }),
        });
        const reqs = await apiRequest("/collection-requests/");
        setCollectionRequests(reqs as any[]);
      } catch {
        // ignore
      }
    })();

    setCollectionRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, collectorId: collector?.id, status: 'assigned' as const, assignedAt: new Date().toISOString() }
          : request
      )
    );
    
    // Switch to assigned tab
    setActiveTab('assigned');
    
    toast.success('Request accepted!', {
      description: 'User has been notified. Check assigned tab to start pickup.'
    });
  };

  const handleStartPickup = (requestId: string) => {
    (async () => {
      try {
        await apiRequest(`/collection-requests/${requestId}/`, {
          method: "PATCH",
          body: JSON.stringify({ status: "in_progress" }),
        });
        const reqs = await apiRequest("/collection-requests/");
        setCollectionRequests(reqs as any[]);
      } catch {
        // ignore
      }
    })();

    setCollectionRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'in_progress' as const }
          : request
      )
    );
    
    setSelectedRequest(requestId);
    
    toast.success('Pickup started!', {
      description: 'Navigate to the pickup location. Good luck!'
    });
  };

  const handleCompletePickup = (requestId: string) => {
    handleSendOTP(requestId);
  };

  const handleSendOTP = (requestId: string) => {
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    (async () => {
      try {
        await apiRequest(`/collection-requests/${requestId}/`, {
          method: "PATCH",
          body: JSON.stringify({
            pickupOTP: generatedOTP,
          }),
        });
        
        // Create notification for the user
        const currentReq = collectionRequests.find(r => r.id === requestId);
        if (currentReq?.userId) {
          await apiRequest(`/notifications/`, {
            method: "POST",
            body: JSON.stringify({
              userId: currentReq.userId,
              title: "Verification OTP",
              message: `Your verification code for pickup ${requestId} is ${generatedOTP}. Share this with the collector to complete your request.`,
              type: "otp"
            })
          });
        }

        const reqs = await apiRequest("/collection-requests/");
        setCollectionRequests(reqs as any[]);
      } catch {
        // ignore
      }
    })();
    toast.success('OTP sent to user!', {
      description: `Verification code ${generatedOTP} has been sent to the user's device.`
    });
    setSelectedRequest(requestId);
    setShowOTPModal(true);
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      (async () => {
        try {
          await apiRequest(`/collection-requests/${selectedRequest}/`, {
            method: "PATCH",
            body: JSON.stringify({
              status: "picked_up",
              completedAt: new Date().toISOString(),
              otpVerifiedAt: new Date().toISOString(),
            }),
          });
          const reqs = await apiRequest("/collection-requests/");
          setCollectionRequests(reqs as any[]);
        } catch {
          // ignore
        }
      })();
      // Mark request as completed
      setCollectionRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === selectedRequest
            ? { ...request, status: 'completed' as const, completedAt: new Date().toISOString() }
            : request
        )
      );

      toast.success('Pickup completed successfully!', {
        description: 'OTP verified! Keep up the great work! Your salary is secure.'
      });
      setShowOTPModal(false);
      setOtp('');
      setSelectedRequest(null);

      // Switch to completed tab
      setActiveTab('completed');
    } else {
      toast.error('Invalid OTP', {
        description: 'Please enter a 6-digit OTP.'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    let convId = selectedConversation;
    const isPotential = convId.startsWith('potential-') || convId.startsWith('general-');

    try {
      if (isPotential) {
        const potentialConv = selectedConv;
        const resp = await apiRequest("/conversations/", {
          method: "POST",
          body: JSON.stringify({
            related_request: potentialConv?.relatedRequestId || null,
            participants: [
              { id: String(collector?.id || user?.id), name: collector?.name || user?.name, role: 'collector' },
              { id: String(potentialConv?.targetId), name: potentialConv?.displayName, role: potentialConv?.role }
            ]
          })
        });
        const realConv = resp as any;
        convId = realConv.id;
        setSelectedConversation(convId);
        // Refresh conversations list
        const allConvs = await apiRequest("/conversations/");
        setConversations(allConvs as any[]);
      }

      await apiRequest("/chat-messages/", {
        method: "POST",
        body: JSON.stringify({
          conversationId: convId,
          senderId: String(collector?.id || user?.id),
          senderName: collector?.name || user?.name || "Collector",
          senderRole: "collector",
          message: newMessage.trim(),
          timestamp: new Date().toISOString(),
          read: false,
        }),
      });
      const msgs = await apiRequest(`/chat-messages/?conversationId=${convId}`);
      setChatMessages(msgs as any[]);
      await loadConversations();
      toast.success('Message sent');
      setNewMessage('');
      setShowEmojiPicker(false);
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };
  
  const handleQuickReply = (reply: string) => {
    setNewMessage(reply);
    // Auto-send quick replies by calling handleSendMessage
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleImageAttach = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success('File attached', {
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      });
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after 60 seconds
      setTimeout(() => {
        setIsRecording(false);
        clearInterval(interval);
        toast.success('Voice message recorded');
        setRecordingDuration(0);
      }, 60000);
    } else {
      setIsRecording(false);
      setRecordingDuration(0);
      toast.success('Voice message sent');
    }
  };
  
  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || amount <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid withdrawal amount'
      });
      return;
    }
    
    if (amount > collector.balance) {
      toast.error('Insufficient balance', {
        description: `You can only withdraw up to ৳${collector.balance.toLocaleString()}`
      });
      return;
    }
    
    if (amount < 100) {
      toast.error('Minimum withdrawal', {
        description: 'Minimum withdrawal amount is ৳100'
      });
      return;
    }
    
    if (!accountNumber || accountNumber.length < 10) {
      toast.error('Invalid account', {
        description: 'Please enter a valid account number'
      });
      return;
    }
    
    // Process withdrawal
    toast.success('Withdrawal requested!', {
      description: `৳${amount.toLocaleString()} will be transferred to your ${withdrawMethod.toUpperCase()} account within 24 hours`
    });
    
    // Reset form
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setAccountNumber('');
  };

  const handleConfirmDumping = (centerId: string, notes: string) => {
    if (!selectedDumpRequest) return;

    (async () => {
      try {
        await apiRequest(`/collection-requests/${selectedDumpRequest}/`, {
          method: "PATCH",
          body: JSON.stringify({
            status: "received",
            receivedAt: new Date().toISOString(),
          }),
        });
        const reqs = await apiRequest("/collection-requests/");
        setCollectionRequests(reqs as any[]);
        
        toast.success('Delivery Confirmed!', {
          description: `Items from request ${selectedDumpRequest} delivered to recycling center.`
        });
      } catch (error) {
        toast.error('Failed to confirm delivery');
      } finally {
        // Reset state
        setShowDumpingModal(false);
        setSelectedDumpRequest(null);
      }
    })();
  };

  // Add notification handler
  const handleNotifications = () => {
    toast.info('Notifications', {
      description: `You have ${availableRequests.length} new pickup requests available!`
    });
  };

  // Add navigation handler
  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address || 'Dhaka, Bangladesh');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    toast.success('Opening Maps', {
      description: 'Navigation opened in new tab'
    });
  };

  // Add call handler
  const handleCall = (requestId: string) => {
    toast.success('Calling User', {
      description: `Initiating call for request ${requestId}`
    });
  };

  // Add voice call handler
  const handleVoiceCall = () => {
    toast.info('Voice Call', {
      description: 'Voice call feature coming soon!'
    });
  };

  // Add video call handler
  const handleVideoCall = () => {
    toast.info('Video Call', {
      description: 'Video call feature coming soon!'
    });
  };

  // Add more options handler
  const handleMoreOptions = () => {
    toast.info('Options', {
      description: 'More conversation options coming soon!'
    });
  };

  // Add message reaction handler
  const handleMessageReaction = (messageId: string, reaction: string) => {
    toast.success('Reaction Added', {
      description: `${reaction} added to message`
    });
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };
  


  const totalEarnings = completedCollections.reduce((sum, r) => sum + (r.pickupCharge || 0), 0);
  const todayEarnings = completedCollections.filter(r => {
    if (!r.completedAt) return false;
    const completedDate = new Date(r.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).reduce((sum, r) => sum + (r.pickupCharge || 0), 0);

  // Salary-based earnings
  const monthlySalary = 18000; // Base monthly salary in BDT
  const dailySalary = Math.round(monthlySalary / 30); // Daily salary
  const currentDate = new Date();
  const workedDays = currentDate.getDate(); // Days worked this month
  const earnedSalary = workedDays * dailySalary; // Salary earned so far this month

  const stats = [
    {
      icon: Clock,
      label: 'Active Pickups',
      value: assignedCollections.length.toString(),
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      icon: CheckCircle,
      label: 'Completed Today',
      value: completedCollections.filter(r => {
        if (!r.completedAt) return false;
        const completedDate = new Date(r.completedAt);
        const today = new Date();
        return completedDate.toDateString() === today.toDateString();
      }).length.toString(),
      color: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      icon: TakaIcon,
      label: 'My Balance',
      value: `৳${collector.balance || 0}`,
      color: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      icon: Star,
      label: 'Rating',
      value: collector.rating.toString(),
      color: 'from-yellow-500 to-yellow-600',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

  const sidebarMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Truck },
    { key: 'assigned', label: 'Assigned', icon: Truck, badge: assignedCollections.length },
    { key: 'available', label: 'Available', icon: Package, badge: availableRequests.length },
    { key: 'deliveries', label: 'Deliveries', icon: Truck, badge: toDeliverCollections.length },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'earnings', label: 'My Wallet', icon: TakaIcon },
    { key: 'messages', label: 'Messages', icon: MessageSquare, badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-cyan-50/30 overflow-hidden">
      <Sidebar
        user={{ name: user?.name || 'Collector', email: user?.email || '', role: user?.role || 'collector' }}
        menuItems={sidebarMenuItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        gradientFrom="from-blue-500"
        gradientTo="to-cyan-600"
        title="Collector Dashboard"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'assigned' && 'My Assigned Collections'}
                  {activeTab === 'available' && 'Available Collections'}
                  {activeTab === 'deliveries' && 'Items to Deliver'}
                  {activeTab === 'completed' && 'Completed Collections'}
                  {activeTab === 'earnings' && 'My Wallet'}
                  {activeTab === 'messages' && 'Messages'}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {collector.name}
                  <Sparkles className="size-3 text-yellow-500" />
                  <span className="font-semibold">⭐ {collector.rating}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleNotifications}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="size-5 text-gray-600" />
                  {availableRequests.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
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
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 card-hover group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bgLight} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className={`size-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Salary & Withdraw Section */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl shadow-xl p-6 mb-6 animate-slide-in-up">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <TakaIcon className="size-7 text-white" />
                    </div>
                    <div>
                      <p className="text-yellow-100 text-sm">Available Balance</p>
                      <h2 className="text-4xl font-bold text-white">৳{collector.balance.toLocaleString()}</h2>
                    </div>
                  </div>
                  <p className="text-yellow-100 text-sm">Lifetime earnings: ৳{totalEarnings.toLocaleString()} • Completed: {completedCollections.length}</p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <TrendingUp className="size-5" />
                  Withdraw Money
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setActiveTab('available')}
                className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-green-100 text-sm mb-1">New Requests</p>
                  <p className="font-bold text-lg flex items-center gap-2">
                    Available Pickups
                    {availableRequests.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                        {availableRequests.length}
                      </span>
                    )}
                  </p>
                </div>
                <Package className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('assigned')}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-blue-100 text-sm mb-1">In Progress</p>
                  <p className="font-bold text-lg flex items-center gap-2">
                    My Pickups
                    {assignedCollections.length > 0 && (
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-bold">
                        {assignedCollections.length}
                      </span>
                    )}
                  </p>
                </div>
                <Truck className="size-8 opacity-75 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('earnings')}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-purple-100 text-sm mb-1">Monthly Salary</p>
                  <p className="font-bold text-lg">৳{monthlySalary.toLocaleString()}</p>
                </div>
                <TakaIcon className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            </>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="animate-slide-in-up">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Collector Overview</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Schedule */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="size-5 text-blue-600" />
                        Today's Schedule
                      </h4>
                      <div className="space-y-3">
                        {assignedCollections.slice(0, 5).map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Truck className="size-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{request.id}</p>
                                <p className="text-xs text-gray-600">{getCategoryLabel(request.category)}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                        {assignedCollections.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Clock className="size-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No assigned pickups today</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl p-6 border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="size-5 text-cyan-600" />
                        Performance
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Completed</span>
                          <span className="text-2xl font-bold text-gray-900">{completedCollections.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">In Progress</span>
                          <span className="text-2xl font-bold text-blue-600">{assignedCollections.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rating</span>
                          <span className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                            ⭐ {collector.rating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Earned This Month</span>
                          <span className="text-2xl font-bold text-green-600">৳{earnedSalary.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Pickups Tab */}
            {activeTab === 'available' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Available Pickups</h3>
                  <p className="text-gray-600">Accept requests and start earning</p>
                </div>

                {availableRequests.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Package className="size-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Available Requests</h4>
                    <p className="text-gray-600">Check back later for new pickup opportunities</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {availableRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-green-300 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                AVAILABLE
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Package className="size-4" />
                              {getCategoryLabel(request.category)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Items</p>
                                <p className="font-semibold text-gray-900">{request.items}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Weight</p>
                                <p className="font-semibold text-gray-900">{request.estimatedWeight || 'TBD'}</p>
                              </div>
                            </div>
                          </div>

                          {request.scheduledDate && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                              <Calendar className="size-4 text-blue-600" />
                              <span className="text-blue-900">
                                <span className="font-semibold">Pickup:</span> {request.scheduledDate} at {request.scheduledTime}
                              </span>
                            </div>
                          )}

                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2 text-sm">
                            <MapPin className="size-4 text-purple-600" />
                            <span className="text-purple-900">
                              <span className="font-semibold">Location:</span> {request.userAddress || 'View after accepting'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold"
                        >
                          <Check className="size-5" />
                          Accept Request
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Assigned Pickups Tab */}
            {activeTab === 'assigned' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">My Active Pickups</h3>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                    <Truck className="size-4" />
                    <span>{assignedCollections.length} active</span>
                  </div>
                </div>

                {assignedCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Truck className="size-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Active Pickups</h4>
                    <p className="text-gray-600">Accept available requests to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedCollections.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-blue-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">{request.id}</h4>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600">{getCategoryLabel(request.category)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">User</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              <User className="size-4" />
                              {request.userName}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">Schedule</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              <Calendar className="size-4" />
                              {request.scheduledDate}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 mb-1">Items</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              <Package className="size-4" />
                              {request.quantity || 'Multiple'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900 mb-1">Pickup Location</p>
                              <p className="text-sm text-gray-700">{request.userAddress || '123 Main St, City'}</p>
                            </div>
                            <button 
                              onClick={() => handleNavigate(request.userAddress || '')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Navigate
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {request.status === 'assigned' && (
                            <button
                              onClick={() => handleStartPickup(request.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                            >
                              <Navigation className="size-5" />
                              Start Pickup
                            </button>
                          )}
                          {request.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => handleCompletePickup(request.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                              >
                                <CheckCircle className="size-5" />
                                Complete Pickup
                              </button>
                              <button 
                                onClick={() => handleCall(request.id)}
                                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                              >
                                <Phone className="size-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Deliveries Tab */}
            {activeTab === 'deliveries' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Items to Deliver</h3>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                    <Truck className="size-4" />
                    <span>{toDeliverCollections.length} items in transit</span>
                  </div>
                </div>

                {toDeliverCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Truck className="size-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No items currently with you for delivery</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {toDeliverCollections.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-blue-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                request.status === 'received' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {request.status === 'received' ? 'DELIVERED - AWAITING CONFIRMATION' : 'PICKED UP'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                             <p>Picked up: {request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                           <div className="flex items-start gap-3">
                              <Building2 className="size-5 text-gray-400 mt-1" />
                              <div>
                                 <p className="text-xs text-gray-500">Deliver To</p>
                                 <p className="font-bold text-gray-900">{request.recyclingCenterName}</p>
                                 <p className="text-sm text-gray-600">{request.recyclingCenterAddress}</p>
                              </div>
                           </div>
                        </div>

                        {request.status === 'picked_up' && (
                           <button
                             onClick={() => {
                               setSelectedDumpRequest(request.id);
                               setShowDumpingModal(true);
                             }}
                             className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
                           >
                             <Truck className="size-5" />
                             Deliver to Recycling Center
                           </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Tab */}
            {activeTab === 'completed' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Completed Pickups</h3>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                    <CheckCircle className="size-4" />
                    <span>{completedCollections.length} completed</span>
                  </div>
                </div>

                {completedCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <CheckCircle className="size-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No completed pickups yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedCollections.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-green-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                COMPLETED
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className="text-sm font-bold text-green-600">Completed</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Date</p>
                            <p className="font-semibold text-gray-900">{request.scheduledDate}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Weight</p>
                            <p className="font-semibold text-gray-900">{request.weight || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500 text-xs mb-1">Items</p>
                            <p className="font-semibold text-gray-900">{request.quantity || 1}</p>
                          </div>
                        </div>

                        {/* Deliver to Center Button removed from here */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === 'earnings' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TakaIcon className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Wallet & Withdraw</h3>
                  <p className="text-gray-600">Manage your earnings and withdrawal requests</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
                    <p className="text-purple-100 text-sm mb-2">Available Balance</p>
                    <p className="text-5xl font-bold mb-2">৳{collector.balance.toLocaleString()}</p>
                    <p className="text-purple-100 text-sm">Withdraw anytime to your account</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
                    <p className="text-green-100 text-sm mb-2">Total Earned</p>
                    <p className="text-5xl font-bold mb-2">৳{totalEarnings.toLocaleString()}</p>
                    <p className="text-green-100 text-sm">Lifetime earnings from pickups</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Withdraw Funds</h4>
                      <p className="text-gray-500 text-sm">Transfer your balance to bKash or Bank</p>
                    </div>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      Withdraw Now
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                  <h4 className="font-bold text-gray-900 mb-6">Attendance & Performance</h4>
                  <div className="space-y-3">
                    {completedCollections.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="size-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{request.id}</p>
                            <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">Completed</p>
                          <p className="text-xs text-gray-500">{request.scheduledDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-600">Chat with users about pickups</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                    <MessageSquare className="size-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      {collectorConversations.length} conversation{collectorConversations.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Conversations List */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Conversations */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <MessageSquare className="size-5 text-blue-600" />
                          Conversations
                        </h4>
                      </div>
                      
                      <div className="max-h-[600px] overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                          <div className="text-center py-16 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <MessageSquare className="size-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium mb-1">No conversations</p>
                            <p className="text-sm text-gray-400">
                              {searchQuery ? 'No results found' : 'Messages will appear here'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {filteredConversations.map((conv) => (
                              <button
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv.id)}
                                className={`w-full text-left p-4 rounded-xl transition-all group ${
                                  selectedConversation === conv.id
                                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md border-2 border-blue-300'
                                    : 'hover:bg-gray-50 border-2 border-transparent'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Avatar */}
                                  <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                      selectedConversation === conv.id 
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                    }`}>
                                      {(conv.displayName || "U").charAt(0).toUpperCase()}
                                    </div>
                                    {/* Online status */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-gray-900 truncate">{conv.displayName}</span>
                                      {conv.unreadCount > 0 && (
                                        <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                                          {conv.unreadCount}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                        conv.role === 'recycling_center' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                                      }`}>
                                        {conv.role === 'recycling_center' ? 'Center' : 'User'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                                    <p className="text-xs text-gray-400">{formatMessageTime(conv.lastMessageTime)}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden flex flex-col shadow-lg" style={{ height: '700px' }}>
                    {selectedConversation ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-white text-lg backdrop-blur-sm">
                                  {(selectedConv?.displayName || "U").charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                              </div>
                                <div>
                                  <h4 className="font-bold text-white text-lg">{selectedConv?.displayName}</h4>
                                  <div className="flex gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                      selectedConv?.role === 'recycling_center' ? 'bg-purple-400 text-white' : 'bg-green-400 text-white'
                                    }`}>
                                      {selectedConv?.role === 'recycling_center' ? 'Center' : 'User'}
                                    </span>
                                  </div>
                                </div>
                              <div>
                                <p className="text-sm text-blue-100 flex items-center gap-2">
                                  <Circle className="size-2 fill-green-400 text-green-400" />
                                  <span>Active now</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={handleVoiceCall}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all hover:scale-110 group"
                                title="Voice call"
                              >
                                <Phone className="size-5 text-white group-hover:rotate-12 transition-transform" />
                              </button>
                              <button 
                                onClick={handleVideoCall}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all hover:scale-110 group"
                                title="Video call"
                              >
                                <Video className="size-5 text-white" />
                              </button>
                              <button 
                                onClick={handleMoreOptions}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                title="More options"
                              >
                                <MoreVertical className="size-5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                          {conversationMessages.map((msg, index) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderRole === 'collector' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className={`flex items-end gap-2 max-w-md ${msg.senderRole === 'collector' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar based on role */}
                                {msg.senderRole !== 'collector' && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                                    msg.senderRole === 'recycling_center' ? 'bg-purple-500' : 'bg-green-500'
                                  }`}>
                                    {msg.senderRole === 'recycling_center' ? 'RC' : 'U'}
                                  </div>
                                )}
                                
                                <div
                                  className={`relative group px-5 py-3 rounded-2xl shadow-sm ${
                                    msg.senderRole === 'collector'
                                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm'
                                      : 'bg-white border-2 border-gray-100 text-gray-900 rounded-bl-sm'
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">{msg.message}</p>
                                  <div className={`flex items-center gap-2 mt-2 ${msg.senderRole === 'collector' ? 'justify-end' : ''}`}>
                                    <p className={`text-xs ${msg.senderRole === 'collector' ? 'text-blue-100' : 'text-gray-500'}`}>
                                      {formatMessageTime(msg.timestamp)}
                                    </p>
                                    {msg.senderRole === 'collector' && (
                                      <CheckCheck className="size-3 text-blue-200" />
                                    )}
                                  </div>

                                  {/* Quick reactions on hover */}
                                  <div className={`absolute -top-8 ${msg.senderRole === 'collector' ? 'right-0' : 'left-0'} bg-white border-2 border-gray-200 rounded-full shadow-lg px-2 py-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <button 
                                      onClick={() => handleMessageReaction(msg.id, '👍')}
                                      className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                      title="Like"
                                    >
                                      👍
                                    </button>
                                    <button 
                                      onClick={() => handleMessageReaction(msg.id, '❤️')}
                                      className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                      title="Love"
                                    >
                                      ❤️
                                    </button>
                                    <button 
                                      onClick={() => handleMessageReaction(msg.id, '😂')}
                                      className="w-7 h-7 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                      title="Laugh"
                                    >
                                      😂
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Typing Indicator */}
                          {isTyping && (
                            <div className="flex justify-start animate-fade-in">
                              <div className="flex items-end gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  U
                                </div>
                                <div className="px-5 py-3 bg-white border-2 border-gray-100 rounded-2xl rounded-bl-sm">
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-gray-200">
                          <div className="flex items-center gap-3 mb-3">
                            <Zap className="size-4 text-blue-600" />
                            <h4 className="text-sm font-bold text-gray-900">Quick Replies</h4>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="px-4 py-2.5 bg-white border-2 border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium whitespace-nowrap flex-shrink-0 hover:scale-105"
                              >
                                <span className="mr-2">⚡</span>
                                {reply}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                          {/* Hidden file inputs */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                          />
                          <input
                            ref={imageInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                          />

                          {/* Recording indicator */}
                          {isRecording && (
                            <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                <Mic className="size-5 text-red-600" />
                              </div>
                              <span className="text-sm font-semibold text-red-900">
                                Recording: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                              </span>
                              <button
                                onClick={handleVoiceRecord}
                                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                Stop & Send
                              </button>
                            </div>
                          )}

                          <div className="flex items-end gap-2">
                            {/* Attachment buttons */}
                            <div className="flex gap-2">
                              <button 
                                onClick={handleFileAttach}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 group relative"
                                title="Attach file"
                              >
                                <Paperclip className="size-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                              </button>
                              <button 
                                onClick={handleImageAttach}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 group relative"
                                title="Attach image"
                              >
                                <Image className="size-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                              </button>
                              <button 
                                onClick={handleVoiceRecord}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                                  isRecording 
                                    ? 'bg-red-100 hover:bg-red-200' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                title="Voice message"
                              >
                                <Mic className={`size-5 ${isRecording ? 'text-red-600' : 'text-gray-600 hover:text-blue-600'} transition-colors`} />
                              </button>
                            </div>

                            {/* Message input with emoji picker */}
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Type your message..."
                                disabled={isRecording}
                              />
                              <button 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                                title="Add emoji"
                              >
                                <Smile className="size-5 text-gray-600" />
                              </button>

                              {/* Emoji Picker Popup */}
                              {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4 z-50 animate-scale-in">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-gray-900">Quick Emojis</h4>
                                    <button
                                      onClick={() => setShowEmojiPicker(false)}
                                      className="w-6 h-6 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                                    >
                                      <X className="size-4 text-gray-500" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2">
                                    {emojis.map((emoji, index) => (
                                      <button
                                        key={index}
                                        onClick={() => handleEmojiSelect(emoji)}
                                        className="w-10 h-10 hover:bg-blue-50 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Send button */}
                            <button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim() || isRecording}
                              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                                newMessage.trim() && !isRecording
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:scale-105'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Send className="size-5" />
                              Send
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
                        <div className="text-center max-w-md px-6">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <MessageSquare className="size-16 text-blue-600" />
                          </div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-3">Select a conversation</h4>
                          <p className="text-gray-600 mb-8">Choose a conversation from the list to start chatting with users about their pickups</p>
                          
                          <div className="grid grid-cols-1 gap-3 mb-6">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-blue-100">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Zap className="size-5 text-blue-600" />
                              </div>
                              <div className="text-left flex-1">
                                <p className="text-sm font-bold text-gray-900">Quick Replies</p>
                                <p className="text-xs text-gray-600">Pre-written messages for faster communication</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-green-100">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Mic className="size-5 text-green-600" />
                              </div>
                              <div className="text-left flex-1">
                                <p className="text-sm font-bold text-gray-900">Voice Messages</p>
                                <p className="text-xs text-gray-600">Send audio recordings up to 60 seconds</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-purple-100">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Image className="size-5 text-purple-600" />
                              </div>
                              <div className="text-left flex-1">
                                <p className="text-sm font-bold text-gray-900">File Sharing</p>
                                <p className="text-xs text-gray-600">Share images and documents easily</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Verify Pickup</h3>
                  <p className="text-green-100">Enter user's OTP to complete</p>
                </div>
                <button
                  onClick={() => setShowOTPModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">OTP Sent!</p>
                    <p className="text-sm text-green-800">
                      A 6-digit verification code has been sent to the user's device. Please ask the user to share the code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Didn't receive the code?</p>
                <button
                  onClick={() => selectedRequest && handleSendOTP(selectedRequest)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Resend OTP
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                    otp.length === 6
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Verify & Complete
                </button>
                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtp('');
                  }}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Profile</h3>
                  <p className="text-blue-100">View and edit your profile</p>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <UserCircle className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Name</p>
                    <p className="text-sm text-gray-800">
                      {user.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Email</p>
                    <p className="text-sm text-gray-800">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Phone</p>
                    <p className="text-sm text-gray-800">
                      {collector.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Truck className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Vehicle Number</p>
                    <p className="text-sm text-gray-800">
                      {collector.vehicleNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Star className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Rating</p>
                    <p className="text-sm text-gray-800">
                      {collector.rating}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Settings</h3>
                  <p className="text-blue-100">Configure your account</p>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Email Notifications</p>
                    <p className="text-sm text-gray-800">
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border w-5 h-5 rounded-full transition-all peer-checked:bg-blue-600" />
                        <span className="ml-3 text-sm font-medium text-gray-900">Enable</span>
                      </label>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Bell className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Push Notifications</p>
                    <p className="text-sm text-gray-800">
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border w-5 h-5 rounded-full transition-all peer-checked:bg-blue-600" />
                        <span className="ml-3 text-sm font-medium text-gray-900">Enable</span>
                      </label>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">SMS Notifications</p>
                    <p className="text-sm text-gray-800">
                      <label className="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border w-5 h-5 rounded-full transition-all peer-checked:bg-blue-600" />
                        <span className="ml-3 text-sm font-medium text-gray-900">Enable</span>
                      </label>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Help & Support</h3>
                  <p className="text-blue-100">Get assistance</p>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Contact Support</p>
                    <p className="text-sm text-gray-800">
                      <a href="mailto:support@collectify.com" className="text-blue-600 hover:underline">support@collectify.com</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Call Support</p>
                    <p className="text-sm text-gray-800">
                      <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1234567890</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="size-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">User Guide</p>
                    <p className="text-sm text-gray-800">
                      <a href="/user-guide" className="text-blue-600 hover:underline">Download User Guide</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <WithdrawModal
        showModal={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        totalEarnings={collector.balance}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        withdrawMethod={withdrawMethod}
        setWithdrawMethod={setWithdrawMethod}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        onWithdraw={handleWithdraw}
      />

      {/* Dumping Confirmation Modal */}
      {selectedDumpRequest && (() => {
        const selectedRequest = collectionRequests.find(r => r.id === selectedDumpRequest);
        const weightValue = selectedRequest?.weight || selectedRequest?.estimatedWeight;
        const parsedWeight = typeof weightValue === 'string' 
          ? parseFloat(weightValue.replace(/[^\d.]/g, '')) 
          : typeof weightValue === 'number' 
            ? weightValue 
            : 0;
        
        return (
          <DumpingConfirmationModal
            showModal={showDumpingModal}
            onClose={() => {
              setShowDumpingModal(false);
              setSelectedDumpRequest(null);
            }}
            requestId={selectedDumpRequest}
            userName={selectedRequest?.userName || 'User'}
            userAddress={selectedRequest?.userAddress || 'Address'}
            collectedItems={[
              {
                name: selectedRequest?.items || getCategoryLabel(selectedRequest?.category || 'electronics'),
                quantity: selectedRequest?.quantity || 1,
                unit: 'items',
                weight: parsedWeight,
                estimatedValue: selectedRequest?.pickupCharge || 25
              }
            ]}
            onConfirmDumping={handleConfirmDumping}
            assignedCenter={selectedRequest ? {
              id: selectedRequest.recyclingCenterId,
              name: selectedRequest.recyclingCenterName,
              address: selectedRequest.recyclingCenterAddress
            } : null}
          />
        );
      })()}
    </div>
  );
}