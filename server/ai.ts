import { z } from "zod";
import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Define types for AI analysis
export type CaseSummaryAnalysis = {
  summary: string;
  recommendations: string[];
};

export type TimelineAnalysis = {
  criticalWindows: Array<{
    timeStart: string;
    timeEnd: string;
    description: string;
  }>;
};

export type RelationshipAnalysis = {
  keyRelationships: Array<{
    name: string;
    relationship: string;
    conflictType: string;
  }>;
};

export type LeadGenerationAnalysis = {
  leads: string[];
};

// Function to generate AI case summary
export async function generateCaseSummary(
  caseDetails: any,
  evidence: any[],
  witnesses: any[]
): Promise<CaseSummaryAnalysis> {
  try {
    const caseInfo = {
      caseNumber: caseDetails.caseNumber,
      title: caseDetails.title,
      description: caseDetails.description,
      location: caseDetails.location,
      crimeType: caseDetails.crimeType,
      crimeDate: caseDetails.crimeDate,
      status: caseDetails.status,
      priority: caseDetails.priority
    };

    const evidenceInfo = evidence.map(e => ({
      type: e.type,
      location: e.location,
      description: e.description,
      collectedAt: e.collectedAt,
      notes: e.notes
    }));

    const witnessInfo = witnesses.map(w => ({
      name: `${w.firstName} ${w.lastName}`,
      contactInfo: { phone: w.contactPhone, email: w.contactEmail },
      relationship: w.relationship,
      reliability: w.reliability,
      interviewStatus: w.interviewStatus,
      notes: w.notes
    }));

    const prompt = `
    As a criminal investigation AI assistant, analyze the following case details and provide:
    1. A concise summary of the case based on evidence and witness information
    2. A list of actionable recommendations for the investigation team

    CASE DETAILS:
    ${JSON.stringify(caseInfo, null, 2)}

    EVIDENCE (${evidence.length} items):
    ${JSON.stringify(evidenceInfo, null, 2)}

    WITNESSES (${witnesses.length} people):
    ${JSON.stringify(witnessInfo, null, 2)}

    Please respond with a JSON object that has the following structure:
    {
      "summary": "comprehensive summary of the case...",
      "recommendations": ["recommendation 1", "recommendation 2", ...]
    }
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      summary: result.summary,
      recommendations: result.recommendations
    };
  } catch (error) {
    console.error("Error generating case summary:", error);
    // Fallback in case of API failure
    return {
      summary: `Unable to generate AI analysis for case "${caseDetails.title}". Please try again later.`,
      recommendations: ["Retry the analysis when the service is available."]
    };
  }
}

// Function to analyze timeline of events
export async function analyzeTimeline(
  caseDetails: any,
  evidence: any[],
  witnesses: any[]
): Promise<TimelineAnalysis> {
  try {
    const caseInfo = {
      caseNumber: caseDetails.caseNumber,
      title: caseDetails.title,
      description: caseDetails.description,
      location: caseDetails.location,
      crimeType: caseDetails.crimeType,
      crimeDate: caseDetails.crimeDate,
      status: caseDetails.status
    };

    const evidenceInfo = evidence.map(e => ({
      type: e.type,
      location: e.location,
      description: e.description,
      collectedAt: e.collectedAt,
      notes: e.notes
    }));

    const witnessInfo = witnesses.map(w => ({
      name: `${w.firstName} ${w.lastName}`,
      statement: w.notes,
      relationship: w.relationship,
      reliability: w.reliability,
      interviewStatus: w.interviewStatus
    }));

    const prompt = `
    As a criminal investigation timeline analyst, review the case details, evidence, and witness statements.
    Based on this information, identify critical time windows that are important for the investigation.
    
    CASE DETAILS:
    ${JSON.stringify(caseInfo, null, 2)}
    
    EVIDENCE (${evidence.length} items):
    ${JSON.stringify(evidenceInfo, null, 2)}
    
    WITNESSES (${witnesses.length} people):
    ${JSON.stringify(witnessInfo, null, 2)}
    
    Please respond with a JSON object that contains an array of critical time windows in the following format:
    {
      "criticalWindows": [
        {
          "timeStart": "HH:MM format",
          "timeEnd": "HH:MM format",
          "description": "explanation of significance"
        },
        ...
      ]
    }
    
    Identify 3-5 critical time windows that investigators should focus on.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      criticalWindows: result.criticalWindows
    };
  } catch (error) {
    console.error("Error analyzing timeline:", error);
    // Fallback in case of API failure
    return {
      criticalWindows: [
        {
          timeStart: "Unknown",
          timeEnd: "Unknown",
          description: "Unable to analyze timeline. Please try again later."
        }
      ]
    };
  }
}

// Function to analyze relationships
export async function analyzeRelationships(
  caseDetails: any,
  evidence: any[],
  witnesses: any[]
): Promise<RelationshipAnalysis> {
  try {
    const caseInfo = {
      caseNumber: caseDetails.caseNumber,
      title: caseDetails.title,
      description: caseDetails.description,
      crimeType: caseDetails.crimeType
    };

    const witnessInfo = witnesses.map(w => ({
      name: `${w.firstName} ${w.lastName}`,
      relationship: w.relationship,
      notes: w.notes,
      reliability: w.reliability
    }));

    const evidenceInfo = evidence.map(e => ({
      type: e.type,
      description: e.description,
      notes: e.notes
    }));

    const prompt = `
    As a criminal investigation relationship analyst, examine the following case, witnesses, and evidence.
    Identify key relationships between people involved in the case and potential conflicts that may be relevant to the investigation.
    
    CASE DETAILS:
    ${JSON.stringify(caseInfo, null, 2)}
    
    WITNESSES (${witnesses.length} people):
    ${JSON.stringify(witnessInfo, null, 2)}
    
    EVIDENCE (${evidence.length} items):
    ${JSON.stringify(evidenceInfo, null, 2)}
    
    Please respond with a JSON object that contains an array of key relationships in the following format:
    {
      "keyRelationships": [
        {
          "name": "person's name",
          "relationship": "relationship to victim/case",
          "conflictType": "description of potential conflict"
        },
        ...
      ]
    }
    
    Identify 3-5 key relationships that may be significant to the investigation.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      keyRelationships: result.keyRelationships
    };
  } catch (error) {
    console.error("Error analyzing relationships:", error);
    // Fallback in case of API failure
    return {
      keyRelationships: [
        {
          name: "Unknown",
          relationship: "Unknown",
          conflictType: "Unable to analyze relationships. Please try again later."
        }
      ]
    };
  }
}

// Function to generate leads
export async function generateLeads(
  caseDetails: any,
  evidence: any[],
  witnesses: any[]
): Promise<LeadGenerationAnalysis> {
  try {
    const caseInfo = {
      caseNumber: caseDetails.caseNumber,
      title: caseDetails.title,
      description: caseDetails.description,
      location: caseDetails.location,
      crimeType: caseDetails.crimeType,
      crimeDate: caseDetails.crimeDate,
      status: caseDetails.status
    };

    const evidenceInfo = evidence.map(e => ({
      type: e.type,
      location: e.location,
      description: e.description,
      collectedAt: e.collectedAt,
      notes: e.notes
    }));

    const witnessInfo = witnesses.map(w => ({
      name: `${w.firstName} ${w.lastName}`,
      relationship: w.relationship,
      notes: w.notes,
      reliability: w.reliability,
      interviewStatus: w.interviewStatus
    }));

    const prompt = `
    As a criminal investigator with expertise in lead generation, analyze the following case details, evidence, and witness statements.
    Generate a list of actionable leads and next steps for the investigation team.
    
    CASE DETAILS:
    ${JSON.stringify(caseInfo, null, 2)}
    
    EVIDENCE (${evidence.length} items):
    ${JSON.stringify(evidenceInfo, null, 2)}
    
    WITNESSES (${witnesses.length} people):
    ${JSON.stringify(witnessInfo, null, 2)}
    
    Based on this information, please provide a JSON object with an array of 5-10 specific, actionable leads to pursue:
    {
      "leads": [
        "Specific lead or next step 1",
        "Specific lead or next step 2",
        ...
      ]
    }
    
    The leads should be concrete, actionable items that investigators can follow up on.
    Focus on evidence gathering, witness interviews, surveillance opportunities, or other practical investigative steps.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      leads: result.leads
    };
  } catch (error) {
    console.error("Error generating leads:", error);
    // Fallback in case of API failure
    return {
      leads: [
        "Unable to generate AI-powered leads. Please try again later.",
        "Review all case evidence and witness statements manually."
      ]
    };
  }
}
