'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  file: z.any()
    .refine((files) => files?.length === 1, 'File is required')
    .refine(
      (files) => files?.[0]?.type === 'application/pdf',
      'Only PDF files are supported'
    )
    .refine(
      (files) => files?.[0]?.size <= 10 * 1024 * 1024,
      'Max file size is 10MB'
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface DocumentUploadProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

export function DocumentUpload({ projectId, onUploadSuccess }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data: UploadFormValues) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const file = data.file[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', data.title);
      formData.append('projectId', projectId);

      // 1. Upload file and process (extract text + generate embedding)
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document');
      }

      setSuccess('Document uploaded and processed successfully!');
      form.reset();
      router.refresh();
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Knowledge Base Document</CardTitle>
        <CardDescription>
          Upload PDF documents (contracts, reports, guidelines) to give the AI context.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Annual Financial Report 2024" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear title helps identify this document.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>PDF Document</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                        className="cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Max size: 10MB. Text must be selectable (not scanned images).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Embed
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
