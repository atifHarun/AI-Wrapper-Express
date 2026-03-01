import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Copy, Loader2, AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { useAnalyze } from "@/hooks/use-analyze";
import { analyzeRequestSchema, type AnalyzeRequest } from "@shared/schema";
import { Header } from "@/components/layout/Header";

export default function Home() {
  const { mutate: analyze, isPending, data, error } = useAnalyze();
  const [copied, setCopied] = useState(false);

  const form = useForm<AnalyzeRequest>({
    resolver: zodResolver(analyzeRequestSchema),
    defaultValues: {
      useCase: "",
      description: "",
    },
  });

  const onSubmit = (values: AnalyzeRequest) => {
    analyze(values);
  };

  const handleCopy = () => {
    if (data?.analysis) {
      navigator.clipboard.writeText(data.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center">
      <Header />
      
      <main className="w-full max-w-3xl mx-auto px-6 pt-32 pb-24 flex-1 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full space-y-12"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-muted rounded-2xl mb-4 shadow-inner">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-foreground">
              Define your use case. <br/>
              <span className="font-semibold text-primary">Let AI do the rest.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Describe your specific scenario and technical requirements to instantly generate structured architectural analysis.
            </p>
          </motion.div>

          {/* Form Section */}
          <motion.div variants={itemVariants} className="bg-card border border-border shadow-2xl shadow-black/[0.03] rounded-3xl p-6 md:p-10 relative z-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="useCase" className="block text-sm font-medium text-foreground mb-2">
                    Primary Use Case
                  </label>
                  <input
                    id="useCase"
                    type="text"
                    {...form.register("useCase")}
                    className="w-full bg-transparent border-b-2 border-border/60 py-3 px-1 text-lg 
                             focus:outline-none focus:border-primary transition-colors duration-300
                             placeholder:text-muted-foreground/40"
                    placeholder="e.g., Real-time collaboration platform"
                    disabled={isPending}
                  />
                  {form.formState.errors.useCase && (
                    <p className="mt-2 text-sm text-destructive font-medium">
                      {form.formState.errors.useCase.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Context & Requirements
                  </label>
                  <textarea
                    id="description"
                    {...form.register("description")}
                    rows={4}
                    className="w-full bg-muted/30 border border-border rounded-xl p-4 text-base
                             focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 
                             transition-all duration-300 resize-none placeholder:text-muted-foreground/40"
                    placeholder="Describe the scale, specific constraints, and desired outcomes..."
                    disabled={isPending}
                  />
                  {form.formState.errors.description && (
                    <p className="mt-2 text-sm text-destructive font-medium">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/5 text-destructive border border-destructive/10 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{error.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 
                         bg-primary text-primary-foreground rounded-xl font-semibold tracking-wide 
                         hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 
                         disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                         shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Architecture...
                    </>
                  ) : (
                    <>
                      Generate Analysis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {data && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="pt-8"
              >
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/[0.02]">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Analysis Result
                    </h2>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="prose prose-zinc max-w-none 
                                  prose-headings:font-semibold prose-headings:tracking-tight 
                                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                                  prose-p:text-muted-foreground prose-p:leading-relaxed
                                  prose-a:text-primary hover:prose-a:text-primary/80
                                  prose-strong:text-foreground prose-strong:font-semibold
                                  prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
                                  prose-pre:bg-primary prose-pre:text-primary-foreground prose-pre:shadow-lg">
                      <ReactMarkdown>{data.analysis}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
