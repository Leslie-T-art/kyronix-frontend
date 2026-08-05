/**
 * Central endpoint registry — the ONLY place engine URLs are declared.
 * Every request in the app resolves its path from here; no string URLs
 * are permitted anywhere else in the codebase.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me'
  },
  dashboard: {
    summary: '/api/bff/dashboard/summary'
  },
  notifications: {
    list: '/api/bff/notifications'
  },
  olts: {
    list: '/api/bff/olts/exceptions'
  },
  audit: {
    trail: '/api/bff/audit/trail'
  },
  kri: {
    list: '/api/bff/kri/indicators'
  },
  riskRegister: {
    list: '/api/bff/risk-register/entries'
  },
  processFlows: {
    list: '/api/bff/process-flows/processes'
  },
  selfAssessment: {
    list: '/api/bff/self-assessment/campaigns'
  }
} as const;

export type EndpointPath =
(typeof ENDPOINTS)[keyof typeof ENDPOINTS][keyof (typeof ENDPOINTS)[keyof typeof ENDPOINTS]];
