"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ConversationStep } from "@/types";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ProgressBar } from "@/components/panels/ProgressBar";
import { SummaryPanel } from "@/components/panels/SummaryPanel";
import { FlowchartPanel } from "@/components/panels/FlowchartPanel";
import { PlanLayout } from "@/components/plans/PlanLayout";
import { Tabs } from "@/components/ui/Tabs";
import { motion, AnimatePresence } from "framer-motion";
import { setMockModeGetter } from "@/lib/api/client";

export default function Home() {
  const { session, initSession, useMockMode, toggleMockMode } = useAppStore();

  useEffect(() => {
    if (!session) {
      initSession();
    }
  }, [session, initSession]);

  useEffect(() => {
    // Set the mock mode getter for API client
    setMockModeGetter(() => useMockMode);
  }, [useMockMode]);

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const showPlanLayout =
    session.currentStep >= ConversationStep.PLAN_GENERATION && session.plans;

  // 사용자가 질문을 하면 우측 패널 표시
  const showSidePanel = session.messages.some((m) => m.role === "user");

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Apple/Toss Style */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RAiDesk</h1>
              <p className="text-xs text-gray-500">
                의료기기 인허가 어시스턴트
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMockMode}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                useMockMode
                  ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="text-base">{useMockMode ? "🧪" : "🔌"}</span>
              <span>{useMockMode ? "Mock Mode" : "Real API"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="sync">
          {/* Chat Area */}
          <motion.div
            key="chat-area"
            initial={false}
            animate={{
              width: showPlanLayout ? "35%" : showSidePanel ? "60%" : "100%",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col overflow-hidden"
          >
            <ChatInterface />
          </motion.div>

          {/* Plan Layout (Center Panel when showing plans) */}
          {showPlanLayout && (
            <motion.div
              key="plan-layout"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden border-l border-gray-200 bg-white"
            >
              <PlanLayout />
            </motion.div>
          )}

          {/* Right Panel (Summary/Flowchart) */}
          {showSidePanel && (
            <motion.div
              key="side-panel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className={`border-l border-gray-200 overflow-hidden bg-gray-50/50 ${
                showPlanLayout ? "w-[25%]" : "w-[40%]"
              }`}
            >
              <div className="h-full p-4">
                <Tabs
                  tabs={[
                    {
                      id: "summary",
                      label: "요약",
                      content: <SummaryPanel session={session} />,
                    },
                    {
                      id: "flowchart",
                      label: "플로우차트",
                      content: (
                        <FlowchartPanel
                          nodes={session.flowchartNodes}
                          edges={session.flowchartEdges}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      {showSidePanel && <ProgressBar currentStep={session.currentStep} />}
    </div>
  );
}
