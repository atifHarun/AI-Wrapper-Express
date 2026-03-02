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
  useCaseName: z.string().min(1, "The name of the specific AI implementation is required."),
  systemType: SystemTypeEnum,
  primaryFunction: z.string().optional(),
  contextOfUse: z.object({
    industry: z.string().min(1, "Industry is required"),
    environment: EnvironmentEnum,
  }),
  stakeholders: z.object({
    primaryUsers: z.array(z.string()).optional(),
    indirectlyAffectedParties: z.array(z.string()).optional(),
    oversightOwners: z.array(z.string()).optional(),
  }).optional(),
  decisionsAndActions: z.object({
    decisionsMadeBySystem: z.array(z.string()).optional(),
    actionsExecutedAutomatically: z.array(z.string()).optional(),
    actionsRequiringHumanApproval: z.array(z.string()).optional(),
  }).optional(),
  dataInputs: z.object({
    dataTypesUsed: z.array(z.string()).optional(),
    dataSources: z.array(z.string()).optional(),
    personalOrSensitiveData: z.boolean().optional(),
  }).optional(),
  modelAutonomyLevel: AutonomyLevelEnum,
  scaleAndReach: z.object({
    expectedNumberOfUsers: z.string().optional(),
    frequencyOfUse: z.string().optional(),
    geographicScope: z.string().optional(),
  }).optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export type AnalyzeResponse = {
  analysis: string;
};
