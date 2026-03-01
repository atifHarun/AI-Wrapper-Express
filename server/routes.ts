import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { api } from "@shared/routes";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  app.post(api.analyze.create.path, async (req, res) => {
    try {
      const input = api.analyze.create.input.parse(req.body);
      
      const prompt = `Analyze the following AI use case:\n\nUse Case: ${input.useCase}\nDescription: ${input.description}\n\nPlease provide a structured analysis, including potential benefits, technical feasibility, and possible challenges.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
      });

      const analysis = response.choices[0].message.content || "No analysis generated.";
      
      res.status(200).json({ analysis });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Analysis error:", err);
      res.status(500).json({ message: "Failed to perform analysis" });
    }
  });

  return httpServer;
}
