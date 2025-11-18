// Conversation Steps
export enum ConversationStep {
  GREETING = 0,
  CONCEPT_INPUT = 1,
  DEVICE_CLASSIFICATION = 2,
  PRODUCT_CATEGORY = 3,
  PURPOSE_MECHANISM = 4,
  PLAN_GENERATION = 5,
  PLAN_REVIEW = 6,
  FINAL_CONFIRMATION = 7,
}

// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Device Classification
export interface DeviceClassification {
  isMedicalDevice: boolean;
  reasoning: string;
  confidence: number;
  category?: string;
  riskClass?: 'I' | 'II' | 'III' | 'IV';
}

// Product Category
export interface ProductCategory {
  code: string;
  name: string;
  description: string;
  regulatoryPath: string;
}

// Purpose and Mechanism
export interface PurposeMechanism {
  intendedUse: string;
  mechanismOfAction: string;
  targetPopulation: string;
  clinicalBenefit: string;
  contraindications?: string[];
}

// Plan Tier Types
export enum PlanTier {
  FASTEST = 'fastest',      // 최단
  NORMAL = 'normal',        // 보통
  CONSERVATIVE = 'conservative', // 보수적
  INNOVATIVE = 'innovative', // 혁신적
}

// Timeline Item
export interface TimelineItem {
  phase: string;
  description: string;
  duration: string;
  dependencies?: string[];
  deliverables: string[];
}

// Plan Structure
export interface Plan {
  id: string;
  tier: PlanTier;
  title: string;
  description: string;
  totalDuration: string;
  estimatedCost?: string;
  riskLevel: 'low' | 'medium' | 'high';
  
  // 공통규격 (Common Standards)
  commonStandards: {
    timeline: TimelineItem[];
    standards: string[];
    documentation: string[];
  };
  
  // 기본규격 (Basic/Performance Evaluation)
  performanceEvaluation: {
    timeline: TimelineItem[];
    tests: string[];
    documentation: string[];
  };
  
  // Key highlights
  pros: string[];
  cons: string[];
  recommendations: string[];
}

// Flowchart Node
export interface FlowchartNode {
  id: string;
  label: string;
  type: 'decision' | 'process' | 'start' | 'end';
  step: ConversationStep;
  data?: any;
}

// Flowchart Edge
export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

// Session State
export interface SessionState {
  sessionId: string;
  currentStep: ConversationStep;
  messages: Message[];
  
  // Collected Data
  concept?: string;
  classification?: DeviceClassification;
  category?: ProductCategory;
  purposeMechanism?: PurposeMechanism;
  plans?: Plan[];
  selectedPlan?: Plan;
  
  // Flowchart
  flowchartNodes: FlowchartNode[];
  flowchartEdges: FlowchartEdge[];
  
  // UI State
  showSummary: boolean;
  showFlowchart: boolean;
  isLoading: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface ClassifyDeviceRequest {
  concept: string;
  context?: string;
}

export interface ClassifyDeviceResponse {
  classification: DeviceClassification;
  suggestedCategories: ProductCategory[];
}

export interface GeneratePlansRequest {
  classification: DeviceClassification;
  category: ProductCategory;
  purposeMechanism: PurposeMechanism;
}

export interface GeneratePlansResponse {
  plans: Plan[];
}

export interface RefinePlanRequest {
  planId: string;
  modifications: string;
  context: Record<string, any>;
}

export interface RefinePlanResponse {
  plan: Plan;
}

// Storage Types
export interface IStorageAdapter {
  saveSession(session: SessionState): Promise<void>;
  loadSession(sessionId: string): Promise<SessionState | null>;
  deleteSession(sessionId: string): Promise<void>;
  listSessions(): Promise<string[]>;
}

// App Mode
export enum AppMode {
  PRODUCTION = 'production',
  MOCK = 'mock',
  TEST = 'test',
}

// Store State
export interface AppStore {
  // Session
  session: SessionState | null;
  mode: AppMode;
  useMockMode: boolean;
  
  // Actions
  initSession: () => void;
  toggleMockMode: () => void;
  updateSession: (updates: Partial<SessionState>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setStep: (step: ConversationStep) => void;
  setClassification: (classification: DeviceClassification) => void;
  setCategory: (category: ProductCategory) => void;
  setPurposeMechanism: (pm: PurposeMechanism) => void;
  setPlans: (plans: Plan[]) => void;
  selectPlan: (plan: Plan) => void;
  toggleSummary: () => void;
  toggleFlowchart: () => void;
  setLoading: (loading: boolean) => void;
  resetSession: () => void;
  
  // Flowchart
  addFlowchartNode: (node: FlowchartNode) => void;
  addFlowchartEdge: (edge: FlowchartEdge) => void;
}

// UI Component Props
export interface ChatInterfaceProps {
  className?: string;
}

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface PlanCardProps {
  plan: Plan;
  selected?: boolean;
  onClick?: () => void;
}

export interface PlanDetailProps {
  plan: Plan;
  onModify?: (modifications: string) => void;
  onConfirm?: () => void;
}

export interface ProgressBarProps {
  currentStep: ConversationStep;
  totalSteps: number;
}

export interface SummaryPanelProps {
  session: SessionState;
}

export interface FlowchartPanelProps {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}


