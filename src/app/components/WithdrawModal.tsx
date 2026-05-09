import { X, Zap, Check, User, AlertCircle, Clock, Sparkles } from 'lucide-react';

// Bangladeshi Taka Icon Component
const TakaIcon = ({ className = "size-5" }: { className?: string }) => (
  <span className={`font-bold ${className}`} style={{ fontFamily: 'Arial, sans-serif' }}>৳</span>
);

interface WithdrawModalProps {
  showModal: boolean;
  onClose: () => void;
  totalEarnings: number;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  withdrawMethod: string;
  setWithdrawMethod: (method: string) => void;
  accountNumber: string;
  setAccountNumber: (number: string) => void;
  onWithdraw: () => void;
}

export function WithdrawModal({
  showModal,
  onClose,
  totalEarnings,
  withdrawAmount,
  setWithdrawAmount,
  withdrawMethod,
  setWithdrawMethod,
  accountNumber,
  setAccountNumber,
  onWithdraw
}: WithdrawModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden">
        {/* Header with gradient and illustration */}
        <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white p-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-4 ring-white/30">
                  <TakaIcon className="size-9 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1">Withdraw Earnings</h3>
                  <p className="text-yellow-100 text-sm">Fast & secure money transfer</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all hover:rotate-90 duration-300"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Available Balance Card */}
            <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80 mb-2 font-medium">Available Balance</p>
                  <p className="text-4xl font-bold text-white">৳{totalEarnings.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="px-4 py-1.5 bg-green-500/30 backdrop-blur-sm rounded-full border border-green-300/50">
                    <p className="text-xs font-bold text-white">Ready to Withdraw</p>
                  </div>
                  <button
                    onClick={() => setWithdrawAmount(totalEarnings.toString())}
                    className="text-sm text-white font-semibold hover:underline flex items-center gap-1"
                  >
                    <Zap className="size-4" />
                    Withdraw All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Amount */}
            <div className="space-y-6">
              {/* Withdraw Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <TakaIcon className="size-4 text-yellow-600" />
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">৳</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-12 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-2xl font-bold text-gray-900 transition-all hover:border-gray-300"
                    placeholder="0"
                    min="100"
                    max={totalEarnings}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500 font-medium">Minimum: ৳100</p>
                  <p className="text-xs text-gray-500 font-medium">Max: ৳{totalEarnings.toLocaleString()}</p>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Quick Select</label>
                <div className="grid grid-cols-2 gap-3">
                  {[500, 1000, 2000, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(amount.toString())}
                      disabled={amount > totalEarnings}
                      className={`relative py-4 rounded-xl font-bold text-base transition-all ${
                        amount > totalEarnings
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-yellow-50 to-orange-50 text-yellow-700 border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-md hover:scale-105'
                      }`}
                    >
                      {amount <= totalEarnings && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                      )}
                      ৳{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Payment Method & Account */}
            <div className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-yellow-600" />
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'bkash', label: 'bKash', color: 'from-pink-500 to-pink-600', icon: '📱' },
                    { value: 'nagad', label: 'Nagad', color: 'from-orange-500 to-red-600', icon: '💳' },
                    { value: 'rocket', label: 'Rocket', color: 'from-purple-500 to-purple-600', icon: '🚀' },
                    { value: 'bank', label: 'Bank', color: 'from-blue-500 to-blue-600', icon: '🏦' }
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setWithdrawMethod(method.value)}
                      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        withdrawMethod === method.value
                          ? `bg-gradient-to-r ${method.color} text-white border-transparent shadow-lg`
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <p className="font-bold text-sm">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="size-4 text-yellow-600" />
                  {withdrawMethod === 'bank' ? 'Account Number' : 'Mobile Number'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold transition-all hover:border-gray-300"
                  placeholder={withdrawMethod === 'bank' ? '01XXXXXXXXXX' : '01X-XXXX-XXXX'}
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {withdrawMethod === 'bank' 
                    ? 'Enter your bank account number' 
                    : 'Must match your registered number'}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="size-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900 mb-2">Processing Information</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Withdrawals processed within 24 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    SMS confirmation sent to your mobile
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    No hidden charges or fees
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={onWithdraw}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100 || parseFloat(withdrawAmount) > totalEarnings || !accountNumber}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Check className="size-5" />
              Confirm Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
