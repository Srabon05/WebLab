import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { 
  Recycle, LogOut, Users, Building2, Truck, FileText, 
  TrendingUp, Activity, CheckCircle, X, Download, Plus,
  Settings, Megaphone, Award, DollarSign, BarChart3, Eye,
  Shield, Bell, User, Sparkles, Filter, Search, Calendar,
  Clock, Edit, Trash2, AlertCircle, Check, XCircle, ChevronDown,
  UserCircle, HelpCircle
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getCurrentUser, logout } from "../lib/auth";
import { 
  mockCollectionRequests, 
  mockRecyclingCenters, 
  mockCollectors,
  mockPendingUsers,
  mockPendingCenters,
  mockPendingCollectors,
  mockEWasteCategories,
  mockRewardRules,
  mockCampaigns,
  mockMonthlyStats,
  mockCategoryStats,
  mockAllUsers,
  getCategoryLabel,
  getStatusColor,
  EWasteCategoryConfig,
  Campaign,
  AllUser
} from "../lib/data";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";

export function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'approvals' | 'users' | 'categories' | 'rewards' | 'reports' | 'campaigns'
  >('dashboard');
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EWasteCategoryConfig | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    message: '',
    type: 'awareness' as 'promotion' | 'awareness' | 'notice',
    targetAudience: 'all' as 'all' | 'users' | 'collectors' | 'centers',
  });

  // State for category form
  const [categoryForm, setCategoryForm] = useState({
    label: '',
    description: '',
    rewardPoints: 50,
  });
  
  // State for delete confirmation
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
  
  // State for user management
  const [allUsers, setAllUsers] = useState(mockAllUsers);
  const [editingUser, setEditingUser] = useState<AllUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<{ id: string; name: string } | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'collector' | 'center' | 'admin',
  });

  // State for pending approvals
  const [pendingUsers, setPendingUsers] = useState(mockPendingUsers);
  const [pendingCenters, setPendingCenters] = useState(mockPendingCenters);
  const [pendingCollectors, setPendingCollectors] = useState(mockPendingCollectors);
  
  // State for approval filter
  const [approvalFilter, setApprovalFilter] = useState<'users' | 'recycling_collectors'>('users');

  // State for categories
  const [categories, setCategories] = useState(mockEWasteCategories);
  
  // State for reward rules
  const [rewardRules, setRewardRules] = useState(mockRewardRules);
  
  // State for campaigns
  const [campaigns, setCampaigns] = useState(mockCampaigns);

  // Check authentication with useEffect to avoid setState during render
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleApprove = (type: 'user' | 'center' | 'collector', id: string, name: string) => {
    if (type === 'user') {
      setPendingUsers(prev => prev.map(u => 
        u.id === id ? { ...u, approvalStatus: 'approved' as const, approvedAt: new Date().toISOString() } : u
      ));
    } else if (type === 'center') {
      setPendingCenters(prev => prev.map(c => 
        c.id === id ? { ...c, approvalStatus: 'approved' as const, status: 'active' as const, approvedAt: new Date().toISOString() } : c
      ));
    } else if (type === 'collector') {
      setPendingCollectors(prev => prev.map(c => 
        c.id === id ? { ...c, approvalStatus: 'approved' as const, status: 'available' as const, approvedAt: new Date().toISOString() } : c
      ));
    }
    
    toast.success(`${name} has been approved!`, {
      description: 'User has been notified via email.'
    });
  };

  const handleReject = (type: 'user' | 'center' | 'collector', id: string, name: string) => {
    if (type === 'user') {
      setPendingUsers(prev => prev.map(u => 
        u.id === id ? { ...u, approvalStatus: 'rejected' as const, approvedAt: new Date().toISOString() } : u
      ));
    } else if (type === 'center') {
      setPendingCenters(prev => prev.map(c => 
        c.id === id ? { ...c, approvalStatus: 'rejected' as const, approvedAt: new Date().toISOString() } : c
      ));
    } else if (type === 'collector') {
      setPendingCollectors(prev => prev.map(c => 
        c.id === id ? { ...c, approvalStatus: 'rejected' as const, approvedAt: new Date().toISOString() } : c
      ));
    }
    
    toast.error(`${name} has been rejected.`, {
      description: 'User has been notified.'
    });
  };

  // Category Management
  const handleEditCategory = (category: EWasteCategoryConfig) => {
    setEditingCategory(category);
    setCategoryForm({
      label: category.label,
      description: category.description,
      rewardPoints: category.rewardPoints,
    });
    setShowCategoryModal(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      label: '',
      description: '',
      rewardPoints: 50,
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setDeletingCategory({ id: categoryId, name: categoryName });
  };

  const confirmDeleteCategory = () => {
    if (!deletingCategory) return;
    
    setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
    toast.success(`${deletingCategory.name} has been deleted`, {
      description: 'Category has been permanently removed from the system.'
    });
    setDeletingCategory(null);
  };

  const cancelDeleteCategory = () => {
    setDeletingCategory(null);
  };

  const handleSaveCategoryForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.label || !categoryForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategory: EWasteCategoryConfig = {
        ...editingCategory,
        label: categoryForm.label,
        description: categoryForm.description,
        rewardPoints: categoryForm.rewardPoints,
      };
      
      setCategories(prev => prev.map(c => 
        c.id === updatedCategory.id ? updatedCategory : c
      ));
      toast.success('Category updated successfully!', {
        description: `${categoryForm.label} has been updated.`
      });
    } else {
      // Create new category
      const newCategory: EWasteCategoryConfig = {
        id: `${categoryForm.label.toLowerCase().replace(/\s+/g, '_')}`,
        label: categoryForm.label,
        description: categoryForm.description,
        rewardPoints: categoryForm.rewardPoints,
        active: true,
      };
      
      setCategories(prev => [...prev, newCategory]);
      toast.success('Category created successfully!', {
        description: `${categoryForm.label} is now available.`
      });
    }
    
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      label: '',
      description: '',
      rewardPoints: 50,
    });
  };

  // User Management
  const handleEditUser = (user: AllUser) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeletingUser({ id: userId, name: userName });
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    
    setAllUsers(prev => prev.filter(u => u.id !== deletingUser.id));
    toast.success(`${deletingUser.name} has been deleted`, {
      description: 'User has been permanently removed from the system.'
    });
    setDeletingUser(null);
  };

  const cancelDeleteUser = () => {
    setDeletingUser(null);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name || !userForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedUser: AllUser = {
        ...editingUser,
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
      };
      
      setAllUsers(prev => prev.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      ));
      toast.success('User updated successfully!', {
        description: `${userForm.name} has been updated.`
      });
    }
    
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: 'user',
    });
  };

  // Reward Rules Management
  const handleDeleteRewardRule = (ruleId: string, ruleName: string) => {
    setRewardRules(prev => prev.filter(r => r.id !== ruleId));
    toast.success(`Reward rule "${ruleName}" deleted`, {
      description: 'Rule has been removed from the system.'
    });
  };

  const handleEditRewardRule = (ruleId: string) => {
    toast.info('Edit reward rule', {
      description: 'Reward rule editor coming soon!'
    });
  };

  // Campaign Management
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCampaign.title || !newCampaign.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const campaign: Campaign = {
      id: `C${String(campaigns.length + 1).padStart(3, '0')}`,
      title: newCampaign.title,
      message: newCampaign.message,
      type: newCampaign.type,
      targetAudience: newCampaign.targetAudience,
      createdAt: new Date().toISOString(),
      active: true,
    };

    setCampaigns(prev => [campaign, ...prev]);
    toast.success('Campaign created successfully!', {
      description: `Sent to ${newCampaign.targetAudience === 'all' ? 'all users' : newCampaign.targetAudience}`
    });
    
    setShowCampaignModal(false);
    setNewCampaign({
      title: '',
      message: '',
      type: 'awareness',
      targetAudience: 'all',
    });
  };

  const handleToggleCampaign = (campaignId: string, currentStatus: boolean) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId ? { ...c, active: !currentStatus } : c
    ));
    toast.success(currentStatus ? 'Campaign deactivated' : 'Campaign activated');
  };

  const handleDeleteCampaign = (campaignId: string, campaignTitle: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    toast.success(`Campaign "${campaignTitle}" deleted`);
  };

  const handleGenerateReport = () => {
    toast.success('Generating monthly report...', {
      description: 'Download will start shortly.'
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast.success('Report generated successfully!', {
        description: 'Check your downloads folder.'
      });
    }, 2000);
  };

  const pendingApprovals = 
    pendingUsers.filter(u => u.approvalStatus === 'pending').length +
    pendingCenters.filter(c => c.approvalStatus === 'pending').length +
    pendingCollectors.filter(c => c.approvalStatus === 'pending').length;

  const stats = [
    {
      icon: FileText,
      label: 'Total Collections',
      value: mockCollectionRequests.length.toString(),
      change: '+12%',
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      icon: Users,
      label: 'Pending Approvals',
      value: pendingApprovals.toString(),
      change: 'New',
      color: 'from-orange-500 to-orange-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      icon: Building2,
      label: 'Active Centers',
      value: mockRecyclingCenters.filter(c => c.status === 'active').length.toString(),
      change: '+3',
      color: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      icon: Activity,
      label: 'Total E-Waste',
      value: '820 kg',
      change: '+18%',
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const sidebarMenuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'approvals', label: 'Approvals', icon: CheckCircle },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'categories', label: 'Categories', icon: Settings },
    { key: 'rewards', label: 'Rewards', icon: Award },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'campaigns', label: 'Campaigns', icon: Megaphone },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
      <Sidebar
        user={{ ...user, email: 'admin@ewaste.bd' }}
        menuItems={sidebarMenuItems}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        gradientFrom="from-blue-500"
        gradientTo="to-indigo-600"
        title="Admin Dashboard"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'approvals' && 'Pending Approvals'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'categories' && 'Category Management'}
                  {activeTab === 'rewards' && 'Reward Rules'}
                  {activeTab === 'reports' && 'Reports & Analytics'}
                  {activeTab === 'campaigns' && 'Campaigns'}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  System Management & Control
                  <Sparkles className="size-3 text-yellow-500" />
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="size-5 text-gray-600" />
                  {pendingApprovals > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${stat.bgLight} ${stat.textColor}`}>
                        {stat.change}
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
                onClick={() => setActiveTab('approvals')}
                className="group bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-orange-100 text-sm mb-1">Action Required</p>
                  <p className="font-bold text-lg">Review Approvals</p>
                </div>
                <Users className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('campaigns')}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-purple-100 text-sm mb-1">Broadcast</p>
                  <p className="font-bold text-lg">Create Campaign</p>
                </div>
                <Megaphone className="size-8 opacity-75 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="text-blue-100 text-sm mb-1">Analytics</p>
                  <p className="font-bold text-lg">View Reports</p>
                </div>
                <BarChart3 className="size-8 opacity-75 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </>
        )}

        {/* Content Area */}
        <div>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="animate-slide-in-up space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">System Analytics</h3>
                  
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Collections Chart */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4">Monthly Collections</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockMonthlyStats} id="monthly-collections-line-chart">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              padding: '12px'
                            }} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="collections" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border-2 border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4">E-Waste by Category</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart id="category-distribution-pie-chart">
                          <Pie
                            data={mockCategoryStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="category"
                          >
                            {mockCategoryStats.map((entry, index) => (
                              <Cell key={`category-cell-${entry.category}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Recent Collections</h4>
                    <div className="space-y-3">
                      {mockCollectionRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{request.id}</p>
                              <p className="text-sm text-gray-600">{getCategoryLabel(request.category)}</p>
                            </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h3>
                  <p className="text-gray-600">Review and approve user registrations</p>
                </div>

                {/* Approval Filter Navbar */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-2 mb-8">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                      onClick={() => setApprovalFilter('users')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                        approvalFilter === 'users'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="size-5" />
                      Users
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        approvalFilter === 'users'
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {pendingUsers.filter(u => u.approvalStatus === 'pending').length}
                      </span>
                    </button>

                    <button
                      onClick={() => setApprovalFilter('recycling_collectors')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                        approvalFilter === 'recycling_collectors'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Building2 className="size-5" />
                        <Truck className="size-5" />
                      </div>
                      Recycling & Collector Roles
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        approvalFilter === 'recycling_collectors'
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {pendingCenters.filter(c => c.approvalStatus === 'pending').length +
                         pendingCollectors.filter(c => c.approvalStatus === 'pending').length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Pending Users */}
                {approvalFilter === 'users' && 
                 pendingUsers.filter(u => u.approvalStatus === 'pending').length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="size-6 text-green-600" />
                      Regular Users ({pendingUsers.filter(u => u.approvalStatus === 'pending').length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingUsers.filter(u => u.approvalStatus === 'pending').map((pendingUser) => (
                        <div key={pendingUser.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-green-300 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <User className="size-6 text-white" />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{pendingUser.name}</h5>
                                <p className="text-sm text-gray-600">{pendingUser.email}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              PENDING
                            </span>
                          </div>

                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="size-4 text-gray-400" />
                              <span>Registered: {new Date(pendingUser.registeredAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove('user', pendingUser.id, pendingUser.name)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                            >
                              <Check className="size-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject('user', pendingUser.id, pendingUser.name)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                            >
                              <XCircle className="size-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Centers */}
                {approvalFilter === 'recycling_collectors' &&
                 pendingCenters.filter(c => c.approvalStatus === 'pending').length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="size-6 text-purple-600" />
                      Recycling Centers ({pendingCenters.filter(c => c.approvalStatus === 'pending').length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingCenters.filter(c => c.approvalStatus === 'pending').map((center) => (
                        <div key={center.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <Building2 className="size-6 text-white" />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{center.name}</h5>
                                <p className="text-sm text-gray-600">{center.email}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              PENDING
                            </span>
                          </div>

                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="size-4 text-gray-400" />
                              <span>Registered: {new Date(center.registeredAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove('center', center.id, center.name)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                            >
                              <Check className="size-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject('center', center.id, center.name)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                            >
                              <XCircle className="size-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Collectors */}
                {approvalFilter === 'recycling_collectors' &&
                 pendingCollectors.filter(c => c.approvalStatus === 'pending').length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="size-6 text-blue-600" />
                      Collectors ({pendingCollectors.filter(c => c.approvalStatus === 'pending').length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingCollectors.filter(c => c.approvalStatus === 'pending').map((collector) => (
                        <div key={collector.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-blue-300 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                <Truck className="size-6 text-white" />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{collector.name}</h5>
                                <p className="text-sm text-gray-600">{collector.email}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                              PENDING
                            </span>
                          </div>

                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Truck className="size-4 text-gray-400" />
                              <span>Vehicle: {collector.vehicleType} - {collector.vehicleNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="size-4 text-gray-400" />
                              <span>Registered: {new Date(collector.registeredAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove('collector', collector.id, collector.name)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                            >
                              <Check className="size-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject('collector', collector.id, collector.name)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                            >
                              <XCircle className="size-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state based on filter */}
                {(() => {
                  const hasPendingUsers = pendingUsers.filter(u => u.approvalStatus === 'pending').length > 0;
                  const hasPendingCenters = pendingCenters.filter(c => c.approvalStatus === 'pending').length > 0;
                  const hasPendingCollectors = pendingCollectors.filter(c => c.approvalStatus === 'pending').length > 0;

                  const showEmpty =
                    (approvalFilter === 'users' && !hasPendingUsers) ||
                    (approvalFilter === 'recycling_collectors' && !hasPendingCenters && !hasPendingCollectors);

                  return showEmpty ? (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h4>
                      <p className="text-gray-600">
                        {approvalFilter === 'users' && 'No pending user approvals'}
                        {approvalFilter === 'recycling_collectors' && 'No pending recycling center or collector approvals'}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-600">Manage and view user profiles</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUsers.map((userItem) => (
                    <div key={userItem.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-blue-300 hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{userItem.name}</h4>
                          <p className="text-sm text-gray-600">{userItem.email}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Role</span>
                          <span className="text-2xl font-bold text-blue-600 capitalize">{userItem.role}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(userItem)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                        >
                          <Edit className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                          className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">E-Waste Categories</h3>
                    <p className="text-gray-600">Manage collection categories and base points</p>
                  </div>
                  <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                  >
                    <Plus className="size-5" />
                    Add Category
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-green-300 hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{category.label}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Base Points</span>
                          <span className="text-2xl font-bold text-green-600">{category.rewardPoints}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                        >
                          <Edit className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.label)}
                          className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="animate-slide-in-up">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="size-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Reward Rules</h3>
                  <p className="text-gray-600">Configure point multipliers and bonuses</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewardRules.map((rule) => (
                    <div key={rule.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Award className="size-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{rule.name}</h4>
                          <p className="text-xs text-gray-600">{rule.condition}</p>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Multiplier</span>
                          <span className="text-xl font-bold text-purple-600">×{rule.multiplier}</span>
                        </div>
                        {rule.bonusPoints && (
                          <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                            <span className="text-sm text-gray-700">Bonus</span>
                            <span className="text-xl font-bold text-purple-600">+{rule.bonusPoints}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRewardRule(rule.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
                        >
                          <Edit className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRewardRule(rule.id, rule.name)}
                          className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">System Reports</h3>
                    <p className="text-gray-600">Generate and download detailed reports</p>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                  >
                    <Download className="size-5" />
                    Generate Report
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Collections Report */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Collections Overview</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={mockMonthlyStats} id="collections-overview-chart">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="collections" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Weight Report */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Weight Collected (kg)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={mockMonthlyStats} id="weight-report-chart">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="weight" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {[
                    { title: 'Monthly Report', desc: 'Detailed monthly statistics', icon: Calendar, color: 'from-blue-500 to-blue-600' },
                    { title: 'User Analytics', desc: 'User engagement metrics', icon: Users, color: 'from-green-500 to-emerald-600' },
                    { title: 'Financial Report', desc: 'Revenue and costs analysis', icon: DollarSign, color: 'from-purple-500 to-purple-600' },
                  ].map((report, index) => {
                    const Icon = report.icon;
                    return (
                      <button
                        key={index}
                        onClick={handleGenerateReport}
                        className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
                      >
                        <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${report.color} mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="size-8 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{report.title}</h4>
                        <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                          <Download className="size-4" />
                          <span>Download PDF</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="animate-slide-in-up">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Awareness Campaigns</h3>
                    <p className="text-gray-600">Broadcast messages to users, collectors, and centers</p>
                  </div>
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium"
                  >
                    <Plus className="size-5" />
                    Create Campaign
                  </button>
                </div>

                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
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
                          <Megaphone className={`size-6 ${
                            campaign.type === 'promotion' ? 'text-green-700' :
                            campaign.type === 'awareness' ? 'text-blue-700' :
                            'text-yellow-700'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">{campaign.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              campaign.type === 'promotion' ? 'bg-green-200' :
                              campaign.type === 'awareness' ? 'bg-blue-200' :
                              'bg-yellow-200'
                            }`}>
                              {campaign.type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              campaign.active ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                            }`}>
                              {campaign.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{campaign.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Target: {campaign.targetAudience.toUpperCase()}</span>
                            <span>•</span>
                            <span>Posted: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleCampaign(campaign.id, campaign.active)}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Edit className="size-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id, campaign.title)}
                            className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="size-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <p className="text-green-100">
                    {editingCategory ? 'Update category details' : 'Add a new e-waste collection category'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    setCategoryForm({ label: '', description: '', rewardPoints: 50 });
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveCategoryForm} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.label}
                  onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="e.g., Laptops & Computers"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  rows={3}
                  placeholder="Brief description of what items belong to this category"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Reward Points *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={categoryForm.rewardPoints}
                  onChange={(e) => setCategoryForm({ ...categoryForm, rewardPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="50"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Base points awarded per collection. Multipliers may apply based on weight.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    setCategoryForm({ label: '', description: '', rewardPoints: 50 });
                  }}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="size-8 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Delete Category?
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deletingCategory.name}"</span>? 
                This action cannot be undone and will permanently remove this category from the system.
              </p>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All existing collections will remain unchanged</li>
                      <li>New collections cannot use this category</li>
                      <li>This action is permanent</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteCategory}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Edit User</h3>
                  <p className="text-blue-100">Update user profile information</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', role: 'user' });
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveUserForm} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Role *
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="user">User</option>
                  <option value="collector">Collector</option>
                  <option value="center">Recycling Center</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Choose the appropriate role for this user's access level.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', role: 'user' });
                  }}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="size-8 text-red-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Delete User?
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deletingUser.name}"</span>? 
                This action cannot be undone and will permanently remove this user from the system.
              </p>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>User's collection history will be preserved</li>
                      <li>User will lose access to the system</li>
                      <li>This action is permanent and irreversible</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteUser}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Create Campaign</h3>
                  <p className="text-purple-100">Broadcast a message to your audience</p>
                </div>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter campaign title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  rows={4}
                  placeholder="Enter your message"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Type *
                  </label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    required
                  >
                    <option value="awareness">Awareness</option>
                    <option value="promotion">Promotion</option>
                    <option value="notice">Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <select
                    value={newCampaign.targetAudience}
                    onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    required
                  >
                    <option value="all">All Users</option>
                    <option value="users">Users Only</option>
                    <option value="collectors">Collectors Only</option>
                    <option value="centers">Centers Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}