import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Activity } from "lucide-react";
import { motion } from "framer-motion";

const TOP_STOCKS = [
  { symbol: 'APPL-P', name: 'Apple Pair Tech', sector: 'Technology', basePrice: 180, volatility: 0.02 },
  { symbol: 'MSFT-P', name: 'MicroSoft Pair', sector: 'Technology', basePrice: 420, volatility: 0.015 },
  { symbol: 'GOOGL-P', name: 'Google Pair', sector: 'Technology', basePrice: 145, volatility: 0.018 },
  { symbol: 'AMZN-P', name: 'Amazon Pair', sector: 'Consumer', basePrice: 175, volatility: 0.025 },
  { symbol: 'TSLA-P', name: 'Tesla Pair Motors', sector: 'Automotive', basePrice: 245, volatility: 0.035 },
  { symbol: 'META-P', name: 'Meta Pair Social', sector: 'Technology', basePrice: 485, volatility: 0.022 },
  { symbol: 'NVDA-P', name: 'Nvidia Pair Chips', sector: 'Technology', basePrice: 525, volatility: 0.028 },
  { symbol: 'JPM-P', name: 'JPMorgan Pair Bank', sector: 'Finance', basePrice: 195, volatility: 0.012 },
  { symbol: 'V-P', name: 'Visa Pair Payments', sector: 'Finance', basePrice: 285, volatility: 0.014 },
  { symbol: 'WMT-P', name: 'Walmart Pair Retail', sector: 'Retail', basePrice: 165, volatility: 0.011 },
  { symbol: 'JNJ-P', name: 'Johnson Pair Health', sector: 'Healthcare', basePrice: 155, volatility: 0.01 },
  { symbol: 'DIS-P', name: 'Disney Pair Entertainment', sector: 'Entertainment', basePrice: 95, volatility: 0.02 },
  { symbol: 'NFLX-P', name: 'Netflix Pair Streaming', sector: 'Entertainment', basePrice: 685, volatility: 0.03 },
  { symbol: 'BA-P', name: 'Boeing Pair Aerospace', sector: 'Aerospace', basePrice: 215, volatility: 0.025 },
  { symbol: 'NKE-P', name: 'Nike Pair Sports', sector: 'Apparel', basePrice: 105, volatility: 0.016 },
  { symbol: 'CYBER-P', name: 'CyberSecure Pair', sector: 'Technology', basePrice: 325, volatility: 0.027 },
  { symbol: 'BIOX-P', name: 'BioXcel Pair Pharma', sector: 'Healthcare', basePrice: 275, volatility: 0.032 },
  { symbol: 'GRNE-P', name: 'GreenEarth Pair Energy', sector: 'Energy', basePrice: 145, volatility: 0.022 },
];

export default function TopStocks({ onSelectStock }) {
  const [selectedSector, setSelectedSector] = React.useState('all');
  
  const sectors = ['all', ...new Set(TOP_STOCKS.map(s => s.sector))];
  
  const filteredStocks = selectedSector === 'all' 
    ? TOP_STOCKS 
    : TOP_STOCKS.filter(s => s.sector === selectedSector);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Popular Stocks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {sectors.map(sector => (
            <Button
              key={sector}
              variant={selectedSector === sector ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSector(sector)}
              className={selectedSector === sector ? "bg-violet-600" : ""}
            >
              {sector.charAt(0).toUpperCase() + sector.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredStocks.map((stock, index) => (
            <motion.button
              key={stock.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelectStock(stock)}
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-all text-left"
            >
              <div className="font-bold text-gray-900">{stock.symbol}</div>
              <div className="text-xs text-gray-500 truncate">{stock.name}</div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}