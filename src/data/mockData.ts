
import { StatusType } from '@/types';

// Using this interface for backward compatibility
// but it should match the one in /src/types/index.ts
export interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  requiredFiles: string[];
  status: StatusType;
  dueDate: string;
  createdAt: string;
  updatedAt: string; // Added to match type in index.ts
  clientId: string;  // Added to match type in index.ts
  auditId: string;   // Added to match type in index.ts
  uploadedFiles?: {
    id?: string;     // Added to match UploadedFile in index.ts
    name: string;
    size: number;
    uploadedAt: string;
    url?: string;    // Added to match UploadedFile in index.ts
  }[];
}

export const documentRequests: DocumentRequest[] = [
  {
    id: '1',
    title: 'Financial Statements',
    description: 'Please upload your latest financial statements including balance sheet, income statement, and cash flow statement.',
    requiredFiles: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement'],
    status: 'pending',
    dueDate: '2023-12-15',
    createdAt: '2023-11-30',
    updatedAt: '2023-11-30',
    clientId: 'client1',
    auditId: 'audit1',
  },
  {
    id: '2',
    title: 'Tax Documents',
    description: 'We need your latest tax returns for the previous fiscal year.',
    requiredFiles: ['Tax Return', 'W-2 Forms', 'Additional Schedules'],
    status: 'rejected',
    dueDate: '2023-12-10',
    createdAt: '2023-11-25',
    updatedAt: '2023-11-25',
    clientId: 'client1',
    auditId: 'audit1',
    uploadedFiles: [
      { 
        id: 'file1',
        name: 'Tax_Return_2022.pdf', 
        size: 1024 * 1024 * 2.1, 
        uploadedAt: '2023-12-01',
        url: '/files/tax_return_2022.pdf'
      },
      { 
        id: 'file2',
        name: 'W2_Forms_2022.pdf', 
        size: 1024 * 512, 
        uploadedAt: '2023-12-01',
        url: '/files/w2_forms_2022.pdf'
      }
    ]
  },
  {
    id: '3',
    title: 'Business Plan',
    description: 'Please provide a detailed business plan including market analysis, financial projections, and expansion strategy.',
    requiredFiles: ['Business Plan', 'Financial Projections', 'Market Analysis'],
    status: 'review',
    dueDate: '2023-12-20',
    createdAt: '2023-11-28',
    updatedAt: '2023-11-28',
    clientId: 'client2',
    auditId: 'audit3',
    uploadedFiles: [
      { 
        id: 'file3',
        name: 'Business_Plan_2023.pdf', 
        size: 1024 * 1024 * 3.7, 
        uploadedAt: '2023-12-02',
        url: '/files/business_plan_2023.pdf'
      },
      { 
        id: 'file4',
        name: 'Financial_Projections.xlsx', 
        size: 1024 * 1024 * 1.2, 
        uploadedAt: '2023-12-02',
        url: '/files/financial_projections.xlsx'
      },
      { 
        id: 'file5',
        name: 'Market_Analysis.pdf', 
        size: 1024 * 1024 * 2.5, 
        uploadedAt: '2023-12-02',
        url: '/files/market_analysis.pdf'
      }
    ]
  },
  {
    id: '4',
    title: 'Identification Documents',
    description: 'Please upload identification documents for all company directors, including passport or driver\'s license.',
    requiredFiles: ['Passport/ID', 'Proof of Address'],
    status: 'approved',
    dueDate: '2023-12-05',
    createdAt: '2023-11-20',
    updatedAt: '2023-11-20',
    clientId: 'client2',
    auditId: 'audit3',
    uploadedFiles: [
      { 
        id: 'file6',
        name: 'ID_Documents_Combined.pdf', 
        size: 1024 * 1024 * 1.8, 
        uploadedAt: '2023-11-25',
        url: '/files/id_documents.pdf'
      },
      { 
        id: 'file7',
        name: 'Proof_of_Address.pdf', 
        size: 1024 * 768, 
        uploadedAt: '2023-11-25',
        url: '/files/proof_of_address.pdf'
      }
    ]
  },
  {
    id: '5',
    title: 'Annual Report',
    description: 'Please upload your company\'s annual report for the previous year.',
    requiredFiles: ['Annual Report', 'Shareholder Information'],
    status: 'rejected',
    dueDate: '2023-12-12',
    createdAt: '2023-11-22',
    updatedAt: '2023-11-22',
    clientId: 'client1',
    auditId: 'audit2',
    uploadedFiles: [
      { 
        id: 'file8',
        name: 'Annual_Report_Draft.pdf', 
        size: 1024 * 1024 * 4.2, 
        uploadedAt: '2023-11-30',
        url: '/files/annual_report_draft.pdf'
      }
    ]
  },
  {
    id: '6',
    title: 'Bank Statements',
    description: 'Please provide the last 3 months of bank statements for all business accounts.',
    requiredFiles: ['Bank Statements', 'Transaction Records'],
    status: 'pending',
    dueDate: '2023-12-18',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01',
    clientId: 'client3',
    auditId: 'audit4',
  },
  {
    id: '7',
    title: 'Property Documents',
    description: 'Please upload all documents related to your commercial property, including deeds, leases, and insurance.',
    requiredFiles: ['Property Deeds', 'Lease Agreements', 'Insurance Policies'],
    status: 'pending',
    dueDate: '2023-12-25',
    createdAt: '2023-12-02',
    updatedAt: '2023-12-02',
    clientId: 'client3',
    auditId: 'audit4',
  }
];
