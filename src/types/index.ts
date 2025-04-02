// Existing types
export type StatusType = 'pending' | 'inreview' | 'approved' | 'rejected';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface DocumentRequest {
  id: string;
  title: string;
  dueDate: string;
  status: StatusType;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  auditId: string;
  requiredFiles: Array<{
    name?: string;
    description?: string;
  }>;
  auditor_expectation?: string;
  system_prompt?: string;
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
