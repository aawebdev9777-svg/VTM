import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, TrendingUp, DollarSign, Activity, Award, Zap, TrendingDown, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.email === 'aa.web.dev9777@gmail.com');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const simulateEventMutation = useMutation({
    mutationFn: async (eventType) => {
      await base44.functions.invoke('simulateMarketEvent', { eventType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const resetAccountsMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('resetUserAccounts', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAccounts'] });
    },
  });

  const logoutAllUsersMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('logoutAllUsers', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const { data: allAccounts = [] } = useQuery({
    queryKey: ['allAccounts'],
    queryFn: async () => {
      const accounts = await base44.asServiceRole.entities.UserAccount.list();
      return accounts;
    },
    enabled: isAdmin,
  });

  const { data: allPortfolios = [] } = useQuery({
    queryKey: ['allPortfolios'],
    queryFn: () => base44.asServiceRole.entities.Portfolio.list(),
    enabled: isAdmin,
  });

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.asServiceRole.entities.Transaction.list(),
    enabled: isAdmin,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (user?.email !== 'aa.web.dev9777@gmail.com') {
          return [];
        }
        return await base44.asServiceRole.entities.User.list();
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },
    enabled: isAdmin,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">You need admin privileges to view this page.</p>
      </div>
    );
  }

  const adminEmail = 'aa.web.dev9777@gmail.com';

  // Filter out admin from all data
  const nonAdminUsers = allUsers.filter(u => u.email !== adminEmail);
  const nonAdminTransactions = allTransactions.filter(t => t.created_by !== adminEmail);

  // Calculate leaderboard (excluding admin)
  const userStats = nonAdminUsers.map(user => {
    const userAccount = allAccounts.find(acc => acc.created_by === user.email);
    const userPortfolio = allPortfolios.filter(p => p.created_by === user.email);
    const portfolioValue = userPortfolio.reduce((sum, p) => sum + (p.shares * p.average_buy_price), 0);
    const totalValue = (userAccount?.cash_balance || 10000) + portfolioValue;
    const profitLoss = totalValue - 10000;
    const profitPercent = (profitLoss / 10000) * 100;

    return {
      email: user.email,
      name: user.full_name || user.email,
      totalValue,
      profitLoss,
      profitPercent,
      trades: nonAdminTransactions.filter(t => t.created_by === user.email).length,
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // App Economics (excluding admin)
  const totalUsers = nonAdminUsers.length;
  const totalTrades = nonAdminTransactions.length;
  const totalVolume = nonAdminTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const avgTradeSize = totalVolume / totalTrades || 0;
  const activeUsers = [...new Set(nonAdminTransactions.map(t => t.created_by))].length;

  // Trading activity over time (last 7 days, excluding admin)
  const activityData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTrades = nonAdminTransactions.filter(t => t.created_date?.startsWith(dateStr));
    activityData.push({
      date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      trades: dayTrades.length,
      volume: dayTrades.reduce((sum, t) => sum + t.total_amount, 0),
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-violet-600" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform overview and user statistics
        </p>
      </motion.div>

      {/* Admin Controls */}
      <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-600" />
            Admin Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Market Simulation</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => simulateEventMutation.mutate('crash')}
                variant="destructive"
                className="gap-2"
                disabled={simulateEventMutation.isPending}
              >
                <TrendingDown className="w-4 h-4" />
                Simulate Crash (-15%)
              </Button>
              <Button
                onClick={() => simulateEventMutation.mutate('boost')}
                className="gap-2 bg-green-600 hover:bg-green-700"
                disabled={simulateEventMutation.isPending}
              >
                <TrendingUp className="w-4 h-4" />
                Simulate Boost (+12%)
              </Button>
              <Button
                onClick={() => simulateEventMutation.mutate('dip')}
                variant="outline"
                className="gap-2"
                disabled={simulateEventMutation.isPending}
              >
                <AlertTriangle className="w-4 h-4" />
                Simulate Dip (-7%)
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">User Management</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => resetAccountsMutation.mutate()}
                variant="outline"
                className="gap-2"
                disabled={resetAccountsMutation.isPending}
              >
                <Users className="w-4 h-4" />
                Reset All Users to £10,000
              </Button>
              <Button
                onClick={() => logoutAllUsersMutation.mutate()}
                variant="destructive"
                className="gap-2"
                disabled={logoutAllUsersMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
                Logout All Users
              </Button>
            </div>
            {resetAccountsMutation.isSuccess && (
              <p className="text-sm text-green-600 mt-2">✓ Accounts reset successfully</p>
            )}
            {logoutAllUsersMutation.isSuccess && (
              <p className="text-sm text-green-600 mt-2">✓ All users logged out</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Trades</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTrades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">£{totalVolume.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Stock Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Trading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Line type="monotone" dataKey="trades" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Trading Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="volume" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">App Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Avg Trade Size</span>
              <span className="font-bold text-gray-900">£{avgTradeSize.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Active Rate</span>
              <span className="font-bold text-gray-900">{totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Trades per User</span>
              <span className="font-bold text-gray-900">{activeUsers > 0 ? (totalTrades / activeUsers).toFixed(1) : 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Volume per User</span>
              <span className="font-bold text-gray-900">£{activeUsers > 0 ? (totalVolume / activeUsers).toLocaleString('en-GB', { maximumFractionDigits: 0 }) : 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Traders Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No users yet</p>
          ) : (
            <div className="space-y-3">
              {userStats.map((user, index) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-amber-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.trades} trades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      £{user.totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <Badge variant={user.profitLoss >= 0 ? 'default' : 'destructive'} className="text-xs">
                      {user.profitLoss >= 0 ? '+' : ''}{user.profitPercent.toFixed(2)}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}