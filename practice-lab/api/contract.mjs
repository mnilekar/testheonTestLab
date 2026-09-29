export const apiVersion = '1.0.0';
export const fixtureVersion = '1.0.0';
export const defaultSeed = 4803;

export const resourceContracts = {
  users: {
    prefix: 'usr',
    required: ['name', 'email', 'role', 'active'],
    filters: ['role', 'active'],
    sortable: ['id', 'name', 'email', 'role', 'active'],
  },
  products: {
    prefix: 'prd',
    required: ['name', 'sku', 'category', 'price', 'stock', 'rating'],
    filters: ['category', 'stock'],
    sortable: ['id', 'name', 'sku', 'category', 'price', 'stock', 'rating'],
    cursor: true,
  },
  orders: {
    prefix: 'ord',
    required: ['customerId', 'status', 'total', 'items'],
    filters: ['status', 'customerId'],
    sortable: ['id', 'status', 'customerId', 'total', 'createdAt'],
  },
  customers: {
    prefix: 'cus',
    required: ['name', 'email', 'city', 'tier', 'active'],
    filters: ['city', 'tier', 'active'],
    sortable: ['id', 'name', 'email', 'city', 'tier', 'active'],
  },
  employees: {
    prefix: 'emp',
    required: ['name', 'department', 'location', 'title', 'active'],
    filters: ['department', 'location', 'active'],
    sortable: ['id', 'name', 'department', 'location', 'title', 'active'],
    cursor: true,
  },
  tasks: {
    prefix: 'tsk',
    required: ['title', 'status', 'priority', 'assigneeId', 'dueDate'],
    filters: ['status', 'priority', 'assigneeId'],
    sortable: ['id', 'title', 'status', 'priority', 'assigneeId', 'dueDate'],
  },
  tickets: {
    prefix: 'tkt',
    required: ['subject', 'status', 'priority', 'customerId', 'assigneeId'],
    filters: ['status', 'priority', 'customerId', 'assigneeId'],
    sortable: [
      'id',
      'subject',
      'status',
      'priority',
      'customerId',
      'assigneeId',
    ],
  },
  bookings: {
    prefix: 'bkg',
    required: ['guestName', 'city', 'checkIn', 'checkOut', 'status', 'total'],
    filters: ['city', 'status'],
    sortable: [
      'id',
      'guestName',
      'city',
      'checkIn',
      'checkOut',
      'status',
      'total',
    ],
  },
};

export const simulatedStatuses = [400, 401, 403, 404, 409, 422, 429, 500, 503];

export const budgets = {
  idleTtlSeconds: 2 * 60 * 60,
  absoluteTtlSeconds: 24 * 60 * 60,
  activeSessions: 100,
  overlayRecordsPerSession: 2000,
  pageLimit: 100,
  searchLength: 200,
  bodyBytes: 64 * 1024,
  globalStorageBytes: 256 * 1024 * 1024,
  maxDelayMs: 10_000,
  realRequestsPerMinute: 300,
  uploadFileBytes: 2 * 1024 * 1024,
  uploadFilesPerSession: 5,
  uploadBytesPerSession: 6 * 1024 * 1024,
  uploadTtlSeconds: 10 * 60,
  authLockAttempts: 3,
  authLockSeconds: 5 * 60,
  authAccessTokenSeconds: 2 * 60,
  authRefreshTokenSeconds: 15 * 60,
  authIdleMinimumSeconds: 5,
  authIdleMaximumSeconds: 30 * 60,
  storeCartQuantity: 20,
  storeCataloguePageSize: 48,
  storeScenarioTimeoutMs: 10_000,
};

export const authContract = {
  sharedDemoPassword: 'Practice@123',
  demoApiKey: 'testheon-demo-key-4803',
  accounts: [
    ['standard_user', 'Customer'],
    ['admin_user', 'Admin'],
    ['manager_user', 'Manager'],
    ['employee_user', 'Employee'],
    ['readonly_user', 'Read-only'],
    ['locked_user', 'Customer'],
    ['expired_user', 'Customer'],
    ['slow_user', 'Customer'],
  ],
  permissions: {
    Customer: ['profile.read', 'orders.create'],
    Employee: ['profile.read', 'tickets.update'],
    Manager: ['profile.read', 'tickets.update', 'reports.read'],
    Admin: [
      'profile.read',
      'orders.create',
      'tickets.update',
      'reports.read',
      'users.manage',
    ],
    'Read-only': ['profile.read', 'reports.read'],
  },
};

export const storeContract = {
  currency: 'INR',
  validCoupon: 'TESTHEON10',
  expiredCoupon: 'EXPIRED20',
  successfulTestCard: '4242424242424242',
  declinedTestCard: '4000000000000002',
  visualDate: '2026-10-15T09:30:00+05:30',
  catalogueSorts: [
    'featured',
    'price-asc',
    'price-desc',
    'rating-desc',
    'name-asc',
  ],
  nextRequestScenarios: [
    '401',
    '403',
    '404',
    '409',
    '422',
    '429',
    '500',
    '503',
    'timeout',
    'malformed',
    'empty',
  ],
};
