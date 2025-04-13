import { useQuery, useMutation } from "@tanstack/react-query";
import { AiAnalysis } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AIAnalysisProps {
  caseId: number;
}

export default function AIAnalysis({ caseId }: AIAnalysisProps) {
  const { toast } = useToast();
  
  const { data: analyses, isLoading } = useQuery<AiAnalysis[]>({
    queryKey: [`/api/cases/${caseId}/analysis`],
  });

  const updateAnalysisMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/cases/${caseId}/analyze`, { analysisType: "all" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${caseId}/analysis`] });
      toast({
        title: "Analysis Updated",
        description: "AI analysis has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Failed to update analysis: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Extract analyses by type
  const caseSummary = analyses?.find(a => a.analysisType === "case_summary")?.content as { 
    summary: string; 
    recommendations: string[] 
  } | undefined;
  
  const timeline = analyses?.find(a => a.analysisType === "timeline")?.content as { 
    criticalWindows: Array<{ timeStart: string; timeEnd: string; description: string }> 
  } | undefined;
  
  const relationships = analyses?.find(a => a.analysisType === "relationships")?.content as { 
    keyRelationships: Array<{ name: string; relationship: string; conflictType: string }> 
  } | undefined;
  
  const leads = analyses?.find(a => a.analysisType === "lead_generation")?.content as { 
    leads: string[] 
  } | undefined;

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-ibm-plex text-lg font-semibold text-[#212121] flex items-center">
              <span className="material-icons mr-2 text-[#0288D1]">psychology</span>
              AI Analysis Tools
            </h2>
          </div>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-40 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-gray-200 h-60 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121] flex items-center">
            <span className="material-icons mr-2 text-[#0288D1]">psychology</span>
            AI Analysis Tools
          </h2>
          <Button 
            className="bg-[#0288D1] hover:bg-[#0288D1]/90 text-white py-1.5 px-3 rounded-md shadow-sm text-sm flex items-center"
            onClick={() => updateAnalysisMutation.mutate()}
            disabled={updateAnalysisMutation.isPending}
          >
            <span className="material-icons mr-1 text-sm">
              {updateAnalysisMutation.isPending ? "hourglass_empty" : "refresh"}
            </span>
            {updateAnalysisMutation.isPending ? "Updating..." : "Update Analysis"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-ibm-plex font-medium text-[#212121] mb-2 flex items-center">
              <span className="material-icons text-sm mr-1 text-[#0288D1]">auto_graph</span>
              Case Timeline Analysis
            </h3>
            {timeline && timeline.criticalWindows && timeline.criticalWindows.length > 0 ? (
              <>
                <p className="text-sm text-[#212121] mb-3">
                  AI has identified critical time windows with potential significance:
                </p>
                <ul className="text-sm list-disc list-inside text-[#212121]">
                  {timeline.criticalWindows.map((window, idx) => (
                    <li key={idx} className="mb-1">
                      {window.timeStart}-{window.timeEnd}: {window.description}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-[#757575]">
                No timeline analysis available yet. Generate an analysis to see potential critical time windows.
              </p>
            )}
            <div className="mt-3 text-right">
              <a href="#" className="text-[#0288D1] text-sm font-medium">View Full Timeline</a>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-ibm-plex font-medium text-[#212121] mb-2 flex items-center">
              <span className="material-icons text-sm mr-1 text-[#0288D1]">hub</span>
              Relationship Mapping
            </h3>
            {relationships && relationships.keyRelationships && relationships.keyRelationships.length > 0 ? (
              <>
                <p className="text-sm text-[#212121] mb-3">
                  AI analysis has identified key relationships with high conflict potential:
                </p>
                <ul className="text-sm list-disc list-inside text-[#212121]">
                  {relationships.keyRelationships.map((rel, idx) => (
                    <li key={idx} className="mb-1">
                      {rel.name} ({rel.relationship}) - {rel.conflictType}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-[#757575]">
                No relationship analysis available yet. Generate an analysis to see potential relationship conflicts.
              </p>
            )}
            <div className="mt-3 text-right">
              <a href="#" className="text-[#0288D1] text-sm font-medium">View Relationship Map</a>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-ibm-plex font-medium text-[#212121] mb-2 flex items-center">
              <span className="material-icons text-sm mr-1 text-[#0288D1]">lightbulb</span>
              Lead Generation
            </h3>
            {leads && leads.leads && leads.leads.length > 0 ? (
              <>
                <p className="text-sm text-[#212121] mb-3">
                  Based on evidence analysis, AI suggests the following leads:
                </p>
                <ul className="text-sm list-disc list-inside text-[#212121]">
                  {leads.leads.map((lead, idx) => (
                    <li key={idx} className="mb-1">{lead}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-[#757575]">
                No lead suggestions available yet. Generate an analysis to see potential investigative leads.
              </p>
            )}
            <div className="mt-3 text-right">
              <a href="#" className="text-[#0288D1] text-sm font-medium">Generate More Leads</a>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-[#0288D1] rounded-lg p-4">
          <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-2">AI Case Summary</h3>
          {caseSummary ? (
            <>
              <p className="text-sm text-[#212121] mb-3">
                Based on the current evidence and witness statements, the AI system has generated the following case summary and recommended next steps:
              </p>
              <div className="bg-white rounded-lg p-3 text-sm text-[#212121] mb-3">
                <p className="mb-2">{caseSummary.summary}</p>
              </div>
              {caseSummary.recommendations && caseSummary.recommendations.length > 0 && (
                <>
                  <h4 className="font-ibm-plex font-medium text-[#0288D1] mb-1">Recommended Next Steps:</h4>
                  <ol className="list-decimal list-inside text-sm text-[#212121] ml-1">
                    {caseSummary.recommendations.map((rec, idx) => (
                      <li key={idx} className="mb-1">{rec}</li>
                    ))}
                  </ol>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-[#0288D1]">No AI analysis has been generated yet</p>
              <p className="text-sm text-[#757575] mt-1">
                Click the "Update Analysis" button to generate AI insights for this case
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
