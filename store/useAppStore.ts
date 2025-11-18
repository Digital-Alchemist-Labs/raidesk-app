import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  AppStore,
  SessionState,
  ConversationStep,
  Message,
  DeviceClassification,
  ProductCategory,
  PurposeMechanism,
  Plan,
  FlowchartNode,
  FlowchartEdge,
  AppMode,
} from '@/types';
import { createStorageAdapter } from '@/lib/storage';

const storage = createStorageAdapter();

const createInitialSession = (): SessionState => ({
  sessionId: uuidv4(),
  currentStep: ConversationStep.GREETING,
  messages: [],
  flowchartNodes: [],
  flowchartEdges: [],
  showSummary: false,
  showFlowchart: false,
  isLoading: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useAppStore = create<AppStore>((set, get) => ({
  session: null,
  mode: (process.env.NEXT_PUBLIC_USE_MOCK === 'true' ? AppMode.MOCK : AppMode.PRODUCTION) as AppMode,
  useMockMode: process.env.NEXT_PUBLIC_USE_MOCK === 'true',

  toggleMockMode: () => {
    const currentMode = get().useMockMode;
    set({ useMockMode: !currentMode });
    
    // 세션 초기화
    get().resetSession();
  },

  initSession: () => {
    const session = createInitialSession();
    set({ session });
    storage.saveSession(session);
  },

  updateSession: (updates) => {
    const currentSession = get().session;
    if (!currentSession) return;

    const updatedSession: SessionState = {
      ...currentSession,
      ...updates,
      updatedAt: new Date(),
    };

    set({ session: updatedSession });
    storage.saveSession(updatedSession);
  },

  addMessage: (message) => {
    const currentSession = get().session;
    if (!currentSession) return;

    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    const updatedMessages = [...currentSession.messages, newMessage];
    get().updateSession({ messages: updatedMessages });
  },

  setStep: (step) => {
    get().updateSession({ currentStep: step });
  },

  setClassification: (classification) => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ classification });

    // Add flowchart node
    get().addFlowchartNode({
      id: `node-classification-${Date.now()}`,
      label: `의료기기: ${classification.isMedicalDevice ? '예' : '아니오'}`,
      type: 'decision',
      step: ConversationStep.DEVICE_CLASSIFICATION,
      data: classification,
    });
  },

  setCategory: (category) => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ category });

    // Add flowchart node
    get().addFlowchartNode({
      id: `node-category-${Date.now()}`,
      label: category.name,
      type: 'process',
      step: ConversationStep.PRODUCT_CATEGORY,
      data: category,
    });
  },

  setPurposeMechanism: (purposeMechanism) => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ purposeMechanism });

    // Add flowchart node
    get().addFlowchartNode({
      id: `node-purpose-${Date.now()}`,
      label: '사용목적 & 작용원리',
      type: 'process',
      step: ConversationStep.PURPOSE_MECHANISM,
      data: purposeMechanism,
    });
  },

  setPlans: (plans) => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ plans });

    // Add flowchart node
    get().addFlowchartNode({
      id: `node-plans-${Date.now()}`,
      label: `${plans.length}개 전략 생성`,
      type: 'process',
      step: ConversationStep.PLAN_GENERATION,
      data: { count: plans.length },
    });
  },

  selectPlan: (plan) => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ selectedPlan: plan });

    // Add flowchart node
    get().addFlowchartNode({
      id: `node-selected-${Date.now()}`,
      label: `선택: ${plan.title}`,
      type: 'decision',
      step: ConversationStep.PLAN_REVIEW,
      data: plan,
    });
  },

  toggleSummary: () => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ showSummary: !currentSession.showSummary });
  },

  toggleFlowchart: () => {
    const currentSession = get().session;
    if (!currentSession) return;

    get().updateSession({ showFlowchart: !currentSession.showFlowchart });
  },

  setLoading: (loading) => {
    get().updateSession({ isLoading: loading });
  },

  resetSession: () => {
    const currentSession = get().session;
    if (currentSession) {
      storage.deleteSession(currentSession.sessionId);
    }
    get().initSession();
  },

  addFlowchartNode: (node) => {
    const currentSession = get().session;
    if (!currentSession) return;

    const updatedNodes = [...currentSession.flowchartNodes, node];
    
    // Auto-create edge from previous node
    if (currentSession.flowchartNodes.length > 0) {
      const prevNode = currentSession.flowchartNodes[currentSession.flowchartNodes.length - 1];
      get().addFlowchartEdge({
        from: prevNode.id,
        to: node.id,
      });
    }

    get().updateSession({ flowchartNodes: updatedNodes });
  },

  addFlowchartEdge: (edge) => {
    const currentSession = get().session;
    if (!currentSession) return;

    const updatedEdges = [...currentSession.flowchartEdges, edge];
    get().updateSession({ flowchartEdges: updatedEdges });
  },
}));


