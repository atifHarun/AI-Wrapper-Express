import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzeRequestSchema, type AnalyzeRequest } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { Loader2, FileJson, ShieldCheck, AlertCircle, Copy, Check, Sparkles } from "lucide-react";

const SAMPLE_JSON = {
  "useCaseName": "Customer Support Chatbot",
  "systemType": "Text-based conversational AI",
  "primaryFunction": "Answering FAQs and providing product tracking information.",
  "contextOfUse": {
    "industry": "Retail",
    "environment": "Customer-facing"
  },
  "stakeholders": {
    "primaryUsers": ["Customers", "Support Agents"],
    "indirectlyAffectedParties": ["Retail Managers"],
    "oversightOwners": ["Compliance Team"]
  },
  "decisionsAndActions": {
    "decisionsMadeBySystem": ["Identifying user intent", "Selecting best FAQ response"],
    "actionsExecutedAutomatically": ["Displaying tracking status"],
    "actionsRequiringHumanApproval": ["Processing refunds"]
  },
  "dataInputs": {
    "dataTypesUsed": ["Order IDs", "Customer Names"],
    "dataSources": ["Order Management System"],
    "personalOrSensitiveData": true
  },
  "modelAutonomyLevel": "Recommendation with human decision",
  "scaleAndReach": {
    "expectedNumberOfUsers": "1 million monthly",
    "frequencyOfUse": "Daily",
    "geographicScope": "National"
  }
};

export default function Home() {
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<{ jsonInput: string }>({
    defaultValues: {
      jsonInput: JSON.stringify(SAMPLE_JSON, null, 2),
    },
  });

  const mutation = useMutation({
    mutationFn: async (json: string) => {
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (e) {
        throw new Error("Invalid JSON format. Please ensure your input is valid JSON.");
      }
      const validated = analyzeRequestSchema.parse(parsed);
      const res = await apiRequest("POST", "/analyze", validated);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.analysis);
      toast({ title: "Analysis Complete", description: "The AI has generated the outcome projections." });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Analysis Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: { jsonInput: string }) => {
    mutation.mutate(data.jsonInput);
  };

  const fillSample = () => {
    form.setValue("jsonInput", JSON.stringify(SAMPLE_JSON, null, 2));
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ShieldCheck className="w-10 h-10" />
            <h1 className="text-4xl font-extrabold tracking-tight">AI Outcome Analyzer</h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground italic">
              "What are the other potential outcomes of this AI solution?"
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Analyze structured AI use cases for ethical, legal, and social impacts using our formal schema.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="lg:sticky lg:top-8 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileJson className="w-5 h-5 text-primary" />
                Input Use Case JSON
              </CardTitle>
              <CardDescription>
                Provide a structured definition based on the formal AI Use Case Schema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="jsonInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Paste your AI use case JSON here..."
                            className="font-mono text-sm min-h-[500px] resize-none border-2 focus-visible:ring-primary/20"
                            data-testid="input-json"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1 font-semibold h-11"
                      disabled={mutation.isPending}
                      data-testid="button-analyze"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        "Analyze Potential Outcomes"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={fillSample}
                      disabled={mutation.isPending}
                      className="h-11"
                      data-testid="button-sample"
                    >
                      Sample JSON
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-8 h-full">
            {mutation.isPending && (
              <Card className="animate-pulse border-primary/20 bg-muted/20">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-lg font-medium text-foreground">Generating Analysis...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The AI is projecting potential ethical, legal, and social impacts based on your formal definition.
                  </p>
                </CardContent>
              </Card>
            )}

            {result && !mutation.isPending && (
              <Card className="border-primary/20 shadow-xl overflow-hidden">
                <CardHeader className="border-b bg-muted/40 flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Analysis Results
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="h-8 px-2 gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy Markdown"}
                  </Button>
                </CardHeader>
                <CardContent className="p-6 prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </CardContent>
              </Card>
            )}

            {!result && !mutation.isPending && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/5">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                <p className="text-muted-foreground max-w-sm">
                  Fill in the formal JSON definition on the left and click analyze to generate an assessment.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="pt-12 border-t text-center space-y-4">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto italic px-4 py-3 bg-muted/30 rounded-lg">
            "This tool generates analytical projections of potential AI outcomes. It does not replace legal, ethical, or compliance review."
          </p>
          <div className="text-xs text-muted-foreground/60 font-mono">
            v1.1.0 | Formal Schema Support | Powered by GPT-5
          </div>
        </footer>
      </div>
    </div>
  );
}
