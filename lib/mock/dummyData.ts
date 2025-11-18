import {
  DeviceClassification,
  ProductCategory,
  Plan,
  PlanTier,
  TimelineItem,
} from '@/types';

export const mockClassification: DeviceClassification = {
  isMedicalDevice: true,
  reasoning: '제시된 개념은 의료 목적으로 사용되며, 질병의 진단 또는 치료를 보조하는 소프트웨어로 의료기기에 해당합니다.',
  confidence: 0.92,
  category: '영상의학 진단보조 소프트웨어',
  riskClass: 'II',
};

export const mockCategories: ProductCategory[] = [
  {
    code: 'A41010.01',
    name: '영상의학 진단보조 소프트웨어',
    description: '의료영상을 분석하여 병변을 검출하거나 의료진의 진단을 보조하는 소프트웨어',
    regulatoryPath: '2등급 의료기기 - 인허가 필요',
  },
  {
    code: 'A41010.02',
    name: '의료영상 처리 소프트웨어',
    description: '의료영상의 화질 개선 및 처리를 수행하는 소프트웨어',
    regulatoryPath: '1등급 의료기기 - 신고',
  },
];

export const mockPurposeMechanism = {
  intendedUse: 'CT 영상에서 폐결절을 자동으로 검출하여 의료진의 진단을 보조',
  mechanismOfAction: '딥러닝 알고리즘을 활용하여 CT 영상을 분석하고 의심 병변을 표시',
  targetPopulation: '폐결절 검진이 필요한 성인 환자',
  clinicalBenefit: '조기 발견을 통한 치료 시기 단축 및 생존율 향상',
  contraindications: ['18세 미만 소아', '영상 품질이 불량한 경우'],
};

const createCommonStandardsTimeline = (tier: PlanTier): TimelineItem[] => {
  const baseTimeline: TimelineItem[] = [
    {
      phase: '문서 준비',
      description: '기술문서 및 임상시험계획서 작성',
      duration: tier === PlanTier.FASTEST ? '2주' : tier === PlanTier.NORMAL ? '4주' : tier === PlanTier.CONSERVATIVE ? '6주' : '3주',
      deliverables: ['기술문서', 'eCTD 구성', '임상시험계획서'],
    },
    {
      phase: '품질관리체계',
      description: 'ISO 13485 인증 준비 및 획득',
      duration: tier === PlanTier.FASTEST ? '8주' : tier === PlanTier.NORMAL ? '12주' : tier === PlanTier.CONSERVATIVE ? '16주' : '10주',
      dependencies: ['문서 준비'],
      deliverables: ['ISO 13485 인증서', 'QMS 문서'],
    },
    {
      phase: '생물학적 안전성',
      description: 'ISO 10993 시험 (해당시)',
      duration: tier === PlanTier.FASTEST ? '4주' : tier === PlanTier.NORMAL ? '6주' : tier === PlanTier.CONSERVATIVE ? '8주' : '5주',
      dependencies: ['문서 준비'],
      deliverables: ['생물학적 안전성 시험 보고서'],
    },
  ];
  
  if (tier === PlanTier.INNOVATIVE) {
    baseTimeline.push({
      phase: '혁신의료기기 지정',
      description: '혁신의료기기로 지정 신청 및 우선심사',
      duration: '4주',
      deliverables: ['혁신의료기기 지정서', '우선심사 승인'],
    });
  }
  
  return baseTimeline;
};

const createPerformanceTimeline = (tier: PlanTier): TimelineItem[] => {
  const baseTimeline: TimelineItem[] = [
    {
      phase: '알고리즘 검증',
      description: '성능 평가를 위한 알고리즘 검증 시험',
      duration: tier === PlanTier.FASTEST ? '4주' : tier === PlanTier.NORMAL ? '8주' : tier === PlanTier.CONSERVATIVE ? '12주' : '6주',
      deliverables: ['알고리즘 검증 보고서', '통계 분석 결과'],
    },
    {
      phase: '임상성능시험',
      description: '실제 임상 환경에서의 성능 평가',
      duration: tier === PlanTier.FASTEST ? '12주' : tier === PlanTier.NORMAL ? '16주' : tier === PlanTier.CONSERVATIVE ? '24주' : '14주',
      dependencies: ['알고리즘 검증'],
      deliverables: ['임상시험 보고서', 'IRB 승인서'],
    },
    {
      phase: 'S/W 검증',
      description: 'IEC 62304 기반 소프트웨어 검증',
      duration: tier === PlanTier.FASTEST ? '6주' : tier === PlanTier.NORMAL ? '8주' : tier === PlanTier.CONSERVATIVE ? '12주' : '7주',
      deliverables: ['소프트웨어 검증 보고서', 'V&V 문서'],
    },
  ];
  
  return baseTimeline;
};

export const mockPlans: Plan[] = [
  {
    id: 'plan-fastest',
    tier: PlanTier.FASTEST,
    title: '최단 경로',
    description: '최소한의 요구사항을 충족하여 가장 빠르게 인허가를 받는 전략',
    totalDuration: '6개월',
    estimatedCost: '1억 ~ 1.5억원',
    riskLevel: 'high',
    commonStandards: {
      timeline: createCommonStandardsTimeline(PlanTier.FASTEST),
      standards: ['ISO 13485', 'ISO 14971', 'IEC 62304'],
      documentation: ['기술문서', '위험관리 파일', 'eCTD'],
    },
    performanceEvaluation: {
      timeline: createPerformanceTimeline(PlanTier.FASTEST),
      tests: ['알고리즘 검증', '임상성능시험 (최소 사례)', 'S/W 검증'],
      documentation: ['시험계획서', '시험보고서', 'V&V 문서'],
    },
    pros: [
      '가장 빠른 시장 진입',
      '초기 비용 최소화',
      '빠른 피드백 수집 가능',
    ],
    cons: [
      '심사 반려 위험 높음',
      '추가 자료 요청 가능성',
      '시장 신뢰도 낮을 수 있음',
    ],
    recommendations: [
      '명확한 규제 근거가 있는 경우 적합',
      '스타트업 초기 단계에 유리',
      '빠른 시장 검증이 필요한 경우',
    ],
  },
  {
    id: 'plan-normal',
    tier: PlanTier.NORMAL,
    title: '표준 경로',
    description: '업계 표준을 따르는 균형잡힌 인허가 전략',
    totalDuration: '9-10개월',
    estimatedCost: '1.5억 ~ 2.5억원',
    riskLevel: 'medium',
    commonStandards: {
      timeline: createCommonStandardsTimeline(PlanTier.NORMAL),
      standards: ['ISO 13485', 'ISO 14971', 'IEC 62304', 'IEC 82304-1'],
      documentation: ['기술문서', '위험관리 파일', 'eCTD', '사용성 평가'],
    },
    performanceEvaluation: {
      timeline: createPerformanceTimeline(PlanTier.NORMAL),
      tests: ['알고리즘 검증', '임상성능시험 (적정 사례)', 'S/W 검증', '사용성 평가'],
      documentation: ['시험계획서', '시험보고서', 'V&V 문서', '사용성 보고서'],
    },
    pros: [
      '승인 가능성 높음',
      '적정 수준의 투자',
      '시장 신뢰도 확보',
    ],
    cons: [
      '중간 수준의 기간 소요',
      '표준 비용 발생',
    ],
    recommendations: [
      '대부분의 의료기기 제조사에 권장',
      '안정적인 인허가를 원하는 경우',
      '중장기적 사업 계획이 있는 경우',
    ],
  },
  {
    id: 'plan-conservative',
    tier: PlanTier.CONSERVATIVE,
    title: '보수적 경로',
    description: '최대한 많은 근거를 확보하여 심사 통과를 보장하는 전략',
    totalDuration: '12-15개월',
    estimatedCost: '2.5억 ~ 4억원',
    riskLevel: 'low',
    commonStandards: {
      timeline: createCommonStandardsTimeline(PlanTier.CONSERVATIVE),
      standards: ['ISO 13485', 'ISO 14971', 'IEC 62304', 'IEC 82304-1', 'ISO 27001'],
      documentation: ['기술문서', '위험관리 파일', 'eCTD', '사용성 평가', '보안성 평가'],
    },
    performanceEvaluation: {
      timeline: createPerformanceTimeline(PlanTier.CONSERVATIVE),
      tests: [
        '알고리즘 검증 (다수 데이터셋)',
        '다기관 임상성능시험',
        'S/W 검증',
        '사용성 평가',
        '보안성 평가',
      ],
      documentation: [
        '시험계획서',
        '시험보고서',
        'V&V 문서',
        '사용성 보고서',
        '보안성 보고서',
        '다기관 임상 데이터',
      ],
    },
    pros: [
      '심사 통과 확률 최대화',
      '높은 시장 신뢰도',
      '글로벌 인허가 대비',
    ],
    cons: [
      '긴 개발 기간',
      '높은 비용',
      '시장 진입 지연',
    ],
    recommendations: [
      '대기업 또는 충분한 자금이 있는 경우',
      '글로벌 시장 진출 계획이 있는 경우',
      '고위험 제품인 경우',
    ],
  },
  {
    id: 'plan-innovative',
    tier: PlanTier.INNOVATIVE,
    title: '혁신 경로',
    description: '혁신의료기기로 지정받아 우선심사 및 지원을 받는 전략',
    totalDuration: '7-8개월',
    estimatedCost: '1.8억 ~ 2.8억원',
    riskLevel: 'medium',
    commonStandards: {
      timeline: createCommonStandardsTimeline(PlanTier.INNOVATIVE),
      standards: ['ISO 13485', 'ISO 14971', 'IEC 62304', 'IEC 82304-1'],
      documentation: [
        '기술문서',
        '위험관리 파일',
        'eCTD',
        '혁신성 입증 자료',
        '혁신의료기기 신청서',
      ],
    },
    performanceEvaluation: {
      timeline: createPerformanceTimeline(PlanTier.INNOVATIVE),
      tests: ['알고리즘 검증', '임상성능시험', 'S/W 검증', '혁신성 평가'],
      documentation: [
        '시험계획서',
        '시험보고서',
        'V&V 문서',
        '혁신성 입증 자료',
        '기술적 우수성 보고서',
      ],
    },
    pros: [
      '우선 심사로 기간 단축',
      '정부 지원금 수혜 가능',
      '시장 주목도 높음',
    ],
    cons: [
      '혁신성 입증 필요',
      '지정 심사 추가 소요',
      '지정 거부시 일반 경로로 전환',
    ],
    recommendations: [
      '기술적 혁신성이 명확한 경우',
      '세계 최초 또는 국내 최초 기술',
      '정부 지원 사업과 연계 가능한 경우',
    ],
  },
];

export const mockResponses = {
  greeting: `안녕하세요! RAiDesk 의료기기 인허가 어시스턴트입니다. 👋

저는 여러분의 의료기기 아이디어를 인허가까지 안내해드리는 AI 어시스턴트입니다.

다음과 같은 절차로 진행됩니다:
1️⃣ 제품 개념 확인
2️⃣ 의료기기 해당 여부 판단
3️⃣ 품목 분류 및 등급 결정
4️⃣ 사용 목적과 작용 원리 정의
5️⃣ 인허가 전략 수립 (4가지 옵션)

어떤 의료기기를 개발하고 계신가요? 간단히 설명해주세요.`,
  
  acknowledgeClassification: `입력하신 내용을 바탕으로 분석한 결과입니다.

의료기기 해당 여부와 품목 분류를 확인해주세요. 수정이 필요하시면 말씀해주세요.`,
  
  acknowledgeCategory: `품목 분류가 확정되었습니다.

이제 구체적인 사용 목적과 작용 원리를 정의하겠습니다. 제안된 내용을 확인해주세요.`,
  
  acknowledgePurpose: `사용 목적과 작용 원리가 확정되었습니다.

이제 인허가 전략을 수립하겠습니다. 최단, 표준, 보수적, 혁신 경로의 4가지 옵션을 제시해드리겠습니다.`,
  
  presentPlans: `4가지 인허가 전략을 준비했습니다.

각 카드를 클릭하시면 상세 내용을 확인하실 수 있습니다. 필요시 수정 요청도 가능합니다.`,
};


