export const API_ENDPOINTS = {
  HEALTH: '/health',
  CLASSIFY: '/api/classify',
  PURPOSE: '/api/purpose',
  STANDARDS: '/api/standards',
  REFINE: '/api/refine',
} as const;

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${endpoint}`;
};

export const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};


