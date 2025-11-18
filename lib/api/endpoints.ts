export const API_ENDPOINTS = {
  CLASSIFY: '/api/classify',
  PURPOSE: '/api/purpose',
  STANDARDS: '/api/standards',
  REFINE: '/api/refine',
} as const;

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${endpoint}`;
};


