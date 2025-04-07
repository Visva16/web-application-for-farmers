import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, ClipboardCopy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { getClientTroubleshootingGuide } from '@/api/troubleshooting';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Step {
  title: string;
  command: string;
  description: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

interface Resource {
  title: string;
  url: string;
}

interface TroubleshootingGuide {
  title: string;
  issues: Issue[];
  additionalResources: Resource[];
}

export function Troubleshooting() {
  const [guide, setGuide] = useState<TroubleshootingGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommands, setCopiedCommands] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchTroubleshootingGuide = async () => {
      try {
        const data = await getClientTroubleshootingGuide();
        setGuide(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch troubleshooting guide');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err.message || 'Failed to fetch troubleshooting guide'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTroubleshootingGuide();
  }, [toast]);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCommands({ ...copiedCommands, [stepId]: true });
      setTimeout(() => {
        setCopiedCommands((prev) => ({ ...prev, [stepId]: false }));
      }, 2000);

      toast({
        title: 'Copied to clipboard',
        description: 'Command copied to clipboard'
      });
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error Loading Troubleshooting Guide</CardTitle>
          <CardDescription>We encountered an error while loading the troubleshooting guide.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{guide.title}</h1>

      <Tabs defaultValue={guide.issues[0]?.id}>
        <TabsList className="mb-4">
          {guide.issues.map((issue) => (
            <TabsTrigger key={issue.id} value={issue.id}>
              {issue.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {guide.issues.map((issue) => (
          <TabsContent key={issue.id} value={issue.id}>
            <Card>
              <CardHeader>
                <CardTitle>{issue.title}</CardTitle>
                <CardDescription>{issue.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {issue.steps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-2">Step {index + 1}: {step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      <div className="bg-secondary rounded-md p-3 flex justify-between items-center">
                        <code className="text-sm font-mono">{step.command}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(step.command, `${issue.id}-${index}`)}
                        >
                          {copiedCommands[`${issue.id}-${index}`] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <ClipboardCopy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
          <CardDescription>
            Check these resources for more detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {guide.additionalResources.map((resource, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-2" />}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-2 text-sm hover:underline"
                >
                  <span>{resource.title}</span>
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}