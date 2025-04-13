import { useParams } from "wouter";
import CaseView from "@/components/cases/CaseView";

export default function CaseDetail() {
  const params = useParams<{ id: string }>();
  const caseId = parseInt(params.id);

  if (isNaN(caseId)) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <div className="material-icons text-4xl mb-2 text-[#757575]">error_outline</div>
          <h2 className="text-2xl font-ibm-plex font-bold mb-2">Invalid Case ID</h2>
          <p className="text-[#757575]">The case ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return <CaseView caseId={caseId} />;
}
