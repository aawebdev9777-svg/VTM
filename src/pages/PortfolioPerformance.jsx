import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

export default function PortfolioPerformance() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn: () => base44.entities.UserAccount.list(),
    select: (data) => data[0],
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list(),
  });

  const { data: stockPrices = [] } = useQuery({
    queryKey: ['stockPrices'],
    queryFn: () => base44.entities.StockPrice.list(),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['portfolioHistory'],
    queryFn: () => base44.entities.PortfolioHistory.list('-created_date', 1000),
  });

  // Calculate days based on timeRange
  const getDaysFromRange = (range) => {
    switch(range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case 'all': return 365;
      default: return 30;
    }
  };

  // Filter history by time range
  const filterHistoryByRange = (data, days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter(item => new Date(item.created_date) >= cutoff);
  };

  const filteredHistory = filterHistoryByRange(history, getDaysFromRange(timeRange));

  // Aggregate daily portfolio values
  const getDailyPortfolioData = () => {
    const dailyMap = new Map();
    
    filteredHistory.forEach(item => {
      const date = new Date(item.created_date).toLocaleDateString('en-GB', { 
        month: 'short', 
        day: 'numeric' 
      });
      const totalValue = (item.portfolio_value_after || 0) + (item.cash_balance_after || 0);
      
      if (!dailyMap.has(date) || new Date(item.created_date) > new Date(dailyMap.get(date).timestamp)) {
        dailyMap.set(date, { date, value: totalValue, timestamp: item.created_date });
      }
    });

    return Array.from(dailyMap.values())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(({ date, value }) => ({ date, value: parseFloat(value.toFixed(2)) }));
  };

  const portfolioData = getDailyPortfolioData();

  // Calculate current portfolio metrics
  const calculateMetrics = () => {
    let totalValue = account?.cash_balance || 0;
    let totalCost = 0;
    const holdings = [];

    portfolio.forEach(holding => {
      const stockPrice = stockPrices.find(s => s.symbol === holding.symbol);
      if (stockPrice) {
        const currentValue = holding.shares * stockPrice.price_gbp;
        const cost = holding.shares * holding.average_buy_price;
        const profitLoss = currentValue - cost;
        const profitLossPercent = (profitLoss / cost) * 100;

        totalValue += currentValue;
        totalCost += cost;

        holdings.push({
          symbol: holding.symbol,
          company_name: holding.company_name,
          shares: holding.shares,
          avgPrice: holding.average_buy_price,
          currentPrice: stockPrice.price_gbp,
          currentValue,
          cost,
          profitLoss,
          profitLossPercent,
        });
      }
    });

    const totalProfitLoss = totalValue - (account?.initial_balance || 10000);
    const totalReturnPercent = ((totalValue - (account?.initial_balance || 10000)) / (account?.initial_balance || 10000)) * 100;

    return {
      totalValue,
      totalCost: totalCost + (account?.cash_balance || 0),
      totalProfitLoss,
      totalReturnPercent,
      holdings: holdings.sort((a, b) => b.currentValue - a.currentValue),
    };
  };

  const metrics = calculateMetrics();

  const StatCard = ({ title, value, icon: Icon, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-lg ${
              trend === 'positive' ? 'bg-green-100' : 
              trend === 'negative' ? 'bg-red-100' : 'bg-violet-100'
            }`}>
              <Icon className={`w-5 h-5 ${
                trend === 'positive' ? 'text-green-600' : 
                trend === 'negative' ? 'text-red-600' : 'text-violet-600'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Performance</h1>
            <p className="text-gray-600 mt-1">Track your investment growth and returns</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Portfolio Value"
            value={`£${metrics.totalValue.toFixed(2)}`}
            icon={DollarSign}
            trend="neutral"
          />
          <StatCard
            title="Total Return"
            value={`${metrics.totalReturnPercent >= 0 ? '+' : ''}${metrics.totalReturnPercent.toFixed(2)}%`}
            icon={Percent}
            trend={metrics.totalReturnPercent >= 0 ? 'positive' : 'negative'}
            subtitle={`£${metrics.totalProfitLoss >= 0 ? '+' : ''}${metrics.totalProfitLoss.toFixed(2)}`}
          />
          <StatCard
            title="Total Invested"
            value={`£${metrics.totalCost.toFixed(2)}`}
            icon={Activity}
            trend="neutral"
          />
          <StatCard
            title="Unrealized P/L"
            value={`£${metrics.totalProfitLoss >= 0 ? '+' : ''}${metrics.totalProfitLoss.toFixed(2)}`}
            icon={metrics.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
            trend={metrics.totalProfitLoss >= 0 ? 'positive' : 'negative'}
          />
        </div>

        {/* Portfolio Value Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Portfolio Value Over Time</CardTitle>
              <div className="flex gap-2">
                {['7d', '30d', '90d', 'all'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`£${value}`, 'Portfolio Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Holdings Breakdown */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Holdings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.holdings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No holdings yet</p>
              ) : (
                metrics.holdings.map((holding, index) => (
                  <motion.div
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{holding.symbol}</p>
                            <p className="text-sm text-gray-500">{holding.company_name}</p>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Shares</p>
                            <p className="font-medium">{holding.shares}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Avg Price</p>
                            <p className="font-medium">£{holding.avgPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Current Price</p>
                            <p className="font-medium">£{holding.currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Value</p>
                            <p className="font-medium">£{holding.currentValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Unrealized P/L</p>
                            <p className={`font-semibold ${
                              holding.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {holding.profitLoss >= 0 ? '+' : ''}£{holding.profitLoss.toFixed(2)}
                              <span className="text-xs ml-1">
                                ({holding.profitLossPercent >= 0 ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.holdings}>
                <XAxis 
                  dataKey="symbol" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`£${value.toFixed(2)}`, 'P/L']}
                />
                <Bar 
                  dataKey="profitLoss" 
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}