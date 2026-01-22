import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Activity, Zap, DollarSign, Share2 } from 'lucide-react';

export default function RealtimeAnalyticsDashboard() {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch all data
  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAllUsers', {});
      return response.data.users || [];
    },
    refetchInterval: 2000
  });

  const { data: accounts } = useQuery({
    queryKey: ['adminAccounts'],
    queryFn: async () => base44.asServiceRole.entities.UserAccount.list(),
    refetchInterval: 2000
  });

  const { data: portfolios } = useQuery({
    queryKey: ['adminPortfolios'],
    queryFn: async () => base44.asServiceRole.entities.Portfolio.list(),
    refetchInterval: 2000
  });

  const { data: transactions } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => base44.asServiceRole.entities.Transaction.list(),
    refetchInterval: 2000
  });

  const { data: copyTrades } = useQuery({
    queryKey: ['adminCopyTrades'],
    queryFn: async () => base44.asServiceRole.entities.CopyTrade.filter({ is_active: true }),
    refetchInterval: 2000
  });

  // Update nodes and connections based on data
  useEffect(() => {
    if (!users || !accounts || !portfolios || !transactions) return;

    // Create nodes for users
    const userNodes = users.map((user, idx) => ({
      id: user.email,
      label: user.full_name,
      type: 'user',
      x: Math.cos(idx / users.length * Math.PI * 2) * 200 + 250,
      y: Math.sin(idx / users.length * Math.PI * 2) * 200 + 250,
      size: 40,
      color: '#8b5cf6'
    }));

    // Add central hub
    const hubNode = {
      id: 'hub',
      label: 'Market Hub',
      type: 'hub',
      x: 250,
      y: 250,
      size: 60,
      color: '#06b6d4'
    };

    // Create connections from transactions
    const txnConnections = transactions
      ?.slice(0, 10)
      .map((tx) => ({
        from: tx.created_by,
        to: 'hub',
        label: `${tx.symbol}`,
        type: tx.type
      })) || [];

    // Create copy trade connections
    const ctConnections = copyTrades
      ?.map((ct) => ({
        from: ct.follower_email,
        to: ct.leader_email,
        label: 'copy',
        type: 'copy'
      })) || [];

    setNodes([hubNode, ...userNodes]);
    setConnections([...txnConnections, ...ctConnections]);

    // Calculate stats
    const totalValue = accounts?.reduce((sum, acc) => sum + acc.cash_balance, 0) || 0;
    const portfolioValue = portfolios?.reduce((sum, p) => sum + (p.shares * p.average_buy_price), 0) || 0;
    const activeUsers = accounts?.filter(a => a.cash_balance > 0).length || 0;
    const totalTrades = transactions?.length || 0;

    setStats({
      totalUsers: users?.length || 0,
      activeUsers,
      totalValue: totalValue + portfolioValue,
      totalTrades,
      copyTrades: copyTrades?.length || 0,
      portfolioValue
    });
  }, [users, accounts, portfolios, transactions, copyTrades]);

  return (
    <div className="space-y-6">
      {/* Key Metrics - Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Trades Executed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats?.totalTrades || 0}</p>
            <p className="text-xs opacity-75 mt-2">buy & sell transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white border-0 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Money Circulating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">£{(stats?.totalValue / 1000000).toFixed(1)}M</p>
            <p className="text-xs opacity-75 mt-2">total app value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-violet-700 text-white border-0 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Trading Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">£{(stats?.totalValue / 1000).toFixed(0)}k</p>
            <p className="text-xs opacity-75 mt-2">circulation</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
            <p className="text-xs opacity-75 mt-1">of {stats?.totalUsers || 0} total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{(stats?.totalValue / 1000).toFixed(1)}k</p>
            <p className="text-xs opacity-75 mt-1">across all accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalTrades || 0}</p>
            <p className="text-xs opacity-75 mt-1">buy & sell transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Copy Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.copyTrades || 0}</p>
            <p className="text-xs opacity-75 mt-1">active connections</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{(stats?.portfolioValue / 1000).toFixed(1)}k</p>
            <p className="text-xs opacity-75 mt-1">in holdings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">✓ Live</p>
            <p className="text-xs opacity-75 mt-1">real-time sync active</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Visualization */}
      <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Market Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg className="w-full h-96 bg-slate-950 rounded-lg" viewBox="0 0 500 500">
            {/* Draw connections */}
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const color = conn.type === 'buy' ? '#10b981' : conn.type === 'sell' ? '#ef4444' : '#a78bfa';

              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={color}
                  strokeWidth="1.5"
                  opacity="0.6"
                  className="animate-pulse"
                />
              );
            })}

            {/* Draw nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill={node.color}
                  opacity="0.8"
                  className={node.type === 'hub' ? 'animate-pulse' : ''}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {node.type === 'hub' ? '🌐' : '👤'}
                </text>
              </g>
            ))}
          </svg>
          <p className="text-xs text-slate-400 mt-3 text-center">
            🟢 Buy trades • 🔴 Sell trades • 🟣 Users • 🔵 Market Hub
          </p>
        </CardContent>
      </Card>
    </div>
  );
}