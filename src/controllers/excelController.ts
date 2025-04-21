import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';

const TEMPLATE_DIR = path.join(process.cwd(), 'uploads', 'templates');
const SOURCE_DIR = path.join(process.cwd(), 'uploads', 'source');

interface ExcelMapping {
  templateColumn: string;
  sourceColumn: string;
  sourceFile: string;
}

interface ExcelFile {
  id: string;
  name: string;
  data: any[];
  headers: string[];
}

const templates: Map<string, ExcelFile> = new Map();
const sourceFiles: Map<string, ExcelFile> = new Map();

export const excelController = {
  async uploadTemplate(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = XLSX.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      const headers = Object.keys(data[0] || {});

      const template: ExcelFile = {
        id: uuidv4(),
        name: req.file.originalname,
        data,
        headers,
      };

      templates.set(template.id, template);

      return res.json(template);
    } catch (error) {
      console.error('Error processing template:', error);
      return res.status(500).json({ error: 'Error processing template' });
    }
  },

  async uploadSourceFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = XLSX.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      const headers = Object.keys(data[0] || {});

      const sourceFile: ExcelFile = {
        id: uuidv4(),
        name: req.file.originalname,
        data,
        headers,
      };

      sourceFiles.set(sourceFile.id, sourceFile);

      return res.json(sourceFile);
    } catch (error) {
      console.error('Error processing source file:', error);
      return res.status(500).json({ error: 'Error processing source file' });
    }
  },

  async processMapping(req: Request, res: Response) {
    try {
      const { templateId, mappings } = req.body;

      const template = templates.get(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const previewData = template.data.map(row => {
        const mappedRow = { ...row };
        mappings.forEach((mapping: ExcelMapping) => {
          const sourceFile = Array.from(sourceFiles.values()).find(f => f.name === mapping.sourceFile);
          if (sourceFile) {
            const sourceRow = sourceFile.data[0]; // Just preview first row
            mappedRow[mapping.templateColumn] = sourceRow[mapping.sourceColumn];
          }
        });
        return mappedRow;
      });

      return res.json({ previewData: previewData.slice(0, 5) });
    } catch (error) {
      console.error('Error processing mapping:', error);
      return res.status(500).json({ error: 'Error processing mapping' });
    }
  },

  async downloadMappedData(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const { mappings } = req.body;

      const template = templates.get(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const finalData = template.data.map(row => {
        const mappedRow = { ...row };
        mappings.forEach((mapping: ExcelMapping) => {
          const sourceFile = Array.from(sourceFiles.values()).find(f => f.name === mapping.sourceFile);
          if (sourceFile) {
            const sourceRow = sourceFile.data.find(sr => 
              sr[mapping.sourceColumn] === row[mapping.templateColumn]
            );
            if (sourceRow) {
              mappedRow[mapping.templateColumn] = sourceRow[mapping.sourceColumn];
            }
          }
        });
        return mappedRow;
      });

      const ws = XLSX.utils.json_to_sheet(finalData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mapped Data");

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=mapped_data.xlsx');
      return res.send(buffer);
    } catch (error) {
      console.error('Error generating mapped data:', error);
      return res.status(500).json({ error: 'Error generating mapped data' });
    }
  },
}; 