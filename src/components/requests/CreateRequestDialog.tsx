
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, PlusCircle, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const requestFormSchema = z.object({
  title: z.string().min(3, { message: 'Request title is required' }),
  description: z.string().min(10, { message: 'Request description is required' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  requiredFiles: z.array(
    z.object({
      name: z.string().min(1, { message: 'File name is required' })
    })
  ).min(1, { message: 'At least one required file must be specified' })
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateRequestDialog: React.FC<CreateRequestDialogProps> = ({ open, onOpenChange }) => {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      requiredFiles: [{ name: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "requiredFiles"
  });

  const onSubmit = (data: RequestFormValues) => {
    console.log('Creating request:', data);
    // Here we would typically call the API to create the request
    // For now, just close the dialog
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Document Request</DialogTitle>
          <DialogDescription>
            Create a new document request to send to your client.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                  <FormLabel>Description</FormLabel>
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
                <Label>Required Files</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ name: '' })}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add File
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <FormField
                      control={form.control}
                      name={`requiredFiles.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Balance Sheet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
