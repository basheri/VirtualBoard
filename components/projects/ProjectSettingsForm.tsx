'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProjectAction, deleteProjectAction } from '@/app/actions/projects';
import { toast } from 'sonner';
import { createProjectSchema, type CreateProject } from '@/lib/schemas/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from 'lucide-react';

interface ProjectSettingsFormProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    strategy: 'GROWTH' | 'SAFETY' | 'BALANCED';
  };
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const form = useForm<CreateProject>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: project.title,
      description: project.description || '',
      strategy: project.strategy,
    },
  });

  const onSubmit = async (data: CreateProject) => {
    setLoading(true);
    try {
      await updateProjectAction(project.id, data);
      toast.success('Project updated successfully');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteProjectAction(project.id);
      toast.success('Project deleted successfully');
      router.push('/dashboard/projects');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Update your project details and strategy
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
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
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
                        placeholder="Describe your project goals"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Strategy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BALANCED">Balanced</SelectItem>
                        <SelectItem value="GROWTH">Growth Focused</SelectItem>
                        <SelectItem value="SAFETY">Safety & Risk Focused</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This strategy will be the default for new meetings in this project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this project and all associated data (meetings, documents, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  project "{project.title}" and remove all data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Project'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
