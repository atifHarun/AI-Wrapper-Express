import { z } from "zod";

export const SystemTypeEnum = z.enum([
  "Text-based conversational AI",
  "Voice-based conversational AI",
  "Decision support AI",
  "Agent assist AI",
]);

export const EnvironmentEnum = z.enum(["Internal", "Customer-facing", "Public"]);

export const AutonomyLevelEnum = z.enum([
  "Informational only",
  "Recommendation with human decision",
  "Action execution with human override",
  "Fully autonomous action",
]);

export const analyzeRequestSchema = z.object({
  useCaseName: z.string().min(1, "Use case name is required"),
  systemType: SystemTypeEnum,
  contextOfUse: z.object({
    industry: z.string().min(1, "Industry is required"),
    environment: EnvironmentEnum,
  }),
  modelAutonomyLevel: AutonomyLevelEnum,
  primaryFunction: z.string().optional(),
  stakeholders: z.string().optional(),
  decisionsAndActions: z.string().optional(),
  dataInputs: z.object({
    personalOrSensitiveData: z.boolean(),
  }).optional(),
  scaleAndReach: z.string().optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export type AnalyzeResponse = {
  analysis: string;
};
