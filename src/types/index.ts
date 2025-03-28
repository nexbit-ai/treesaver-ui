
// Central file for type definitions

// Document request statuses
export type StatusType = 'pending' | 'seen' | 'review' | 'approved' | 'rejected';

// File metadata
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url?: string;
}

// Document request interface
export interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  status: StatusType;
  requiredFiles: string[];
  dueDate: string;
  createdAt: string;
  uploadedFiles?: FileMetadata[];
  clientId?: string;
  auditorId?: string;
}

// User roles
export type UserRole = 'client' | 'auditor' | 'admin';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

// Comment interface
export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

// Audit interface
export interface Audit {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  auditorId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  requests: DocumentRequest[];
}
