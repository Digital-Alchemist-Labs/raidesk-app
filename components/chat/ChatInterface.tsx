'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ConversationStep } from '@/types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { apiClient } from '@/lib/api';
import { mockResponses } from '@/lib/mock/dummyData';
import { motion } from 'framer-motion';

export function ChatInterface() {
  const {
    session,
    addMessage,
    setStep,
    setClassification,
    setCategory,
    setPurposeMechanism,
    setPlans,
    setLoading,
  } = useAppStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasGreeted = useRef(false);

  useEffect(() => {
    if (session && !hasGreeted.current && session.messages.length === 0) {
      hasGreeted.current = true;
      // Send greeting message
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: mockResponses.greeting,
        });
        setStep(ConversationStep.CONCEPT_INPUT);
      }, 500);
    }
  }, [session, addMessage, setStep]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // 진행 키워드 체크
  const isProceedKeyword = (msg: string): boolean => {
    const keywords = ['진행', '다음', '계속', '확인', '네', '예', 'yes', 'ok', '좋아', '맞아'];
    const normalized = msg.toLowerCase().trim();
    return keywords.some(keyword => normalized.includes(keyword));
  };

  // 수정 키워드 체크
  const isModifyKeyword = (msg: string): boolean => {
    const keywords = ['수정', '다시', '재입력', '변경', '아니', '틀려', '아니야', 'no'];
    const normalized = msg.toLowerCase().trim();
    return keywords.some(keyword => normalized.includes(keyword));
  };

  const handleSend = async (message: string) => {
    if (!session) return;

    // Add user message
    addMessage({
      role: 'user',
      content: message,
    });

    setLoading(true);

    try {
      const shouldProceed = isProceedKeyword(message);

      // Handle based on current step
      switch (session.currentStep) {
        case ConversationStep.CONCEPT_INPUT:
          // Classify device
          const classifyResponse = await apiClient.classifyDevice({
            concept: message,
          });
          
          setClassification(classifyResponse.classification);
          
          addMessage({
            role: 'assistant',
            content: mockResponses.acknowledgeClassification,
            metadata: {
              classification: classifyResponse.classification,
              suggestedCategories: classifyResponse.suggestedCategories,
            },
          });
          
          setStep(ConversationStep.DEVICE_CLASSIFICATION);
          break;

        case ConversationStep.DEVICE_CLASSIFICATION:
          // User confirms classification or modifies it
          if (shouldProceed) {
            // Move to category selection
            addMessage({
              role: 'assistant',
              content: mockResponses.acknowledgeCategory,
            });
            setStep(ConversationStep.PRODUCT_CATEGORY);
          } else if (isModifyKeyword(message)) {
            // 재분류 요청
            addMessage({
              role: 'assistant',
              content: '의료기기 개념을 다시 입력해주세요. 더 자세히 설명해주시면 정확한 분류가 가능합니다.',
            });
            setStep(ConversationStep.CONCEPT_INPUT);
          } else {
            addMessage({
              role: 'assistant',
              content: '분류 결과를 검토해주세요.\n\n✅ 맞다면: "확인" 또는 "진행"\n🔄 다시 하려면: "수정" 또는 "다시"',
            });
          }
          break;

        case ConversationStep.PRODUCT_CATEGORY:
          // Select category and generate purpose/mechanism
          if (shouldProceed && session.classification) {
            const purposeMech = await apiClient.generatePurposeMechanism(
              message,
              session.classification.category || ''
            );
            
            setPurposeMechanism(purposeMech);
            
            if (session.classification.category) {
              setCategory({
                code: 'A41010.01',
                name: session.classification.category,
                description: '의료기기 품목',
                regulatoryPath: '인허가 필요',
              });
            }
            
            addMessage({
              role: 'assistant',
              content: mockResponses.acknowledgePurpose,
              metadata: { purposeMechanism: purposeMech },
            });
            
            setStep(ConversationStep.PURPOSE_MECHANISM);
          } else if (isModifyKeyword(message)) {
            // 분류 단계로 돌아가기
            addMessage({
              role: 'assistant',
              content: '분류 단계로 돌아갑니다. 의료기기 개념을 다시 입력해주세요.',
            });
            setStep(ConversationStep.CONCEPT_INPUT);
          } else {
            addMessage({
              role: 'assistant',
              content: '품목 분류를 확인해주세요.\n\n✅ 맞다면: "확인" 또는 "진행"\n🔄 다시 하려면: "수정" 또는 "다시"',
            });
          }
          break;

        case ConversationStep.PURPOSE_MECHANISM:
          // User confirms purpose/mechanism
          if (shouldProceed) {
            // Generate plans
            if (session.classification && session.category && session.purposeMechanism) {
              addMessage({
                role: 'assistant',
                content: '인허가 전략을 생성하고 있습니다. 잠시만 기다려주세요...',
              });

              const plansResponse = await apiClient.generatePlans({
                classification: session.classification,
                category: session.category,
                purposeMechanism: session.purposeMechanism,
              });
              
              setPlans(plansResponse.plans);
              
              addMessage({
                role: 'assistant',
                content: mockResponses.presentPlans,
              });
              
              setStep(ConversationStep.PLAN_GENERATION);
            }
          } else if (isModifyKeyword(message)) {
            // 처음부터 다시 시작
            addMessage({
              role: 'assistant',
              content: '사용 목적과 작용 원리를 다시 생성하시겠습니까?\n\n의료기기 개념을 처음부터 다시 입력해주세요.',
            });
            setStep(ConversationStep.CONCEPT_INPUT);
          } else {
            addMessage({
              role: 'assistant',
              content: '사용 목적과 작용 원리를 검토해주세요.\n\n✅ 맞다면: "확인" 또는 "진행" (인허가 전략 생성)\n🔄 다시 하려면: "수정" 또는 "다시" (처음부터)',
            });
          }
          break;

        case ConversationStep.PLAN_GENERATION:
        case ConversationStep.PLAN_REVIEW:
          // Handle plan-related queries
          if (shouldProceed) {
            addMessage({
              role: 'assistant',
              content: '우측의 플랜 카드를 클릭하여 상세 내용을 확인하실 수 있습니다. 마음에 드는 플랜을 선택해주세요!',
            });
          } else if (isModifyKeyword(message)) {
            // 플랜 재생성
            addMessage({
              role: 'assistant',
              content: '플랜을 다시 생성하시겠습니까?\n\n"재생성" 입력 시 새로운 플랜을 생성합니다.\n"처음부터" 입력 시 개념 입력부터 다시 시작합니다.',
            });
          } else if (message.includes('재생성') && session.classification && session.category && session.purposeMechanism) {
            // 플랜만 다시 생성
            addMessage({
              role: 'assistant',
              content: '새로운 인허가 전략을 생성하고 있습니다...',
            });

            const plansResponse = await apiClient.generatePlans({
              classification: session.classification,
              category: session.category,
              purposeMechanism: session.purposeMechanism,
            });
            
            setPlans(plansResponse.plans);
            
            addMessage({
              role: 'assistant',
              content: '새로운 전략이 생성되었습니다! 우측에서 확인해주세요.',
            });
          } else if (message.includes('처음부터')) {
            addMessage({
              role: 'assistant',
              content: '처음부터 다시 시작합니다. 의료기기 개념을 입력해주세요.',
            });
            setStep(ConversationStep.CONCEPT_INPUT);
          } else {
            addMessage({
              role: 'assistant',
              content: '플랜 카드를 클릭하여 상세 내용을 확인하실 수 있습니다.\n\n🔄 플랜 재생성: "재생성"\n⏮ 처음부터: "처음부터"\n\n또는 해당 플랜을 선택 후 수정 요청을 해주세요.',
            });
          }
          break;

        default:
          addMessage({
            role: 'assistant',
            content: '무엇을 도와드릴까요?',
          });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      addMessage({
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  // Show welcome screen if no messages yet
  if (session.messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <span className="text-6xl">🏥</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RAiDesk에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            의료기기 인허가 과정을 처음부터 끝까지 안내해드립니다.
          </p>
          <div className="flex gap-2 justify-center">
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <MessageList messages={session.messages} isLoading={session.isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <InputArea
        onSend={handleSend}
        disabled={session.isLoading}
        placeholder={
          session.currentStep === ConversationStep.CONCEPT_INPUT
            ? '의료기기 아이디어를 설명해주세요...'
            : session.currentStep === ConversationStep.DEVICE_CLASSIFICATION
            ? '확인: "진행" | 수정: "다시"'
            : session.currentStep === ConversationStep.PRODUCT_CATEGORY
            ? '확인: "진행" | 수정: "다시"'
            : session.currentStep === ConversationStep.PURPOSE_MECHANISM
            ? '확인: "진행" | 수정: "다시"'
            : session.currentStep === ConversationStep.PLAN_GENERATION || 
              session.currentStep === ConversationStep.PLAN_REVIEW
            ? '재생성: "재생성" | 처음부터: "처음부터" | 질문 입력...'
            : '메시지를 입력하세요...'
        }
      />
    </div>
  );
}


