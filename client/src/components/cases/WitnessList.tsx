import { useQuery } from "@tanstack/react-query";
import { Witness } from "@shared/schema";
import { Link } from "wouter";

interface WitnessListProps {
  caseId: number;
}

export default function WitnessList({ caseId }: WitnessListProps) {
  const { data: witnesses, isLoading } = useQuery<Witness[]>({
    queryKey: [`/api/cases/${caseId}/witnesses`],
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Witness Information</h2>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Witness Information</h2>
        <Link href={`/witnesses?caseId=${caseId}`}>
          <a className="text-[#1A237E] hover:text-[#0288D1] flex items-center text-sm transition-all duration-200">
            <span className="material-icons text-sm mr-1">add</span>
            Add Witness
          </a>
        </Link>
      </div>
      
      <div className="space-y-4">
        {witnesses && witnesses.length > 0 ? (
          witnesses.map((witness) => (
            <div key={witness.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow hover:-translate-y-0.5">
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  <span className="material-icons text-gray-500">person</span>
                </div>
                <div>
                  <h3 className="font-ibm-plex font-medium">{witness.firstName} {witness.lastName}</h3>
                  <p className="text-sm text-[#757575]">{witness.relationship || "Witness"}</p>
                </div>
              </div>
              <div className="flex flex-wrap text-xs text-[#757575] mb-2">
                {witness.contactPhone && (
                  <div className="w-1/2 mb-1">
                    <span className="font-medium">Contact:</span> {witness.contactPhone}
                  </div>
                )}
                {witness.reliability && (
                  <div className="w-1/2 mb-1">
                    <span className="font-medium">Reliability:</span>{" "}
                    <span className={
                      witness.reliability === "high" 
                        ? "text-green-600"
                        : witness.reliability === "medium"
                        ? "text-amber-600"
                        : witness.reliability === "low"
                        ? "text-red-600"
                        : "text-[#FFC107]"
                    }>
                      {witness.reliability === "under_assessment" ? "Under Assessment" : 
                        witness.reliability.charAt(0).toUpperCase() + witness.reliability.slice(1)}
                    </span>
                  </div>
                )}
                {witness.interviewStatus && (
                  <div className="w-full">
                    <span className="font-medium">Interview Status:</span>{" "}
                    {witness.interviewStatus === "completed" 
                      ? "Completed" 
                      : witness.interviewStatus === "scheduled"
                      ? "Scheduled"
                      : "Pending"}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <a href="#" className={`text-sm flex items-center ${
                  witness.interviewStatus === "completed" ? "text-[#1A237E]" : "text-[#757575]"
                }`}>
                  <span className="material-icons text-sm mr-1">visibility</span>
                  {witness.interviewStatus === "completed" ? "View Statement" : "No Statement Yet"}
                </a>
                <a href="#" className="text-[#1A237E] text-sm flex items-center">
                  <span className="material-icons text-sm mr-1">
                    {witness.interviewStatus === "completed" ? "edit" : "event"}
                  </span>
                  {witness.interviewStatus === "completed" ? "Add Notes" : "Schedule"}
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="material-icons text-[#757575] mb-2">people</span>
            <p className="text-[#757575]">No witnesses have been added yet</p>
            <Link href={`/witnesses?caseId=${caseId}`}>
              <a className="text-[#1A237E] mt-2 inline-block">Add first witness</a>
            </Link>
          </div>
        )}
        
        {witnesses && witnesses.length > 3 && (
          <button className="w-full py-2 mt-2 border border-dashed border-[#757575] text-[#757575] rounded-md text-sm hover:text-[#1A237E] hover:border-[#1A237E] transition-all duration-200 flex items-center justify-center">
            <span className="material-icons text-sm mr-1">add</span>
            View All Witnesses ({witnesses.length})
          </button>
        )}
      </div>
    </div>
  );
}
