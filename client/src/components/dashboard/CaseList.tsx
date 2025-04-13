import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function CaseList() {
  const { data: cases, isLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Active Cases</h2>
            <Link href="/cases/create">
              <a className="text-[#1A237E] hover:text-[#0288D1] flex items-center text-sm transition-all duration-200">
                <span className="material-icons text-sm mr-1">add</span>
                New Case
              </a>
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 h-20 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Active Cases</h2>
          <Link href="/cases/create">
            <a className="text-[#1A237E] hover:text-[#0288D1] flex items-center text-sm transition-all duration-200">
              <span className="material-icons text-sm mr-1">add</span>
              New Case
            </a>
          </Link>
        </div>
        
        <div className="space-y-4">
          {cases && cases.length > 0 ? (
            cases.map((caseItem) => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                <a className="block">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-ibm-plex font-medium text-[#212121]">{caseItem.title}</h3>
                          <span 
                            className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full ${
                              caseItem.priority === 'high' 
                                ? 'bg-[#D32F2F] text-white' 
                                : caseItem.priority === 'medium'
                                ? 'bg-[#FFC107] text-[#212121]'
                                : 'bg-[#0288D1] text-white'
                            }`}
                          >
                            {caseItem.priority?.charAt(0).toUpperCase() + caseItem.priority?.slice(1)} Priority
                          </span>
                        </div>
                        <p className="text-sm text-[#757575]">
                          Case #{caseItem.caseNumber} • {caseItem.crimeDate ? format(new Date(caseItem.crimeDate), 'MMM d, yyyy') : 'No date'}
                        </p>
                      </div>
                      <span 
                        className={`px-2 py-1 text-xs rounded-full ${
                          caseItem.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : caseItem.status === 'closed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {caseItem.status?.charAt(0).toUpperCase() + caseItem.status?.slice(1)}
                      </span>
                    </div>
                    
                    {caseItem.description && (
                      <p className="text-sm text-[#212121] mt-2 line-clamp-2">{caseItem.description}</p>
                    )}
                    
                    <div className="flex flex-wrap mt-3 text-xs text-[#757575]">
                      {caseItem.location && (
                        <div className="mr-4">
                          <span className="font-medium">Location:</span> {caseItem.location}
                        </div>
                      )}
                      {caseItem.crimeType && (
                        <div className="mr-4">
                          <span className="font-medium">Type:</span> {caseItem.crimeType}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-[#757575]">
              <span className="material-icons mb-2 text-3xl">folder_off</span>
              <p>No cases found</p>
              <Link href="/cases/create">
                <a className="text-[#1A237E] mt-2 inline-block">Create your first case</a>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
