'use client';

import { useState } from 'react';
import { Plan } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Clock,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PlanDetailProps {
  plan: Plan;
  onModify?: (modifications: string) => void;
  onConfirm?: () => void;
  onBack?: () => void;
}

export function PlanDetail({
  plan,
  onModify,
  onConfirm,
  onBack,
}: PlanDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [modifications, setModifications] = useState('');

  const handleModifyClick = () => {
    if (!onModify) return;
    if (!modifications.trim()) return;
    onModify(modifications.trim());
    setModifications('');
    setIsEditing(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 mb-1">
            선택한 인허가 전략 플랜
          </p>
          <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
          <p className="text-sm text-gray-600 max-w-2xl">
            {plan.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {onBack && (
            <Button
              variant="ghost"
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900"
              onClick={onBack}
            >
              ← 플랜 목록으로
            </Button>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-gray-600">
            <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1">
              총 소요 기간:
              <span className="ml-1 font-semibold">
                {plan.totalDuration}
              </span>
            </span>

            {plan.estimatedCost && (
              <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1">
                예상 비용:
                <span className="ml-1 font-semibold">
                  {plan.estimatedCost}
                </span>
              </span>
            )}

            <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1">
              위험도:
              <span className="ml-1 font-semibold">
                {plan.riskLevel === 'low'
                  ? '낮음'
                  : plan.riskLevel === 'medium'
                  ? '중간'
                  : '높음'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid (Timeline + Pros/Cons) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Timelines */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                공통규격 타임라인
              </h3>
            </div>

            {plan.commonStandards.timeline.length === 0 ? (
              <p className="text-sm text-gray-500">
                타임라인 정보가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {plan.commonStandards.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.phase}</p>
                      <p className="text-xs text-gray-600">
                        {item.description}
                      </p>
                    </div>

                    <span className="ml-4 shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">
                      {item.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                기본규격(성능평가) 타임라인
              </h3>
            </div>

            {plan.performanceEvaluation.timeline.length === 0 ? (
              <p className="text-sm text-gray-500">
                타임라인 정보가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {plan.performanceEvaluation.timeline.map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.phase}</p>
                        <p className="text-xs text-gray-600">
                          {item.description}
                        </p>
                      </div>

                      <span className="ml-4 shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-600">
                        {item.duration}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Pros / Cons / Recommendations */}
        <div className="space-y-4">
          <Card className="p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                장점
              </h3>
            </div>

            {plan.pros.length === 0 ? (
              <p className="text-sm text-gray-500">
                장점 정보가 없습니다.
              </p>
            ) : (
              <ul className="space-y-1">
                {plan.pros.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-800"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                단점 / 리스크
              </h3>
            </div>

            {plan.cons.length === 0 ? (
              <p className="text-sm text-gray-500">
                단점 정보가 없습니다.
              </p>
            ) : (
              <ul className="space-y-1">
                {plan.cons.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-800"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-600" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900">
                권장 사항
              </h3>
            </div>

            {plan.recommendations.length === 0 ? (
              <p className="text-sm text-gray-500">
                권장 사항이 없습니다.
              </p>
            ) : (
              <ul className="space-y-1">
                {plan.recommendations.map((text, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-800"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Documentation */}
      <Card className="p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            요구 문서 요약
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-2">공통규격 문서</p>

            {plan.commonStandards.documentation.length === 0 ? (
              <p className="text-gray-500">문서 정보 없음</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-gray-800">
                {plan.commonStandards.documentation.map(
                  (doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ),
                )}
              </ul>
            )}
          </div>

          <div>
            <p className="font-medium mb-2">
              기본규격(성능평가) 문서
            </p>

            {plan.performanceEvaluation.documentation.length === 0 ? (
              <p className="text-gray-500">문서 정보 없음</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 text-gray-800">
                {plan.performanceEvaluation.documentation.map(
                  (doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          플랜이 맞지 않는 경우 수정 요청을 통해 조정하실 수 있습니다.
        </p>

        <div className="flex items-center gap-2">
          {onModify && (
            <Button
               variant="secondary"
               className="border-gray-300 text-gray-800"
               onClick={() => setIsEditing(true)}
            >
              수정 요청
            </Button>

          )}

          {onConfirm && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onConfirm}
            >
              이 플랜 선택
            </Button>
          )}
        </div>
      </div>

      {/* 수정 요청 모달 */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
        >
          <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900">
              플랜 수정 요청
            </h3>

            <p className="text-sm text-gray-600">
              조정해야 하는 부분을 작성해주세요.
            </p>

            <textarea
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={() => {
                  setIsEditing(false);
                  setModifications('');
                }}
              >
                취소
              </Button>

              <Button
                disabled={!modifications.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleModifyClick}
              >
                전송
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
