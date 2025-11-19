# API Client Usage Examples

프론트엔드에서 개선된 API 클라이언트를 사용하는 방법을 보여주는 예시 모음입니다.

## 기본 사용법

### 1. Health Check & Connection Validation

```typescript
import { apiClient } from '@/lib/api';

// 컴포넌트 마운트 시 서버 연결 확인
useEffect(() => {
  const checkServerConnection = async () => {
    const isHealthy = await apiClient.checkHealth();
    
    if (!isHealthy) {
      toast.error('서버에 연결할 수 없습니다. 관리자에게 문의하세요.');
      return;
    }
    
    const serverInfo = await apiClient.getServerInfo();
    console.log('Server:', serverInfo);
    // { name: "RAiDesk API", version: "1.0.0", status: "operational" }
  };
  
  checkServerConnection();
}, []);
```

### 2. Error Handling

```typescript
import { 
  apiClient,
  ApiConnectionError,
  ApiValidationError,
  ApiTimeoutError,
  ApiServerError 
} from '@/lib/api';

const handleClassifyDevice = async (concept: string) => {
  try {
    setLoading(true);
    const result = await apiClient.classifyDevice({ concept });
    setClassification(result.classification);
    setSuggestedCategories(result.suggestedCategories);
  } catch (error) {
    if (error instanceof ApiConnectionError) {
      toast.error('서버에 연결할 수 없습니다. 인터넷 연결을 확인하세요.');
    } else if (error instanceof ApiValidationError) {
      toast.error(`입력이 올바르지 않습니다: ${error.message}`);
    } else if (error instanceof ApiTimeoutError) {
      toast.error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    } else if (error instanceof ApiServerError) {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      toast.error('알 수 없는 오류가 발생했습니다.');
    }
  } finally {
    setLoading(false);
  }
};
```

### 3. Request Cancellation

```typescript
import { apiClient } from '@/lib/api';
import { useRef } from 'react';

function ClassifyComponent() {
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const handleClassify = async (concept: string) => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    try {
      const result = await apiClient.classifyDevice(
        { concept },
        abortControllerRef.current.signal
      );
      // 결과 처리
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('요청이 취소되었습니다');
      } else {
        // 다른 에러 처리
      }
    }
  };
  
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info('요청을 취소했습니다');
    }
  };
  
  return (
    <div>
      <button onClick={() => handleClassify(concept)}>
        분류하기
      </button>
      <button onClick={handleCancel}>
        취소
      </button>
    </div>
  );
}
```

### 4. Refine Plan (Updated)

```typescript
import { apiClient } from '@/lib/api';
import { Plan } from '@/types';

// ⚠️ 주의: refinePlan은 이제 originalPlan 파라미터가 필수입니다
const handleRefinePlan = async (
  plan: Plan,
  modifications: string
) => {
  try {
    setLoading(true);
    
    const result = await apiClient.refinePlan(
      {
        planId: plan.id,
        modifications,
        context: {
          budget_constraint: '1억원',
          timeline_constraint: '6개월'
        }
      },
      plan  // ← 원본 계획 전달 (필수)
    );
    
    setRefinedPlan(result.plan);
    toast.success('계획이 수정되었습니다');
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

## 고급 패턴

### 5. React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Health check query
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.checkHealth(),
    refetchInterval: 30000, // 30초마다 체크
    retry: 3,
  });
};

// Classification mutation
export const useClassifyDevice = () => {
  return useMutation({
    mutationFn: (concept: string) => 
      apiClient.classifyDevice({ concept }),
    onSuccess: (data) => {
      console.log('Classification successful:', data);
    },
    onError: (error) => {
      console.error('Classification failed:', error);
    },
  });
};

// Usage in component
function ClassifyPage() {
  const { data: isHealthy } = useHealthCheck();
  const classifyMutation = useClassifyDevice();
  
  const handleSubmit = (concept: string) => {
    if (!isHealthy) {
      toast.error('서버에 연결할 수 없습니다');
      return;
    }
    
    classifyMutation.mutate(concept);
  };
  
  return (
    <div>
      {!isHealthy && (
        <Alert>서버 연결이 불안정합니다</Alert>
      )}
      
      <button
        onClick={() => handleSubmit(concept)}
        disabled={classifyMutation.isPending}
      >
        {classifyMutation.isPending ? '분류 중...' : '분류하기'}
      </button>
    </div>
  );
}
```

### 6. Retry Logic with User Feedback

```typescript
import { apiClient } from '@/lib/api';

const classifyWithRetry = async (
  concept: string,
  onRetry?: (attempt: number) => void
) => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await apiClient.classifyDevice({ concept });
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < 3) {
        onRetry?.(attempt);
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * attempt)
        );
      }
    }
  }
  
  throw lastError!;
};

// Usage
const handleClassify = async (concept: string) => {
  try {
    const result = await classifyWithRetry(
      concept,
      (attempt) => {
        toast.info(`재시도 중... (${attempt}/3)`);
      }
    );
    // 성공 처리
  } catch (error) {
    toast.error('여러 번 시도했지만 실패했습니다');
  }
};
```

### 7. Timeout Configuration

```typescript
// 긴 작업에 대한 타임아웃 증가
const generatePlansWithLongTimeout = async (request: GeneratePlansRequest) => {
  // 환경 변수로 설정하거나
  // NEXT_PUBLIC_API_TIMEOUT=60000
  
  // 또는 개별 요청에 대해 axios config 직접 수정
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초
  
  try {
    const result = await apiClient.generatePlans(request, controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
```

### 8. Progress Tracking (for long requests)

```typescript
import { apiClient } from '@/lib/api';

const classifyWithProgress = async (
  concept: string,
  onProgress: (progress: number) => void
) => {
  // 예상 시간: 3초
  const estimatedDuration = 3000;
  const intervalTime = 100; // 100ms마다 업데이트
  let elapsed = 0;
  
  const progressInterval = setInterval(() => {
    elapsed += intervalTime;
    const progress = Math.min((elapsed / estimatedDuration) * 100, 95);
    onProgress(progress);
  }, intervalTime);
  
  try {
    const result = await apiClient.classifyDevice({ concept });
    clearInterval(progressInterval);
    onProgress(100);
    return result;
  } catch (error) {
    clearInterval(progressInterval);
    throw error;
  }
};

// Usage
const [progress, setProgress] = useState(0);

const handleClassify = async (concept: string) => {
  setProgress(0);
  try {
    const result = await classifyWithProgress(concept, setProgress);
    // 성공 처리
  } catch (error) {
    // 에러 처리
  }
};
```

### 9. Batch Requests with Error Recovery

```typescript
import { apiClient } from '@/lib/api';

const classifyMultipleConcepts = async (
  concepts: string[],
  onProgress?: (completed: number, total: number) => void
) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < concepts.length; i++) {
    try {
      const result = await apiClient.classifyDevice({
        concept: concepts[i]
      });
      results.push({ concept: concepts[i], result });
    } catch (error) {
      errors.push({ concept: concepts[i], error });
    }
    
    onProgress?.(i + 1, concepts.length);
  }
  
  return { results, errors };
};

// Usage
const handleBatchClassify = async (concepts: string[]) => {
  setProgress({ current: 0, total: concepts.length });
  
  const { results, errors } = await classifyMultipleConcepts(
    concepts,
    (completed, total) => {
      setProgress({ current: completed, total });
    }
  );
  
  toast.success(`${results.length}개 성공, ${errors.length}개 실패`);
  
  if (errors.length > 0) {
    // 실패한 항목 재시도 옵션 제공
    setFailedConcepts(errors.map(e => e.concept));
  }
};
```

### 10. Debounced API Calls

```typescript
import { apiClient } from '@/lib/api';
import { useCallback, useRef } from 'react';

function useDebounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  
  return useCallback(
    (...args: Parameters<T>) => {
      // 이전 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            abortControllerRef.current = new AbortController();
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            if (error.name !== 'AbortError') {
              reject(error);
            }
          }
        }, delay);
      });
    },
    [fn, delay]
  );
}

// Usage: 사용자가 타이핑을 멈춘 후 500ms 뒤에 자동 분류
function AutoClassifyInput() {
  const [concept, setConcept] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const debouncedClassify = useDebounce(
    async (value: string) => {
      if (value.length < 3) return;
      
      const result = await apiClient.classifyDevice({ concept: value });
      setSuggestions(result.suggestedCategories);
    },
    500
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConcept(value);
    debouncedClassify(value);
  };
  
  return (
    <div>
      <input value={concept} onChange={handleChange} />
      {suggestions.length > 0 && (
        <SuggestionList items={suggestions} />
      )}
    </div>
  );
}
```

## Testing

### 11. Mock Mode Testing

```typescript
// 개발 중 Mock 모드로 빠르게 테스트
// .env.local
// NEXT_PUBLIC_USE_MOCK=true

// Mock 모드에서도 동일한 API 호출 방식 사용
const result = await apiClient.classifyDevice({ concept });
// Mock 데이터 반환
```

### 12. Error Simulation (for testing error handling)

```typescript
// 테스트용: 일부러 잘못된 요청 보내기
const testErrorHandling = async () => {
  try {
    // 빈 concept (validation error)
    await apiClient.classifyDevice({ concept: '' });
  } catch (error) {
    console.log('Validation error caught:', error);
  }
  
  try {
    // 존재하지 않는 엔드포인트 (404 error)
    await axios.get('http://localhost:8000/api/nonexistent');
  } catch (error) {
    console.log('Not found error caught:', error);
  }
  
  try {
    // 서버가 꺼져있을 때 (connection error)
    await apiClient.checkHealth();
  } catch (error) {
    console.log('Connection error caught:', error);
  }
};
```

## Best Practices

### ✅ Do

```typescript
// 1. 항상 try-catch로 에러 처리
try {
  const result = await apiClient.classifyDevice({ concept });
} catch (error) {
  handleError(error);
}

// 2. 긴 작업에는 로딩 상태 표시
setLoading(true);
try {
  await apiClient.generatePlans(request);
} finally {
  setLoading(false);
}

// 3. AbortController로 요청 취소 지원
const controller = new AbortController();
apiClient.classifyDevice({ concept }, controller.signal);

// 4. 에러 타입별로 적절한 메시지 표시
if (error instanceof ApiConnectionError) {
  toast.error('서버 연결 실패');
}

// 5. Health check로 서버 상태 확인
const isHealthy = await apiClient.checkHealth();
```

### ❌ Don't

```typescript
// 1. 에러 처리 없이 API 호출
const result = await apiClient.classifyDevice({ concept }); // ❌

// 2. 로딩 상태 없이 긴 작업
await apiClient.generatePlans(request); // ❌ 사용자가 기다리는지 모름

// 3. 타임아웃이나 취소 없이 무한정 대기
await apiClient.classifyDevice({ concept }); // ❌ 취소 불가

// 4. Generic 에러 메시지만 표시
catch (error) {
  toast.error('오류 발생'); // ❌ 원인을 알 수 없음
}

// 5. Mock 모드를 프로덕션에 배포
NEXT_PUBLIC_USE_MOCK=true // ❌ 프로덕션에서는 false
```

## 전체 워크플로우 예시

```typescript
import { apiClient, ApiConnectionError, ApiTimeoutError } from '@/lib/api';
import { useState, useEffect } from 'react';

function CompleteWorkflow() {
  const [serverHealthy, setServerHealthy] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [concept, setConcept] = useState('');
  const [classification, setClassification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [plans, setPlans] = useState([]);
  
  // 1. 초기 health check
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await apiClient.checkHealth();
      setServerHealthy(healthy);
      
      if (healthy) {
        const info = await apiClient.getServerInfo();
        console.log('Connected to:', info);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // 30초마다
    return () => clearInterval(interval);
  }, []);
  
  // 2. Classification
  const handleClassify = async () => {
    if (!serverHealthy) {
      toast.error('서버에 연결할 수 없습니다');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    
    try {
      const result = await apiClient.classifyDevice({ concept });
      setClassification(result.classification);
      setProgress(33);
    } catch (error) {
      if (error instanceof ApiConnectionError) {
        toast.error('서버 연결 실패');
        setServerHealthy(false);
      } else if (error instanceof ApiTimeoutError) {
        toast.error('시간 초과. 다시 시도해주세요.');
      } else {
        toast.error('분류 실패: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 3. Generate Plans
  const handleGeneratePlans = async () => {
    setLoading(true);
    setProgress(33);
    
    try {
      // Purpose & Mechanism
      const purposeMechanism = await apiClient.generatePurposeMechanism(
        concept,
        selectedCategory.name
      );
      setProgress(66);
      
      // Plans
      const result = await apiClient.generatePlans({
        classification,
        category: selectedCategory,
        purposeMechanism,
      });
      setPlans(result.plans);
      setProgress(100);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  
  // 4. Refine Plan
  const handleRefinePlan = async (plan, modifications) => {
    setLoading(true);
    
    try {
      const result = await apiClient.refinePlan(
        {
          planId: plan.id,
          modifications,
          context: {}
        },
        plan // ← 원본 계획
      );
      
      // 업데이트된 계획으로 교체
      setPlans(plans.map(p => 
        p.id === plan.id ? result.plan : p
      ));
      
      toast.success('계획이 수정되었습니다');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {!serverHealthy && (
        <Alert variant="error">
          서버 연결이 불안정합니다
        </Alert>
      )}
      
      {loading && <ProgressBar value={progress} />}
      
      {/* UI components */}
    </div>
  );
}
```

## 참고 자료

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query](https://tanstack.com/query/latest)
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Error Handling Best Practices](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)

