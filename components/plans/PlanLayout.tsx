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
        <p className="text-gray-500">플랜을 생성 중입니다...</p>
      </div>
    );
  }

  const selectedPlan = session.plans.find((p) => p.id === selectedPlanId) || null;

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
    if (!selectedPlan || !session) return;

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

      const updatedPlans = session.plans?.map((p) =>
        p.id === selectedPlan.id ? response.plan : p
      );

      if (updatedPlans) {
        useAppStore.getState().setPlans(updatedPlans);
      }
    } catch (error) {
      console.error('Failed to modify plan', error);
      addMessage({
        role: 'assistant',
        content: '플랜 수정 중 오류가 발생했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedPlan ? '선택한 인허가 전략 플랜' : '인허가 전략 플랜'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {selectedPlan
            ? '선택한 플랜의 상세 내용과 타임라인/요구사항을 검토하고 수정/확정할 수 있습니다.'
            : '4가지 전략 중 하나를 선택하세요.'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">

        <AnimatePresence mode="wait">

          {/* ================================
                  📌 플랜 목록 전체 화면
              ================================ */}
          {!selectedPlan && (
            <motion.div
              key="plan-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 overflow-y-auto p-6 bg-white"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.plans.map((plan: Plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={plan.id === selectedPlanId}
                    onClick={() => handleSelectPlan(plan)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ================================
                    📌 플랜 디테일 전체 화면
              ================================ */}
          {selectedPlan && (
            <motion.div
              key="plan-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-white overflow-y-auto"
            >
              <PlanDetail
                plan={selectedPlan}
                onModify={handleModifyPlan}
                onConfirm={handleConfirmPlan}
                onBack={() => setSelectedPlanId(null)}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
