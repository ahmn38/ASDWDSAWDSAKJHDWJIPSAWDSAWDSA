import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Witness, Case } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import WitnessForm from "@/components/witnesses/WitnessForm";
import { queryClient } from "@/lib/queryClient";

export default function WitnessManagement() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const caseId = params.get("caseId") ? parseInt(params.get("caseId")!) : null;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWitness, setSelectedWitness] = useState<Witness | null>(null);

  // Fetch cases for filter dropdown
  const { data: cases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Fetch witnesses based on selected case
  const { data: witnesses, isLoading } = useQuery<Witness[]>({
    queryKey: [caseId ? `/api/cases/${caseId}/witnesses` : '/api/witnesses'],
    queryFn: async ({ queryKey }) => {
      if (!caseId) {
        // If we had a global witnesses endpoint, we would use it here
        // For demo, just return witnesses from the first case
        const firstCaseId = cases?.[0]?.id;
        if (!firstCaseId) return [];
        const res = await fetch(`/api/cases/${firstCaseId}/witnesses`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch witnesses");
        return res.json();
      }
      return queryClient.defaultQueryOptions().queryFn!({ queryKey });
    },
    enabled: !!cases || !!caseId,
  });

  const handleEditWitness = (witness: Witness) => {
    setSelectedWitness(witness);
    setIsFormOpen(true);
  };

  const handleCreateWitness = () => {
    setSelectedWitness(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedWitness(null);
  };

  const handleCaseFilter = (caseId: string) => {
    if (caseId === "all") {
      setLocation("/witnesses");
    } else {
      setLocation(`/witnesses?caseId=${caseId}`);
    }
  };

  // Get reliability badge color
  const getReliabilityBadge = (reliability: string | null | undefined) => {
    switch (reliability) {
      case "high":
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Medium</span>;
      case "low":
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">Low</span>;
      case "under_assessment":
        return <span className="px-2 py-0.5 bg-yellow-100 text-[#FFC107] rounded-full text-xs">Under Assessment</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    }
  };

  // Get interview status badge
  const getInterviewStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>;
      case "scheduled":
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Scheduled</span>;
      default:
        return <span className="px-2 py-0.5 bg-yellow-100 text-[#FFC107] rounded-full text-xs">Pending</span>;
    }
  };

  // Find current case
  const currentCase = caseId ? cases?.find(c => c.id === caseId) : null;

  return (
    <>
      {/* Breadcrumbs and Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center text-sm">
          <a href="/" className="text-[#1A237E]">Dashboard</a>
          <span className="mx-2 text-[#757575]">/</span>
          <span className="text-[#757575]">Witness Management</span>
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
          <h1 className="font-ibm-plex text-2xl font-bold text-[#212121]">
            Witness Management {currentCase ? `- ${currentCase.title}` : ''}
          </h1>
          <Button 
            className="bg-[#1A237E] hover:bg-[#1A237E]/90"
            onClick={handleCreateWitness}
          >
            <span className="material-icons mr-1 text-sm">add</span>
            Add Witness
          </Button>
        </div>

        {/* Case Filter */}
        <Card className="mb-6">
          <CardContent className="p-4 flex flex-wrap items-center">
            <span className="text-[#757575] mr-3">Filter by Case:</span>
            <select 
              className="border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
              value={caseId?.toString() || "all"}
              onChange={(e) => handleCaseFilter(e.target.value)}
            >
              <option value="all">All Cases</option>
              {cases?.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id.toString()}>
                  {caseItem.title} (#{caseItem.caseNumber})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* Witnesses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg p-6 h-40"></div>
            ))
          ) : witnesses && witnesses.length > 0 ? (
            witnesses.map(witness => (
              <Card 
                key={witness.id} 
                className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => handleEditWitness(witness)}
              >
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <span className="material-icons text-gray-500">person</span>
                      </div>
                      <div>
                        <h3 className="font-ibm-plex font-medium text-[#212121]">
                          {witness.firstName} {witness.lastName}
                        </h3>
                        <p className="text-xs text-[#757575]">{witness.relationship || "Witness"}</p>
                      </div>
                    </div>
                    {getReliabilityBadge(witness.reliability)}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-[#757575]">
                        <strong>Contact:</strong> {witness.contactPhone || "N/A"}
                      </div>
                      <div>
                        {getInterviewStatusBadge(witness.interviewStatus)}
                      </div>
                    </div>
                    <p className="text-sm text-[#212121] line-clamp-2">
                      {witness.notes || "No notes available."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <span className="material-icons text-4xl text-[#757575] mb-2">people</span>
              <h3 className="font-ibm-plex text-lg font-medium mb-1">No Witnesses Found</h3>
              <p className="text-[#757575] mb-4">
                {currentCase 
                  ? `No witnesses have been added to ${currentCase.title} yet.` 
                  : "No witnesses have been added to any cases yet."}
              </p>
              <Button 
                className="bg-[#1A237E] hover:bg-[#1A237E]/90"
                onClick={handleCreateWitness}
              >
                Add First Witness
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Witness Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-ibm-plex text-lg font-semibold">
                {selectedWitness ? 'Edit Witness' : 'Add New Witness'}
              </h2>
              <button 
                onClick={handleCloseForm}
                className="text-[#757575] hover:text-[#212121]"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="p-4">
              <WitnessForm 
                witness={selectedWitness}
                onClose={handleCloseForm}
                caseId={caseId}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
