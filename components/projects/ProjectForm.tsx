'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectAction } from '@/app/actions/projects';
import { toast } from 'sonner';
import { createProjectSchema, type CreateProject } from '@/lib/schemas/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

export function ProjectForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateProject>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      strategy: 'BALANCED',
    },
  });

  const onSubmit = async (data: CreateProject) => {
    setLoading(true);

    try {
      const result = await createProjectAction(data);
      toast.success('Project created successfully');
      router.push(`/dashboard/projects/${result.id}`);
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      toast.error(errorMessage);
      form.setError('root', {
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Set up a new project for your virtual advisory board
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
                      placeholder="Enter project title"
                      floatingLabel
                      label="Project Title"
                      error={form.formState.errors.title?.message}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a descriptive title for your advisory board project
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project goals and context"
                      label="Description (Optional)"
                      showCharCount
                      maxCharCount={500}
                      error={form.formState.errors.description?.message}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide context about your business or project objectives
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Strategy</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GROWTH">Growth Focused</SelectItem>
                      <SelectItem value="SAFETY">Safety First</SelectItem>
                      <SelectItem value="BALANCED">Balanced Approach</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how your advisory board should prioritize different perspectives
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-destructive animate-slide-down">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Project...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}