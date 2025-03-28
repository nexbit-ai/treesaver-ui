
import { Client, Audit } from '@/types';

export const clients: Client[] = [
  {
    id: "client-1",
    name: "Acme Corporation",
    email: "contact@acmecorp.com",
    companyName: "Acme Corporation Inc.",
    industry: "Manufacturing",
    contactPerson: "John Doe"
  },
  {
    id: "client-2",
    name: "TechVision",
    email: "info@techvision.com",
    companyName: "TechVision LLC",
    industry: "Technology",
    contactPerson: "Jane Smith"
  },
  {
    id: "client-3",
    name: "Global Finance",
    email: "support@globalfinance.com",
    companyName: "Global Finance Group",
    industry: "Financial Services",
    contactPerson: "Robert Johnson"
  },
  {
    id: "client-4",
    name: "HealthPlus",
    email: "contact@healthplus.org",
    companyName: "HealthPlus Medical Group",
    industry: "Healthcare",
    contactPerson: "Sarah Williams"
  }
];

export const audits: Audit[] = [
  {
    id: "audit-1",
    name: "2023 Annual Audit",
    clientId: "client-1",
    status: "completed",
    startDate: "2023-01-15",
    endDate: "2023-03-20",
    fiscalYear: "2023",
    description: "Complete financial statement audit for fiscal year 2023"
  },
  {
    id: "audit-2",
    name: "2024 Q1 Review",
    clientId: "client-1",
    status: "in-progress",
    startDate: "2024-04-01",
    endDate: "2024-05-15",
    fiscalYear: "2024",
    description: "Quarterly review of financial statements"
  },
  {
    id: "audit-3",
    name: "2023 Tax Audit",
    clientId: "client-2",
    status: "completed",
    startDate: "2023-02-10",
    endDate: "2023-04-15",
    fiscalYear: "2023",
    description: "Tax compliance audit"
  },
  {
    id: "audit-4",
    name: "2024 Annual Audit",
    clientId: "client-2",
    status: "planned",
    startDate: "2024-01-20",
    endDate: "2024-03-25",
    fiscalYear: "2024"
  },
  {
    id: "audit-5",
    name: "2023 Compliance Audit",
    clientId: "client-3",
    status: "completed",
    startDate: "2023-03-01",
    endDate: "2023-05-10",
    fiscalYear: "2023",
    description: "Regulatory compliance audit"
  },
  {
    id: "audit-6",
    name: "2024 Internal Controls Review",
    clientId: "client-4",
    status: "in-progress",
    startDate: "2024-02-15",
    endDate: "2024-04-20",
    fiscalYear: "2024",
    description: "Review of internal controls and procedures"
  }
];
