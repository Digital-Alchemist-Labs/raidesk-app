'use client';

import { useState } from 'react';
import { Plan } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle, XCircle, Lightbulb, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlanDetailProps {
  plan: Plan;
  onModify?: (modifications: string) => void;
  onConfirm?: () => void;
}

export function PlanDetail({ plan, onModify, onConfirm }: PlanDetailProps) {
  const [showModifyInput, setShowModifyInput] = useState(false);
  const [modifications, setModifications] = useState('');

  const handleModify = () => {
    if (modifications.trim() && onModify) {
      onModify(modifications);
      setModifications('');
      setShowModifyInput(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{plan.title}</h2>
        <p className="text-white/70">{plan.description}</p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-white/60">총 기간</p>
          <p className="text-lg font-bold text-white">{plan.totalDuration}</p>
        </Card>
        <Card className="text-center">
          <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-white/60">예상 비용</p>
          <p className="text-lg font-bold text-white">{plan.estimatedCost || 'N/A'}</p>
        </Card>
        <Card className="text-center">
          <Lightbulb className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-sm text-white/60">위험도</p>
          <p className="text-lg font-bold text-white capitalize">{plan.riskLevel}</p>
        </Card>
      </div>

      {/* Common Standards */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-3">공통규격</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/60 mb-2">적용 규격</p>
            <div className="flex flex-wrap gap-2">
              {plan.commonStandards.standards.map((standard, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 glass rounded-full text-xs text-white"
                >
                  {standard}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-white/60 mb-2">타임라인</p>
            <div className="space-y-2">
              {plan.commonStandards.timeline.map((item, idx) => (
                <div key={idx} className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm">{item.phase}</span>
                    <span className="text-xs text-white/60">{item.duration}</span>
                  </div>
                  <p className="text-xs text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Evaluation */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-3">기본규격 (성능평가)</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/60 mb-2">평가 항목</p>
            <div className="flex flex-wrap gap-2">
              {plan.performanceEvaluation.tests.map((test, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 glass rounded-full text-xs text-white"
                >
                  {test}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-white/60 mb-2">타임라인</p>
            <div className="space-y-2">
              {plan.performanceEvaluation.timeline.map((item, idx) => (
                <div key={idx} className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm">{item.phase}</span>
                    <span className="text-xs text-white/60">{item.duration}</span>
                  </div>
                  <p className="text-xs text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Pros & Cons */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">장점</h3>
          </div>
          <ul className="space-y-2">
            {plan.pros.map((pro, idx) => (
              <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">단점</h3>
          </div>
          <ul className="space-y-2">
            {plan.cons.map((con, idx) => (
              <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-white">권장 사항</h3>
        </div>
        <ul className="space-y-2">
          {plan.recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Actions */}
      <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 pt-4 space-y-3">
        {!showModifyInput ? (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowModifyInput(true)}
            >
              수정 요청
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={onConfirm}
            >
              이 플랜 선택
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <textarea
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              placeholder="수정하고 싶은 내용을 입력하세요..."
              className="w-full glass rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowModifyInput(false);
                  setModifications('');
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleModify}
                disabled={!modifications.trim()}
              >
                수정 요청 전송
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


