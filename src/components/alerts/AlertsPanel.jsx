import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AlertsPanel({ selectedStock }) {
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.PriceAlert.filter({ is_active: true }),
  });

  const createAlertMutation = useMutation({
    mutationFn: (alertData) => base44.entities.PriceAlert.create(alertData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowForm(false);
      setTargetPrice('');
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.PriceAlert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const handleCreateAlert = () => {
    if (!selectedStock || !targetPrice) return;
    
    createAlertMutation.mutate({
      symbol: selectedStock.symbol,
      company_name: selectedStock.company_name,
      target_price: parseFloat(targetPrice),
      condition,
      is_active: true
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Price Alerts
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            disabled={!selectedStock}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {showForm && selectedStock && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg bg-gray-50 space-y-3"
            >
              <div>
                <p className="text-sm font-medium mb-2">
                  Alert for {selectedStock.symbol}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price (£)"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCreateAlert}
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={!targetPrice}
              >
                Create Alert
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No active alerts</p>
            <p className="text-xs mt-1">Select a stock and create an alert</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{alert.symbol}</p>
                      <Badge variant="outline" className="text-xs">
                        {alert.condition === 'above' ? (
                          <>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Above
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Below
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      £{alert.target_price?.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}