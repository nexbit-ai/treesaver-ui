// Existing types
export type StatusType = 'pending' | 'InReview' | 'approved' | 'rejected';

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
