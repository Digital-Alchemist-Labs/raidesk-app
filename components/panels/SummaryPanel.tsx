'use client';

import { SessionState } from '@/types';
import { Card } from '@/components/ui/Card';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface SummaryPanelProps {
  session: SessionState;
}

export function SummaryPanel({ session }: SummaryPanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">진행 요약</h2>

      {/* Concept */}
      {session.concept && (
        <Card>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">제품 개념</h3>
              <p className="text-sm text-gray-600">{session.concept}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Classification */}
      {session.classification && (
        <Card>
          <div className="flex items-start gap-3">
            {session.classification.isMedicalDevice ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">의료기기 분류</h3>
              <p className="text-sm text-gray-600 mb-2">
                {session.classification.isMedicalDevice ? '의료기기에 해당' : '의료기기 미해당'}
              </p>
              {session.classification.category && (
                <p className="text-sm text-gray-600">
                  품목: {session.classification.category}
                </p>
              )}
              {session.classification.riskClass && (
                <p className="text-sm text-gray-600">
                  등급: {session.classification.riskClass}등급
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                신뢰도: {(session.classification.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Category */}
      {session.category && (
        <Card>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">품목 분류</h3>
              <p className="text-sm text-gray-600 mb-1">{session.category.name}</p>
              <p className="text-xs text-gray-500">코드: {session.category.code}</p>
              <p className="text-xs text-gray-500 mt-1">
                경로: {session.category.regulatoryPath}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Purpose & Mechanism */}
      {session.purposeMechanism && (
        <Card>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">사용 목적 & 원리</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">사용 목적</p>
                  <p className="text-gray-700">{session.purposeMechanism.intendedUse}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-xs mb-1">작용 원리</p>
                  <p className="text-gray-700">{session.purposeMechanism.mechanismOfAction}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-xs mb-1">대상 환자군</p>
                  <p className="text-gray-700">{session.purposeMechanism.targetPopulation}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Selected Plan */}
      {session.selectedPlan && (
        <Card selected>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">선택된 플랜</h3>
              <p className="text-sm text-gray-600 mb-2">{session.selectedPlan.title}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>기간: {session.selectedPlan.totalDuration}</span>
                <span>비용: {session.selectedPlan.estimatedCost}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">{session.messages.length}</p>
            <p className="text-xs text-gray-600 mt-1">메시지</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {session.plans?.length || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">생성된 플랜</p>
          </div>
        </div>
      </Card>
    </div>
  );
}


