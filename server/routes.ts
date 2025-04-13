import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertCaseSchema,
  insertEvidenceSchema,
  insertWitnessSchema,
  insertActivityLogSchema,
  insertAiAnalysisSchema
} from "@shared/schema";
import { generateCaseSummary, analyzeTimeline, analyzeRelationships, generateLeads } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cases routes
  app.get("/api/cases", async (req: Request, res: Response) => {
    const cases = await storage.getAllCases();
    res.json(cases);
  });

  app.get("/api/cases/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const caseData = await storage.getCase(id);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.json(caseData);
  });

  app.post("/api/cases", async (req: Request, res: Response) => {
    try {
      const caseData = insertCaseSchema.parse(req.body);
      const newCase = await storage.createCase(caseData);
      
      // Log activity
      await storage.logActivity({
        caseId: newCase.id,
        userId: newCase.leadDetectiveId || 1,
        activityType: "case_created",
        description: `Case ${newCase.caseNumber} (${newCase.title}) was created.`
      });
      
      res.status(201).json(newCase);
    } catch (error) {
      res.status(400).json({ message: "Invalid case data", error: (error as Error).message });
    }
  });

  app.put("/api/cases/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    try {
      const caseData = insertCaseSchema.partial().parse(req.body);
      const updatedCase = await storage.updateCase(id, caseData);
      
      if (!updatedCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      
      // Log activity
      await storage.logActivity({
        caseId: id,
        userId: updatedCase.leadDetectiveId || 1,
        activityType: "case_updated",
        description: `Case ${updatedCase.caseNumber} (${updatedCase.title}) was updated.`
      });
      
      res.json(updatedCase);
    } catch (error) {
      res.status(400).json({ message: "Invalid case data", error: (error as Error).message });
    }
  });

  // Evidence routes
  app.get("/api/cases/:caseId/evidence", async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.caseId);
    if (isNaN(caseId)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const evidenceItems = await storage.getCaseEvidence(caseId);
    res.json(evidenceItems);
  });

  app.post("/api/evidence", async (req: Request, res: Response) => {
    try {
      const evidenceData = insertEvidenceSchema.parse(req.body);
      const newEvidence = await storage.createEvidence(evidenceData);
      
      // Log activity
      await storage.logActivity({
        caseId: newEvidence.caseId,
        userId: 1, // Default to first user for demo
        activityType: "evidence_added",
        description: `Evidence ${newEvidence.evidenceNumber} (${newEvidence.type}) was added to the case.`
      });
      
      res.status(201).json(newEvidence);
    } catch (error) {
      res.status(400).json({ message: "Invalid evidence data", error: (error as Error).message });
    }
  });

  app.put("/api/evidence/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid evidence ID" });
    }

    try {
      const evidenceData = insertEvidenceSchema.partial().parse(req.body);
      const updatedEvidence = await storage.updateEvidence(id, evidenceData);
      
      if (!updatedEvidence) {
        return res.status(404).json({ message: "Evidence not found" });
      }
      
      // Log activity
      await storage.logActivity({
        caseId: updatedEvidence.caseId,
        userId: 1, // Default to first user for demo
        activityType: "evidence_updated",
        description: `Evidence ${updatedEvidence.evidenceNumber} (${updatedEvidence.type}) was updated.`
      });
      
      res.json(updatedEvidence);
    } catch (error) {
      res.status(400).json({ message: "Invalid evidence data", error: (error as Error).message });
    }
  });

  // Witness routes
  app.get("/api/cases/:caseId/witnesses", async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.caseId);
    if (isNaN(caseId)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const witnesses = await storage.getCaseWitnesses(caseId);
    res.json(witnesses);
  });

  app.post("/api/witnesses", async (req: Request, res: Response) => {
    try {
      const witnessData = insertWitnessSchema.parse(req.body);
      const newWitness = await storage.createWitness(witnessData);
      
      // Log activity
      await storage.logActivity({
        caseId: newWitness.caseId,
        userId: 1, // Default to first user for demo
        activityType: "witness_added",
        description: `Witness ${newWitness.firstName} ${newWitness.lastName} was added to the case.`
      });
      
      res.status(201).json(newWitness);
    } catch (error) {
      res.status(400).json({ message: "Invalid witness data", error: (error as Error).message });
    }
  });

  app.put("/api/witnesses/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid witness ID" });
    }

    try {
      const witnessData = insertWitnessSchema.partial().parse(req.body);
      const updatedWitness = await storage.updateWitness(id, witnessData);
      
      if (!updatedWitness) {
        return res.status(404).json({ message: "Witness not found" });
      }
      
      // Log activity
      await storage.logActivity({
        caseId: updatedWitness.caseId,
        userId: 1, // Default to first user for demo
        activityType: "witness_updated",
        description: `Witness ${updatedWitness.firstName} ${updatedWitness.lastName} was updated.`
      });
      
      res.json(updatedWitness);
    } catch (error) {
      res.status(400).json({ message: "Invalid witness data", error: (error as Error).message });
    }
  });

  // Activity logs routes
  app.get("/api/cases/:caseId/activities", async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.caseId);
    if (isNaN(caseId)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const activities = await storage.getCaseActivities(caseId);
    res.json(activities);
  });

  // AI Analysis routes
  app.get("/api/cases/:caseId/analysis", async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.caseId);
    if (isNaN(caseId)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const analyses = await storage.getCaseAnalyses(caseId);
    res.json(analyses);
  });

  app.post("/api/cases/:caseId/analyze", async (req: Request, res: Response) => {
    const caseId = parseInt(req.params.caseId);
    if (isNaN(caseId)) {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const caseData = await storage.getCase(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    const evidence = await storage.getCaseEvidence(caseId);
    const witnesses = await storage.getCaseWitnesses(caseId);

    // Generate all types of analysis
    try {
      const analysisType = req.body.analysisType || "all";
      
      if (analysisType === "all" || analysisType === "case_summary") {
        const caseSummary = await generateCaseSummary(caseData, evidence, witnesses);
        await storage.saveAnalysis({
          caseId,
          analysisType: "case_summary",
          content: caseSummary
        });
      }
      
      if (analysisType === "all" || analysisType === "timeline") {
        const timeline = await analyzeTimeline(caseData, evidence, witnesses);
        await storage.saveAnalysis({
          caseId,
          analysisType: "timeline",
          content: timeline
        });
      }
      
      if (analysisType === "all" || analysisType === "relationships") {
        const relationships = await analyzeRelationships(caseData, evidence, witnesses);
        await storage.saveAnalysis({
          caseId,
          analysisType: "relationships",
          content: relationships
        });
      }
      
      if (analysisType === "all" || analysisType === "lead_generation") {
        const leads = await generateLeads(caseData, evidence, witnesses);
        await storage.saveAnalysis({
          caseId,
          analysisType: "lead_generation",
          content: leads
        });
      }
      
      // Log activity
      await storage.logActivity({
        caseId,
        userId: 1, // Default to first user for demo
        activityType: "ai_analysis",
        description: `AI analysis (${analysisType}) was generated for the case.`
      });
      
      const analyses = await storage.getCaseAnalyses(caseId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate analysis", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
