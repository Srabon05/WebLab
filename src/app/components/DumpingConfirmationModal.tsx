import { X, Package, MapPin, Weight, Check, AlertCircle, Truck, Building2, Calendar, Clock, QrCode, CheckCircle, Award } from 'lucide-react';
import { useState } from 'react';

// Bangladeshi Taka Icon Component
const TakaIcon = ({ className = "size-5" }: { className?: string }) => (
  <span className={`font-bold ${className}`} style={{ fontFamily: 'Arial, sans-serif' }}>৳</span>
);

interface CollectedItem {
  name: string;
  quantity: number;
  unit: string;
  weight?: number;
  estimatedValue: number;
}

interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
}

interface DumpingConfirmationModalProps {
  showModal: boolean;
  onClose: () => void;
  requestId: string;
  userName: string;
  userAddress: string;
  collectedItems: CollectedItem[];
  assignedCenter: { id: string; name: string; address: string } | null;
  onConfirmDumping: (centerId: string, notes: string) => void;
}

export function DumpingConfirmationModal({
  showModal,
  onClose,
  requestId,
  userName,
  userAddress,
  collectedItems,
  assignedCenter,
  onConfirmDumping
}: DumpingConfirmationModalProps) {
  const [notes, setNotes] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);

  // Mock recycling centers
  const recyclingCenters: RecyclingCenter[] = [
    { id: 'rc1', name: 'GreenTech Recycling Hub', address: 'Dhanmondi, Dhaka', distance: '2.5 km', rating: 4.8 },
    { id: 'rc2', name: 'EcoWaste Management', address: 'Gulshan, Dhaka', distance: '3.2 km', rating: 4.6 },
    { id: 'rc3', name: 'Bangladesh Recycling Center', address: 'Banani, Dhaka', distance: '4.1 km', rating: 4.7 }
  ];

  const totalWeight = collectedItems.reduce((sum, item) => sum + (item.weight || 0), 0);
  const totalValue = collectedItems.reduce((sum, item) => sum + item.estimatedValue, 0);

  const handleConfirm = () => {
    if (assignedCenter) {
      setShowQRCode(true);
      setTimeout(() => {
        onConfirmDumping(assignedCenter.id, notes);
        setShowQRCode(false);
        onClose();
      }, 3000);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white p-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/30">
                  <Truck className="size-9 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1">Deliver to Recycling Center</h3>
                  <p className="text-green-100 text-sm">Complete your collection and earn rewards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all hover:rotate-90 duration-300"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Request Info */}
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/80 mb-1">Request ID</p>
                  <p className="font-bold text-white">#{requestId}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Collected From</p>
                  <p className="font-bold text-white">{userName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          {!showQRCode ? (
            <>
              {/* Collected Items Summary */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="size-5 text-green-600" />
                  Collected Items
                </h4>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
                  <div className="space-y-3">
                    {collectedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between pb-3 border-b border-green-200 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Package className="size-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} {item.unit}
                              {item.weight && ` • ${item.weight} kg`}
                            </p>
                          </div>
                        </div>
                        {/* Value removed */}
                      </div>
                    ))}
                  </div>
                  
                  {/* Totals */}
                  <div className="mt-5 pt-5 border-t-2 border-green-300">
                    <div className="bg-white/60 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Weight className="size-5 text-green-600" />
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Combined Weight</p>
                      </div>
                      <p className="text-3xl font-black text-gray-900">{totalWeight} kg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Recycling Center */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="size-5 text-green-600" />
                  Assigned Recycling Center
                </h4>
                {assignedCenter ? (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl border-2 border-transparent shadow-lg shadow-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-xl">{assignedCenter.name}</p>
                          <CheckCircle className="size-6 text-green-200" />
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 text-green-200" />
                            <span className="text-white/90">{assignedCenter.address || 'Address not available'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 text-green-200" />
                            <span className="text-white/90">Deliver during business hours</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border-2 border-red-100 rounded-xl text-red-600 flex items-center gap-2">
                    <AlertCircle className="size-5" />
                    No assigned recycling center found for this request.
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="size-4 text-green-600" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all hover:border-gray-300 resize-none"
                  placeholder="Any special notes about the collected items..."
                  rows={3}
                />
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-900 mb-2">Delivery Process</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Show QR code at recycling center for verification
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Center staff will verify items and weight
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Earnings will be credited immediately upon confirmation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!assignedCenter}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Check className="size-5" />
                  Confirm Delivery
                </button>
              </div>
            </>
          ) : (
            /* QR Code Display */
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-64 h-64 bg-white border-8 border-green-500 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                <QrCode className="size-32 text-green-600" />
              </div>
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Delivery Code Generated</h4>
                <p className="text-gray-600 mb-4">Show this code at the recycling center</p>
                <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl">
                  <p className="text-sm font-medium mb-1">Confirmation Code</p>
                  <p className="text-3xl font-bold tracking-wider">{requestId.toUpperCase()}</p>
                </div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 w-full max-w-md">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle className="size-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Delivery Confirmed</p>
                    <p className="text-sm">Redirecting you back...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
