import {
  users, cases, evidence, witnesses, activityLogs, aiAnalyses,
  type User, type InsertUser,
  type Case, type InsertCase,
  type Evidence, type InsertEvidence,
  type Witness, type InsertWitness,
  type ActivityLog, type InsertActivityLog,
  type AiAnalysis, type InsertAiAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Case operations
  createCase(caseData: InsertCase): Promise<Case>;
  getCase(id: number): Promise<Case | undefined>;
  getCaseByNumber(caseNumber: string): Promise<Case | undefined>;
  getAllCases(): Promise<Case[]>;
  updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined>;
  deleteCase(id: number): Promise<boolean>;
  
  // Evidence operations
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  getEvidence(id: number): Promise<Evidence | undefined>;
  getCaseEvidence(caseId: number): Promise<Evidence[]>;
  updateEvidence(id: number, evidence: Partial<InsertEvidence>): Promise<Evidence | undefined>;
  deleteEvidence(id: number): Promise<boolean>;
  
  // Witness operations
  createWitness(witness: InsertWitness): Promise<Witness>;
  getWitness(id: number): Promise<Witness | undefined>;
  getCaseWitnesses(caseId: number): Promise<Witness[]>;
  updateWitness(id: number, witness: Partial<InsertWitness>): Promise<Witness | undefined>;
  deleteWitness(id: number): Promise<boolean>;
  
  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getCaseActivities(caseId: number): Promise<ActivityLog[]>;
  
  // AI Analysis operations
  saveAnalysis(analysis: InsertAiAnalysis): Promise<AiAnalysis>;
  getCaseAnalyses(caseId: number): Promise<AiAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cases: Map<number, Case>;
  private evidenceItems: Map<number, Evidence>;
  private witnesses: Map<number, Witness>;
  private activityLogs: Map<number, ActivityLog>;
  private aiAnalyses: Map<number, AiAnalysis>;
  
  private userId: number;
  private caseId: number;
  private evidenceId: number;
  private witnessId: number;
  private activityId: number;
  private analysisId: number;
  
  constructor() {
    this.users = new Map();
    this.cases = new Map();
    this.evidenceItems = new Map();
    this.witnesses = new Map();
    this.activityLogs = new Map();
    this.aiAnalyses = new Map();
    
    this.userId = 1;
    this.caseId = 1;
    this.evidenceId = 1;
    this.witnessId = 1;
    this.activityId = 1;
    this.analysisId = 1;
    
    // Initialize with a default detective user
    this.createUser({
      username: "detective",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      badgeNumber: "DT-4952",
      role: "detective"
    });
    
    // Initialize with a sample case
    this.createCase({
      caseNumber: "RH-2023-0142",
      title: "Riverside Homicide",
      description: "Male victim (Michael Reynolds, 34) found deceased in Riverside Park on May 14, 2023, at approximately 23:15. Cause of death appears to be blunt force trauma to the head.",
      location: "Riverside Park, North Section",
      crimeType: "Homicide - Blunt Force",
      crimeDate: new Date("2023-05-14T23:15:00"),
      status: "active",
      priority: "high",
      leadDetectiveId: 1,
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    
    const user: User = {
      ...insertUser,
      id
    };
    
    this.users.set(id, user);
    return user;
  }
  
  // Case operations
  async createCase(caseData: InsertCase): Promise<Case> {
    const id = this.caseId++;
    const now = new Date();
    
    const newCase: Case = {
      ...caseData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.cases.set(id, newCase);
    return newCase;
  }
  
  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }
  
  async getCaseByNumber(caseNumber: string): Promise<Case | undefined> {
    return Array.from(this.cases.values()).find(
      (c) => c.caseNumber === caseNumber,
    );
  }
  
  async getAllCases(): Promise<Case[]> {
    return Array.from(this.cases.values());
  }
  
  async updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined> {
    const existingCase = this.cases.get(id);
    
    if (!existingCase) {
      return undefined;
    }
    
    const updatedCase: Case = {
      ...existingCase,
      ...caseData,
      updatedAt: new Date()
    };
    
    this.cases.set(id, updatedCase);
    return updatedCase;
  }
  
  async deleteCase(id: number): Promise<boolean> {
    return this.cases.delete(id);
  }
  
  // Evidence operations
  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const id = this.evidenceId++;
    const now = new Date();
    
    const newEvidence: Evidence = {
      ...evidenceData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.evidenceItems.set(id, newEvidence);
    return newEvidence;
  }
  
  async getEvidence(id: number): Promise<Evidence | undefined> {
    return this.evidenceItems.get(id);
  }
  
  async getCaseEvidence(caseId: number): Promise<Evidence[]> {
    return Array.from(this.evidenceItems.values()).filter(
      (evidence) => evidence.caseId === caseId,
    );
  }
  
  async updateEvidence(id: number, evidenceData: Partial<InsertEvidence>): Promise<Evidence | undefined> {
    const existingEvidence = this.evidenceItems.get(id);
    
    if (!existingEvidence) {
      return undefined;
    }
    
    const updatedEvidence: Evidence = {
      ...existingEvidence,
      ...evidenceData,
      updatedAt: new Date()
    };
    
    this.evidenceItems.set(id, updatedEvidence);
    return updatedEvidence;
  }
  
  async deleteEvidence(id: number): Promise<boolean> {
    return this.evidenceItems.delete(id);
  }
  
  // Witness operations
  async createWitness(witnessData: InsertWitness): Promise<Witness> {
    const id = this.witnessId++;
    const now = new Date();
    
    const newWitness: Witness = {
      ...witnessData,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.witnesses.set(id, newWitness);
    return newWitness;
  }
  
  async getWitness(id: number): Promise<Witness | undefined> {
    return this.witnesses.get(id);
  }
  
  async getCaseWitnesses(caseId: number): Promise<Witness[]> {
    return Array.from(this.witnesses.values()).filter(
      (witness) => witness.caseId === caseId,
    );
  }
  
  async updateWitness(id: number, witnessData: Partial<InsertWitness>): Promise<Witness | undefined> {
    const existingWitness = this.witnesses.get(id);
    
    if (!existingWitness) {
      return undefined;
    }
    
    const updatedWitness: Witness = {
      ...existingWitness,
      ...witnessData,
      updatedAt: new Date()
    };
    
    this.witnesses.set(id, updatedWitness);
    return updatedWitness;
  }
  
  async deleteWitness(id: number): Promise<boolean> {
    return this.witnesses.delete(id);
  }
  
  // Activity log operations
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityId++;
    const now = new Date();
    
    const newActivity: ActivityLog = {
      ...activityData,
      id,
      createdAt: now
    };
    
    this.activityLogs.set(id, newActivity);
    return newActivity;
  }
  
  async getCaseActivities(caseId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((activity) => activity.caseId === caseId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // AI Analysis operations
  async saveAnalysis(analysisData: InsertAiAnalysis): Promise<AiAnalysis> {
    const id = this.analysisId++;
    const now = new Date();
    
    const newAnalysis: AiAnalysis = {
      ...analysisData,
      id,
      createdAt: now
    };
    
    this.aiAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async getCaseAnalyses(caseId: number): Promise<AiAnalysis[]> {
    return Array.from(this.aiAnalyses.values()).filter(
      (analysis) => analysis.caseId === caseId,
    );
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Case operations
  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async getCase(id: number): Promise<Case | undefined> {
    const [caseData] = await db.select().from(cases).where(eq(cases.id, id));
    return caseData;
  }

  async getCaseByNumber(caseNumber: string): Promise<Case | undefined> {
    const [caseData] = await db.select().from(cases).where(eq(cases.caseNumber, caseNumber));
    return caseData;
  }

  async getAllCases(): Promise<Case[]> {
    return await db.select().from(cases).orderBy(desc(cases.createdAt));
  }

  async updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined> {
    const [updatedCase] = await db
      .update(cases)
      .set({ ...caseData, updatedAt: new Date() })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  async deleteCase(id: number): Promise<boolean> {
    const result = await db
      .delete(cases)
      .where(eq(cases.id, id));
    return result.rowCount > 0;
  }

  // Evidence operations
  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const [newEvidence] = await db.insert(evidence).values(evidenceData).returning();
    return newEvidence;
  }

  async getEvidence(id: number): Promise<Evidence | undefined> {
    const [evidenceData] = await db.select().from(evidence).where(eq(evidence.id, id));
    return evidenceData;
  }

  async getCaseEvidence(caseId: number): Promise<Evidence[]> {
    return await db
      .select()
      .from(evidence)
      .where(eq(evidence.caseId, caseId));
  }

  async updateEvidence(id: number, evidenceData: Partial<InsertEvidence>): Promise<Evidence | undefined> {
    const [updatedEvidence] = await db
      .update(evidence)
      .set({ ...evidenceData, updatedAt: new Date() })
      .where(eq(evidence.id, id))
      .returning();
    return updatedEvidence;
  }

  async deleteEvidence(id: number): Promise<boolean> {
    const result = await db
      .delete(evidence)
      .where(eq(evidence.id, id));
    return result.rowCount > 0;
  }

  // Witness operations
  async createWitness(witnessData: InsertWitness): Promise<Witness> {
    const [newWitness] = await db.insert(witnesses).values(witnessData).returning();
    return newWitness;
  }

  async getWitness(id: number): Promise<Witness | undefined> {
    const [witness] = await db.select().from(witnesses).where(eq(witnesses.id, id));
    return witness;
  }

  async getCaseWitnesses(caseId: number): Promise<Witness[]> {
    return await db
      .select()
      .from(witnesses)
      .where(eq(witnesses.caseId, caseId));
  }

  async updateWitness(id: number, witnessData: Partial<InsertWitness>): Promise<Witness | undefined> {
    const [updatedWitness] = await db
      .update(witnesses)
      .set({ ...witnessData, updatedAt: new Date() })
      .where(eq(witnesses.id, id))
      .returning();
    return updatedWitness;
  }

  async deleteWitness(id: number): Promise<boolean> {
    const result = await db
      .delete(witnesses)
      .where(eq(witnesses.id, id));
    return result.rowCount > 0;
  }

  // Activity log operations
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLogs).values(activityData).returning();
    return newActivity;
  }

  async getCaseActivities(caseId: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.caseId, caseId))
      .orderBy(desc(activityLogs.createdAt));
  }

  // AI Analysis operations
  async saveAnalysis(analysisData: InsertAiAnalysis): Promise<AiAnalysis> {
    const [newAnalysis] = await db.insert(aiAnalyses).values(analysisData).returning();
    return newAnalysis;
  }

  async getCaseAnalyses(caseId: number): Promise<AiAnalysis[]> {
    return await db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.caseId, caseId));
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();
