# RAiDesk Server - Required Improvements

이 문서는 `raidesk-server`에 추가로 필요한 기능들을 정리한 것입니다.

## 🚨 Critical (필수 구현)

### 1. Session Management (세션 관리)

**현재 문제점**:
- 서버가 재시작되면 모든 데이터 손실
- 클라이언트가 모든 상태를 관리해야 함
- 여러 탭/창에서 상태 공유 불가

**필요한 기능**:

#### API 엔드포인트
```python
# app/routers/sessions.py

@router.post("/api/sessions")
async def create_session():
    """새 세션 생성"""
    session_id = generate_unique_id()
    session = {
        "session_id": session_id,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "data": {}
    }
    await session_manager.save(session)
    return {"session_id": session_id}

@router.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """세션 조회"""
    session = await session_manager.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session

@router.put("/api/sessions/{session_id}")
async def update_session(session_id: str, data: dict):
    """세션 업데이트"""
    await session_manager.update(session_id, data)
    return {"status": "updated"}

@router.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """세션 삭제"""
    await session_manager.delete(session_id)
    return {"status": "deleted"}
```

#### 저장소 구현

**Option 1: Redis (추천 - 프로덕션)**
```python
# app/storage/redis_adapter.py
import redis.asyncio as redis
import json

class RedisSessionManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def save(self, session: dict):
        session_id = session["session_id"]
        await self.redis.setex(
            f"session:{session_id}",
            3600 * 24,  # 24시간 TTL
            json.dumps(session, default=str)
        )
    
    async def get(self, session_id: str):
        data = await self.redis.get(f"session:{session_id}")
        return json.loads(data) if data else None
    
    async def update(self, session_id: str, data: dict):
        session = await self.get(session_id)
        if session:
            session["data"].update(data)
            session["updated_at"] = datetime.now()
            await self.save(session)
```

**Option 2: SQLite (개발용)**
```python
# app/storage/sqlite_adapter.py
import aiosqlite
import json

class SQLiteSessionManager:
    def __init__(self, db_path: str = "./raidesk.db"):
        self.db_path = db_path
    
    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at TEXT,
                    updated_at TEXT,
                    data TEXT
                )
            """)
            await db.commit()
    
    async def save(self, session: dict):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT OR REPLACE INTO sessions VALUES (?, ?, ?, ?)",
                (
                    session["session_id"],
                    session["created_at"],
                    session["updated_at"],
                    json.dumps(session["data"])
                )
            )
            await db.commit()
```

#### 설정 추가
```bash
# .env
SESSION_STORAGE=redis  # 또는 sqlite
REDIS_URL=redis://localhost:6379
# 또는
DATABASE_URL=sqlite:///./raidesk.db
```

---

### 2. Plan Storage (계획 저장소)

**현재 문제점**:
- `/api/refine` 엔드포인트가 전체 plan을 request에 포함하도록 요구
- 큰 payload 크기
- Plan 버전 관리 불가

**개선 방안**:

#### Models 추가
```python
# app/models.py

class StoredPlan(BaseModel):
    """데이터베이스에 저장되는 Plan"""
    id: str
    session_id: str
    plan: Plan
    version: int = 1
    parent_id: Optional[str] = None  # refinement 추적용
    created_at: datetime
    updated_at: datetime
```

#### API 엔드포인트
```python
# app/routers/plans.py

@router.post("/api/plans")
async def store_plan(plan: Plan, session_id: str):
    """계획 저장"""
    stored = StoredPlan(
        id=plan.id,
        session_id=session_id,
        plan=plan,
        version=1,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    await plan_repository.save(stored)
    return {"plan_id": plan.id}

@router.get("/api/plans/{plan_id}")
async def get_plan(plan_id: str):
    """계획 조회"""
    stored = await plan_repository.get(plan_id)
    if not stored:
        raise HTTPException(404, "Plan not found")
    return stored.plan

@router.get("/api/plans/{plan_id}/history")
async def get_plan_history(plan_id: str):
    """계획 수정 이력"""
    history = await plan_repository.get_history(plan_id)
    return {"versions": history}
```

#### Refine 엔드포인트 개선
```python
# app/routers/refine.py

@router.post("/refine", response_model=RefinePlanResponse)
async def refine_plan_endpoint(request: RefinePlanRequest):
    """계획 수정 - 이제 plan_id만 필요"""
    
    # 저장소에서 원본 계획 조회
    stored = await plan_repository.get(request.plan_id)
    if not stored:
        raise HTTPException(404, "Plan not found")
    
    original_plan = stored.plan
    
    # 수정 실행
    result = await refine_plan(
        plan=original_plan,
        modifications=request.modifications,
        context=request.context
    )
    
    # 새 버전으로 저장
    new_stored = StoredPlan(
        id=f"{request.plan_id}_v{stored.version + 1}",
        session_id=stored.session_id,
        plan=result.plan,
        version=stored.version + 1,
        parent_id=request.plan_id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    await plan_repository.save(new_stored)
    
    return result
```

#### 저장소 구현
```python
# app/storage/plan_repository.py

class PlanRepository:
    def __init__(self, db):
        self.db = db
    
    async def save(self, stored_plan: StoredPlan):
        """계획 저장"""
        # Redis 또는 SQLite에 저장
        pass
    
    async def get(self, plan_id: str) -> Optional[StoredPlan]:
        """계획 조회"""
        pass
    
    async def get_history(self, plan_id: str) -> List[StoredPlan]:
        """계획 수정 이력 조회"""
        pass
    
    async def get_by_session(self, session_id: str) -> List[StoredPlan]:
        """세션의 모든 계획 조회"""
        pass
```

---

### 3. Enhanced Error Handling (향상된 에러 처리)

**현재 문제점**:
- 모든 에러가 generic 500 error
- 클라이언트가 구체적인 에러 원인 파악 불가
- Pydantic validation 에러가 사용자 친화적이지 않음

**개선 방안**:

#### Custom Exceptions
```python
# app/exceptions.py

class RAiDeskException(Exception):
    """Base exception"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class DeviceNotMedicalError(RAiDeskException):
    """의료기기가 아닌 경우"""
    def __init__(self, concept: str):
        super().__init__(
            f"'{concept}'은(는) 의료기기로 분류되지 않습니다.",
            status_code=400
        )

class OllamaConnectionError(RAiDeskException):
    """Ollama 연결 실패"""
    def __init__(self):
        super().__init__(
            "AI 모델 서버에 연결할 수 없습니다.",
            status_code=503
        )

class InvalidCategoryError(RAiDeskException):
    """잘못된 품목 카테고리"""
    def __init__(self, category: str):
        super().__init__(
            f"'{category}'은(는) 유효하지 않은 품목 카테고리입니다.",
            status_code=400
        )

class SessionNotFoundError(RAiDeskException):
    """세션을 찾을 수 없음"""
    def __init__(self, session_id: str):
        super().__init__(
            f"세션 '{session_id}'을(를) 찾을 수 없습니다.",
            status_code=404
        )
```

#### Error Handler Middleware
```python
# app/middleware/error_handler.py

from fastapi import Request
from fastapi.responses import JSONResponse
from app.exceptions import RAiDeskException

@app.exception_handler(RAiDeskException)
async def raidesk_exception_handler(request: Request, exc: RAiDeskException):
    """커스텀 예외 처리"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "type": "raidesk_error"
        }
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Pydantic validation 에러를 사용자 친화적으로"""
    errors = []
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"])
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=400,
        content={
            "error": "ValidationError",
            "message": "입력 데이터가 올바르지 않습니다.",
            "details": errors,
            "type": "validation_error"
        }
    )
```

#### Usage in Agents
```python
# app/agents/classifier.py

async def classify_device(concept: str, context: Optional[str] = None):
    try:
        result = await ollama_client.generate(...)
    except ConnectionError:
        raise OllamaConnectionError()
    
    if not result.classification.is_medical_device:
        raise DeviceNotMedicalError(concept)
    
    return result
```

---

## ⚡ Important (중요)

### 4. CORS Configuration (환경별 설정)

**현재 문제점**:
- `localhost:3000`, `localhost:3001` 하드코딩
- 프로덕션 도메인 지원 불가

**개선 방안**:

```python
# app/config.py
class Settings(BaseSettings):
    # ...
    cors_origins: Union[List[str], str] = ["http://localhost:3000"]
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
```

```bash
# .env (개발)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# .env (프로덕션)
CORS_ORIGINS=https://raidesk.com,https://www.raidesk.com,https://app.raidesk.com
```

---

## 📊 Recommended (권장)

### 5. Rate Limiting (속도 제한)

**이유**:
- AI 모델 호출은 비용이 높음
- 무분별한 요청 방지
- 서버 리소스 보호

**구현**:

```bash
pip install slowapi
```

```python
# app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# app/routers/classify.py
@router.post("/classify")
@limiter.limit("10/minute")  # 분당 10회
async def classify_device_endpoint(request: Request, ...):
    ...

# app/routers/standards.py
@router.post("/standards")
@limiter.limit("5/minute")  # 가장 비싼 작업
async def generate_plans_endpoint(request: Request, ...):
    ...
```

**권장 제한**:
- `/api/classify`: 10/분
- `/api/purpose`: 15/분
- `/api/standards`: 5/분 (가장 비용이 높음)
- `/api/refine`: 20/분
- `/health`: 제한 없음

---

### 6. Structured Logging (구조화된 로깅)

**현재**: uvicorn의 기본 로그만 출력

**개선**:

```python
# app/middleware/logging.py
import logging
import json
import time
from fastapi import Request

logger = logging.getLogger("raidesk")

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
        }
        
        # 추가 컨텍스트
        for key in ["request_id", "user_id", "session_id", "duration_ms"]:
            if hasattr(record, key):
                log_data[key] = getattr(record, key)
        
        return json.dumps(log_data, ensure_ascii=False)

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()
    
    # Request 로그
    logger.info(
        f"{request.method} {request.url.path}",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host
        }
    )
    
    response = await call_next(request)
    
    # Response 로그
    duration_ms = int((time.time() - start_time) * 1000)
    logger.info(
        f"Response {response.status_code}",
        extra={
            "request_id": request_id,
            "status_code": response.status_code,
            "duration_ms": duration_ms
        }
    )
    
    return response
```

**로그 출력 예시**:
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "level": "INFO",
  "message": "POST /api/classify",
  "module": "logging",
  "request_id": "req_123",
  "method": "POST",
  "path": "/api/classify",
  "client": "127.0.0.1"
}
{
  "timestamp": "2024-01-01T12:00:02",
  "level": "INFO",
  "message": "Response 200",
  "request_id": "req_123",
  "status_code": 200,
  "duration_ms": 2341
}
```

---

### 7. Health Check 개선

**현재**:
```python
@app.get("/health")
async def health():
    return {"status": "healthy"}
```

**개선** (실제 dependency 체크):
```python
@app.get("/health")
async def health():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "checks": {}
    }
    
    # Ollama 연결 확인
    try:
        response = await ollama_client.generate("test", max_tokens=1)
        health_status["checks"]["ollama"] = "healthy"
    except Exception as e:
        health_status["checks"]["ollama"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Redis/DB 연결 확인 (if implemented)
    if session_manager:
        try:
            await session_manager.ping()
            health_status["checks"]["session_storage"] = "healthy"
        except Exception as e:
            health_status["checks"]["session_storage"] = f"unhealthy: {str(e)}"
            health_status["status"] = "degraded"
    
    status_code = 200 if health_status["status"] in ["healthy", "degraded"] else 503
    return JSONResponse(content=health_status, status_code=status_code)
```

---

## 🔮 Future (향후 고려사항)

### 8. Streaming Support (스트리밍 응답)

**장점**:
- 사용자가 AI 응답을 실시간으로 볼 수 있음
- 체감 속도 개선
- 더 나은 UX

**구현**:
```python
from fastapi.responses import StreamingResponse

@router.post("/classify/stream")
async def classify_stream(request: ClassifyDeviceRequest):
    async def generate():
        async for chunk in classifier.stream(request.concept):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

### 9. Authentication (인증)

**프로덕션 배포 전 필수**

**Option 1: API Key (가장 간단)**
```python
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key not in settings.valid_api_keys:
        raise HTTPException(403, "Invalid API key")
    return api_key

@router.post("/classify", dependencies=[Depends(verify_api_key)])
async def classify_device_endpoint(...):
    ...
```

**Option 2: JWT (권장)**
```python
from fastapi import Depends
from fastapi.security import HTTPBearer
from jose import jwt

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(401, "Invalid token")
```

### 10. Caching (캐싱)

**목적**: 동일한 요청에 대한 AI 재생성 방지

```python
import hashlib
from functools import wraps

def cache_result(expire_seconds: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = hashlib.sha256(
                json.dumps([args, kwargs], sort_keys=True).encode()
            ).hexdigest()
            
            # 캐시 확인
            cached = await redis.get(f"cache:{cache_key}")
            if cached:
                return json.loads(cached)
            
            # 실행 및 캐싱
            result = await func(*args, **kwargs)
            await redis.setex(
                f"cache:{cache_key}",
                expire_seconds,
                json.dumps(result, default=str)
            )
            return result
        return wrapper
    return decorator

@cache_result(expire_seconds=3600)
async def classify_device(concept: str, context: Optional[str] = None):
    # 동일한 concept에 대해 1시간 동안 캐시
    ...
```

---

## 📦 필요한 패키지

```bash
# requirements.txt에 추가

# Session Management
redis>=4.5.0  # Redis 사용 시
aiosqlite>=0.19.0  # SQLite 사용 시

# Rate Limiting
slowapi>=0.1.9

# Authentication (선택)
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4

# Monitoring (선택)
prometheus-client>=0.16.0
sentry-sdk>=1.40.0
```

---

## 🚀 구현 우선순위

### Phase 1: 필수 기능 (1-2주)
1. ✅ Session Management (Redis 또는 SQLite)
2. ✅ Plan Storage
3. ✅ Enhanced Error Handling
4. ✅ CORS 환경별 설정

### Phase 2: 안정성 개선 (1주)
5. ✅ Rate Limiting
6. ✅ Structured Logging
7. ✅ Health Check 개선

### Phase 3: 최적화 (1-2주)
8. ⭕ Caching
9. ⭕ Monitoring/Metrics
10. ⭕ Performance Optimization

### Phase 4: 프로덕션 준비 (1주)
11. ⭕ Authentication
12. ⭕ Streaming Support (선택)
13. ⭕ CI/CD Pipeline

---

## 📝 테스트 방법

### Session Management 테스트
```bash
# 세션 생성
curl -X POST http://localhost:8000/api/sessions

# 세션 조회
curl http://localhost:8000/api/sessions/sess_abc123

# 세션 업데이트
curl -X PUT http://localhost:8000/api/sessions/sess_abc123 \
  -H "Content-Type: application/json" \
  -d '{"concept": "폐결절 검출 AI"}'
```

### Rate Limiting 테스트
```bash
# 10회 연속 요청 (제한 확인)
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/classify \
    -H "Content-Type: application/json" \
    -d '{"concept": "test"}' &
done
```

### Error Handling 테스트
```bash
# 잘못된 세션 ID
curl http://localhost:8000/api/sessions/invalid_id

# 빈 concept
curl -X POST http://localhost:8000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"concept": ""}'
```

---

## 💡 참고 자료

- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [Redis Python Client](https://redis.readthedocs.io/)
- [slowapi Documentation](https://slowapi.readthedocs.io/)
- [Structured Logging Guide](https://www.structlog.org/)
- [API Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

