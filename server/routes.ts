import type { Express } from "express";
import { type Server } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { api } from "@shared/routes";
import { analyzeRequestSchema } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
