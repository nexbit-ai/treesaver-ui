// Existing types
export type StatusType = 'pending' | 'seen' | 'review' | 'approved' | 'rejected';

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
  description: string;
  dueDate: string;
  status: StatusType;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  auditId: string;
  requiredFiles: string[];
  uploadedFiles?: UploadedFile[];
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
