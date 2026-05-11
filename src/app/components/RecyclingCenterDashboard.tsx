import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { 
  Recycle, LogOut, Package, FileText, BookOpen, MessageSquare,
  Download, Upload, Plus, CheckCircle, Clock, AlertTriangle, Send,
  Building2, Bell, Sparkles, X, Trash2, Award, TrendingUp,
  Leaf, Droplet, Zap, Settings, Eye, Edit, MapPin, User,
  ChevronDown, UserCircle, HelpCircle, Search, Paperclip, 
  MoreVertical, Phone, Video, Info, Activity, Truck, Star
} from "lucide-react";
import { getCurrentUser, logout } from "../lib/auth";
import { apiRequest } from "../lib/api";
import { 
  getCategoryLabel,
  getStatusColor,
  getClassificationColor,
  ItemClassification,
  RecoveredMaterial
} from "../lib/data";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";

export function RecyclingCenterDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'incoming' | 'processing' | 'processed' | 'guidelines' | 'messages'
  >('dashboard');
  
  const handleLogout = () => {
    void logout();
    navigate('/');
  };
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showAssignCollectorModal, setShowAssignCollectorModal] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // State for tracking request statuses
  const [processingRequests, setProcessingRequests] = useState<string[]>([]);
  const [completedRequests, setCompletedRequests] = useState<string[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<Record<string, string>>({});  // requestId -> collectorId
  
  // State for profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Classification state
  const [classification, setClassification] = useState<ItemClassification>('recyclable');
  const [recoveredMaterials, setRecoveredMaterials] = useState<RecoveredMaterial[]>([]);
  const [disposalMethod, setDisposalMethod] = useState('');
  const [processingNotes, setProcessingNotes] = useState('');

  // Backend data
  const [recyclingCenters, setRecyclingCenters] = useState<any[]>([]);
  const [collectionRequests, setCollectionRequests] = useState<any[]>([]);
  const [disposalGuidelines, setDisposalGuidelines] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [rewardTransactions, setRewardTransactions] = useState<any[]>([]);
  const [rewardRedemptions, setRewardRedemptions] = useState<any[]>([]);
  const [rewardProfile, setRewardProfile] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load backend data - MUST BE BEFORE EARLY RETURNS
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [centers, requests, guidelines, convs, cols, usersData] = await Promise.all([
          apiRequest("/recycling-centers/"),
          apiRequest("/collection-requests/"),
          apiRequest("/guidelines/"),
          apiRequest("/conversations/"),
          apiRequest("/collectors/"),
          apiRequest("/users/"),
        ]);
        setRecyclingCenters(centers as any[]);
        setCollectionRequests(requests as any[]);
        setDisposalGuidelines(guidelines as any[]);
        setConversations(convs as any[]);
        setCollectors(cols as any[]);
        setAllUsers(usersData as any[]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.id]);

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

  // Check authentication with useEffect to avoid setState during render
  useEffect(() => {
    if (!user || user.role !== 'recycling_center') {
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

  const center = recyclingCenters.find(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
  
  // Early return if not authorized
  if (!user || user.role !== 'recycling_center') {
    return null; // Let useEffect handle navigation
  }

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle case where center profile is missing
  if (!center) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="size-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Center Profile Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find a recycling center profile associated with {user.email}. Please contact support.</p>
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

  const centerCollections = collectionRequests.filter(
    r => String(r.recyclingCenterId) === String(center.id)
  );

  // Available: Show pending requests that are not yet assigned to ANY center
  const availableRequests = collectionRequests.filter(
    r => (r.status === 'pending' || r.status === 'requested') && !r.recyclingCenterId
  );
  
  // Incoming: Show requests assigned to this center OR available requests
  const incomingCollections = [
    ...centerCollections.filter(
      r => (r.status === 'pending' || r.status === 'received' || (r.status === 'assigned' && !assignedRequests[r.id])) && 
           !processingRequests.includes(r.id) &&
           !completedRequests.includes(r.id)
    ),
    ...availableRequests
  ];
  
  // Get processing items
  const processingCollections = centerCollections.filter(
    r => processingRequests.includes(r.id)
  );
  
  const processedCollections = centerCollections.filter(
    r => r.status === 'completed' || completedRequests.includes(r.id)
  );

  const centerParticipantIds = new Set([String(center?.id), String(user?.id)].filter(Boolean));
  const visibleRequestIds = new Set([
    ...centerCollections.map(r => String(r.id)),
    ...availableRequests.map(r => String(r.id))
  ]);
  
  // 1-on-1 Conversation Logic: Map everything to individuals
  const getIndividualContacts = () => {
    const contacts: any[] = [];
    const seenIds = new Set();

    // 1. Add people from existing conversations
    conversations.forEach(conv => {
      const others = (conv.participants || []).filter(
        (p: any) => String(p.id) !== String(user?.id) && String(p.id) !== String(center?.id)
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
        req.collectorId ? { id: String(req.collectorId), name: req.collectorName, role: 'collector' } : null
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

    // 3. Add all other users and collectors
    const allPeople = [
      ...allUsers.filter(u => u.role === 'user'),
      ...collectors
    ];
    
    allPeople.forEach(p => {
      const pid = String(p.id);
      if (!seenIds.has(pid) && pid !== String(user?.id) && pid !== String(center?.id)) {
        contacts.push({
          id: `general-${pid}`,
          targetId: pid,
          displayName: p.name,
          role: p.role === 'user' ? 'user' : 'collector',
          lastMessage: "No history",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isPotential: true
        });
        seenIds.add(pid);
      }
    });

    return contacts;
  };

  const finalSidebarList = getIndividualContacts();
  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);



  
  const handleViewProfile = () => {
    setShowProfileDropdown(false);
    toast.info('View Profile', {
      description: 'Profile page coming soon!'
    });
  };
  
  const handleSettings = () => {
    setShowProfileDropdown(false);
    toast.info('Settings', {
      description: 'Settings page coming soon!'
    });
  };
  
  const handleHelp = () => {
    setShowProfileDropdown(false);
    toast.info('Help & Support', {
      description: 'Help center coming soon!'
    });
  };

  const handleMarkReceived = (requestId: string) => {
    (async () => {
      try {
        await apiRequest(`/collection-requests/${requestId}/`, {
          method: "PATCH",
          body: JSON.stringify({
            status: "in_progress",
            receivedAt: new Date().toISOString(),
          }),
        });
        const requests = await apiRequest("/collection-requests/");
        setCollectionRequests(requests as any[]);
      } catch {
        // ignore
      }
    })();

    setProcessingRequests([...processingRequests, requestId]);
    setActiveTab('processing');
    toast.success('Items marked as received and moved to processing', {
      description: 'Saved to database.'
    });
  };

  const handleConfirmDelivery = (requestId: string) => {
    (async () => {
      try {
        await apiRequest(`/collection-requests/${requestId}/`, {
          method: "PATCH",
          body: JSON.stringify({
            status: "completed",
            completedAt: new Date().toISOString(),
          }),
        });
        const requests = await apiRequest("/collection-requests/");
        setCollectionRequests(requests as any[]);
        toast.success('Delivery confirmed!', {
          description: 'Request marked as completed. User and collector notified.'
        });
      } catch (error) {
        toast.error('Failed to confirm delivery');
      }
    })();
  };

  const handleAssignCollector = (requestId: string) => {
    setSelectedRequest(requestId);
    setSelectedCollectorId('');
    setShowAssignCollectorModal(true);
  };

  const handleSaveAssignment = () => {
    if (selectedRequest && selectedCollectorId) {
      const collector = collectors.find(c => c.id === selectedCollectorId);
      (async () => {
        try {
          await apiRequest(`/collection-requests/${selectedRequest}/`, {
            method: "PATCH",
            body: JSON.stringify({
              collectorId: selectedCollectorId,
              recyclingCenterId: center.id, // Claim the request for this center
              status: "assigned",
              assignedAt: new Date().toISOString(),
            }),
          });
          const requests = await apiRequest("/collection-requests/");
          setCollectionRequests(requests as any[]);
        } catch {
          // ignore
        }
      })();
      setAssignedRequests({
        ...assignedRequests,
        [selectedRequest]: selectedCollectorId
      });
      toast.success('Collector assigned successfully', {
        description: `${collector?.name} assigned and stored in database.`
      });
      setShowAssignCollectorModal(false);
      setSelectedRequest(null);
      setSelectedCollectorId('');
    } else {
      toast.error('Please select a collector');
    }
  };

  const handleClassify = (requestId: string) => {
    setSelectedRequest(requestId);
    setShowClassificationModal(true);
  };

  const handleSaveClassification = () => {
    if (selectedRequest) {
      const outcome = {
        processedDate: new Date().toISOString(),
        classification,
        recoveredMaterials,
        disposalMethod,
        notes: processingNotes || undefined,
        certificateGenerated: true,
      };
      (async () => {
        try {
          await apiRequest(`/collection-requests/${selectedRequest}/`, {
            method: "PATCH",
            body: JSON.stringify({
              status: "completed",
              completedAt: new Date().toISOString(),
              classification,
              recyclingOutcome: outcome,
            }),
          });
          const requests = await apiRequest("/collection-requests/");
          setCollectionRequests(requests as any[]);
        } catch {
          // ignore
        }
      })();
      // Move from processing to completed
      setProcessingRequests(processingRequests.filter(id => id !== selectedRequest));
      setCompletedRequests([...completedRequests, selectedRequest]);
      // Switch to processed tab
      setActiveTab('processed');
    }
    toast.success('Classification saved successfully', {
      description: 'Saved to database and moved to processed.'
    });
    setShowClassificationModal(false);
    setRecoveredMaterials([]);
    setDisposalMethod('');
    setProcessingNotes('');
    setSelectedRequest(null);
  };

  const handleGenerateCertificate = (requestId: string) => {
    setSelectedRequest(requestId);
    setShowCertificateModal(true);
    toast.success('Generating recycling certificate...', {
      description: 'Download will start shortly.'
    });
  };

  const handleAddMaterial = () => {
    setRecoveredMaterials([
      ...recoveredMaterials,
      { material: '', weight: 0, unit: 'kg' as const }
    ]);
  };

  const handleUpdateMaterial = (index: number, field: keyof RecoveredMaterial, value: any) => {
    const updated = [...recoveredMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setRecoveredMaterials(updated);
  };

  const handleRemoveMaterial = (index: number) => {
    setRecoveredMaterials(recoveredMaterials.filter((_, i) => i !== index));
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
              { id: String(center?.id || user?.id), name: center?.name || user?.name, role: 'recycling_center' },
              { id: String(potentialConv?.targetId), name: potentialConv?.displayName, role: potentialConv?.role }
            ]
          })
        });
        const realConv = resp as any;
        convId = realConv.id;
        setSelectedConversation(convId);
        // Refresh conversations list to include the new one
        const allConvs = await apiRequest("/conversations/");
        setConversations(allConvs as any[]);
      }

      await apiRequest("/chat-messages/", {
        method: "POST",
        body: JSON.stringify({
          conversationId: convId,
          senderId: String(center?.id || user?.id),
          senderName: center?.name || user?.name || "Recycling Center",
          senderRole: "recycling_center",
          message: newMessage.trim(),
          timestamp: new Date().toISOString(),
          read: false,
        }),
      });
      const msgs = await apiRequest(`/chat-messages/?conversationId=${selectedConversation}`);
      setChatMessages(msgs as any[]);
      await loadConversations();
      toast.success('Message sent');
      setNewMessage('');
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const stats = [
    {
      icon: Clock,
      label: 'Incoming',
      value: incomingCollections.length.toString(),
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      icon: Package,
      label: 'Processing',
      value: processingCollections.length.toString(),
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: CheckCircle,
      label: 'Processed Today',
      value: completedRequests.length.toString(),
      color: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      icon: Award,
      label: 'Total Recycled',
      value: '450 kg',
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  const selectedReq = collectionRequests.find(r => String(r.id) === String(selectedRequest));
  const selectedConv = finalSidebarList.find(c => String(c.id) === String(selectedConversation));
  const conversationMessages = (chatMessages || []).filter(m => String(m.conversationId) === String(selectedConversation));

  const sidebarMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Building2 },
    { key: 'incoming', label: 'Incoming', icon: Clock, badge: incomingCollections.length },
    { key: 'processing', label: 'Processing', icon: Package, badge: processingCollections.length },
    { key: 'processed', label: 'Processed', icon: CheckCircle },
    { key: 'guidelines', label: 'Guidelines', icon: BookOpen },
    { key: 'messages', label: 'Messages', icon: MessageSquare, badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 overflow-hidden">
      <Sidebar
        user={{ name: user?.name || 'Center', email: user?.email || '', role: user?.role || 'recycling_center' }}
        menuItems={sidebarMenuItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        gradientFrom="from-purple-500"
        gradientTo="to-indigo-600"
        title="Recycling Center"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'incoming' && 'Incoming Collections'}
                  {activeTab === 'processing' && 'Processing'}
                  {activeTab === 'processed' && 'Processed Items'}
                  {activeTab === 'guidelines' && 'Disposal Guidelines'}
                  {activeTab === 'messages' && 'Messages'}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {center.name}
                  <Sparkles className="size-3 text-yellow-500" />
                  <span className="font-semibold text-yellow-600">⭐ {center.rating}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="size-5 text-gray-600" />
                  {incomingCollections.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setActiveTab('incoming')}
                className="group bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-orange-100 text-sm mb-1">New Items</p>
                  <p className="font-bold text-lg">View Incoming</p>
                </div>
                <Clock className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('processing')}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-blue-100 text-sm mb-1">Active</p>
                  <p className="font-bold text-lg">Processing Items</p>
                </div>
                <Package className="size-8 opacity-75 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('guidelines')}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-purple-100 text-sm mb-1">Reference</p>
                  <p className="font-bold text-lg">Guidelines</p>
                </div>
                <BookOpen className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            </>
          )}

          {/* Content Tabs */}
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="animate-slide-in-up">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Center Overview</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Summary */}
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="size-5 text-purple-600" />
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {incomingCollections.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Package className="size-5 text-purple-600" />
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
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 border-2 border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="size-5 text-indigo-600" />
                    Performance
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Processed</span>
                      <span className="text-2xl font-bold text-gray-900">{processedCollections.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">In Progress</span>
                      <span className="text-2xl font-bold text-blue-600">{processingCollections.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Center Rating</span>
                      <span className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                        ⭐ {center.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Processing Capacity</span>
                      <span className="text-2xl font-bold text-green-600">{center.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Incoming Tab */}
            {activeTab === 'incoming' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Incoming Collections</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="size-4" />
                    <span>{incomingCollections.length} items awaiting processing</span>
                  </div>
                </div>

                {incomingCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Package className="size-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h4>
                    <p className="text-gray-600">No incoming collections at this time</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {incomingCollections.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                              {!request.recyclingCenterId && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1">
                                  <Sparkles className="size-3" />
                                  AVAILABLE
                                </span>
                              )}
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
                                <p className="text-gray-500 text-xs mb-1">Quantity</p>
                                <p className="font-semibold text-gray-900">{request.quantity || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Weight</p>
                                <p className="font-semibold text-gray-900">{request.weight || 'TBD'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">User</p>
                                <p className="font-semibold text-gray-900">{request.userName}</p>
                              </div>
                            </div>
                          </div>

                          {(request.collectorName || assignedRequests[request.id]) && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                              <User className="size-4 text-blue-600" />
                              <span>Collector: <span className="font-semibold text-gray-900">
                                {assignedRequests[request.id] 
                                  ? collectors.find(c => c.id === assignedRequests[request.id])?.name 
                                  : request.collectorName}
                              </span></span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {request.status === 'received' ? (
                            <button
                              onClick={() => handleConfirmDelivery(request.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-bold ring-4 ring-orange-500/20"
                            >
                              <CheckCircle className="size-4" />
                              Confirm Delivery
                            </button>
                          ) : !request.collectorId && !assignedRequests[request.id] ? (
                            <button
                              onClick={() => handleAssignCollector(request.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                            >
                              <User className="size-4" />
                              Assign Collector
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleMarkReceived(request.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                              >
                                <CheckCircle className="size-4" />
                                Mark Received
                              </button>
                              <button
                                onClick={() => handleClassify(request.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                              >
                                <Settings className="size-4" />
                                Classify
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

            {/* Processing Tab */}
            {activeTab === 'processing' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Items in Processing</h3>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                    <Package className="size-4" />
                    <span>{processingCollections.length} items being processed</span>
                  </div>
                </div>

                {processingCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Package className="size-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">No Items Processing</h4>
                    <p className="text-gray-600">Items marked as received will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {processingCollections.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 animate-pulse">
                                PROCESSING
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Package className="size-4" />
                              {getCategoryLabel(request.category)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Items</p>
                                <p className="font-semibold text-gray-900">{request.items}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Quantity</p>
                                <p className="font-semibold text-gray-900">{request.quantity || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">Weight</p>
                                <p className="font-semibold text-gray-900">{request.weight || 'TBD'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs mb-1">User</p>
                                <p className="font-semibold text-gray-900">{request.userName}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleClassify(request.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                        >
                          <Settings className="size-5" />
                          Classify & Complete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Processed Tab */}
            {activeTab === 'processed' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Processed Collections</h3>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                    <CheckCircle className="size-4" />
                    <span>{processedCollections.length} completed</span>
                  </div>
                </div>

                {processedCollections.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <CheckCircle className="size-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No processed collections yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {processedCollections.map((request) => (
                      <div key={request.id} className="bg-white rounded-2xl border-2 border-green-100 p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">{request.id}</h4>
                              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                COMPLETED
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                          </div>
                        </div>

                        {request.itemClassification && (
                          <div className={`rounded-xl p-4 mb-4 ${
                            request.itemClassification === 'recyclable' ? 'bg-green-50 border-2 border-green-200' :
                            request.itemClassification === 'refurbishable' ? 'bg-blue-50 border-2 border-blue-200' :
                            request.itemClassification === 'hazardous' ? 'bg-red-50 border-2 border-red-200' :
                            'bg-yellow-50 border-2 border-yellow-200'
                          }`}>
                            <p className="text-xs font-semibold text-gray-600 mb-2">Classification</p>
                            <p className={`font-bold capitalize ${
                              request.itemClassification === 'recyclable' ? 'text-green-700' :
                              request.itemClassification === 'refurbishable' ? 'text-blue-700' :
                              request.itemClassification === 'hazardous' ? 'text-red-700' :
                              'text-yellow-700'
                            }`}>
                              {request.itemClassification}
                            </p>
                          </div>
                        )}

                        {request.recoveredMaterials && request.recoveredMaterials.length > 0 && (
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                            <p className="text-xs font-semibold text-purple-900 mb-3">Recovered Materials</p>
                            <div className="space-y-2">
                              {(request.recoveredMaterials || []).map((material, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-700">{material.material}</span>
                                  <span className="font-bold text-purple-700">{material.weight} {material.unit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleGenerateCertificate(request.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
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

            {/* Guidelines Tab */}
            {activeTab === 'guidelines' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Disposal Guidelines</h3>
                  <p className="text-gray-600">Proper handling and disposal procedures for e-waste</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {disposalGuidelines.map((guideline: any) => (
                    <div key={guideline.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-4 rounded-xl ${
                          'bg-yellow-100'
                        }`}>
                          <AlertTriangle className={`size-6 ${
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{guideline.category}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              guideline.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              guideline.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              guideline.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {guideline.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{guideline.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Safety Precautions</p>
                          <ul className="space-y-1">
                            {(guideline.safetyPrecautions || []).map((precaution, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{precaution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-purple-900 mb-2">Disposal Method</p>
                          <p className="text-sm text-gray-700">{guideline.disposalMethod}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="animate-slide-in-up">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                  {/* Conversations List */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-100 flex flex-col overflow-hidden">
                    {/* Search Header */}
                    <div className="p-4 bg-white border-b border-purple-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="size-5 text-purple-600" />
                        Messages
                        {totalUnreadMessages > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                            {totalUnreadMessages}
                          </span>
                        )}
                      </h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {finalSidebarList.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="size-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No contacts available</p>
                        </div>
                      ) : (
                        finalSidebarList.map((conv: any) => {
                          const displayName = conv.displayName || "User";
                          const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
                          const isOnline = Math.random() > 0.5;
                          
                          return (
                            <button
                              key={conv.id}
                              onClick={() => setSelectedConversation(conv.id)}
                              className={`w-full text-left p-3 rounded-xl transition-all group relative ${
                                selectedConversation === conv.id
                                  ? 'bg-white shadow-md border-2 border-purple-300 scale-[1.02]'
                                  : 'bg-white/70 hover:bg-white border border-gray-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                    selectedConversation === conv.id 
                                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                  }`}>
                                    {initials}
                                  </div>
                                  {isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                                  )}
                                </div>
 
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-gray-900 text-sm truncate">{displayName}</span>
                                    {conv.unreadCount > 0 && (
                                      <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        {conv.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                      conv.role === 'collector' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                      {conv.role === 'collector' ? 'Collector' : 'User'}
                                    </span>
                                    {conv.relatedRequestId && (
                                      <span className="text-[10px] text-gray-400 font-medium">Req #{conv.relatedRequestId}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {conv.isPotential && (
                                    <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                                      NEW CONTACT
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 overflow-hidden flex flex-col shadow-lg">
                    {selectedConversation ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {(() => {
                                const conv = selectedConv;
                                  const userName = selectedConv?.displayName || "User";
                                  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
                                  const isOnline = Math.random() > 0.5;

                                return (
                                  <>
                                    <div className="relative">
                                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                                        {initials}
                                      </div>
                                      {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-purple-600" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-lg">
                                        {selectedConv?.displayName || "User"}
                                      </h4>
                                      <div className="flex gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                          selectedConv?.role === 'collector' ? 'bg-blue-400 text-white' : 'bg-green-400 text-white'
                                        }`}>
                                          {selectedConv?.role === 'collector' ? 'Collector' : 'User'}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toast.info('Voice call feature coming soon!')}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              >
                                <Phone className="size-5" />
                              </button>
                              <button 
                                onClick={() => toast.info('Video call feature coming soon!')}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              >
                                <Video className="size-5" />
                              </button>
                              <button 
                                onClick={() => toast.info('Conversation info')}
                                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
                              >
                                <Info className="size-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-purple-50/20">
                          {conversationMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <MessageSquare className="size-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No messages yet</p>
                                <p className="text-gray-400 text-sm mt-2">Start the conversation!</p>
                              </div>
                            </div>
                          ) : (
                            conversationMessages.map((msg, index) => {
                              const isCenter = msg.senderRole === 'recycling_center';
                              const showAvatar = index === 0 || 
                                conversationMessages[index - 1]?.senderRole !== msg.senderRole;
                              
                              let userName = msg.senderName;
                              if (isCenter) userName = "You";
                              else if (msg.senderRole === 'collector') userName = `Collector: ${msg.senderName}`;
                              else if (msg.senderRole === 'user') userName = `User: ${msg.senderName}`;
                              
                              const initials = msg.senderName.split(' ').map(n => n[0]).join('').toUpperCase();

                              return (
                                  <div
                                    key={msg.id}
                                    className={`flex items-end gap-2 ${isCenter ? 'justify-start' : 'justify-end'} animate-slide-in-up`}
                                  >
                                    {isCenter && showAvatar && (
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </div>
                                    )}
                                    {isCenter && !showAvatar && <div className="w-8" />}

                                    <div className={`max-w-md group ${isCenter ? 'items-start' : 'items-end'}`}>
                                      {showAvatar && (
                                        <p className={`text-xs font-semibold mb-1 px-1 ${isCenter ? 'text-left text-purple-600' : 'text-right text-gray-600'}`}>
                                          {userName}
                                        </p>
                                      )}
                                      <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                                        isCenter
                                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-bl-md'
                                          : 'bg-white text-gray-900 rounded-br-md border border-gray-200'
                                      }`}>
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                        <div className={`flex items-center gap-2 mt-1.5 ${
                                          isCenter ? 'justify-start' : 'justify-end'
                                        }`}>
                                          <p className={`text-xs ${
                                            isCenter ? 'text-purple-200' : 'text-gray-500'
                                          }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                          {isCenter && (
                                            <CheckCircle className="size-3 text-purple-200" />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {!isCenter && showAvatar && (
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 ${
                                        msg.senderRole === 'collector' ? 'bg-blue-500' : 'bg-green-500'
                                      }`}>
                                        {msg.senderRole === 'collector' ? 'C' : 'U'}
                                      </div>
                                    )}
                                    {!isCenter && !showAvatar && <div className="w-8" />}
                                  </div>
                                );
                            })
                          )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toast.info('File attachment coming soon!')}
                              className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                              title="Attach file"
                            >
                              <Paperclip className="size-5 text-gray-600" />
                            </button>
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                              placeholder="Type your message... (Press Enter to send)"
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-medium"
                            >
                              <Send className="size-5" />
                              Send
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50/20">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="size-10 text-purple-600" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h4>
                          <p className="text-gray-600 text-sm">Choose a conversation from the list to start messaging</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Assign Collector Modal */}
      {showAssignCollectorModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Assign Collector</h3>
                  <p className="text-blue-100">Request {selectedRequest}</p>
                </div>
                <button
                  onClick={() => setShowAssignCollectorModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Collector *
                </label>
                <div className="space-y-3">
                  {collectors.filter((c) => (c.approvalStatus === 'approved' || c.approval_status === 'approved')).map((collector: any) => (
                    <div
                      key={collector.id}
                      onClick={() => setSelectedCollectorId(collector.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedCollectorId === collector.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                            <Truck className="size-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{collector.name}</p>
                            <p className="text-sm text-gray-600">{collector.phone}</p>
                            <p className="text-xs text-gray-500">{collector.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-yellow-600 mb-1">
                            <Star className="size-4 fill-yellow-600" />
                            <span className="font-bold">{collector.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">{collector.completedCollections} collections</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowAssignCollectorModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignment}
                  disabled={!selectedCollectorId}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Assign Collector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classification Modal */}
      {showClassificationModal && selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Item Classification</h3>
                  <p className="text-purple-100">{selectedReq.id}</p>
                </div>
                <button
                  onClick={() => setShowClassificationModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Item Classification *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setClassification('recyclable')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      classification === 'recyclable'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Recycle className={`size-6 ${classification === 'recyclable' ? 'text-white' : 'text-green-600'}`} />
                      <span className="font-bold">Recyclable</span>
                    </div>
                    <p className={`text-sm ${classification === 'recyclable' ? 'text-green-100' : 'text-gray-500'}`}>
                      Can be processed into raw materials
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClassification('reusable')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      classification === 'reusable'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className={`size-6 ${classification === 'reusable' ? 'text-white' : 'text-blue-600'}`} />
                      <span className="font-bold">Reusable</span>
                    </div>
                    <p className={`text-sm ${classification === 'reusable' ? 'text-blue-100' : 'text-gray-500'}`}>
                      Can be used as-is or donated
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClassification('repairable')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      classification === 'repairable'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className={`size-6 ${classification === 'repairable' ? 'text-white' : 'text-purple-600'}`} />
                      <span className="font-bold">Repairable</span>
                    </div>
                    <p className={`text-sm ${classification === 'repairable' ? 'text-purple-100' : 'text-gray-500'}`}>
                      Can be fixed and reused
                    </p>
                  </button>
                </div>

                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as ItemClassification)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                >
                  <option value="recyclable">Recyclable - Can be processed into raw materials</option>
                  <option value="reusable">Reusable - Can be used as-is or donated</option>
                  <option value="repairable">Repairable - Can be fixed and reused</option>
                  <option value="refurbishable">Refurbishable - Needs refurbishment</option>
                  <option value="hazardous">Hazardous Waste - Requires special handling</option>
                  <option value="non_recyclable">Non-Recyclable - Must be disposed</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Recovered Materials
                  </label>
                  <button
                    onClick={handleAddMaterial}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Plus className="size-4" />
                    Add Material
                  </button>
                </div>
                <div className="space-y-3">
                  {recoveredMaterials.map((material, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={material.material}
                        onChange={(e) => handleUpdateMaterial(index, 'material', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Material name"
                      />
                      <input
                        type="number"
                        value={material.weight}
                        onChange={(e) => handleUpdateMaterial(index, 'weight', parseFloat(e.target.value))}
                        className="w-24 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Weight"
                      />
                      <select
                        value={material.unit}
                        onChange={(e) => handleUpdateMaterial(index, 'unit', e.target.value)}
                        className="w-20 px-2 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lbs">lbs</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Leaf className="size-5 text-purple-600" />
                  Recycling Outcome
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Weight Processed
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="0.00"
                        step="0.01"
                      />
                      <span className="text-gray-600 font-medium">kg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Processing Method
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                      <option value="">Select method</option>
                      <option value="mechanical">Mechanical Shredding</option>
                      <option value="thermal">Thermal Treatment</option>
                      <option value="chemical">Chemical Processing</option>
                      <option value="manual">Manual Dismantling</option>
                      <option value="donation">Prepared for Donation</option>
                      <option value="repair">Repair & Refurbishment</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Disposal Method
                </label>
                <input
                  type="text"
                  value={disposalMethod}
                  onChange={(e) => setDisposalMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Mechanical shredding, Chemical treatment"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Processing Notes
                </label>
                <textarea
                  value={processingNotes}
                  onChange={(e) => setProcessingNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows={4}
                  placeholder="Add any additional processing notes..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveClassification}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
                >
                  Save Classification
                </button>
                <button
                  onClick={() => setShowClassificationModal(false)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}