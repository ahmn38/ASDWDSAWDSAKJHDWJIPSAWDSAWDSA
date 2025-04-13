import { useQuery } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { format } from "date-fns";

import CaseSummary from "./CaseSummary";
import EvidenceList from "./EvidenceList";
import WitnessList from "./WitnessList";
import AIAnalysis from "./AIAnalysis";
import CaseActivityLog from "./ActivityLog";

interface CaseViewProps {
  caseId: number;
}

export default function CaseView({ caseId }: CaseViewProps) {
  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: [`/api/cases/${caseId}`],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 h-60 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <div className="material-icons text-4xl mb-2 text-[#757575]">folder_off</div>
          <h2 className="text-2xl font-ibm-plex font-bold mb-2">Case Not Found</h2>
          <p className="text-[#757575]">The case you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumbs and Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center text-sm">
          <a href="#" className="text-[#1A237E]">Cases</a>
          <span className="mx-2 text-[#757575]">/</span>
          <a href="#" className="text-[#1A237E]">{caseData.title}</a>
          <span className="mx-2 text-[#757575]">/</span>
          <span className="text-[#757575]">Case Overview</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[#212121] shadow-sm hover:bg-gray-50 text-sm flex items-center transition-all duration-200">
            <span className="material-icons text-[#757575] mr-1 text-sm">share</span>
            Share
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[#212121] shadow-sm hover:bg-gray-50 text-sm flex items-center transition-all duration-200">
            <span className="material-icons text-[#757575] mr-1 text-sm">print</span>
            Print
          </button>
          <button className="px-3 py-1.5 bg-[#1A237E] text-white rounded-md shadow-sm hover:bg-opacity-90 text-sm flex items-center transition-all duration-200">
            <span className="material-icons mr-1 text-sm">edit</span>
            Edit Case
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Case Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center mb-2">
              <h1 className="font-ibm-plex text-2xl font-bold text-[#212121]">{caseData.title}</h1>
              <span 
                className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full ${
                  caseData.priority === 'high' 
                    ? 'bg-[#D32F2F] text-white' 
                    : caseData.priority === 'medium'
                    ? 'bg-[#FFC107] text-[#212121]'
                    : 'bg-[#0288D1] text-white'
                }`}
              >
                {caseData.priority?.charAt(0).toUpperCase() + caseData.priority?.slice(1)} Priority
              </span>
            </div>
            <p className="text-[#757575] text-sm">
              Case #{caseData.caseNumber} • Opened on {caseData.createdAt ? format(new Date(caseData.createdAt), 'MMMM d, yyyy') : 'Unknown date'}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <div className="mr-4">
              <p className="text-xs text-[#757575] mb-1">Case Status</p>
              <div className="flex items-center">
                <span 
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    caseData.status === 'active' 
                      ? 'bg-[#D32F2F]' 
                      : caseData.status === 'closed'
                      ? 'bg-[#424242]'
                      : 'bg-[#0288D1]'
                  }`}
                ></span>
                <span className="font-ibm-plex font-medium capitalize">{caseData.status}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#757575] mb-1">Lead Detective</p>
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center mr-1">
                  <span className="material-icons text-xs">person</span>
                </div>
                <span className="font-ibm-plex font-medium">Det. Sarah Johnson</span>
              </div>
            </div>
          </div>
        </div>

        {/* Case Summary */}
        <CaseSummary caseId={caseId} caseData={caseData} />

        {/* Evidence and Witness Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Evidence List */}
          <div className="md:col-span-2">
            <EvidenceList caseId={caseId} />
          </div>
          
          {/* Witness List */}
          <div>
            <WitnessList caseId={caseId} />
          </div>
        </div>
        
        {/* AI Analysis */}
        <AIAnalysis caseId={caseId} />
        
        {/* Activity Log */}
        <CaseActivityLog caseId={caseId} />
      </div>
    </>
  );
}
