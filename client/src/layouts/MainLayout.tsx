import { useState, ReactNode } from "react";
import Sidebar from "@/components/ui/sidebar";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-[#1A237E] text-white h-16 flex items-center justify-between px-4 shadow-md z-10">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 md:hidden"
          >
            <span className="material-icons">menu</span>
          </button>
          <div className="flex items-center">
            <span className="material-icons mr-2">local_police</span>
            <h1 className="font-ibm-plex text-xl font-bold">DetectiveHub</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="material-icons cursor-pointer">notifications</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#D32F2F]"></span>
          </div>
          <div className="relative">
            <span className="material-icons cursor-pointer">help_outline</span>
          </div>
          <div className="flex items-center ml-4 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              <span className="material-icons text-sm">person</span>
            </div>
            <span className="font-ibm-plex text-sm hidden md:block">Det. Sarah Johnson</span>
            <span className="material-icons text-sm ml-1">arrow_drop_down</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F5F5F5]">
          {children}
        </main>
      </div>
    </div>
  );
}
