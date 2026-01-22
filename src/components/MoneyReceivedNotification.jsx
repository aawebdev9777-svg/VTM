import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MoneyReceivedNotification({ transaction, onClose }) {
  useEffect(() => {
    if (transaction && transaction.type === 'buy' && transaction.symbol === 'TRANSFER') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [transaction]);

  return (
    <AnimatePresence>
      {transaction && transaction.type === 'buy' && transaction.symbol === 'TRANSFER' && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 hover:bg-white/20 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-8">
                <h3 className="text-xl font-bold mb-2">💰 Money Received!</h3>
                <p className="text-base opacity-95">
                  {transaction.company_name.replace('Received from ', '')} sent you{' '}
                  <span className="font-bold text-lg">
                    £{transaction.total_amount?.toLocaleString('en-GB', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}