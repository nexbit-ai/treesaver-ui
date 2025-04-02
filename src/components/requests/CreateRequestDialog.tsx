import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, PlusCircle, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Client, Audit } from '@/types';
import { useClients } from '@/hooks/useClients';
import { useAudits } from '@/hooks/useAudits';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { Checkbox } from '@/components/ui/checkbox';
import { useQueryClient } from '@tanstack/react-query';

const requestFormSchema = z.object({
  title: z.string().min(3, { message: 'Request title is required' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  clientId: z.string().min(1, { message: 'Client is required' }),
  auditId: z.string().min(1, { message: 'Audit is required' }),
  expectations: z.array(z.string()).default(['']),
  systemChecks: z.object({
    checkTamperedDocuments: z.boolean().default(true),
    checkMissingPages: z.boolean().default(true),
    checkRequiredSignatures: z.boolean().default(true),
    checkCorrectDates: z.boolean().default(true),
    checkRequiredDocument: z.boolean().default(true)
  }),
  requiredFiles: z.array(
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    })
  ).default([])
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClientId?: string;
  selectedAuditId?: string;
}

const CreateRequestDialog: React.FC<CreateRequestDialogProps> = ({ 
  open, 
  onOpenChange,
  selectedClientId,
  selectedAuditId 
}) => {
  const { clients } = useClients();
  const { audits, getAuditsByClientId } = useAudits(selectedClientId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([]);
  const queryClient = useQueryClient();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      dueDate: new Date().toISOString().split('T')[0],
      clientId: selectedClientId || '',
      auditId: selectedAuditId || '',
      requiredFiles: [{ name: '', description: '' }],
      expectations: [''],
      systemChecks: {
        checkTamperedDocuments: true,
        checkMissingPages: true,
        checkRequiredSignatures: true,
        checkCorrectDates: true,
        checkRequiredDocument: true
      }
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        dueDate: new Date().toISOString().split('T')[0],
        clientId: selectedClientId || '',
        auditId: selectedAuditId || '',
        requiredFiles: [{ name: '', description: '' }],
        expectations: [''],
        systemChecks: {
          checkTamperedDocuments: true,
          checkMissingPages: true,
          checkRequiredSignatures: true,
          checkCorrectDates: true,
          checkRequiredDocument: true
        }
      });
      
      if (selectedClientId) {
        setFilteredAudits(audits);
      } else {
        setFilteredAudits([]);
      }
    }
  }, [open, selectedClientId, selectedAuditId, audits, form]);

  const { fields: requiredFilesFields, append: appendRequiredFile, remove: removeRequiredFile } = useFieldArray({
    control: form.control,
    name: "requiredFiles" as const
  });

  const { fields: expectationFields, append: appendExpectation, remove: removeExpectation } = useFieldArray({
    control: form.control,
    name: "expectations" as const
  });

  const handleClientChange = (clientId: string) => {
    // Update form values
    form.setValue('clientId', clientId);
    form.setValue('auditId', '');
    
    // If a new client is selected, we need to fetch their audits from mock data
    // since we're not re-fetching from the API in this component
    const clientAudits = getAuditsByClientId(clientId);
    setFilteredAudits(clientAudits);
  };

  const onSubmit = async (data: RequestFormValues) => {
    console.log('Creating request:', data);
    setIsSubmitting(true);
    
    try {
      const formattedDueDate = new Date(data.dueDate).toISOString();
      
      // Map system checks to hardcoded prompts
      const systemPrompts = [];
      if (data.systemChecks.checkTamperedDocuments) {
        systemPrompts.push("Check if the document has been tampered with or modified after creation");
      }
      if (data.systemChecks.checkMissingPages) {
        systemPrompts.push("Check for any missing pages in the document");
      }
      if (data.systemChecks.checkRequiredSignatures) {
        systemPrompts.push("Verify that all required signatures are present and valid");
      }
      if (data.systemChecks.checkCorrectDates) {
        systemPrompts.push("Validate that all dates in the document are correct and consistent");
      }
      if (data.systemChecks.checkRequiredDocument) {
        systemPrompts.push("Confirm that the submitted document matches the required document type");
      }

      // Filter out empty expectations and join them
      const auditorExpectations = data.expectations
        .filter(exp => exp.trim() !== '')
        .join('\n');
      
      const response = await apiService.createDocumentRequest(data.auditId, {
        name: data.title,
        expiry_date: formattedDueDate,
        auditor_expectation: auditorExpectations,
        system_prompt: systemPrompts.join('\n')
      });
      
      // Invalidate the document requests query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['documentRequests'] });
      
      toast.success("Document request created successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create document request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Document Request</DialogTitle>
          <DialogDescription>
            Create a new document request for your client with optional required files.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={handleClientChange}
                      value={field.value}
                      disabled={!!selectedClientId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auditId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Audit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.watch('clientId') || !!selectedAuditId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredAudits.length > 0 ? (
                          filteredAudits.map((audit) => (
                            <SelectItem key={audit.id} value={audit.id}>
                              {audit.name} ({audit.fiscalYear})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No audits available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Financial Statements" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Expectations</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendExpectation('')}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Expectation
                </Button>
              </div>

              <div className="space-y-3 rounded-md border p-4 bg-muted/20">
                {expectationFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`expectations.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="Enter expectation" 
                              {...field} 
                              className="h-8" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {expectationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpectation(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2">System Checks</Label>
              <div className="space-y-2 rounded-md border p-4 bg-muted/20">
                <FormField
                  control={form.control}
                  name="systemChecks.checkTamperedDocuments"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Check if the document is tampered
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systemChecks.checkMissingPages"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Check for missing pages
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systemChecks.checkRequiredSignatures"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Check for required signatures
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systemChecks.checkCorrectDates"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Check for correct dates
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="systemChecks.checkRequiredDocument"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Check if the submitted document is required
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Files (Optional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => appendRequiredFile({ name: '', description: '' })}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add File
                </Button>
              </div>

              <div className="space-y-3 rounded-md border p-4 bg-muted/20">
                {requiredFilesFields.map((field, index) => (
                  <div key={field.id} className="rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                        File {index + 1}
                      </h4>
                      {requiredFilesFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRequiredFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name={`requiredFiles.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Balance Sheet" {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`requiredFiles.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Please include all footnotes" 
                                {...field} 
                                className="h-8" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <span className="animate-spin">⧗</span>
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestDialog;
