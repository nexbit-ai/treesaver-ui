import React, { useState } from 'react';
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

const requestFormSchema = z.object({
  title: z.string().min(3, { message: 'Request title is required' }),
  description: z.string().optional(),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  clientId: z.string().min(1, { message: 'Client is required' }),
  auditId: z.string().min(1, { message: 'Audit is required' }),
  requiredFiles: z.array(
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional().default([])
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
  const { audits, getAuditsByClientId } = useAudits();
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>(
    selectedClientId ? getAuditsByClientId(selectedClientId) : []
  );

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      clientId: selectedClientId || '',
      auditId: selectedAuditId || '',
      requiredFiles: [{ name: '', description: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requiredFiles"
  });

  const handleClientChange = (clientId: string) => {
    form.setValue('clientId', clientId);
    form.setValue('auditId', '');
    const clientAudits = getAuditsByClientId(clientId);
    setFilteredAudits(clientAudits);
  };

  const onSubmit = (data: RequestFormValues) => {
    console.log('Creating request:', data);
    toast.success("Document request created successfully");
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
                      onValueChange={(value) => handleClientChange(value)}
                      defaultValue={field.value}
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
                      defaultValue={field.value}
                      disabled={!form.watch('clientId')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredAudits.map((audit) => (
                          <SelectItem key={audit.id} value={audit.id}>
                            {audit.name} ({audit.fiscalYear})
                          </SelectItem>
                        ))}
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide your Q1 2024 financial statements including balance sheet, income statement, and cash flow statement." 
                      className="h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  onClick={() => append({ name: '', description: '' })}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add File
                </Button>
              </div>

              <div className="space-y-3 rounded-md border p-4 bg-muted/20">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border bg-card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                        File {index + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
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
              <Button type="submit">Create Request</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestDialog;
