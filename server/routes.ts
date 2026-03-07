import type { Express } from "express";
import { type Server } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { api } from "@shared/routes";
import { analyzeRequestSchema } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// JSON Schema for validation
const AI_USE_CASE_SCHEMA = {
  required: ["useCaseName", "systemType", "contextOfUse", "modelAutonomyLevel"],
  properties: {
    useCaseName: { type: "string" },
    systemType: { 
      type: "string",
      enum: [
        "Text-based conversational AI",
        "Voice-based conversational AI",
        "Decision support AI",
        "Agent assist AI"
      ]
    },
    contextOfUse: {
      type: "object",
      properties: {
        industry: { type: "string" },
        environment: {
          type: "string",
          enum: ["Internal", "Customer-facing", "Public"]
        }
      }
    },
    modelAutonomyLevel: {
      type: "string",
      enum: [
        "Informational only",
        "Recommendation with human decision",
        "Action execution with human override",
        "Fully autonomous action"
      ]
    }
  }
};

// Validate that required fields exist in the generated JSON
function validateGeneratedJson(json: any): boolean {
  try {
    if (!json || typeof json !== "object") return false;
    
    for (const field of AI_USE_CASE_SCHEMA.required) {
      if (!(field in json)) return false;
    }
    
    // Validate systemType enum
    if (!AI_USE_CASE_SCHEMA.properties.systemType.enum.includes(json.systemType)) {
      return false;
    }
    
    // Validate modelAutonomyLevel enum
    if (!AI_USE_CASE_SCHEMA.properties.modelAutonomyLevel.enum.includes(json.modelAutonomyLevel)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Endpoint: Generate structured JSON from free-text description
  app.post(api.generateJson.create.path, async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description || typeof description !== "string" || description.trim().length === 0) {
        return res.status(400).json({
          message: "Description is required and cannot be empty"
        });
      }

      console.log(`[${new Date().toISOString()}] Generate JSON request from description: "${description.substring(0, 50)}..."`);

      const prompt = `You are an expert in AI system design and schema validation. Convert the following free-text description of an AI system into a structured JSON object that strictly follows this schema:

{
  "useCaseName": "string - The name of the specific AI implementation",
  "systemType": "one of: Text-based conversational AI, Voice-based conversational AI, Decision support AI, Agent assist AI",
  "primaryFunction": "string (optional) - What the AI does",
  "contextOfUse": {
    "industry": "string - The industry",
    "environment": "one of: Internal, Customer-facing, Public"
  },
  "stakeholders": {
    "primaryUsers": ["array of strings"],
    "indirectlyAffectedParties": ["array of strings"],
    "oversightOwners": ["array of strings"]
  },
  "decisionsAndActions": {
    "decisionsMadeBySystem": ["array of strings"],
    "actionsExecutedAutomatically": ["array of strings"],
    "actionsRequiringHumanApproval": ["array of strings"]
  },
  "dataInputs": {
    "dataTypesUsed": ["array of strings"],
    "dataSources": ["array of strings"],
    "personalOrSensitiveData": boolean
  },
  "modelAutonomyLevel": "one of: Informational only, Recommendation with human decision, Action execution with human override, Fully autonomous action",
  "scaleAndReach": {
    "expectedNumberOfUsers": "string",
    "frequencyOfUse": "string",
    "geographicScope": "string"
  }
}

IMPORTANT RULES:
1. You MUST include all required fields: useCaseName, systemType, contextOfUse, modelAutonomyLevel
2. For enum fields, use EXACTLY the values specified above - no variations
3. For array fields, populate them with realistic values based on the description
4. Return ONLY valid JSON - no explanations, no markdown, no code blocks
5. If the description is unclear about a field, make reasonable inferences

Description to convert:
${description}

Return ONLY the JSON object, nothing else.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { 
            role: "system", 
            content: "You are a JSON generation assistant. Return only valid JSON with no explanations or markdown."
          },
          { role: "user", content: prompt }
        ],
      });

      const content = response.choices[0].message.content || "";
      
      // Extract JSON from response (in case it's wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      let generatedJson;
      try {
        generatedJson = JSON.parse(jsonString);
      } catch (parseErr) {
        console.error("Failed to parse JSON:", parseErr);
        return res.status(500).json({
          message: "Unable to generate valid JSON. Please try again."
        });
      }

      // Validate the generated JSON
      if (!validateGeneratedJson(generatedJson)) {
        console.error("Generated JSON failed validation");
        return res.status(500).json({
          message: "Unable to generate valid JSON. Please try again."
        });
      }

      res.status(200).json({ json: generatedJson });
    } catch (err) {
      console.error("Generate JSON error:", err);
      res.status(500).json({ message: "Failed to generate JSON from description" });
    }
  });

  // Endpoint: Analyze use case for outcomes
  app.post(api.analyze.create.path, async (req, res) => {
    try {
      const input = analyzeRequestSchema.parse(req.body);
      
      console.log(`[${new Date().toISOString()}] Analyze Request: useCaseName="${input.useCaseName}", modelAutonomyLevel="${input.modelAutonomyLevel}"`);

      const prompt = `
        Perform a structured ethical and impact analysis for the following AI use case provided in JSON format:
        ${JSON.stringify(input, null, 2)}

        What are the other potential outcomes of this AI solution?
        
        Analyze the following specifically:
        - modelAutonomyLevel: ${input.modelAutonomyLevel}
        - scaleAndReach: ${input.scaleAndReach || "Not specified"}
        - personalOrSensitiveData: ${input.dataInputs?.personalOrSensitiveData ? "Yes" : "No"}

        Categorize the output into exactly these 8 sections using bullet points:
        1. Positive outcomes
        2. Negative outcomes
        3. Ethical risks
        4. Legal risks
        5. Social impacts
        6. Economic impacts
        7. Long-term systemic risks
        8. Recommended Human Oversight Actions

        Guidelines:
        - Avoid promotional language.
        - Explicitly analyze modelAutonomyLevel.
        - Analyze scaleAndReach for amplified risks.
        - Analyze dataInputs.personalOrSensitiveData carefully.
        - Identify unintended consequences.
        - Consider bias, privacy, fairness, transparency, accountability.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { 
            role: "system", 
            content: "You are an AI ethics and policy expert. Provide structured, critical analysis of AI use cases." 
          },
          { role: "user", content: prompt }
        ],
      });

      const analysis = response.choices[0].message.content || "No analysis generated.";
      
      res.status(200).json({ analysis });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      console.error("Analysis error:", err);
      res.status(500).json({ message: "Failed to perform analysis" });
    }
  });

  return httpServer;
}
