import {
  users, cases, evidence, witnesses, activityLogs, aiAnalyses,
  type User, type InsertUser,
  type Case, type InsertCase,
  type Evidence, type InsertEvidence,
  type Witness, type InsertWitness,
  type ActivityLog, type InsertActivityLog,
  type AiAnalysis, type InsertAiAnalysis
} from "@shared/schema";

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

// Initialize storage with sample data
export const storage = new MemStorage();

// Add sample evidence
storage.createEvidence({
  caseId: 1,
  evidenceNumber: "RH-2023-0142-E001",
  type: "Physical",
  description: "Bloodied Rock found near the victim's body. Suspected to be the murder weapon.",
  location: "3m north of victim",
  status: "in_lab",
  collectedBy: "Ofc. M. Rodriguez",
  collectedAt: new Date("2023-05-15"),
  notes: "Sent for DNA analysis and fingerprint processing.",
});

storage.createEvidence({
  caseId: 1,
  evidenceNumber: "RH-2023-0142-E002",
  type: "Photo",
  description: "Complete set of 43 photos documenting the crime scene, victim position, and surrounding area.",
  location: "Crime scene",
  status: "processed",
  collectedBy: "Det. K. Wallace",
  collectedAt: new Date("2023-05-15"),
  notes: "Photos include wide shots and close-ups of the crime scene.",
});

storage.createEvidence({
  caseId: 1,
  evidenceNumber: "RH-2023-0142-E003",
  type: "Document",
  description: "Victim's Business Records from Reynolds Tech Consulting for the past 6 months.",
  location: "Business Office",
  status: "under_review",
  collectedBy: "Det. Sarah Johnson",
  collectedAt: new Date("2023-05-16"),
  notes: "Includes client contracts, payment records, and expense reports.",
});

// Add sample witnesses
storage.createWitness({
  caseId: 1,
  firstName: "Jennifer",
  lastName: "Baker",
  contactPhone: "(555) 123-4567",
  contactEmail: "jbaker@example.com",
  relationship: "Park visitor, first to discover body",
  reliability: "high",
  interviewStatus: "completed",
  notes: "Completed 2 interview sessions. Witness reports seeing a tall man in dark clothing near the scene around 22:45.",
});

storage.createWitness({
  caseId: 1,
  firstName: "Robert",
  lastName: "Chen",
  contactPhone: "(555) 789-1234",
  contactEmail: "rchen@example.com",
  relationship: "Park maintenance worker",
  reliability: "medium",
  interviewStatus: "completed",
  notes: "Completed 1 interview session. Was working in the south section of the park until 22:00.",
});

storage.createWitness({
  caseId: 1,
  firstName: "David",
  lastName: "Reynolds",
  contactPhone: "(555) 456-7890",
  contactEmail: "dreynolds@example.com",
  relationship: "Victim's brother and business partner",
  reliability: "under_assessment",
  interviewStatus: "scheduled",
  notes: "Interview scheduled for May 20, 2023. Financial records show potential business dispute.",
});

// Add sample activity logs
storage.logActivity({
  caseId: 1,
  userId: 1,
  activityType: "witness_added",
  description: "Added David Reynolds (victim's brother) to witness list and scheduled interview for May 20, 2023.",
});

storage.logActivity({
  caseId: 1,
  userId: 1,
  activityType: "evidence_updated",
  description: "Updated status of Evidence #RH-2023-0142-E001 (Bloodied Rock) to 'In Lab'. Preliminary testing shows blood type match to victim.",
});

storage.logActivity({
  caseId: 1,
  userId: 1,
  activityType: "evidence_added",
  description: "Added Evidence #RH-2023-0142-E003 (Victim's Business Records) to the case file. Retrieved from victim's office with consent from next of kin.",
});

storage.logActivity({
  caseId: 1,
  userId: 1,
  activityType: "witness_interview",
  description: "Completed interview with Jennifer Baker (first witness). Witness reports seeing a 'tall man in dark clothing' near the scene around 22:45. Full transcript added to case file.",
});

// Add sample AI analysis
storage.saveAnalysis({
  caseId: 1,
  analysisType: "case_summary",
  content: {
    summary: "The investigation into Michael Reynolds' homicide reveals signs of a premeditated attack potentially related to his business dealings. The cause of death (blunt force trauma) and the evidence collected suggest the perpetrator may have personal knowledge of the victim's routine. Witness statements corroborate unusual activity in the park that evening, but descriptions of individuals seen in the area are inconsistent. Financial records show significant tension with his brother/business partner over a recent contract worth $500,000. Additionally, text messages recovered from the victim's phone indicate a heated exchange with client James Wilson three days before the incident.",
    recommendations: [
      "Conduct in-depth interview with David Reynolds with focus on financial disputes",
      "Obtain search warrant for James Wilson's residence and vehicle",
      "Cross-reference cell tower data with witness timeline statements",
      "Expand CCTV collection to include routes between victim's office and the park"
    ]
  }
});

storage.saveAnalysis({
  caseId: 1,
  analysisType: "timeline",
  content: {
    criticalWindows: [
      {
        timeStart: "21:00",
        timeEnd: "21:45",
        description: "Victim last seen leaving office"
      },
      {
        timeStart: "22:30",
        timeEnd: "23:00",
        description: "Unusual activity in park reported"
      }
    ]
  }
});

storage.saveAnalysis({
  caseId: 1,
  analysisType: "relationships",
  content: {
    keyRelationships: [
      {
        name: "David Reynolds",
        relationship: "brother",
        conflictType: "financial dispute"
      },
      {
        name: "James Wilson",
        relationship: "client",
        conflictType: "recent contract termination"
      }
    ]
  }
});

storage.saveAnalysis({
  caseId: 1,
  analysisType: "lead_generation",
  content: {
    leads: [
      "Review victim's recent contract negotiations",
      "Check CCTV from downtown office building"
    ]
  }
});
