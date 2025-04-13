import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Case } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: cases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });
  
  // Get recent cases (up to 3)
  const recentCases = cases?.slice(0, 3) || [];

  // Check if the current route matches the link
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside 
      className={`w-64 bg-white shadow-md flex flex-col transition-all duration-200 fixed md:relative h-full z-20 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="relative w-full">
          <span className="material-icons absolute left-3 top-2.5 text-[#757575]">search</span>
          <input 
            type="text" 
            placeholder="Search cases..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent" 
          />
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          <li className="px-4 mb-2">
            <Link href="/">
              <div 
                className={`flex items-center px-2 py-2 rounded transition-all duration-200 cursor-pointer ${
                  isActive("/") 
                    ? "bg-[#1A237E]/10 text-[#1A237E] border-l-4 border-[#1A237E]" 
                    : "text-[#212121] hover:text-[#1A237E] hover:bg-[#1A237E]/5"
                }`}
              >
                <span className="material-icons mr-3">dashboard</span>
                <span className="font-ibm-plex">Dashboard</span>
              </div>
            </Link>
          </li>
          <li className="px-4 mb-2">
            <Link href="/cases/create">
              <div 
                className={`flex items-center px-2 py-2 rounded transition-all duration-200 cursor-pointer ${
                  isActive("/cases/create") 
                    ? "bg-[#1A237E]/10 text-[#1A237E] border-l-4 border-[#1A237E]" 
                    : "text-[#212121] hover:text-[#1A237E] hover:bg-[#1A237E]/5"
                }`}
              >
                <span className="material-icons mr-3">folder</span>
                <span className="font-ibm-plex">Cases</span>
              </div>
            </Link>
          </li>
          <li className="px-4 mb-2">
            <Link href="/evidence">
              <div 
                className={`flex items-center px-2 py-2 rounded transition-all duration-200 cursor-pointer ${
                  isActive("/evidence") 
                    ? "bg-[#1A237E]/10 text-[#1A237E] border-l-4 border-[#1A237E]" 
                    : "text-[#212121] hover:text-[#1A237E] hover:bg-[#1A237E]/5"
                }`}
              >
                <span className="material-icons mr-3">inventory_2</span>
                <span className="font-ibm-plex">Evidence Vault</span>
              </div>
            </Link>
          </li>
          <li className="px-4 mb-2">
            <Link href="/witnesses">
              <div 
                className={`flex items-center px-2 py-2 rounded transition-all duration-200 cursor-pointer ${
                  isActive("/witnesses") 
                    ? "bg-[#1A237E]/10 text-[#1A237E] border-l-4 border-[#1A237E]" 
                    : "text-[#212121] hover:text-[#1A237E] hover:bg-[#1A237E]/5"
                }`}
              >
                <span className="material-icons mr-3">people</span>
                <span className="font-ibm-plex">Witnesses</span>
              </div>
            </Link>
          </li>
          <li className="px-4 mb-2">
            <Link href="/ai-analysis">
              <a 
                className={`flex items-center px-2 py-2 rounded transition-all duration-200 ${
                  isActive("/ai-analysis") 
                    ? "bg-[#1A237E]/10 text-[#1A237E] border-l-4 border-[#1A237E]" 
                    : "text-[#212121] hover:text-[#1A237E] hover:bg-[#1A237E]/5"
                }`}
              >
                <span className="material-icons mr-3">psychology</span>
                <span className="font-ibm-plex">AI Analysis</span>
              </a>
            </Link>
          </li>
        </ul>
        
        <div className="mt-8 px-4">
          <h3 className="font-ibm-plex font-medium text-xs uppercase text-[#757575] tracking-wider mb-3 px-2">Recent Cases</h3>
          <ul>
            {recentCases.map((caseItem) => (
              <li key={caseItem.id} className="mb-1">
                <Link href={`/cases/${caseItem.id}`}>
                  <a className="flex items-center px-2 py-1.5 text-sm text-[#212121] rounded hover:text-[#1A237E] transition-all duration-200">
                    <span 
                      className={`w-2 h-2 rounded-full mr-2 ${
                        caseItem.priority === "high" ? "bg-[#D32F2F]" : 
                        caseItem.priority === "medium" ? "bg-[#FFC107]" : 
                        "bg-[#0288D1]"
                      }`}
                    ></span>
                    <span>{caseItem.title}</span>
                  </a>
                </Link>
              </li>
            ))}
            {recentCases.length === 0 && (
              <li className="text-sm text-[#757575] px-2">No recent cases</li>
            )}
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Link href="/cases/create">
          <a className="flex items-center justify-center w-full px-4 py-2 text-[#1A237E] bg-[#1A237E] bg-opacity-10 rounded-md font-ibm-plex transition-all duration-200 hover:bg-opacity-20">
            <span className="material-icons mr-2">add</span>
            <span>New Case</span>
          </a>
        </Link>
      </div>
    </aside>
  );
}
