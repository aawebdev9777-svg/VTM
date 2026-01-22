import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, TrendingUp, DollarSign, Activity, Award, Zap, TrendingDown, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminSendMoney from '../components/admin/AdminSendMoney';
import MarketStats from '../components/admin/MarketStats';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardPage, setLeaderboardPage] = useState(0);
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
      queryClient.invalidateQueries();
    },
  });

  const resetAllDataMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('resetAllUsers', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
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
    queryFn: () => base44.asServiceRole.entities.UserAccount.list(),
    enabled: isAdmin,
    refetchInterval: 2000,
  });

  const { data: allPortfolios = [] } = useQuery({
    queryKey: ['allPortfolios'],
    queryFn: () => base44.asServiceRole.entities.Portfolio.list(),
    enabled: isAdmin,
    refetchInterval: 2000,
  });

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.asServiceRole.entities.Transaction.list('-created_date', 500),
    enabled: isAdmin,
    refetchInterval: 2000,
  });

  const { data: allSocialPosts = [] } = useQuery({
    queryKey: ['allSocialPosts'],
    queryFn: () => base44.asServiceRole.entities.SocialPost.list('-created_date', 50),
    enabled: isAdmin,
    refetchInterval: 2000,
  });

  const { data: allCopyTrades = [] } = useQuery({
    queryKey: ['allCopyTrades'],
    queryFn: () => base44.asServiceRole.entities.CopyTrade.list(),
    enabled: isAdmin,
    refetchInterval: 2000,
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
    refetchInterval: 2000,
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
  const totalPosts = allSocialPosts.filter(p => p.created_by !== adminEmail).length;
  const activeCopyTrades = allCopyTrades.filter(ct => ct.is_active).length;

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

  // ABPF Analytics
  const abpfPortfolios = allPortfolios.filter(p => p.symbol === 'ABPF');
  const abpfHolders = new Set(abpfPortfolios.map(p => p.created_by)).size;
  const abpfShares = abpfPortfolios.reduce((sum, p) => sum + p.shares, 0);
  const abpfTransactions = nonAdminTransactions.filter(t => t.symbol === 'ABPF');
  const abpfVolume = abpfTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const abpfPercentOfVolume = totalVolume > 0 ? ((abpfVolume / totalVolume) * 100).toFixed(1) : 0;

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

      {/* Market Stats */}
      <div className="mb-6">
        <MarketStats />
      </div>

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
              <Button
                onClick={async () => {
                  if (confirm('Give everyone 1 random starter stock?')) {
                    await base44.functions.invoke('giveStarterStock', {});
                    queryClient.invalidateQueries();
                  }
                }}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                🎁 Give Starter Stock
              </Button>
              <Button
                onClick={async () => {
                  if (confirm('Create/update bot accounts (Julian, Chris, Thomas Neve)?')) {
                    await base44.functions.invoke('createBots', {});
                    queryClient.invalidateQueries();
                  }
                }}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                🤖 Create Top 3 Bots
              </Button>
              <Button
                onClick={async () => {
                  if (confirm('Give all users 3 free stock selections?')) {
                    await base44.functions.invoke('giveAllUsersThreeStocks', {});
                    queryClient.invalidateQueries();
                  }
                }}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                🎁 Give All Users 3 Free Stocks
              </Button>
              <Button
                onClick={async () => {
                  if (confirm('Give everyone a random stock to start earning dividends?')) {
                    await base44.functions.invoke('giveEveryoneRandomStock', {});
                    await base44.functions.invoke('setDividendYields', {});
                    queryClient.invalidateQueries();
                  }
                }}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
              >
                💰 Auto-Buy Random Stock (Dividends)
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">User Management</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => resetAccountsMutation.mutate()}
                  variant="outline"
                  className="gap-2"
                  disabled={resetAccountsMutation.isPending}
                >
                  <Users className="w-4 h-4" />
                  Reset All Balances
                </Button>
                <Button
                  onClick={() => resetAllDataMutation.mutate()}
                  variant="destructive"
                  className="gap-2"
                  disabled={resetAllDataMutation.isPending}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Reset ALL Data
                </Button>
                <Button
                  onClick={() => logoutAllUsersMutation.mutate()}
                  variant="outline"
                  className="gap-2"
                  disabled={logoutAllUsersMutation.isPending}
                >
                  <LogOut className="w-4 h-4" />
                  Logout All Users
                </Button>
              </div>
              {resetAccountsMutation.isSuccess && (
                <p className="text-sm text-green-600">✓ Balances reset successfully</p>
              )}
              {resetAllDataMutation.isSuccess && (
                <p className="text-sm text-green-600">✓ All data reset successfully</p>
              )}
              {logoutAllUsersMutation.isSuccess && (
                <p className="text-sm text-green-600">✓ All users logged out</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Send Money to User</h3>
            <AdminSendMoney />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Trades</p>
                <p className="text-xl font-bold text-gray-900">{totalTrades}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Volume</p>
                <p className="text-xl font-bold text-gray-900">£{(totalVolume / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Copy Trades</p>
                <p className="text-xl font-bold text-gray-900">{activeCopyTrades}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Posts</p>
                <p className="text-xl font-bold text-gray-900">{totalPosts}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ABPF Analytics Card */}
      <Card className="border-0 shadow-lg mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
           <TrendingUp className="w-5 h-5 text-green-600" />
           🚀 ABPF Performance
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500">Investors</p>
              <p className="text-2xl font-bold text-green-600">{abpfHolders}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500">Total Shares</p>
              <p className="text-2xl font-bold text-green-600">{abpfShares.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500">Volume</p>
              <p className="text-2xl font-bold text-green-600">£{(abpfVolume / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500">% of Total</p>
              <p className="text-2xl font-bold text-green-600">{abpfPercentOfVolume}%</p>
            </div>
          </div>
          <p className="text-sm text-green-700">💰 Most invested stock - super profitable!</p>
        </CardContent>
      </Card>

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
              {userStats.slice(leaderboardPage * 10, (leaderboardPage + 1) * 10).map((user, index) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100"
                  >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      leaderboardPage * 10 + index === 0 ? 'bg-amber-400 text-white' :
                      leaderboardPage * 10 + index === 1 ? 'bg-gray-300 text-gray-700' :
                      leaderboardPage * 10 + index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {leaderboardPage * 10 + index + 1}
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
          {userStats.length > 10 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaderboardPage(p => Math.max(0, p - 1))}
                disabled={leaderboardPage === 0}
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">Page {leaderboardPage + 1} of {Math.ceil(userStats.length / 10)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaderboardPage(p => Math.min(Math.ceil(userStats.length / 10) - 1, p + 1))}
                disabled={leaderboardPage >= Math.ceil(userStats.length / 10) - 1}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}