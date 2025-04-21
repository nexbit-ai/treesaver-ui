import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ExcelFile {
  name: string;
  data: any[][];
  headers: string[];
  sheets: string[];
  selectedSheet: string;
  headerRow: number;
  rawData: ArrayBuffer;
}

interface ColumnMapping {
  templateColumn: string;
  sourceColumn: string;
  sourceFile: string;
}

const ExcelMapper: React.FC = () => {
  const [templateFile, setTemplateFile] = useState<ExcelFile | null>(null);
  const [sourceFiles, setSourceFiles] = useState<ExcelFile[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [currentFile, setCurrentFile] = useState<ExcelFile | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsLoading(true);
    try {
      for (const file of acceptedFiles) {
        const data = await readExcelFile(file);
        if (!templateFile) {
          setTemplateFile(data);
          setCurrentFile(data);
          setShowSheetSelector(true);
        } else {
          setSourceFiles(prev => [...prev, data]);
          setCurrentFile(data);
          setShowSheetSelector(true);
        }
      }
    } catch (error) {
      toast.error('Error reading Excel file');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<ExcelFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data || typeof data === 'string') {
            throw new Error('Invalid file data');
          }
          const workbook = XLSX.read(data, { type: 'array' });
          const sheets = workbook.SheetNames;
          
          // Get the first sheet's data for initial display
          const firstSheet = workbook.Sheets[sheets[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Ensure we have a valid 2D array
          const sheetData = Array.isArray(jsonData) ? jsonData.map(row => 
            Array.isArray(row) ? row : []
          ) : [];
          
          resolve({
            name: file.name,
            data: sheetData,
            headers: [],
            sheets,
            selectedSheet: sheets[0],
            headerRow: 0,
            rawData: data
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSheetSelect = (file: ExcelFile, sheetName: string) => {
    try {
      // Use the stored raw data to read the workbook
      const workbook = XLSX.read(file.rawData, { type: 'array' });
      const sheet = workbook.Sheets[sheetName];
      
      // Convert sheet to array of arrays
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Ensure we have a valid 2D array
      const sheetData = Array.isArray(jsonData) ? jsonData.map(row => 
        Array.isArray(row) ? row : []
      ) : [];
      
      const updatedFile = {
        ...file,
        selectedSheet: sheetName,
        data: sheetData,
        headers: []
      };

      if (file === templateFile) {
        setTemplateFile(updatedFile);
      } else {
        setSourceFiles(prev => 
          prev.map(f => f.name === file.name ? updatedFile : f)
        );
      }
      setCurrentFile(updatedFile);
    } catch (error) {
      console.error('Error reading sheet:', error);
      toast.error('Error reading sheet data');
    }
  };

  const handleHeaderRowSelect = (file: ExcelFile, rowIndex: number) => {
    const headers = file.data[rowIndex] as string[];
    const updatedFile = {
      ...file,
      headerRow: rowIndex,
      headers: headers.filter(h => h !== undefined && h !== null && h !== '')
    };

    if (file === templateFile) {
      setTemplateFile(updatedFile);
    } else {
      setSourceFiles(prev => 
        prev.map(f => f.name === file.name ? updatedFile : f)
      );
    }
    setCurrentFile(updatedFile);
  };

  const handleConfirmHeaders = () => {
    if (currentFile) {
      if (currentFile === templateFile) {
        setTemplateFile(currentFile);
      } else {
        setSourceFiles(prev => 
          prev.map(f => f.name === currentFile.name ? currentFile : f)
        );
      }
      setShowSheetSelector(false);
      toast.success('Headers selected successfully');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true
  });

  const handleMappingChange = (index: number, field: keyof ColumnMapping, value: string) => {
    setMappings(prev => {
      const newMappings = [...prev];
      if (!newMappings[index]) {
        newMappings[index] = { templateColumn: '', sourceColumn: 'none', sourceFile: 'none' };
      }
      
      // If changing the source file, reset the source column
      if (field === 'sourceFile') {
        newMappings[index] = { 
          ...newMappings[index], 
          sourceFile: value === 'none' ? '' : value,
          sourceColumn: 'none'
        };
      } else {
        newMappings[index] = { 
          ...newMappings[index], 
          [field]: value === 'none' ? '' : value 
        };
      }
      return newMappings;
    });
  };

  const generatePreview = () => {
    if (!templateFile || !templateFile.headers.length) {
      toast.error('Please select headers for the template file first');
      return;
    }

    try {
      const preview: any[][] = [];
      
      // Add template headers as the first row
      preview.push(templateFile.headers);

      // Process each source file
      sourceFiles.forEach(sourceFile => {
        // Filter mappings for this source file, ensuring we only include valid mappings
        const fileMappings = mappings.filter(m => 
          m && m.sourceFile === sourceFile.name && m.sourceColumn !== 'none'
        );
        
        if (fileMappings.length === 0) return;

        // Get the source file's data for the selected sheet
        const workbook = XLSX.read(sourceFile.rawData, { type: 'array' });
        const sheet = workbook.Sheets[sourceFile.selectedSheet];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Get the header row from the source file
        const sourceHeaders = sheetData[sourceFile.headerRow] as string[];
        
        // Start from the row after the header row
        sheetData.slice(sourceFile.headerRow + 1).forEach(row => {
          const mappedRow = templateFile.headers.map(header => {
            const mapping = fileMappings.find(m => m.templateColumn === header);
            if (!mapping) return ''; // Return empty string for unmapped columns
            
            // Find the index of the source column in the source headers
            const sourceIndex = sourceHeaders.indexOf(mapping.sourceColumn);
            return sourceIndex >= 0 ? row[sourceIndex] : '';
          });
          preview.push(mappedRow);
        });
      });

      setPreviewData(preview);
      toast.success('Preview generated successfully');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Error generating preview');
    }
  };

  const handleExport = () => {
    if (previewData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const ws = XLSX.utils.aoa_to_sheet(previewData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mapped Data');
      XLSX.writeFile(wb, 'mapped_data.xlsx');
      toast.success('File exported successfully');
    } catch (error) {
      toast.error('Error exporting file');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Excel Mapper</h1>
      
      <Sheet open={showSheetSelector} onOpenChange={setShowSheetSelector}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Select Sheet and Header Row</SheetTitle>
          </SheetHeader>
          {currentFile && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Select Sheet</Label>
                <Select
                  value={currentFile.selectedSheet}
                  onValueChange={(value) => handleSheetSelect(currentFile, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentFile.sheets.map((sheet) => (
                      <SelectItem key={sheet} value={sheet}>
                        {sheet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Select Header Row</Label>
                <div className="max-h-60 overflow-auto border rounded">
                  <table className="w-full">
                    <tbody>
                      {currentFile.data.slice(0, 10).map((row, index) => (
                        <tr 
                          key={index}
                          className={`cursor-pointer hover:bg-muted ${
                            currentFile.headerRow === index ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => handleHeaderRowSelect(currentFile, index)}
                        >
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2 border">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Click on a row to select it as the header row
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowSheetSelector(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmHeaders}>
                  Confirm Headers
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="mapping" disabled={!templateFile || sourceFiles.length === 0}>
            Map Columns
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={mappings.length === 0}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Excel Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                >
                  <input {...getInputProps()} />
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : isDragActive ? (
                    <p>Drop the files here...</p>
                  ) : (
                    <p>Drag and drop Excel files here, or click to select files</p>
                  )}
                </div>

                {templateFile && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Template File:</h3>
                    <p>{templateFile.name}</p>
                    <div className="mt-2">
                      <h4 className="font-medium">Headers:</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {templateFile.headers.map((header, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded">
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {sourceFiles.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Source Files:</h3>
                    <div className="space-y-2">
                      {sourceFiles.map((file, index) => (
                        <div key={index} className="p-2 border rounded">
                          <p>{file.name}</p>
                          <div className="mt-2">
                            <h4 className="font-medium">Headers:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {file.headers.map((header, i) => (
                                <span key={i} className="px-2 py-1 bg-muted rounded">
                                  {header}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which columns from the source files should be mapped to the template columns.
                  Leave unmapped if you don't want to populate that column.
                </p>
                {templateFile?.headers.map((templateHeader, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <Label>Template Column</Label>
                      <Input value={templateHeader} disabled />
                    </div>
                    <div>
                      <Label>Source Column</Label>
                      <div className="space-y-2">
                        <Select
                          value={mappings[index]?.sourceFile || 'none'}
                          onValueChange={(value) => handleMappingChange(index, 'sourceFile', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source file" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {sourceFiles.map((file) => (
                              <SelectItem key={file.name} value={file.name}>
                                {file.name} ({file.selectedSheet})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={mappings[index]?.sourceColumn || 'none'}
                          onValueChange={(value) => handleMappingChange(index, 'sourceColumn', value)}
                          disabled={!mappings[index]?.sourceFile}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {mappings[index]?.sourceFile && 
                              sourceFiles
                                .find(f => f.name === mappings[index]?.sourceFile)
                                ?.headers.map((header) => (
                                  <SelectItem key={header} value={header}>
                                    {header}
                                  </SelectItem>
                                ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button onClick={generatePreview} className="mt-4">
                  Generate Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Mapped Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previewData.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border">
                        <thead>
                          <tr>
                            {previewData[0].map((header, index) => (
                              <th key={index} className="border p-2 bg-muted">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border p-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button onClick={handleExport} className="mt-4">
                      Export to Excel
                    </Button>
                  </>
                ) : (
                  <p>No preview data available. Please generate a preview first.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExcelMapper; 