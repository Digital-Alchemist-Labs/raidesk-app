import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ClassifyDeviceRequest,
  ClassifyDeviceResponse,
  GeneratePlansRequest,
  GeneratePlansResponse,
  RefinePlanRequest,
  RefinePlanResponse,
  PurposeMechanism,
  Plan,
} from '@/types';
import { API_ENDPOINTS, getApiUrl, getBaseUrl } from './endpoints';
import {
  mockClassification,
  mockCategories,
  mockPlans,
  mockPurposeMechanism,
} from '@/lib/mock/dummyData';
import { parseApiError } from './errors';

// Import dynamically to avoid circular dependency
let getUseMockMode: (() => boolean) | null = null;

export const setMockModeGetter = (getter: () => boolean) => {
  getUseMockMode = getter;
};

const shouldUseMock = () => {
  if (getUseMockMode) {
    return getUseMockMode();
  }
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API Client for RAiDesk Backend
 * Supports both real API calls and mock mode
 */
export class ApiClient {
  private client: AxiosInstance;
  private requestCount = 0;

  constructor() {
    const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
    
    this.client = axios.create({
      baseURL: getBaseUrl(),
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - logging and timing
    this.client.interceptors.request.use(
      (config) => {
        this.requestCount++;
        const requestId = `req_${Date.now()}_${this.requestCount}`;
        config.headers['X-Request-ID'] = requestId;
        
        // Add timing metadata
        (config as any).metadata = { 
          startTime: Date.now(),
          requestId 
        };

        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request ${requestId}] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - logging, timing, and error handling
    this.client.interceptors.response.use(
      (response) => {
        const metadata = (response.config as any).metadata;
        if (metadata) {
          const duration = Date.now() - metadata.startTime;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[API Response ${metadata.requestId}] ${response.status} (${duration}ms)`
            );
          }
        }

        return response;
      },
      async (error: AxiosError) => {
        const metadata = (error.config as any)?.metadata;
        if (metadata) {
          const duration = Date.now() - metadata.startTime;
          console.error(
            `[API Error ${metadata.requestId}] ${error.response?.status || 'Network Error'} (${duration}ms)`,
            error.message
          );
        }

        // Retry logic for transient failures
        const config = error.config as any;
        const retryCount = config?._retryCount || 0;
        const maxRetries = 3;
        const shouldRetry = 
          retryCount < maxRetries &&
          (!error.response || error.response.status >= 500) &&
          error.code !== 'ECONNABORTED';

        if (shouldRetry) {
          config._retryCount = retryCount + 1;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff
          
          console.log(`[API Retry ${metadata?.requestId}] Attempt ${config._retryCount}/${maxRetries} after ${delay}ms`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client.request(config);
        }

        // Parse and throw custom error
        throw parseApiError(error);
      }
    );
  }

  /**
   * Health check - verify server connection
   */
  async checkHealth(): Promise<boolean> {
    if (shouldUseMock()) {
      return true;
    }

    try {
      const response = await this.client.get(API_ENDPOINTS.HEALTH, {
        timeout: 5000, // Short timeout for health check
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('[Health Check Failed]', error);
      return false;
    }
  }

  /**
   * Get server info
   */
  async getServerInfo(): Promise<{
    name: string;
    version: string;
    status: string;
  } | null> {
    if (shouldUseMock()) {
      return {
        name: 'RAiDesk API (Mock)',
        version: '1.0.0',
        status: 'mock',
      };
    }

    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      console.error('[Server Info Failed]', error);
      return null;
    }
  }

  /**
   * Classify device from concept description
   */
  async classifyDevice(
    request: ClassifyDeviceRequest,
    signal?: AbortSignal
  ): Promise<ClassifyDeviceResponse> {
    if (shouldUseMock()) {
      await delay(1500); // Simulate network delay
      return {
        classification: mockClassification,
        suggestedCategories: mockCategories,
      };
    }

    const response = await this.client.post<ClassifyDeviceResponse>(
      API_ENDPOINTS.CLASSIFY,
      request,
      { signal }
    );
    return response.data;
  }

  /**
   * Generate purpose and mechanism suggestions
   */
  async generatePurposeMechanism(
    concept: string,
    category: string,
    signal?: AbortSignal
  ): Promise<PurposeMechanism> {
    if (shouldUseMock()) {
      await delay(1200);
      return mockPurposeMechanism;
    }

    const response = await this.client.post<PurposeMechanism>(
      API_ENDPOINTS.PURPOSE,
      { concept, category },
      { signal }
    );
    return response.data;
  }

  /**
   * Generate 4-tier plans
   */
  async generatePlans(
    request: GeneratePlansRequest,
    signal?: AbortSignal
  ): Promise<GeneratePlansResponse> {
    if (shouldUseMock()) {
      await delay(2000);
      return {
        plans: mockPlans,
      };
    }

    const response = await this.client.post<GeneratePlansResponse>(
      API_ENDPOINTS.STANDARDS,
      request,
      { signal }
    );
    return response.data;
  }

  /**
   * Refine a specific plan
   * @param request - The refinement request
   * @param originalPlan - The original plan to refine (required for server)
   * @param signal - Optional abort signal for cancellation
   */
  async refinePlan(
    request: RefinePlanRequest,
    originalPlan: Plan,
    signal?: AbortSignal
  ): Promise<RefinePlanResponse> {
    if (shouldUseMock()) {
      await delay(1500);
      // In mock mode, just return the same plan with a note
      const plan = mockPlans.find(p => p.id === request.planId);
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      return {
        plan: {
          ...plan,
          description: `${plan.description}\n\n[수정 요청 반영: ${request.modifications}]`,
        },
      };
    }

    // Server requires the full original plan in the context
    const requestWithContext: RefinePlanRequest = {
      ...request,
      context: {
        ...request.context,
        original_plan: originalPlan, // Backend expects snake_case
      },
    };

    const response = await this.client.post<RefinePlanResponse>(
      API_ENDPOINTS.REFINE,
      requestWithContext,
      { signal }
    );
    return response.data;
  }
}

// Singleton instance
export const apiClient = new ApiClient();


