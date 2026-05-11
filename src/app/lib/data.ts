export type EWasteCategory = 
  | 'computers'
  | 'mobile_devices'
  | 'televisions'
  | 'appliances'
  | 'batteries'
  | 'cables'
  | 'other';

export type CollectionStatus = 
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'received'
  | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface EWasteCategoryConfig {
  id: EWasteCategory;
  label: string;
  description: string;
  rewardPoints: number;
  pickupCharge: number;
  active: boolean;
}

export interface RewardRule {
  id: string;
  category: EWasteCategory;
  minWeight: number;
  maxWeight?: number;
  pointsPerKg: number;
  bonusPoints?: number;
}

export interface Campaign {
  id: string;
  title: string;
  message: string;
  type: 'notice' | 'awareness' | 'promotion';
  createdAt: string;
  expiresAt?: string;
  active: boolean;
  targetAudience: 'all' | 'users' | 'collectors' | 'centers';
}

export interface CollectionRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  category: EWasteCategory;
  items: string;
  quantity?: number;
  weight?: number;
  estimatedWeight?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: CollectionStatus;
  collectorId?: string;
  collectorName?: string;
  recyclingCenterId?: string;
  recyclingCenterName?: string;
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
  notes?: string;
  image?: string;
  rewardPoints?: number;
  pickupCharge?: number;
  receivedAt?: string;
  classification?: ItemClassification;
  recyclingOutcome?: RecyclingOutcome;
  trackingHistory?: TrackingUpdate[];
  pickupOTP?: string;
  otpVerifiedAt?: string;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'bonus';
  points: number;
  description: string;
  relatedRequestId?: string;
  timestamp: string;
  balance: number;
}

export interface RewardRedemption {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'voucher' | 'donation' | 'discount' | 'cashback';
  icon: string;
  available: boolean;
}

export interface UserRewardProfile {
  userId: string;
  totalPoints: number;
  lifetimePoints: number;
  redeemedPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  rank?: number;
}

export interface TrackingUpdate {
  status: CollectionStatus;
  timestamp: string;
  message: string;
  location?: string;
}

export type ItemClassification = 'reusable' | 'repairable' | 'recyclable' | 'hazardous';

export interface RecyclingOutcome {
  processedDate: string;
  classification: ItemClassification;
  recoveredMaterials: RecoveredMaterial[];
  disposalMethod: string;
  notes?: string;
  certificateGenerated?: boolean;
}

export interface RecoveredMaterial {
  material: string;
  weight: number;
  unit: 'kg' | 'g';
  value?: number;
}

export interface DisposalGuideline {
  id: string;
  category: EWasteCategory;
  title: string;
  description: string;
  steps: string[];
  safetyWarnings: string[];
  uploadedBy: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'collector' | 'recycling_center';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: 'user' | 'collector' | 'recycling_center';
  }[];
  relatedRequestId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface RecyclingCenter {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  capacity: number;
  currentLoad: number;
  acceptedCategories: EWasteCategory[];
  rating: number;
  totalCollections: number;
  status: 'active' | 'inactive';
  approvalStatus: ApprovalStatus;
  registeredAt: string;
  approvedAt?: string;
  certifications?: string[];
}

export interface Collector {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  assignedCenter?: string;
  assignedCenterName?: string;
  status: 'available' | 'busy' | 'offline';
  completedCollections: number;
  rating: number;
  currentLocation?: string;
  approvalStatus: ApprovalStatus;
  registeredAt: string;
  approvedAt?: string;
  licenseNumber?: string;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'user' | 'collector' | 'recycling_center';
  approvalStatus: ApprovalStatus;
  registeredAt: string;
  approvedAt?: string;
}

// Mock data
export const mockCollectionRequests: CollectionRequest[] = [
  {
    id: 'CR001',
    userId: '4',
    userName: 'Fatima Rahman',
    userPhone: '+880-1712-345678',
    userAddress: 'House 45, Road 12, Dhanmondi, Dhaka',
    category: 'computers',
    items: 'Old laptop, desktop computer, keyboard, mouse',
    quantity: 4,
    estimatedWeight: '15-20 kg',
    scheduledDate: '2026-04-02',
    scheduledTime: '10:00 AM',
    status: 'assigned',
    collectorId: '3',
    collectorName: 'Karim Hossain',
    recyclingCenterId: '2',
    recyclingCenterName: 'GreenTech Recycling Center',
    createdAt: '2026-03-28T10:30:00Z',
    notes: 'Please call before arrival',
    rewardPoints: 50,
    pickupCharge: 10,
    trackingHistory: [
      {
        status: 'pending',
        timestamp: '2026-03-28T10:30:00Z',
        message: 'Request submitted successfully',
      },
      {
        status: 'assigned',
        timestamp: '2026-03-28T14:00:00Z',
        message: 'Collector Karim Hossain assigned',
        location: 'GreenTech Recycling Center',
      },
    ],
  },
  {
    id: 'CR002',
    userId: '4',
    userName: 'Fatima Rahman',
    userPhone: '+880-1712-345678',
    userAddress: 'House 45, Road 12, Dhanmondi, Dhaka',
    category: 'mobile_devices',
    items: '3 old smartphones, 2 tablets',
    quantity: 5,
    estimatedWeight: '1-2 kg',
    status: 'pending',
    recyclingCenterId: '2',
    recyclingCenterName: 'GreenTech Recycling Center',
    createdAt: '2026-03-29T14:20:00Z',
    rewardPoints: 30,
    pickupCharge: 5,
    trackingHistory: [
      {
        status: 'pending',
        timestamp: '2026-03-29T14:20:00Z',
        message: 'Request submitted successfully',
      },
    ],
  },
  {
    id: 'CR003',
    userId: '5',
    userName: 'Abdul Rahim',
    userPhone: '+880-1823-456789',
    userAddress: '78 CDA Avenue, Agrabad, Chittagong',
    category: 'televisions',
    items: '32-inch LED TV',
    quantity: 1,
    weight: 12,
    scheduledDate: '2026-03-30',
    scheduledTime: '2:00 PM',
    status: 'completed',
    collectorId: '3',
    collectorName: 'Karim Hossain',
    recyclingCenterId: '2',
    recyclingCenterName: 'GreenTech Recycling Center',
    createdAt: '2026-03-25T09:15:00Z',
    completedAt: '2026-03-30T14:30:00Z',
    rewardPoints: 40,
    pickupCharge: 15,
    classification: 'recyclable',
    trackingHistory: [
      {
        status: 'pending',
        timestamp: '2026-03-25T09:15:00Z',
        message: 'Request submitted successfully',
      },
      {
        status: 'assigned',
        timestamp: '2026-03-25T11:00:00Z',
        message: 'Collector assigned',
      },
      {
        status: 'in_progress',
        timestamp: '2026-03-30T13:30:00Z',
        message: 'Collector en route to pickup location',
      },
      {
        status: 'completed',
        timestamp: '2026-03-30T14:30:00Z',
        message: 'Items collected and delivered to recycling center',
      },
    ],
  },
  {
    id: 'CR004',
    userId: '6',
    userName: 'Nusrat Jahan',
    userPhone: '+880-1934-567890',
    userAddress: 'Flat 3B, Zindabazar, Sylhet',
    category: 'appliances',
    items: 'Microwave, toaster, coffee maker',
    quantity: 3,
    estimatedWeight: '10-15 kg',
    scheduledDate: '2026-04-01',
    scheduledTime: '11:00 AM',
    status: 'in_progress',
    collectorId: '6',
    collectorName: 'Mahmud Khan',
    recyclingCenterId: '2',
    recyclingCenterName: 'GreenTech Recycling Center',
    createdAt: '2026-03-27T16:45:00Z',
    rewardPoints: 25,
    pickupCharge: 8,
    trackingHistory: [
      {
        status: 'pending',
        timestamp: '2026-03-27T16:45:00Z',
        message: 'Request submitted successfully',
      },
      {
        status: 'assigned',
        timestamp: '2026-03-28T09:00:00Z',
        message: 'Collector Mahmud Khan assigned',
      },
      {
        status: 'in_progress',
        timestamp: '2026-04-01T10:30:00Z',
        message: 'Collector is on the way',
        location: 'En route to Zindabazar, Sylhet',
      },
    ],
  },
  {
    id: 'CR005',
    userId: '7',
    userName: 'Shahidul Islam',
    userPhone: '+880-1745-678901',
    userAddress: 'Plot 22, Mirpur DOHS, Dhaka',
    category: 'batteries',
    items: 'Car battery, UPS batteries (2 units)',
    quantity: 3,
    estimatedWeight: '30 kg',
    scheduledDate: '2026-04-06',
    scheduledTime: '9:00 AM',
    status: 'pending',
    recyclingCenterId: '2',
    recyclingCenterName: 'GreenTech Recycling Center',
    createdAt: '2026-04-04T11:20:00Z',
    rewardPoints: 60,
    pickupCharge: 20,
    trackingHistory: [
      {
        status: 'pending',
        timestamp: '2026-04-04T11:20:00Z',
        message: 'Request submitted - awaiting collector assignment',
      },
    ],
  },
  {
    id: 'CR006',
    userId: '8',
    userName: 'Ayesha Siddique',
    userPhone: '+880-1856-789012',
    userAddress: 'House 18, Banani, Dhaka',
    category: 'computers',
    items: 'Printer, scanner, old monitor',
    quantity: 3,
    estimatedWeight: '12 kg',
    scheduledDate: '2026-04-07',
    scheduledTime: '3:00 PM',
    status: 'pending',
    recyclingCenterId: '2',
    recyclingCenterName: 'GreenTech Recycling Center',
    createdAt: '2026-04-05T08:45:00Z',
    rewardPoints: 35,
    pickupCharge: 12,
    trackingHistory: [
      {
        status: 'pending',
        timestamp: '2026-04-05T08:45:00Z',
        message: 'Request submitted - awaiting collector assignment',
      },
    ],
  },
];

export const mockRecyclingCenters: RecyclingCenter[] = [
  {
    id: '2',
    name: 'GreenTech Recycling Center',
    email: 'center@ewaste.com',
    phone: '+1-555-0101',
    address: '123 Green St, EcoCity',
    city: 'EcoCity',
    capacity: 10000,
    currentLoad: 6500,
    acceptedCategories: ['computers', 'mobile_devices', 'televisions', 'appliances', 'batteries', 'cables'],
    rating: 4.8,
    totalCollections: 1250,
    status: 'active',
    approvalStatus: 'approved',
    registeredAt: '2025-01-15T08:00:00Z',
    approvedAt: '2025-01-16T10:00:00Z',
    certifications: ['ISO 14001', 'EPA Certified'],
  },
  {
    id: '7',
    name: 'EcoRecycle Solutions',
    email: 'eco@recycle.com',
    phone: '+1-555-0106',
    address: '555 Recycle Blvd, GreenCity',
    city: 'GreenCity',
    capacity: 8000,
    currentLoad: 3200,
    acceptedCategories: ['computers', 'mobile_devices', 'batteries', 'cables', 'other'],
    rating: 4.5,
    totalCollections: 890,
    status: 'active',
    approvalStatus: 'approved',
    registeredAt: '2025-02-20T09:00:00Z',
    approvedAt: '2025-02-21T11:00:00Z',
    certifications: ['ISO 14001'],
  },
  {
    id: '8',
    name: 'TechWaste Recyclers',
    email: 'tech@waste.com',
    phone: '+1-555-0107',
    address: '888 Tech Park, EcoCity',
    city: 'EcoCity',
    capacity: 15000,
    currentLoad: 9800,
    acceptedCategories: ['computers', 'mobile_devices', 'televisions', 'appliances'],
    rating: 4.7,
    totalCollections: 2100,
    status: 'active',
    approvalStatus: 'approved',
    registeredAt: '2025-03-10T10:00:00Z',
    approvedAt: '2025-03-11T12:00:00Z',
    certifications: ['ISO 14001'],
  },
];

export const mockCollectors: Collector[] = [
  {
    id: '3',
    name: 'Karim Hossain',
    email: 'collector@ewaste.com',
    phone: '+1-555-0102',
    vehicleType: 'Van',
    vehicleNumber: 'ECO-123',
    assignedCenter: '2',
    assignedCenterName: 'GreenTech Recycling Center',
    status: 'busy',
    completedCollections: 145,
    rating: 4.9,
    currentLocation: 'En route to 456 Main St',
    approvalStatus: 'approved',
    registeredAt: '2025-01-15T08:00:00Z',
    approvedAt: '2025-01-16T10:00:00Z',
    licenseNumber: 'COL-12345',
  },
  {
    id: '6',
    name: 'Mahmud Khan',
    email: 'mike@ewaste.com',
    phone: '+1-555-0108',
    vehicleType: 'Truck',
    vehicleNumber: 'ECO-456',
    assignedCenter: '2',
    assignedCenterName: 'GreenTech Recycling Center',
    status: 'busy',
    completedCollections: 98,
    rating: 4.7,
    currentLocation: 'At pickup location',
    approvalStatus: 'approved',
    registeredAt: '2025-02-20T09:00:00Z',
    approvedAt: '2025-02-21T11:00:00Z',
    licenseNumber: 'COL-67890',
  },
  {
    id: '9',
    name: 'Sarah Transport',
    email: 'sarah@ewaste.com',
    phone: '+1-555-0109',
    vehicleType: 'Van',
    vehicleNumber: 'ECO-789',
    assignedCenter: '7',
    assignedCenterName: 'EcoRecycle Solutions',
    status: 'available',
    completedCollections: 67,
    rating: 4.8,
    currentLocation: 'At depot',
    approvalStatus: 'approved',
    registeredAt: '2025-03-10T10:00:00Z',
    approvedAt: '2025-03-11T12:00:00Z',
    licenseNumber: 'COL-54321',
  },
];

export const mockPendingUsers: PendingUser[] = [
  {
    id: 'PU001',
    name: 'Jahangir Alam',
    email: 'jahangir.alam@example.com',
    phone: '+880-1712-111222',
    address: '23 Banani, Dhaka',
    role: 'user',
    approvalStatus: 'pending',
    registeredAt: '2026-03-20T15:00:00Z',
  },
  {
    id: 'PU002',
    name: 'Taslima Khatun',
    email: 'taslima.k@example.com',
    phone: '+880-1823-222333',
    address: '45 Uttara, Dhaka',
    role: 'collector',
    approvalStatus: 'approved',
    registeredAt: '2026-03-21T16:00:00Z',
    approvedAt: '2026-03-22T18:00:00Z',
  },
  {
    id: 'PU003',
    name: 'Rashid Ahmed',
    email: 'rashid.ahmed@example.com',
    phone: '+880-1934-333444',
    address: '78 Gulshan, Dhaka',
    role: 'recycling_center',
    approvalStatus: 'rejected',
    registeredAt: '2026-03-22T17:00:00Z',
    approvedAt: '2026-03-23T19:00:00Z',
  },
];

export interface AllUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'user';
  joinedAt: string;
  totalCollections: number;
  totalPoints: number;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
}

export const mockAllUsers: AllUser[] = [
  {
    id: '4',
    name: 'Fatima Rahman',
    email: 'fatima.rahman@example.com',
    phone: '+880-1712-345678',
    address: 'House 45, Road 12, Dhanmondi, Dhaka',
    role: 'user',
    joinedAt: '2025-06-15T10:00:00Z',
    totalCollections: 12,
    totalPoints: 450,
    status: 'active',
    lastActive: '2026-03-31T14:30:00Z',
  },
  {
    id: '5',
    name: 'Abdul Rahim',
    email: 'abdul.rahim@example.com',
    phone: '+880-1823-456789',
    address: '78 CDA Avenue, Agrabad, Chittagong',
    role: 'user',
    joinedAt: '2025-08-20T09:00:00Z',
    totalCollections: 8,
    totalPoints: 320,
    status: 'active',
    lastActive: '2026-03-30T16:20:00Z',
  },
  {
    id: '6',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@example.com',
    phone: '+880-1934-567890',
    address: 'Flat 3B, Zindabazar, Sylhet',
    role: 'user',
    joinedAt: '2025-09-10T11:00:00Z',
    totalCollections: 15,
    totalPoints: 580,
    status: 'active',
    lastActive: '2026-03-31T10:15:00Z',
  },
  {
    id: '7',
    name: 'Kamal Hossain',
    email: 'kamal.h@example.com',
    phone: '+880-1712-678901',
    address: '12 Mirpur DOHS, Dhaka',
    role: 'user',
    joinedAt: '2025-10-05T13:00:00Z',
    totalCollections: 6,
    totalPoints: 240,
    status: 'active',
    lastActive: '2026-03-29T18:45:00Z',
  },
  {
    id: '8',
    name: 'Salma Begum',
    email: 'salma.begum@example.com',
    phone: '+880-1823-789012',
    address: '89 Khulshi, Chittagong',
    role: 'user',
    joinedAt: '2025-11-12T14:00:00Z',
    totalCollections: 10,
    totalPoints: 425,
    status: 'active',
    lastActive: '2026-03-31T09:30:00Z',
  },
  {
    id: '9',
    name: 'Habib Rahman',
    email: 'habib.r@example.com',
    phone: '+880-1934-890123',
    address: '34 Court Road, Rajshahi',
    role: 'user',
    joinedAt: '2025-12-01T15:00:00Z',
    totalCollections: 4,
    totalPoints: 180,
    status: 'active',
    lastActive: '2026-03-28T12:00:00Z',
  },
  {
    id: '10',
    name: 'Ayesha Siddique',
    email: 'ayesha.s@example.com',
    phone: '+880-1712-901234',
    address: '56 Shantinagar, Dhaka',
    role: 'user',
    joinedAt: '2026-01-10T16:00:00Z',
    totalCollections: 9,
    totalPoints: 370,
    status: 'active',
    lastActive: '2026-03-31T11:20:00Z',
  },
  {
    id: '11',
    name: 'Mizanur Rahman',
    email: 'mizan.r@example.com',
    phone: '+880-1823-012345',
    address: '23 Kazir Dewri, Chittagong',
    role: 'user',
    joinedAt: '2026-02-14T10:00:00Z',
    totalCollections: 3,
    totalPoints: 135,
    status: 'inactive',
    lastActive: '2026-03-15T08:00:00Z',
  },
  {
    id: '12',
    name: 'Razia Sultana',
    email: 'razia.sultana@example.com',
    phone: '+880-1934-123456',
    address: '67 Mohakhali, Dhaka',
    role: 'user',
    joinedAt: '2026-03-01T12:00:00Z',
    totalCollections: 2,
    totalPoints: 95,
    status: 'active',
    lastActive: '2026-03-30T20:10:00Z',
  },
  {
    id: '13',
    name: 'Jahangir Kabir',
    email: 'jahangir.k@example.com',
    phone: '+880-1712-234567',
    address: '45 Bailey Road, Dhaka',
    role: 'user',
    joinedAt: '2026-03-15T14:00:00Z',
    totalCollections: 1,
    totalPoints: 50,
    status: 'active',
    lastActive: '2026-03-31T15:40:00Z',
  },
];

export const getCategoryLabel = (category: EWasteCategory): string => {
  const labels: Record<EWasteCategory, string> = {
    computers: 'Computers & Laptops',
    mobile_devices: 'Mobile Devices',
    televisions: 'Televisions & Monitors',
    appliances: 'Small Appliances',
    batteries: 'Batteries',
    cables: 'Cables & Accessories',
    other: 'Other E-Waste',
  };
  return labels[category];
};

export const getStatusColor = (status: CollectionStatus): string => {
  const colors: Record<CollectionStatus, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    assigned: 'text-blue-600 bg-blue-50',
    in_progress: 'text-purple-600 bg-purple-50',
    completed: 'text-green-600 bg-green-50',
    received: 'text-orange-600 bg-orange-50',
    cancelled: 'text-red-600 bg-red-50',
  };
  return colors[status];
};

export const mockEWasteCategories: EWasteCategoryConfig[] = [
  {
    id: 'computers',
    label: 'Computers & Laptops',
    description: 'Desktop computers, laptops, keyboards, mice',
    rewardPoints: 50,
    pickupCharge: 10,
    active: true,
  },
  {
    id: 'mobile_devices',
    label: 'Mobile Devices',
    description: 'Smartphones, tablets, smartwatches',
    rewardPoints: 30,
    pickupCharge: 5,
    active: true,
  },
  {
    id: 'televisions',
    label: 'Televisions & Monitors',
    description: 'TVs, computer monitors, displays',
    rewardPoints: 40,
    pickupCharge: 15,
    active: true,
  },
  {
    id: 'appliances',
    label: 'Small Appliances',
    description: 'Microwaves, toasters, coffee makers',
    rewardPoints: 25,
    pickupCharge: 8,
    active: true,
  },
  {
    id: 'batteries',
    label: 'Batteries',
    description: 'Rechargeable batteries, power banks',
    rewardPoints: 15,
    pickupCharge: 0,
    active: true,
  },
  {
    id: 'cables',
    label: 'Cables & Accessories',
    description: 'Cables, chargers, adapters, peripherals',
    rewardPoints: 10,
    pickupCharge: 0,
    active: true,
  },
  {
    id: 'other',
    label: 'Other E-Waste',
    description: 'Other electronic waste items',
    rewardPoints: 20,
    pickupCharge: 5,
    active: true,
  },
];

export const mockRewardRules: (RewardRule & { name: string; condition: string; multiplier: number })[] = [
  {
    id: 'RR001',
    name: 'Bulk Computer Discount',
    condition: 'Computers 10-50 kg',
    category: 'computers',
    minWeight: 10,
    maxWeight: 50,
    pointsPerKg: 7,
    bonusPoints: 10,
    multiplier: 1.4,
  },
  {
    id: 'RR002',
    name: 'Premium Computer Bonus',
    condition: 'Computers 50+ kg',
    category: 'computers',
    minWeight: 50,
    pointsPerKg: 10,
    bonusPoints: 50,
    multiplier: 2.0,
  },
  {
    id: 'RR003',
    name: 'Mobile Device Premium',
    condition: 'Any mobile devices',
    category: 'mobile_devices',
    minWeight: 0,
    pointsPerKg: 15,
    multiplier: 3.0,
  },
  {
    id: 'RR004',
    name: 'Battery Collection',
    condition: 'Any batteries',
    category: 'batteries',
    minWeight: 0,
    pointsPerKg: 20,
    multiplier: 4.0,
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'C001',
    title: 'Earth Day Special',
    message: 'Celebrate Earth Day with us! Get 2x reward points on all e-waste collections during April.',
    type: 'promotion',
    createdAt: '2026-03-15T10:00:00Z',
    expiresAt: '2026-04-30T23:59:59Z',
    active: true,
    targetAudience: 'users',
  },
  {
    id: 'C002',
    title: 'Proper Battery Disposal',
    message: 'Did you know? Batteries contain toxic materials that can harm the environment. Always recycle your batteries responsibly!',
    type: 'awareness',
    createdAt: '2026-03-20T09:00:00Z',
    active: true,
    targetAudience: 'all',
  },
  {
    id: 'C003',
    title: 'System Maintenance Notice',
    message: 'Our system will undergo scheduled maintenance on April 5th from 2:00 AM to 4:00 AM. Services will be temporarily unavailable.',
    type: 'notice',
    createdAt: '2026-03-25T14:00:00Z',
    expiresAt: '2026-04-05T04:00:00Z',
    active: true,
    targetAudience: 'all',
  },
  {
    id: 'C004',
    title: 'Collector Bonus Program',
    message: 'Complete 10 collections this month and receive a bonus of 500 points!',
    type: 'promotion',
    createdAt: '2026-03-01T08:00:00Z',
    expiresAt: '2026-03-31T23:59:59Z',
    active: true,
    targetAudience: 'collectors',
  },
];

export const mockPendingCenters: RecyclingCenter[] = [
  {
    id: 'PC001',
    name: 'Green Future Recycling',
    email: 'info@greenfuture.com',
    phone: '+1-555-0120',
    address: '999 Eco Lane, GreenCity',
    city: 'GreenCity',
    capacity: 12000,
    currentLoad: 0,
    acceptedCategories: ['computers', 'mobile_devices', 'televisions'],
    rating: 0,
    totalCollections: 0,
    status: 'inactive',
    approvalStatus: 'pending',
    registeredAt: '2026-03-28T10:00:00Z',
    certifications: ['ISO 14001'],
  },
];

export const mockPendingCollectors: Collector[] = [
  {
    id: 'PC001',
    name: 'Alex Driver',
    email: 'alex.driver@email.com',
    phone: '+1-555-0121',
    vehicleType: 'Van',
    vehicleNumber: 'ECO-999',
    status: 'offline',
    completedCollections: 0,
    rating: 0,
    approvalStatus: 'pending',
    registeredAt: '2026-03-29T11:00:00Z',
    licenseNumber: 'COL-99999',
  },
];

// Statistics data for charts
export const mockMonthlyStats = [
  { month: 'Oct', collections: 45, weight: 580 },
  { month: 'Nov', collections: 52, weight: 650 },
  { month: 'Dec', collections: 48, weight: 620 },
  { month: 'Jan', collections: 60, weight: 750 },
  { month: 'Feb', collections: 55, weight: 690 },
  { month: 'Mar', collections: 68, weight: 820 },
];

export const mockCategoryStats = [
  { category: 'Computers', value: 35, color: '#3b82f6' },
  { category: 'Mobile', value: 25, color: '#10b981' },
  { category: 'TVs', value: 20, color: '#f59e0b' },
  { category: 'Appliances', value: 15, color: '#8b5cf6' },
  { category: 'Other', value: 5, color: '#6b7280' },
];

export const mockDisposalGuidelines: DisposalGuideline[] = [
  {
    id: 'DG001',
    category: 'batteries',
    title: 'Safe Battery Disposal Guide',
    description: 'Guidelines for handling and disposing of various battery types safely',
    steps: [
      'Separate batteries by type (Li-ion, NiMH, Lead-acid, Alkaline)',
      'Check for any damage or leakage - handle with protective gloves',
      'Tape battery terminals to prevent short circuits',
      'Store in a cool, dry place away from flammable materials',
      'Transport in non-conductive containers',
      'Process according to battery chemistry specifications',
    ],
    safetyWarnings: [
      'Never puncture or incinerate batteries',
      'Avoid exposure to water or extreme temperatures',
      'Use proper PPE when handling damaged batteries',
      'Keep away from children and pets',
    ],
    uploadedBy: 'GreenTech Recycling Center',
    uploadedAt: '2026-01-15T10:00:00Z',
    fileUrl: '/guidelines/battery-disposal.pdf',
  },
  {
    id: 'DG002',
    category: 'computers',
    title: 'Computer & Electronics Recycling',
    description: 'Proper procedures for dismantling and recycling computer equipment',
    steps: [
      'Remove all personal data using certified data destruction methods',
      'Disassemble components: case, motherboard, RAM, storage, PSU',
      'Separate metals (steel, aluminum, copper) from plastics',
      'Remove and properly dispose of any batteries or capacitors',
      'Sort recyclable materials by type',
      'Document materials recovered for tracking',
    ],
    safetyWarnings: [
      'Discharge capacitors before handling',
      'Wear cut-resistant gloves when disassembling',
      'Ensure data has been properly wiped',
    ],
    uploadedBy: 'GreenTech Recycling Center',
    uploadedAt: '2026-02-10T14:30:00Z',
    fileUrl: '/guidelines/computer-recycling.pdf',
  },
  {
    id: 'DG003',
    category: 'televisions',
    title: 'CRT and LCD Screen Disposal',
    description: 'Safe handling of television and monitor screens containing hazardous materials',
    steps: [
      'Identify screen type: CRT (contains lead) or LCD (contains mercury)',
      'Handle CRT screens with extreme care - contains vacuum tube',
      'Remove LCD backlights carefully due to mercury content',
      'Separate glass, plastic housing, and electronic components',
      'Package hazardous materials according to regulations',
      'Send to specialized processing facility',
    ],
    safetyWarnings: [
      'CRT implosion risk - handle with extreme caution',
      'Mercury exposure risk in LCD backlights',
      'Always wear safety glasses and protective equipment',
      'Never break screens intentionally',
    ],
    uploadedBy: 'GreenTech Recycling Center',
    uploadedAt: '2026-03-05T09:15:00Z',
    fileUrl: '/guidelines/screen-disposal.pdf',
  },
];

export const mockConversations: Conversation[] = [
  {
    id: 'CONV001',
    participants: [
      { id: '2', name: 'GreenTech Recycling Center', role: 'recycling_center' },
      { id: '4', name: 'Jane Smith', role: 'user' },
    ],
    relatedRequestId: 'CR001',
    lastMessage: 'What time should I expect the pickup?',
    lastMessageTime: '2026-03-30T15:30:00Z',
    unreadCount: 1,
  },
  {
    id: 'CONV002',
    participants: [
      { id: '2', name: 'GreenTech Recycling Center', role: 'recycling_center' },
      { id: '3', name: 'John Collector', role: 'collector' },
    ],
    relatedRequestId: 'CR001',
    lastMessage: 'Items received at the center. Processing now.',
    lastMessageTime: '2026-03-30T16:45:00Z',
    unreadCount: 0,
  },
  {
    id: 'CONV003',
    participants: [
      { id: '2', name: 'GreenTech Recycling Center', role: 'recycling_center' },
      { id: '6', name: 'Alice Williams', role: 'user' },
    ],
    relatedRequestId: 'CR004',
    lastMessage: 'Can you provide a recycling certificate for tax purposes?',
    lastMessageTime: '2026-03-30T14:20:00Z',
    unreadCount: 1,
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'MSG001',
    conversationId: 'CONV001',
    senderId: '4',
    senderName: 'Jane Smith',
    senderRole: 'user',
    message: 'Hi, I have a question about my pickup request CR001.',
    timestamp: '2026-03-30T15:00:00Z',
    read: true,
  },
  {
    id: 'MSG002',
    conversationId: 'CONV001',
    senderId: '2',
    senderName: 'GreenTech Recycling Center',
    senderRole: 'recycling_center',
    message: 'Hello Jane! How can we help you with your pickup?',
    timestamp: '2026-03-30T15:05:00Z',
    read: true,
  },
  {
    id: 'MSG003',
    conversationId: 'CONV001',
    senderId: '4',
    senderName: 'Jane Smith',
    senderRole: 'user',
    message: 'What time should I expect the pickup?',
    timestamp: '2026-03-30T15:30:00Z',
    read: false,
  },
  {
    id: 'MSG004',
    conversationId: 'CONV002',
    senderId: '3',
    senderName: 'John Collector',
    senderRole: 'collector',
    message: 'Heading to the center with CR001 items now.',
    timestamp: '2026-03-30T16:00:00Z',
    read: true,
  },
  {
    id: 'MSG005',
    conversationId: 'CONV002',
    senderId: '2',
    senderName: 'GreenTech Recycling Center',
    senderRole: 'recycling_center',
    message: 'Great! We\'re ready to receive. Please use Bay 3.',
    timestamp: '2026-03-30T16:10:00Z',
    read: true,
  },
  {
    id: 'MSG006',
    conversationId: 'CONV002',
    senderId: '3',
    senderName: 'John Collector',
    senderRole: 'collector',
    message: 'Items received at the center. Processing now.',
    timestamp: '2026-03-30T16:45:00Z',
    read: true,
  },
  {
    id: 'MSG007',
    conversationId: 'CONV003',
    senderId: '6',
    senderName: 'Alice Williams',
    senderRole: 'user',
    message: 'Can you provide a recycling certificate for tax purposes?',
    timestamp: '2026-03-30T14:20:00Z',
    read: false,
  },
];

export const getClassificationColor = (classification: ItemClassification): string => {
  const colors: Record<ItemClassification, string> = {
    reusable: 'text-green-600 bg-green-50',
    repairable: 'text-blue-600 bg-blue-50',
    recyclable: 'text-purple-600 bg-purple-50',
    hazardous: 'text-red-600 bg-red-50',
  };
  return colors[classification];
};

// Reward System Mock Data
export const mockRewardTransactions: RewardTransaction[] = [
  {
    id: 'RT001',
    userId: '4',
    type: 'earned',
    points: 40,
    description: 'E-waste collection completed - CR003',
    relatedRequestId: 'CR003',
    timestamp: '2026-03-30T14:30:00Z',
    balance: 165,
  },
  {
    id: 'RT002',
    userId: '4',
    type: 'earned',
    points: 50,
    description: 'E-waste collection completed - CR001',
    relatedRequestId: 'CR001',
    timestamp: '2026-03-28T16:00:00Z',
    balance: 125,
  },
  {
    id: 'RT003',
    userId: '4',
    type: 'bonus',
    points: 20,
    description: 'Earth Day special bonus - 2x points promotion',
    timestamp: '2026-03-25T10:00:00Z',
    balance: 75,
  },
  {
    id: 'RT004',
    userId: '4',
    type: 'redeemed',
    points: -25,
    description: 'Redeemed: $5 Amazon Gift Card',
    timestamp: '2026-03-20T12:00:00Z',
    balance: 55,
  },
  {
    id: 'RT005',
    userId: '4',
    type: 'earned',
    points: 30,
    description: 'E-waste collection completed',
    timestamp: '2026-03-15T15:30:00Z',
    balance: 80,
  },
];

export const mockRewardRedemptions: RewardRedemption[] = [
  {
    id: 'RED001',
    name: 'Amazon Gift Card',
    description: '$5 Amazon e-gift card delivered via email',
    pointsRequired: 100,
    category: 'voucher',
    icon: '🎁',
    available: true,
  },
  {
    id: 'RED002',
    name: 'Tree Plantation',
    description: 'Plant 5 trees in your name through our partner organizations',
    pointsRequired: 150,
    category: 'donation',
    icon: '🌳',
    available: true,
  },
  {
    id: 'RED003',
    name: 'Next Pickup Discount',
    description: '50% off on your next e-waste pickup charge',
    pointsRequired: 50,
    category: 'discount',
    icon: '💰',
    available: true,
  },
  {
    id: 'RED004',
    name: 'Cashback to Wallet',
    description: 'Convert 200 points to $10 cashback',
    pointsRequired: 200,
    category: 'cashback',
    icon: '💵',
    available: true,
  },
  {
    id: 'RED005',
    name: 'Starbucks Gift Card',
    description: '$10 Starbucks e-gift card',
    pointsRequired: 200,
    category: 'voucher',
    icon: '☕',
    available: true,
  },
  {
    id: 'RED006',
    name: 'Ocean Cleanup Donation',
    description: 'Support ocean cleanup initiatives',
    pointsRequired: 250,
    category: 'donation',
    icon: '🌊',
    available: true,
  },
];

export const mockUserRewardProfile: UserRewardProfile = {
  userId: '4',
  totalPoints: 165,
  lifetimePoints: 190,
  redeemedPoints: 25,
  tier: 'silver',
  rank: 47,
};

export const mockLeaderboard: Array<{
  rank: number;
  userId: string;
  name: string;
  points: number;
  collections: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}> = [
  { rank: 1, userId: '10', name: 'Emma Green', points: 1250, collections: 35, tier: 'platinum' },
  { rank: 2, userId: '11', name: 'Michael Eco', points: 980, collections: 28, tier: 'gold' },
  { rank: 3, userId: '12', name: 'Sarah Planet', points: 750, collections: 22, tier: 'gold' },
  { rank: 4, userId: '13', name: 'David Earth', points: 620, collections: 18, tier: 'silver' },
  { rank: 5, userId: '14', name: 'Lisa Nature', points: 540, collections: 16, tier: 'silver' },
  { rank: 47, userId: '4', name: 'Jane Smith', points: 165, collections: 3, tier: 'silver' },
];

// Helper function to generate OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to get tier color
export const getTierColor = (tier: 'bronze' | 'silver' | 'gold' | 'platinum'): string => {
  const colors = {
    bronze: 'text-orange-700 bg-orange-100',
    silver: 'text-gray-700 bg-gray-200',
    gold: 'text-yellow-700 bg-yellow-100',
    platinum: 'text-purple-700 bg-purple-100',
  };
  return colors[tier];
};

// Helper function to get tier icon
export const getTierIcon = (tier: 'bronze' | 'silver' | 'gold' | 'platinum'): string => {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };
  return icons[tier];
};