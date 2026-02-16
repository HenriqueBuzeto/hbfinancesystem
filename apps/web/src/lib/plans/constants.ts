export type PlanSlug = 'FREE' | 'START' | 'PRO';

export const PLAN_ORDER: PlanSlug[] = ['FREE', 'START', 'PRO'];

export const PLAN_LIMITS = {
  FREE: {
    maxTransactionsPerMonth: -1,
    maxBills: -1,
    maxAccounts: 5,
    maxCategories: 30,
    canExportPdf: false,
    canExportExcel: false,
    canUseGoals: true,
    canUseAdvancedReports: false,
    canUseProDashboard: false,
    canUseInvestments: false,
    canUseBusinessMode: false,
    canUseAiAssistant: false,
    canUseEducation: false,
  },
  START: {
    maxTransactionsPerMonth: -1,
    maxBills: -1,
    maxAccounts: 10,
    maxCategories: 50,
    canExportPdf: true,
    canExportExcel: false,
    canUseGoals: true,
    canUseAdvancedReports: true,
    canUseProDashboard: false,
    canUseInvestments: false,
    canUseBusinessMode: false,
    canUseAiAssistant: true,
    canUseEducation: false,
  },
  PRO: {
    maxTransactionsPerMonth: -1,
    maxBills: -1,
    maxAccounts: -1,
    maxCategories: -1,
    canExportPdf: true,
    canExportExcel: true,
    canUseGoals: true,
    canUseAdvancedReports: true,
    canUseProDashboard: true,
    canUseInvestments: true,
    canUseBusinessMode: true,
    canUseAiAssistant: true,
    canUseEducation: true,
  },
} as const;

export const PLAN_LABELS: Record<PlanSlug, string> = {
  FREE: 'Grátis',
  START: 'Start',
  PRO: 'Pro',
};

export const PLAN_DESCRIPTIONS: Record<PlanSlug, string> = {
  FREE: 'Para experimentar o sistema',
  START: 'Para organizar suas finanças',
  PRO: 'Recursos premium e exclusivos',
};

export const FEATURE_MIN_PLAN: Record<string, PlanSlug> = {
  exportPdf: 'START',
  exportExcel: 'PRO',
  goals: 'FREE',
  advancedReports: 'START',
  proDashboard: 'PRO',
  investments: 'PRO',
  businessMode: 'PRO',
  proTab: 'PRO',
  aiAssistant: 'START',
  educationFinancial: 'PRO',
};

function planRank(plan: PlanSlug): number {
  const i = PLAN_ORDER.indexOf(plan);
  return i === -1 ? 0 : i;
}

export function hasPlanAccess(current: PlanSlug, required: PlanSlug): boolean {
  return planRank(current) >= planRank(required);
}

export function canAccessFeature(plan: PlanSlug, feature: string): boolean {
  const required = FEATURE_MIN_PLAN[feature];
  if (!required) return true;
  return hasPlanAccess(plan, required);
}
