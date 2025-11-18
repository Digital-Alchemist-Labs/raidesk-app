'use client';

import { Plan, PlanTier } from '@/types';
import { Card } from '@/components/ui/Card';
import { Clock, DollarSign, AlertTriangle } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  selected?: boolean;
  onClick?: () => void;
}

const tierColors = {
  [PlanTier.FASTEST]: 'from-red-500 to-rose-500',
  [PlanTier.NORMAL]: 'from-blue-500 to-blue-600',
  [PlanTier.CONSERVATIVE]: 'from-green-500 to-green-600',
  [PlanTier.INNOVATIVE]: 'from-purple-500 to-purple-600',
};

const tierEmojis = {
  [PlanTier.FASTEST]: '⚡',
  [PlanTier.NORMAL]: '📋',
  [PlanTier.CONSERVATIVE]: '🛡️',
  [PlanTier.INNOVATIVE]: '🚀',
};

const riskLevelColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

const riskLevelLabels = {
  low: '낮음',
  medium: '중간',
  high: '높음',
};

export function PlanCard({ plan, selected = false, onClick }: PlanCardProps) {
  return (
    <Card
      hoverable
      selected={selected}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tierColors[plan.tier]} flex items-center justify-center text-2xl shadow-md`}>
            {tierEmojis[plan.tier]}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{plan.title}</h3>
            <p className="text-xs text-gray-500">{plan.tier}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
        {plan.description}
      </p>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">{plan.totalDuration}</span>
        </div>
        
        {plan.estimatedCost && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">{plan.estimatedCost}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className={`w-4 h-4 ${riskLevelColors[plan.riskLevel]}`} />
          <span className="text-gray-700">
            위험도: <span className={riskLevelColors[plan.riskLevel]}>
              {riskLevelLabels[plan.riskLevel]}
            </span>
          </span>
        </div>
      </div>

      {/* Pros count */}
      <div className="flex gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-200">
          장점 {plan.pros.length}개
        </span>
        <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-200">
          단점 {plan.cons.length}개
        </span>
      </div>
    </Card>
  );
}


