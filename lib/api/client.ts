import axios from 'axios';
import {
  ClassifyDeviceRequest,
  ClassifyDeviceResponse,
  GeneratePlansRequest,
  GeneratePlansResponse,
  RefinePlanRequest,
  RefinePlanResponse,
  PurposeMechanism,
} from '@/types';
import { API_ENDPOINTS, getApiUrl } from './endpoints';
import {
  mockClassification,
  mockCategories,
  mockPlans,
  mockPurposeMechanism,
} from '@/lib/mock/dummyData';

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
  private client = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Classify device from concept description
   */
  async classifyDevice(
    request: ClassifyDeviceRequest
  ): Promise<ClassifyDeviceResponse> {
    if (shouldUseMock()) {
      await delay(1500); // Simulate network delay
      return {
        classification: mockClassification,
        suggestedCategories: mockCategories,
      };
    }

    try {
      const response = await this.client.post<ClassifyDeviceResponse>(
        getApiUrl(API_ENDPOINTS.CLASSIFY),
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to classify device:', error);
      throw new Error('Failed to classify device. Please try again.');
    }
  }

  /**
   * Generate purpose and mechanism suggestions
   */
  async generatePurposeMechanism(
    concept: string,
    category: string
  ): Promise<PurposeMechanism> {
    if (shouldUseMock()) {
      await delay(1200);
      return mockPurposeMechanism;
    }

    try {
      const response = await this.client.post<PurposeMechanism>(
        getApiUrl(API_ENDPOINTS.PURPOSE),
        { concept, category }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate purpose/mechanism:', error);
      throw new Error('Failed to generate purpose/mechanism. Please try again.');
    }
  }

  /**
   * Generate 4-tier plans
   */
  async generatePlans(
    request: GeneratePlansRequest
  ): Promise<GeneratePlansResponse> {
    if (shouldUseMock()) {
      await delay(2000);
      return {
        plans: mockPlans,
      };
    }

    try {
      const response = await this.client.post<GeneratePlansResponse>(
        getApiUrl(API_ENDPOINTS.STANDARDS),
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate plans:', error);
      throw new Error('Failed to generate plans. Please try again.');
    }
  }

  /**
   * Refine a specific plan
   */
  async refinePlan(request: RefinePlanRequest): Promise<RefinePlanResponse> {
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

    try {
      const response = await this.client.post<RefinePlanResponse>(
        getApiUrl(API_ENDPOINTS.REFINE),
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to refine plan:', error);
      throw new Error('Failed to refine plan. Please try again.');
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();


