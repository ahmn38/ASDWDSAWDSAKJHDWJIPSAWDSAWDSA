import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Evidence, Case } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EvidenceForm from "@/components/evidence/EvidenceForm";
import { useState } from "react";
import { format } from "date-fns";

export default function EvidenceVault() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const caseId = params.get("caseId") ? parseInt(params.get("caseId")!) : null;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  // Fetch cases for filter dropdown
  const { data: cases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Fetch evidence based on selected case
  const { data: evidence, isLoading } = useQuery<Evidence[]>({
    queryKey: [caseId ? `/api/cases/${caseId}/evidence` : '/api/evidence'],
    queryFn: async ({ queryKey }) => {
      if (!caseId) {
        // If we had a global evidence endpoint, we would use it here
        // For demo, just return evidence from the first case
        const firstCaseId = cases?.[0]?.id;
        if (!firstCaseId) return [];
        const res = await fetch(`/api/cases/${firstCaseId}/evidence`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch evidence");
        return res.json();
      }
      return queryClient.defaultQueryOptions().queryFn!({ queryKey });
    },
    enabled: !!cases || !!caseId,
  });

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case "collected":
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs rounded-full">Collected</span>;
      case "in_lab":
        return <span className="bg-green-100 text-[#388E3C] px-2 py-0.5 text-xs rounded-full">In Lab</span>;
      case "processed":
        return <span className="bg-blue-100 text-[#0288D1] px-2 py-0.5 text-xs rounded-full">Processed</span>;
      case "under_review":
        return <span className="bg-yellow-100 text-[#FFC107] px-2 py-0.5 text-xs rounded-full">Under Review</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 text-xs rounded-full">Unknown</span>;
    }
  };

  const getTypeIcon = (type: string | null | undefined) => {
    switch (type?.toLowerCase()) {
      case "physical":
        return "inventory_2";
      case "photo":
      case "image":
        return "photo_camera";
      case "document":
        return "receipt_long";
      case "digital":
        return "computer";
      case "biological":
        return "biotech";
      default:
        return "category";
    }
  };

  const handleEditEvidence = (item: Evidence) => {
    setSelectedEvidence(item);
    setIsFormOpen(true);
  };

  const handleCreateEvidence = () => {
    setSelectedEvidence(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEvidence(null);
  };

  const handleCaseFilter = (caseId: string) => {
    if (caseId === "all") {
      setLocation("/evidence");
    } else {
      setLocation(`/evidence?caseId=${caseId}`);
    }
  };

  // Find the current case
  const currentCase = caseId ? cases?.find(c => c.id === caseId) : null;

  return (
    <>
      {/* Breadcrumbs and Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center text-sm">
          <a href="/" className="text-[#1A237E]">Dashboard</a>
          <span className="mx-2 text-[#757575]">/</span>
          <span className="text-[#757575]">Evidence Vault</span>
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
            Evidence Vault {currentCase ? `- ${currentCase.title}` : ''}
          </h1>
          <Button 
            className="bg-[#1A237E] hover:bg-[#1A237E]/90"
            onClick={handleCreateEvidence}
          >
            <span className="material-icons mr-1 text-sm">add</span>
            Add Evidence
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

        {/* Evidence List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg p-6 h-40"></div>
            ))
          ) : evidence && evidence.length > 0 ? (
            evidence.map(item => (
              <Card 
                key={item.id} 
                className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                onClick={() => handleEditEvidence(item)}
              >
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="material-icons p-2 bg-gray-100 rounded mr-3 text-[#424242]">
                        {getTypeIcon(item.type)}
                      </span>
                      <div>
                        <h3 className="font-ibm-plex font-medium text-[#212121] line-clamp-1">
                          {item.evidenceNumber}
                        </h3>
                        <p className="text-xs text-[#757575]">{item.type}</p>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#212121] line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-[#757575]">
                      <div>
                        {item.collectedAt && (
                          <span>{format(new Date(item.collectedAt), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                      <div>
                        {item.collectedBy && <span>{item.collectedBy}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <span className="material-icons text-4xl text-[#757575] mb-2">inventory_2</span>
              <h3 className="font-ibm-plex text-lg font-medium mb-1">No Evidence Found</h3>
              <p className="text-[#757575] mb-4">
                {currentCase 
                  ? `No evidence has been added to ${currentCase.title} yet.` 
                  : "No evidence has been added to any cases yet."}
              </p>
              <Button 
                className="bg-[#1A237E] hover:bg-[#1A237E]/90"
                onClick={handleCreateEvidence}
              >
                Add First Evidence
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-ibm-plex text-lg font-semibold">
                {selectedEvidence ? 'Edit Evidence' : 'Add New Evidence'}
              </h2>
              <button 
                onClick={handleCloseForm}
                className="text-[#757575] hover:text-[#212121]"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="p-4">
              <EvidenceForm 
                evidence={selectedEvidence}
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
