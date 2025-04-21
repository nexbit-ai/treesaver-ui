// Existing types
export type StatusType = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'PUSH_BACK' | 'RE_SUBMITTED';

// Mapping for API statuses to frontend display
export const STATUS_DISPLAY_MAP: Record<StatusType, string> = {
  'PENDING': 'Pending',
  'IN_REVIEW': 'In Review',
  'APPROVED': 'Approved',
  'PUSH_BACK': 'Pushed-Back',
  'RE_SUBMITTED': 'Re-Submitted'
};

// Mapping for status colors
export const STATUS_COLOR_MAP: Record<StatusType, { bg: string; text: string; border: string }> = {
  'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'IN_REVIEW': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'APPROVED': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'PUSH_BACK': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  'RE_SUBMITTED': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }
};

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface TestResult {
  testCaseName: string;
  result: 'pass' | 'fail';
  files: string;
}

export interface DocumentRequest {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: StatusType;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  auditId: string;
  requiredFiles: string[];
  uploadedFiles?: Array<{
    name: string;
    size: number;
  }>;
  auditor_expectation?: string;
  system_prompt?: string;
  documents?: Document[];
  testResults?: TestResult[];
}

// New types
export interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  industry: string;
  contactPerson: string;
}

export interface Audit {
  id: string;
  name: string;
  clientId: string;
  status: 'planned' | 'in-progress' | 'completed';
  startDate: string;
  endDate: string;
  fiscalYear: string;
  description?: string;
}

// Added User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'cpa' | 'client';
  clientId?: string; // For client users
  organization?: string;
}
