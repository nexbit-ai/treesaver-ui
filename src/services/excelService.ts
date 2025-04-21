import { apiService } from './api';

export interface ExcelMapping {
  templateColumn: string;
  sourceColumn: string;
  sourceFile: string;
}

export interface ExcelFile {
  name: string;
  data: any[];
  headers: string[];
}

export const excelService = {
  async uploadTemplate(file: File): Promise<ExcelFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.post('/excel/upload-template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async uploadSourceFile(file: File): Promise<ExcelFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.post('/excel/upload-source', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async processMapping(templateId: string, mappings: ExcelMapping[]): Promise<any> {
    const response = await apiService.post('/excel/process-mapping', {
      templateId,
      mappings,
    });
    
    return response.data;
  },

  async downloadMappedData(templateId: string): Promise<Blob> {
    const response = await apiService.get(`/excel/download/${templateId}`, {
      responseType: 'blob',
    });
    
    return response.data;
  },
}; 