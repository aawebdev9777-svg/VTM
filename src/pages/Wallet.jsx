import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, CreditCard, TrendingUp, TrendingDown, DollarSign, Crown, Users, Search, Send, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const cardDesigns = [
  { gradient: 'from-violet-600 via-violet-700 to-indigo-800', name: 'Royal Purple' },
  { gradient: 'from-rose-500 via-pink-600 to-purple-700', name: 'Sunset Blaze' },
  { gradient: 'from-cyan-500 via-blue-600 to-indigo-700', name: 'Ocean Deep' },
  { gradient: 'from-emerald-500 via-teal-600 to-cyan-700', name: 'Forest Mist' },
  { gradient: 'from-amber-500 via-orange-600 to-red-700', name: 'Fire Gold' },
  { gradient: 'from-slate-700 via-gray-800 to-black', name: 'Carbon Black' },
  { gradient: 'from-fuchsia-500 via-purple-600 to-indigo-700', name: 'Mystic Night' },
  { gradient: 'from-lime-500 via-green-600 to-emerald-700', name: 'Jade Dream' },
  { gradient: 'from-yellow-400 via-orange-500 to-red-600', name: 'Solar Flare' },
  { gradient: 'from-blue-600 via-indigo-700 to-purple-800', name: 'Twilight' },
];

const adminCard = { gradient: 'from-yellow-400 via-amber-500 to-orange-600', name: 'Super Admin' };

const generateCardNumber = (email) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash = hash & hash;
  }
  const last4 = Math.abs(hash % 10000).toString().padStart(4, '0');
  return `**** **** **** ${last4}`;
};

export default function Wallet() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const { data: accounts } = useQuery({
    queryKey: ['userAccount'],
    queryFn: () => base44.entities.UserAccount.list(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: allAccounts = [] } = useQuery({
    queryKey: ['allAccounts'],
    queryFn: () => base44.asServiceRole.entities.UserAccount.list(),
  });

  const { data: allPortfolios = [] } = useQuery({
    queryKey: ['allPortfolios'],
    queryFn: () => base44.asServiceRole.entities.Portfolio.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 5),
  });

  const account = accounts?.[0];
  const cashBalance = account?.cash_balance || 10000;
  const initialBalance = account?.initial_balance || 10000;
  const totalSpent = transactions.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.total_amount, 0);
  const totalEarned = transactions.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.total_amount, 0);

  const isAdmin = currentUser?.email === 'aa.web.dev9777@gmail.com';
  const currentCardDesign = isAdmin ? adminCard : cardDesigns[selectedCardIndex];
  const cardNumber = currentUser ? generateCardNumber(currentUser.email) : '**** **** **** 0000';

  // Leaderboard
  const leaderboard = allUsers.map(user => {
    const userAccount = allAccounts.find(acc => acc.created_by === user.email);
    const userPortfolio = allPortfolios.filter(p => p.created_by === user.email);
    const portfolioValue = userPortfolio.reduce((sum, p) => sum + (p.shares * p.average_buy_price), 0);
    const totalValue = (userAccount?.cash_balance || 10000) + portfolioValue;
    return {
      email: user.email,
      name: user.full_name || user.email,
      totalValue,
      rank: 0,
    };
  }).sort((a, b) => b.totalValue - a.totalValue).map((user, index) => ({ ...user, rank: index + 1 }));

  // Search users
  const filteredUsers = allUsers.filter(user => 
    user.email !== currentUser?.email && 
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async ({ recipientEmail, amount }) => {
      const recipientAccounts = await base44.asServiceRole.entities.UserAccount.filter({ created_by: recipientEmail });
      
      if (recipientAccounts.length === 0) {
        throw new Error('Recipient account not found');
      }

      const recipientAccount = recipientAccounts[0];
      
      await base44.entities.UserAccount.update(account.id, {
        cash_balance: account.cash_balance - amount
      });
      
      await base44.asServiceRole.entities.UserAccount.update(recipientAccount.id, {
        cash_balance: recipientAccount.cash_balance + amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccount'] });
      queryClient.invalidateQueries({ queryKey: ['allAccounts'] });
      setTransferAmount('');
      setSelectedRecipient(null);
    },
  });

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (amount > 0 && amount <= cashBalance && selectedRecipient) {
      transferMutation.mutate({ recipientEmail: selectedRecipient.email, amount });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <WalletIcon className="w-6 h-6 text-violet-600" />
          Wallet
          {isAdmin && <Crown className="w-6 h-6 text-yellow-500" />}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your virtual trading wallet
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Credit Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative w-full">
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`relative bg-gradient-to-br ${currentCardDesign.gradient} rounded-2xl p-6 md:p-8 text-white shadow-2xl overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Trading Account</p>
                    <p className="text-sm font-medium">{currentCardDesign.name}</p>
                    {isAdmin && <Badge className="mt-1 bg-yellow-400 text-gray-900">SUPER ADMIN</Badge>}
                  </div>
                  {isAdmin ? <Crown className="w-10 h-10" /> : <CreditCard className="w-10 h-10 opacity-75" />}
                </div>

                <div className="mb-6">
                  <p className="text-4xl md:text-5xl font-bold tracking-wide">
                    £{cashBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-75">Account Holder</p>
                    <p className="text-sm font-medium">{currentUser?.full_name || 'Trader'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">Card Number</p>
                    <p className="text-sm font-mono">{cardNumber}</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-20 left-6 w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80"></div>
            </motion.div>

            {!isAdmin && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {cardDesigns.map((design, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCardIndex(index)}
                    className={`flex-shrink-0 w-16 h-10 rounded-lg bg-gradient-to-br ${design.gradient} transition-all ${
                      selectedCardIndex === index ? 'ring-4 ring-violet-600 scale-110' : 'opacity-50 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((user) => (
                  <div
                    key={user.email}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.email === currentUser?.email ? 'bg-violet-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? 'bg-yellow-400 text-gray-900' :
                        user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                        user.rank === 3 ? 'bg-amber-600 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">£{user.totalValue.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Initial Balance</p>
                  <p className="text-xl font-bold text-gray-900">£{initialBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-red-600">£{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">£{totalEarned.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Money */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" />
                Send Money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchQuery && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.email}
                        onClick={() => setSelectedRecipient(user)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedRecipient?.email === user.email
                            ? 'border-violet-600 bg-violet-50'
                            : 'border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedRecipient && (
                  <div className="space-y-3">
                    <div className="p-3 bg-violet-50 rounded-lg">
                      <p className="text-sm text-gray-600">Sending to:</p>
                      <p className="font-medium">{selectedRecipient.full_name}</p>
                    </div>
                    <Input
                      type="number"
                      placeholder="Amount (£)"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <Button
                      onClick={handleTransfer}
                      disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > cashBalance}
                      className="w-full bg-violet-600 hover:bg-violet-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send £{transferAmount || '0'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'buy' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {transaction.type === 'buy' ? (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.symbol}</p>
                          <p className="text-xs text-gray-500">{transaction.shares} shares</p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'buy' ? '-' : '+'}£{transaction.total_amount?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}