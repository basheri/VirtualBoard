import { createServerClient } from '@/lib/supabase/server';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DeleteDocumentButton } from '@/components/documents/DeleteDocumentButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { FileText } from 'lucide-react';

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const projectId = (await params).projectId;
  const supabase = await createServerClient();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Manage documents that provide context to your AI Board of Advisors.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {!documents || documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents uploaded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <DeleteDocumentButton documentId={doc.id} projectId={projectId} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <DocumentUpload projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
