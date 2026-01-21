'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileText, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        form.setValue('file', files);
        if (!form.getValues('title')) {
          form.setValue('title', file.name.replace('.pdf', ''));
        }
      } else {
        setError('Only PDF files are supported');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      if (!form.getValues('title')) {
        form.setValue('title', files[0].name.replace('.pdf', ''));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue('file', undefined);
  };

  const onSubmit = async (data: UploadFormValues) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      const file = data.file[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', data.title);
      formData.append('projectId', projectId);

      // Simulate progress (in real implementation, use XMLHttpRequest for actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 1. Upload file and process (extract text + generate embedding)
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document');
      }

      setSuccess('Document uploaded and processed successfully!');
      form.reset();
      setSelectedFile(null);
      router.refresh();
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <Card className="hover-lift">
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
                  <FormControl>
                    <Input
                      placeholder="e.g., Annual Financial Report 2024"
                      floatingLabel
                      label="Document Title"
                      error={form.formState.errors.title?.message}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear title helps identify this document.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>PDF Document</FormLabel>
                  <FormControl>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer",
                        isDragging
                          ? "border-primary bg-primary/5 scale-105"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
                      )}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          onChange(e.target.files);
                          handleFileSelect(e);
                        }}
                        {...field}
                        className="hidden"
                        id="file-upload"
                      />

                      {!selectedFile ? (
                        <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload className="h-10 w-10 text-gray-400" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                              Drop your PDF here or click to browse
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Max size: 10MB
                            </p>
                          </div>
                        </label>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-between bg-white p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Text must be selectable (not scanned images).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={uploading || !selectedFile} className="w-full">
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
