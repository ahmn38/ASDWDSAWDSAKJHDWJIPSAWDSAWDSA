import { useQuery, useMutation } from "@tanstack/react-query";
import { Case, AiAnalysis } from "@shared/schema";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function AIAnalytics() {
  const { toast } = useToast();
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Fetch all cases
  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Fetch analysis for selected case
  const { data: analyses, isLoading: analysisLoading } = useQuery<AiAnalysis[]>({
    queryKey: [`/api/cases/${selectedCaseId}/analysis`],
    enabled: !!selectedCaseId,
  });

  // Mutation for generating new analysis
  const generateAnalysisMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCaseId) throw new Error("No case selected");
      return apiRequest("POST", `/api/cases/${selectedCaseId}/analyze`, { analysisType: "all" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${selectedCaseId}/analysis`] });
      toast({
        title: "Analysis Generated",
        description: "AI analysis has been successfully generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: `Failed to generate analysis: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Get current case
  const currentCase = selectedCaseId ? cases?.find(c => c.id === selectedCaseId) : null;

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

  const handleChangeCase = (id: string) => {
    setSelectedCaseId(id === "none" ? null : parseInt(id));
  };

  const handleGenerateAnalysis = () => {
    if (selectedCaseId) {
      generateAnalysisMutation.mutate();
    } else {
      toast({
        title: "No Case Selected",
        description: "Please select a case to generate analysis.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Breadcrumbs and Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center text-sm">
          <a href="/" className="text-[#1A237E]">Dashboard</a>
          <span className="mx-2 text-[#757575]">/</span>
          <span className="text-[#757575]">AI Analysis</span>
          {currentCase && (
            <>
              <span className="mx-2 text-[#757575]">/</span>
              <a href={`/cases/${currentCase.id}`} className="text-[#1A237E]">{currentCase.title}</a>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-ibm-plex text-2xl font-bold text-[#212121]">
              AI Analysis Dashboard
            </h1>
            <p className="text-[#757575]">
              Powerful AI tools to analyze case data and generate insights
            </p>
          </div>
        </div>

        {/* Case Selection */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center mb-2 md:mb-0">
                <span className="text-[#757575] mr-3">Select Case:</span>
                <select 
                  className="border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
                  value={selectedCaseId?.toString() || "none"}
                  onChange={(e) => handleChangeCase(e.target.value)}
                  disabled={casesLoading}
                >
                  <option value="none">Select a case...</option>
                  {cases?.map(caseItem => (
                    <option key={caseItem.id} value={caseItem.id.toString()}>
                      {caseItem.title} (#{caseItem.caseNumber})
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                className="bg-[#0288D1] hover:bg-[#0288D1]/90"
                disabled={!selectedCaseId || generateAnalysisMutation.isPending}
                onClick={handleGenerateAnalysis}
              >
                <span className="material-icons mr-1 text-sm">psychology</span>
                {generateAnalysisMutation.isPending ? "Generating..." : "Generate Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedCaseId ? (
          <>
            {/* Analysis Tabs */}
            <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 mb-0">
              <div className="flex">
                <button 
                  className={`px-4 py-3 font-ibm-plex text-sm font-medium transition-all duration-200 ${
                    activeTab === 'summary' 
                      ? 'text-[#1A237E] border-b-2 border-[#1A237E]' 
                      : 'text-[#757575] hover:text-[#212121]'
                  }`}
                  onClick={() => setActiveTab('summary')}
                >
                  Case Summary
                </button>
                <button 
                  className={`px-4 py-3 font-ibm-plex text-sm font-medium transition-all duration-200 ${
                    activeTab === 'timeline' 
                      ? 'text-[#1A237E] border-b-2 border-[#1A237E]' 
                      : 'text-[#757575] hover:text-[#212121]'
                  }`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline Analysis
                </button>
                <button 
                  className={`px-4 py-3 font-ibm-plex text-sm font-medium transition-all duration-200 ${
                    activeTab === 'relationships' 
                      ? 'text-[#1A237E] border-b-2 border-[#1A237E]' 
                      : 'text-[#757575] hover:text-[#212121]'
                  }`}
                  onClick={() => setActiveTab('relationships')}
                >
                  Relationship Mapping
                </button>
                <button 
                  className={`px-4 py-3 font-ibm-plex text-sm font-medium transition-all duration-200 ${
                    activeTab === 'leads' 
                      ? 'text-[#1A237E] border-b-2 border-[#1A237E]' 
                      : 'text-[#757575] hover:text-[#212121]'
                  }`}
                  onClick={() => setActiveTab('leads')}
                >
                  Lead Generation
                </button>
              </div>
            </div>

            {/* Analysis Content */}
            <Card className="rounded-t-none">
              <CardContent className="p-6">
                {analysisLoading ? (
                  <div className="py-20 text-center">
                    <div className="material-icons text-4xl text-[#0288D1] animate-pulse mb-2">psychology</div>
                    <p className="text-[#757575]">Loading analysis data...</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                      <div>
                        <h2 className="font-ibm-plex text-xl font-semibold text-[#212121] mb-4 flex items-center">
                          <span className="material-icons mr-2 text-[#0288D1]">summarize</span>
                          AI Case Summary
                        </h2>
                        
                        {caseSummary ? (
                          <div>
                            <div className="bg-blue-50 border border-[#0288D1] rounded-lg p-5 mb-6">
                              <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-2">Summary Analysis</h3>
                              <p className="text-[#212121] mb-4">{caseSummary.summary}</p>
                              
                              <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-2">Key Findings</h3>
                              <ul className="list-disc list-inside text-[#212121] mb-4">
                                {caseSummary.recommendations.map((rec, index) => (
                                  <li key={index} className="mb-1">{rec}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <h3 className="font-ibm-plex text-lg font-medium text-[#212121] mb-3">
                              Recommendations
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                              <ol className="list-decimal list-inside text-[#212121]">
                                {caseSummary.recommendations.map((rec, index) => (
                                  <li key={index} className="mb-3 pl-1">
                                    <span className="font-medium">{rec}</span>
                                    <p className="ml-6 mt-1 text-sm text-[#757575]">
                                      Recommendation based on AI analysis of case evidence and witness statements.
                                    </p>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                            <span className="material-icons text-4xl text-[#757575] mb-2">psychology</span>
                            <h3 className="font-ibm-plex text-lg font-medium mb-1">No Summary Analysis Available</h3>
                            <p className="text-[#757575] mb-4">Generate an AI analysis to see a comprehensive case summary.</p>
                            <Button 
                              className="bg-[#0288D1] hover:bg-[#0288D1]/90"
                              onClick={handleGenerateAnalysis}
                              disabled={generateAnalysisMutation.isPending}
                            >
                              Generate Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                      <div>
                        <h2 className="font-ibm-plex text-xl font-semibold text-[#212121] mb-4 flex items-center">
                          <span className="material-icons mr-2 text-[#0288D1]">timeline</span>
                          Timeline Analysis
                        </h2>
                        
                        {timeline && timeline.criticalWindows && timeline.criticalWindows.length > 0 ? (
                          <div>
                            <div className="bg-blue-50 border border-[#0288D1] rounded-lg p-5 mb-6">
                              <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-3">
                                Critical Time Windows
                              </h3>
                              <p className="text-[#212121] mb-4">
                                AI analysis has identified the following critical time windows that may be significant to the investigation:
                              </p>
                            </div>
                            
                            <div className="relative pl-8 border-l-2 border-[#0288D1]">
                              {timeline.criticalWindows.map((window, index) => (
                                <div key={index} className="mb-8 relative">
                                  <div className="absolute -left-4 top-0 w-6 h-6 rounded-full bg-[#0288D1] flex items-center justify-center text-white">
                                    <span className="material-icons text-sm">schedule</span>
                                  </div>
                                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <h4 className="font-ibm-plex font-medium text-[#212121] mb-1">
                                      {window.timeStart} - {window.timeEnd}
                                    </h4>
                                    <p className="text-[#757575] text-sm mb-2">
                                      {window.description}
                                    </p>
                                    <div className="flex justify-end">
                                      <Button variant="outline" size="sm">
                                        <span className="material-icons text-xs mr-1">search</span>
                                        Investigate
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                            <span className="material-icons text-4xl text-[#757575] mb-2">schedule</span>
                            <h3 className="font-ibm-plex text-lg font-medium mb-1">No Timeline Analysis Available</h3>
                            <p className="text-[#757575] mb-4">Generate an AI analysis to see critical time windows.</p>
                            <Button 
                              className="bg-[#0288D1] hover:bg-[#0288D1]/90"
                              onClick={handleGenerateAnalysis}
                              disabled={generateAnalysisMutation.isPending}
                            >
                              Generate Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Relationships Tab */}
                    {activeTab === 'relationships' && (
                      <div>
                        <h2 className="font-ibm-plex text-xl font-semibold text-[#212121] mb-4 flex items-center">
                          <span className="material-icons mr-2 text-[#0288D1]">hub</span>
                          Relationship Mapping
                        </h2>
                        
                        {relationships && relationships.keyRelationships && relationships.keyRelationships.length > 0 ? (
                          <div>
                            <div className="bg-blue-50 border border-[#0288D1] rounded-lg p-5 mb-6">
                              <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-3">
                                Key Relationship Analysis
                              </h3>
                              <p className="text-[#212121] mb-4">
                                AI has identified the following key relationships with potential conflicts that may be relevant to the case:
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {relationships.keyRelationships.map((rel, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-[#1A237E] flex items-center justify-center text-white mr-3">
                                      <span className="material-icons">person</span>
                                    </div>
                                    <div>
                                      <h4 className="font-ibm-plex font-medium text-[#212121]">{rel.name}</h4>
                                      <p className="text-[#757575] text-sm">{rel.relationship}</p>
                                    </div>
                                  </div>
                                  <div className="bg-red-50 p-3 rounded-md border border-red-100">
                                    <p className="text-[#D32F2F] text-sm font-medium mb-1">Conflict Type:</p>
                                    <p className="text-[#212121] text-sm">{rel.conflictType}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                            <span className="material-icons text-4xl text-[#757575] mb-2">people</span>
                            <h3 className="font-ibm-plex text-lg font-medium mb-1">No Relationship Analysis Available</h3>
                            <p className="text-[#757575] mb-4">Generate an AI analysis to see relationship mapping.</p>
                            <Button 
                              className="bg-[#0288D1] hover:bg-[#0288D1]/90"
                              onClick={handleGenerateAnalysis}
                              disabled={generateAnalysisMutation.isPending}
                            >
                              Generate Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Leads Tab */}
                    {activeTab === 'leads' && (
                      <div>
                        <h2 className="font-ibm-plex text-xl font-semibold text-[#212121] mb-4 flex items-center">
                          <span className="material-icons mr-2 text-[#0288D1]">lightbulb</span>
                          Lead Generation
                        </h2>
                        
                        {leads && leads.leads && leads.leads.length > 0 ? (
                          <div>
                            <div className="bg-blue-50 border border-[#0288D1] rounded-lg p-5 mb-6">
                              <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-3">
                                AI Generated Leads
                              </h3>
                              <p className="text-[#212121] mb-4">
                                Based on the case evidence and witness statements, the AI has generated the following potential leads for investigation:
                              </p>
                            </div>
                            
                            <div className="space-y-4">
                              {leads.leads.map((lead, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-start">
                                    <div className="bg-[#0288D1] rounded-full p-2 text-white mr-3 mt-1">
                                      <span className="material-icons">lightbulb</span>
                                    </div>
                                    <div>
                                      <h4 className="font-ibm-plex font-medium text-[#212121] mb-1">Lead #{index + 1}</h4>
                                      <p className="text-[#212121]">{lead}</p>
                                      <div className="flex justify-end mt-3">
                                        <Button size="sm" variant="outline" className="mr-2">
                                          <span className="material-icons text-xs mr-1">check</span>
                                          Mark as Pursued
                                        </Button>
                                        <Button size="sm" className="bg-[#1A237E] hover:bg-[#1A237E]/90">
                                          <span className="material-icons text-xs mr-1">assignment</span>
                                          Assign
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                            <span className="material-icons text-4xl text-[#757575] mb-2">lightbulb</span>
                            <h3 className="font-ibm-plex text-lg font-medium mb-1">No Lead Suggestions Available</h3>
                            <p className="text-[#757575] mb-4">Generate an AI analysis to see potential investigative leads.</p>
                            <Button 
                              className="bg-[#0288D1] hover:bg-[#0288D1]/90"
                              onClick={handleGenerateAnalysis}
                              disabled={generateAnalysisMutation.isPending}
                            >
                              Generate Analysis
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <span className="material-icons text-6xl text-[#0288D1] mb-4">psychology</span>
            <h2 className="font-ibm-plex text-2xl font-bold mb-2">AI Analysis Tools</h2>
            <p className="text-[#757575] max-w-lg mx-auto mb-6">
              Select a case to generate AI-powered insights that can help with your investigation. 
              The AI can analyze evidence, identify patterns, suggest leads, and more.
            </p>
            <Button className="bg-[#1A237E] hover:bg-[#1A237E]/90">
              Select a Case to Begin
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
