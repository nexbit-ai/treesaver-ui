
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
  },
  {
    id: "client-5",
    name: "Green Energy Solutions",
    email: "info@greenenergy.com",
    companyName: "Green Energy Solutions Ltd.",
    industry: "Renewable Energy",
    contactPerson: "Michael Chen"
  },
  {
    id: "client-6",
    name: "Retail Dynamics",
    email: "contact@retaildynamics.com",
    companyName: "Retail Dynamics Corporation",
    industry: "Retail",
    contactPerson: "Emily Rodriguez"
  },
  {
    id: "client-7",
    name: "Construction Plus",
    email: "info@constructionplus.com",
    companyName: "Construction Plus Industries",
    industry: "Construction",
    contactPerson: "David Thompson"
  },
  {
    id: "client-8",
    name: "Education First",
    email: "contact@educationfirst.edu",
    companyName: "Education First University",
    industry: "Education",
    contactPerson: "Dr. Lisa Anderson"
  }
];

export const audits: Audit[] = [
  // Acme Corporation Audits
  {
    id: "audit-1",
    name: "2023 Annual Financial Audit",
    clientId: "client-1",
    status: "completed",
    startDate: "2023-01-15",
    endDate: "2023-03-20",
    fiscalYear: "2023",
    description: "Complete financial statement audit for fiscal year 2023"
  },
  {
    id: "audit-2",
    name: "2024 Q1 Financial Review",
    clientId: "client-1",
    status: "in-progress",
    startDate: "2024-04-01",
    endDate: "2024-05-15",
    fiscalYear: "2024",
    description: "Quarterly review of financial statements and internal controls"
  },
  {
    id: "audit-3",
    name: "2024 Tax Compliance Audit",
    clientId: "client-1",
    status: "planned",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    fiscalYear: "2024",
    description: "Comprehensive tax compliance and documentation review"
  },

  // TechVision Audits
  {
    id: "audit-4",
    name: "2023 Tax Compliance Audit",
    clientId: "client-2",
    status: "completed",
    startDate: "2023-02-10",
    endDate: "2023-04-15",
    fiscalYear: "2023",
    description: "Tax compliance audit and documentation review"
  },
  {
    id: "audit-5",
    name: "2024 Annual Audit",
    clientId: "client-2",
    status: "in-progress",
    startDate: "2024-01-20",
    endDate: "2024-03-25",
    fiscalYear: "2024",
    description: "Annual financial statement audit with IT controls assessment"
  },
  {
    id: "audit-6",
    name: "2024 SOC 2 Compliance Review",
    clientId: "client-2",
    status: "planned",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    fiscalYear: "2024",
    description: "SOC 2 Type II compliance audit for cloud services"
  },

  // Global Finance Audits
  {
    id: "audit-7",
    name: "2023 Regulatory Compliance Audit",
    clientId: "client-3",
    status: "completed",
    startDate: "2023-03-01",
    endDate: "2023-05-10",
    fiscalYear: "2023",
    description: "Regulatory compliance audit for financial services"
  },
  {
    id: "audit-8",
    name: "2024 Risk Management Assessment",
    clientId: "client-3",
    status: "in-progress",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    fiscalYear: "2024",
    description: "Comprehensive risk management and internal controls review"
  },
  {
    id: "audit-9",
    name: "2024 Anti-Money Laundering Review",
    clientId: "client-3",
    status: "planned",
    startDate: "2024-08-01",
    endDate: "2024-10-31",
    fiscalYear: "2024",
    description: "AML compliance and transaction monitoring audit"
  },

  // HealthPlus Audits
  {
    id: "audit-10",
    name: "2024 Internal Controls Review",
    clientId: "client-4",
    status: "in-progress",
    startDate: "2024-02-15",
    endDate: "2024-04-20",
    fiscalYear: "2024",
    description: "Review of internal controls and procedures for healthcare operations"
  },
  {
    id: "audit-11",
    name: "2024 HIPAA Compliance Audit",
    clientId: "client-4",
    status: "planned",
    startDate: "2024-05-01",
    endDate: "2024-07-31",
    fiscalYear: "2024",
    description: "HIPAA compliance and patient data security audit"
  },

  // Green Energy Solutions Audits
  {
    id: "audit-12",
    name: "2023 Environmental Compliance Audit",
    clientId: "client-5",
    status: "completed",
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    fiscalYear: "2023",
    description: "Environmental compliance and sustainability reporting audit"
  },
  {
    id: "audit-13",
    name: "2024 Financial Performance Review",
    clientId: "client-5",
    status: "in-progress",
    startDate: "2024-01-15",
    endDate: "2024-03-31",
    fiscalYear: "2024",
    description: "Financial performance and renewable energy project audit"
  },

  // Retail Dynamics Audits
  {
    id: "audit-14",
    name: "2024 Inventory Management Audit",
    clientId: "client-6",
    status: "in-progress",
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    fiscalYear: "2024",
    description: "Inventory management and retail operations audit"
  },
  {
    id: "audit-15",
    name: "2024 E-commerce Security Review",
    clientId: "client-6",
    status: "planned",
    startDate: "2024-09-01",
    endDate: "2024-11-30",
    fiscalYear: "2024",
    description: "E-commerce security and payment processing audit"
  },

  // Construction Plus Audits
  {
    id: "audit-16",
    name: "2024 Project Cost Audit",
    clientId: "client-7",
    status: "in-progress",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    fiscalYear: "2024",
    description: "Project cost analysis and construction management audit"
  },
  {
    id: "audit-17",
    name: "2024 Safety Compliance Review",
    clientId: "client-7",
    status: "planned",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    fiscalYear: "2024",
    description: "Safety compliance and workplace regulations audit"
  },

  // Education First Audits
  {
    id: "audit-18",
    name: "2024 Financial Aid Audit",
    clientId: "client-8",
    status: "in-progress",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    fiscalYear: "2024",
    description: "Financial aid distribution and student account audit"
  },
  {
    id: "audit-19",
    name: "2024 Research Grant Compliance",
    clientId: "client-8",
    status: "planned",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    fiscalYear: "2024",
    description: "Research grant compliance and academic program audit"
  }
];

