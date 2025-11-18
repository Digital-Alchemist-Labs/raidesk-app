'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plan, ConversationStep } from '@/types';
import { PlanCard } from './PlanCard';
import { PlanDetail } from './PlanDetail';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export function PlanLayout() {
  const { session, selectPlan, setStep, addMessage, setLoading } = useAppStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (!session?.plans) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-white/60">플랜을 생성 중입니다...</p>
      </div>
    );
  }

  const selectedPlan = session.plans.find(p => p.id === selectedPlanId);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;

    selectPlan(selectedPlan);
    
    addMessage({
      role: 'assistant',
      content: `${selectedPlan.title} 플랜을 선택하셨습니다. 이 플랜으로 진행하시겠습니까?`,
    });

    setStep(ConversationStep.FINAL_CONFIRMATION);
  };

  const handleModifyPlan = async (modifications: string) => {
    if (!selectedPlan) return;

    setLoading(true);
    
    try {
      const response = await apiClient.refinePlan({
        planId: selectedPlan.id,
        modifications,
        context: {
          classification: session.classification,
          category: session.category,
          purposeMechanism: session.purposeMechanism,
        },
      });

      addMessage({
        role: 'assistant',
        content: `플랜을 수정했습니다. 변경 사항을 확인해주세요.`,
        metadata: { modifiedPlan: response.plan },
      });

      // Update the plan in the store
      const updatedPlans = session.plans?.map(p =>
        p.id === selectedPlan.id ? response.plan : p
      );
      
      if (updatedPlans) {
        useAppStore.getState().setPlans(updatedPlans);
      }
    } catch (error) {
      console.error('Failed to modify plan:', error);
      addMessage({
        role: 'assistant',
        content: '플랜 수정 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">인허가 전략 플랜</h2>
        <p className="text-sm text-gray-600 mt-1">
          4가지 전략 중 하나를 선택하세요
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Plan Cards Grid */}
        <div className={`overflow-y-auto p-4 transition-all duration-300 ${
          selectedPlan ? 'w-1/3' : 'w-full'
        }`}>
          <div className="grid grid-cols-1 gap-4">
            {session.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={plan.id === selectedPlanId}
                onClick={() => handleSelectPlan(plan)}
              />
            ))}
          </div>
        </div>

        {/* Plan Detail */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="w-2/3 border-l border-white/10 overflow-hidden"
            >
              <PlanDetail
                plan={selectedPlan}
                onModify={handleModifyPlan}
                onConfirm={handleConfirmPlan}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


