/**
 * Every internal href in the staff console. Kept separate from the citizen
 * app's route table on purpose: the two apps deploy independently and share
 * nothing but the API.
 */
export const routes = {
  home: "/",
  login: "/login",
  twoFactor: "/login/two-factor",

  complaints: {
    list: "/complaints",
    detail: (id: string) => `/complaints/${id}`,
  },

  serviceRequests: {
    list: "/service-requests",
    detail: (id: string) => `/service-requests/${id}`,
  },

  payments: {
    ledger: "/payments",
  },

  people: {
    users: "/people/users",
    staff: "/people/staff",
  },

  taxonomy: {
    departments: "/taxonomy/departments",
    categories: "/taxonomy/categories",
    wards: "/taxonomy/wards",
    zones: "/taxonomy/zones",
    serviceTypes: "/taxonomy/service-types",
  },

  reports: {
    sla: "/reports/sla",
  },

  oversight: {
    messages: "/oversight/messages",
    auditLogs: "/oversight/audit-logs",
    securityEvents: "/oversight/security-events",
  },

  settings: {
    system: "/settings",
    access: "/settings/access",
  },

  account: "/account",
  notifications: "/notifications",
} as const;

/** Everything except the sign-in screens needs a session cookie. */
export const PUBLIC_PREFIXES = ["/login"];
