// This file contains functions to seed the database with sample data
import { storage } from './storage';

/**
 * Seeds the database with sample data
 */
export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Create default detective user
    const user = await storage.createUser({
      username: "detective",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      badgeNumber: "DT-4952",
      role: "detective"
    });
    
    // Create sample case
    const caseData = await storage.createCase({
      caseNumber: "RH-2023-0142",
      title: "Riverside Homicide",
      description: "Male victim (Michael Reynolds, 34) found deceased in Riverside Park on May 14, 2023, at approximately 23:15. Cause of death appears to be blunt force trauma to the head.",
      location: "Riverside Park, North Section",
      crimeType: "Homicide - Blunt Force",
      crimeDate: new Date("2023-05-14T23:15:00"),
      status: "active",
      priority: "high",
      leadDetectiveId: user.id,
    });

    // Add sample evidence
    await storage.createEvidence({
      caseId: caseData.id,
      evidenceNumber: "RH-2023-0142-E001",
      type: "Physical",
      description: "Bloodied Rock found near the victim's body. Suspected to be the murder weapon.",
      location: "3m north of victim",
      status: "in_lab",
      collectedBy: "Ofc. M. Rodriguez",
      collectedAt: new Date("2023-05-15"),
      notes: "Sent for DNA analysis and fingerprint processing.",
    });

    await storage.createEvidence({
      caseId: caseData.id,
      evidenceNumber: "RH-2023-0142-E002",
      type: "Photo",
      description: "Complete set of 43 photos documenting the crime scene, victim position, and surrounding area.",
      location: "Crime scene",
      status: "processed",
      collectedBy: "Det. K. Wallace",
      collectedAt: new Date("2023-05-15"),
      notes: "Photos include wide shots and close-ups of the crime scene.",
    });

    await storage.createEvidence({
      caseId: caseData.id,
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
    await storage.createWitness({
      caseId: caseData.id,
      firstName: "Jennifer",
      lastName: "Baker",
      contactPhone: "(555) 123-4567",
      contactEmail: "jbaker@example.com",
      relationship: "Park visitor, first to discover body",
      reliability: "high",
      interviewStatus: "completed",
      notes: "Completed 2 interview sessions. Witness reports seeing a tall man in dark clothing near the scene around 22:45.",
    });

    await storage.createWitness({
      caseId: caseData.id,
      firstName: "Robert",
      lastName: "Chen",
      contactPhone: "(555) 789-1234",
      contactEmail: "rchen@example.com",
      relationship: "Park maintenance worker",
      reliability: "medium",
      interviewStatus: "completed",
      notes: "Completed 1 interview session. Was working in the south section of the park until 22:00.",
    });

    await storage.createWitness({
      caseId: caseData.id,
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
    await storage.logActivity({
      caseId: caseData.id,
      userId: user.id,
      activityType: "witness_added",
      description: "Added David Reynolds (victim's brother) to witness list and scheduled interview for May 20, 2023.",
    });

    await storage.logActivity({
      caseId: caseData.id,
      userId: user.id,
      activityType: "evidence_updated",
      description: "Updated status of Evidence #RH-2023-0142-E001 (Bloodied Rock) to 'In Lab'. Preliminary testing shows blood type match to victim.",
    });

    await storage.logActivity({
      caseId: caseData.id,
      userId: user.id,
      activityType: "evidence_added",
      description: "Added Evidence #RH-2023-0142-E003 (Victim's Business Records) to the case file. Retrieved from victim's office with consent from next of kin.",
    });

    await storage.logActivity({
      caseId: caseData.id,
      userId: user.id,
      activityType: "witness_interview",
      description: "Completed interview with Jennifer Baker (first witness). Witness reports seeing a 'tall man in dark clothing' near the scene around 22:45. Full transcript added to case file.",
    });

    // Add sample AI analysis
    await storage.saveAnalysis({
      caseId: caseData.id,
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

    await storage.saveAnalysis({
      caseId: caseData.id,
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

    await storage.saveAnalysis({
      caseId: caseData.id,
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

    await storage.saveAnalysis({
      caseId: caseData.id,
      analysisType: "lead_generation",
      content: {
        leads: [
          "Review victim's recent contract negotiations",
          "Check CCTV from downtown office building"
        ]
      }
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}