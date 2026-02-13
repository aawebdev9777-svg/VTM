import React from 'react';
import { Crown, Award, Trophy, Gem, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const TIER_CONFIG = {
  Bronze: { color: '#CD7F32', icon: Award, glow: 'shadow-orange-300' },
  Silver: { color: '#C0C0C0', icon: Star, glow: 'shadow-gray-300' },
  Gold: { color: '#FFD700', icon: Trophy, glow: 'shadow-yellow-300' },
  Platinum: { color: '#E5E4E2', icon: Gem, glow: 'shadow-slate-300' },
  Diamond: { color: '#B9F2FF', icon: Zap, glow: 'shadow-cyan-300' },
  Titan: { color: '#FF6B35', icon: Crown, glow: 'shadow-orange-400' },
};

export default function RankBadge({ tier = 'Bronze', size = 'md', showLabel = true, animate = false }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
  const Icon = config.icon;

  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const Badge = (
    <div className="flex items-center gap-2">
      <motion.div
        initial={animate ? { scale: 0 } : {}}
        animate={animate ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 500 }}
        className={`${sizes[size]} rounded-full flex items-center justify-center ${config.glow} shadow-lg`}
        style={{ backgroundColor: config.color }}
      >
        <Icon className={`${iconSizes[size]} text-white`} />
      </motion.div>
      {showLabel && (
        <span className="font-bold" style={{ color: config.color }}>
          {tier}
        </span>
      )}
    </div>
  );

  return Badge;
}