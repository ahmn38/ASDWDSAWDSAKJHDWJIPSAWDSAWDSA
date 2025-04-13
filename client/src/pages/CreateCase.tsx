import CreateCaseForm from "@/components/cases/CreateCaseForm";

export default function CreateCase() {
  return (
    <>
      {/* Breadcrumbs and Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center text-sm">
          <a href="#" className="text-[#1A237E]">Cases</a>
          <span className="mx-2 text-[#757575]">/</span>
          <span className="text-[#757575]">New Case</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-ibm-plex text-2xl font-bold text-[#212121]">Create New Case</h1>
        </div>

        <CreateCaseForm />
      </div>
    </>
  );
}
