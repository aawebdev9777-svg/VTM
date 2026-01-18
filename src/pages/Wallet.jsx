import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Wallet as WalletIcon, CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Wallet() {
  const { data: accounts } = useQuery({
    queryKey: ['userAccount'],
    queryFn: () => base44.entities.UserAccount.list(),
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <WalletIcon className="w-6 h-6 text-violet-600" />
          Wallet
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your virtual trading wallet
        </p>
      </motion.div>

      {/* Credit Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative w-full max-w-md mx-auto">
          {/* Card Shadow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl transform rotate-3 opacity-20"></div>
          
          {/* Main Card */}
          <motion.div
            whileHover={{ scale: 1.02, rotateY: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-2xl overflow-hidden"
          >
            {/* Card Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            {/* Card Content */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-xs opacity-75 mb-1">Trading Account</p>
                  <p className="text-sm font-medium">Virtual Balance</p>
                </div>
                <CreditCard className="w-10 h-10 opacity-75" />
              </div>

              <div className="mb-6">
                <p className="text-4xl md:text-5xl font-bold tracking-wide">
                  £{cashBalance.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-75">Account Holder</p>
                  <p className="text-sm font-medium">Stock Trader</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Card Number</p>
                  <p className="text-sm font-mono">**** 4242</p>
                </div>
              </div>
            </div>

            {/* Chip */}
            <div className="absolute top-20 left-6 w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
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
  );
}