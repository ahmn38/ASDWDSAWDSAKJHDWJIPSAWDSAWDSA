import { useQuery } from "@tanstack/react-query";
import { Evidence } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";

interface EvidenceListProps {
  caseId: number;
}

export default function EvidenceList({ caseId }: EvidenceListProps) {
  const { data: evidence, isLoading } = useQuery<Evidence[]>({
    queryKey: [`/api/cases/${caseId}/evidence`],
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

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Evidence Collection</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex">
                <div className="w-10 h-10 bg-gray-200 rounded mr-3"></div>
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
        <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Evidence Collection</h2>
        <Link href={`/evidence?caseId=${caseId}`}>
          <a className="text-[#1A237E] hover:text-[#0288D1] flex items-center text-sm transition-all duration-200">
            <span className="material-icons text-sm mr-1">add</span>
            Add Evidence
          </a>
        </Link>
      </div>
      
      <div className="space-y-4">
        {evidence && evidence.length > 0 ? (
          evidence.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-200 hover:shadow hover:-translate-y-0.5">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <span className="material-icons text-[#424242] p-2 bg-gray-100 rounded mr-3">
                    {getTypeIcon(item.type)}
                  </span>
                  <div>
                    <h3 className="font-ibm-plex font-medium">{item.description?.split('.')[0] || "Evidence Item"}</h3>
                    <p className="text-sm text-[#757575]">Evidence #{item.evidenceNumber}</p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <div className="pl-11 mt-2">
                <p className="text-sm text-[#212121] mb-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap text-xs text-[#757575]">
                  {item.collectedBy && (
                    <div className="mr-4">
                      <span className="font-medium">Collected by:</span> {item.collectedBy}
                    </div>
                  )}
                  {item.collectedAt && (
                    <div className="mr-4">
                      <span className="font-medium">Date:</span> {format(new Date(item.collectedAt), 'MMM d, yyyy')}
                    </div>
                  )}
                  {item.location && (
                    <div>
                      <span className="font-medium">Location:</span> {item.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <span className="material-icons text-[#757575] mb-2">inventory_2</span>
            <p className="text-[#757575]">No evidence has been added to this case yet</p>
            <Link href={`/evidence?caseId=${caseId}`}>
              <a className="text-[#1A237E] mt-2 inline-block">Add first evidence item</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
