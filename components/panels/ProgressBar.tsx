'use client';

import { ConversationStep } from '@/types';
import { motion } from 'framer-motion';

const STEPS = [
  { step: ConversationStep.GREETING, label: '시작' },
  { step: ConversationStep.CONCEPT_INPUT, label: '개념 입력' },
  { step: ConversationStep.DEVICE_CLASSIFICATION, label: '분류' },
  { step: ConversationStep.PRODUCT_CATEGORY, label: '품목' },
  { step: ConversationStep.PURPOSE_MECHANISM, label: '목적/원리' },
  { step: ConversationStep.PLAN_GENERATION, label: '플랜 생성' },
  { step: ConversationStep.PLAN_REVIEW, label: '검토' },
  { step: ConversationStep.FINAL_CONFIRMATION, label: '완료' },
];

interface ProgressBarProps {
  currentStep: ConversationStep;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  
  return (
    <div className="w-full py-5 px-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-2 max-w-6xl mx-auto">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.step;
          const isCompleted = currentStep > step.step;
          
          return (
            <div key={step.step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all duration-300 ${
                    isCompleted || isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </motion.div>
                <span className={`text-xs text-center transition-colors ${
                  isActive ? 'text-gray-900 font-semibold' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2 mt-[-24px] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: isCompleted ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


