import { useQuery } from "@tanstack/react-query";
import { Case, AiAnalysis } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface CaseSummaryProps {
  caseId: number;
  caseData: Case;
}

export default function CaseSummary({ caseId, caseData }: CaseSummaryProps) {
  const { data: analyses } = useQuery<AiAnalysis[]>({
    queryKey: [`/api/cases/${caseId}/analysis`],
  });

  // Find case summary analysis
  const caseSummaryAnalysis = analyses?.find(a => a.analysisType === "case_summary");
  const summary = caseSummaryAnalysis?.content as { summary: string; recommendations: string[] } | undefined;

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Case Summary</h2>
          {caseSummaryAnalysis && (
            <span className="text-xs bg-[#0288D1] bg-opacity-10 text-[#0288D1] px-2 py-1 rounded-full font-medium">AI Enhanced</span>
          )}
        </div>
        
        <p className="mb-4 text-[#212121]">
          {caseData.description || "No case description available."}
        </p>
        
        {summary && (
          <div className="bg-blue-50 border-l-4 border-[#0288D1] p-4 rounded mb-4">
            <div className="flex items-start">
              <span className="material-icons text-[#0288D1] mr-2">psychology</span>
              <div>
                <h3 className="font-ibm-plex font-medium text-[#0288D1] mb-1">AI Analysis Insight</h3>
                <p className="text-sm text-[#212121]">{summary.summary}</p>
                {summary.recommendations && summary.recommendations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-[#0288D1]">Recommendations:</p>
                    <ul className="text-sm list-disc list-inside text-[#212121] mt-1">
                      {summary.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap -mx-2">
          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-3">
            <div className="border border-gray-200 rounded p-3 bg-gray-50">
              <p className="text-xs text-[#757575] mb-1">Location</p>
              <p className="font-medium">{caseData.location || "Not specified"}</p>
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-3">
            <div className="border border-gray-200 rounded p-3 bg-gray-50">
              <p className="text-xs text-[#757575] mb-1">Date & Time</p>
              <p className="font-medium">
                {caseData.crimeDate 
                  ? format(new Date(caseData.crimeDate), 'MMM d, yyyy, HH:mm')
                  : "Not specified"}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-3">
            <div className="border border-gray-200 rounded p-3 bg-gray-50">
              <p className="text-xs text-[#757575] mb-1">Created</p>
              <p className="font-medium">
                {caseData.createdAt
                  ? format(new Date(caseData.createdAt), 'MMM d, yyyy')
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-3">
            <div className="border border-gray-200 rounded p-3 bg-gray-50">
              <p className="text-xs text-[#757575] mb-1">Crime Type</p>
              <p className="font-medium">{caseData.crimeType || "Not classified"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
