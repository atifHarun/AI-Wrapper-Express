import { z } from "zod";

export const analyzeRequestSchema = z.object({
  useCase: z.string().min(1, "Use case is required"),
  description: z.string().min(1, "Description is required"),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export type AnalyzeResponse = {
  analysis: string;
};
