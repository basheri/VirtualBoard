'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMeetingSchema, type CreateMeeting } from '@/lib/schemas/meeting';
import { AGENTS, AgentRole } from '@/lib/ai/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createMeetingAction } from '@/app/actions/meetings';

export default function NewMeetingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const form = useForm<CreateMeeting>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: '',
      strategy: 'BALANCED',
      agentIds: ['moderator'],
    },
  });

  // التحقق من وجود projectId
  if (!projectId) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center">
          <p className="text-muted-foreground">Project ID not found</p>
          <Button onClick={() => router.push('/dashboard/projects')} variant="outline" className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CreateMeeting) => {
    setLoading(true);
    
    try {
      const result = await createMeetingAction(projectId, data);
      router.push(`/dashboard/projects/${projectId}/meetings/${result.id}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
      form.setError('root', {
        message: 'Failed to create meeting. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableAgents = AGENTS.filter(agent => agent.role !== 'MODERATOR');

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Meeting</CardTitle>
          <CardDescription>
            Set up a new advisory board meeting with selected AI advisors
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
                    <FormLabel>Meeting Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter meeting title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your advisory meeting a descriptive title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Strategy</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-4">
                        {(['GROWTH', 'SAFETY', 'BALANCED'] as const).map((strategy) => (
                          <Button
                            key={strategy}
                            type="button"
                            variant={field.value === strategy ? 'default' : 'outline'}
                            onClick={() => field.onChange(strategy)}
                            className="h-auto py-3"
                          >
                            <div className="text-center">
                              <div className="font-medium">{strategy}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {strategy === 'GROWTH' && 'Focus on growth opportunities'}
                                {strategy === 'SAFETY' && 'Prioritize risk mitigation'}
                                {strategy === 'BALANCED' && 'Balanced perspectives'}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose how your advisory board should prioritize different perspectives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Advisors</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {availableAgents.map((agent) => (
                          <div key={agent.id} className="flex items-center space-x-3 rounded-lg border p-4">
                            <Checkbox
                              checked={field.value.includes(agent.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, agent.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== agent.id));
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{agent.name}</h4>
                                <Badge variant="outline">{agent.role}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {agent.role === 'CFO' && 'Financial analysis and budget planning'}
                                {agent.role === 'CTO' && 'Technical feasibility and architecture'}
                                {agent.role === 'LEGAL' && 'Legal compliance and risk assessment'}
                                {agent.role === 'CMO' && 'Market analysis and growth strategies'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select the advisors you want to participate in this meeting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Meeting...' : 'Create Meeting'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
