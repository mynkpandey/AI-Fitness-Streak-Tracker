import { Link, useLocation } from "wouter";
import { Home, BarChart2, Zap, Settings } from "lucide-react";
import { useState } from "react";
import { AddActivityModal } from "@/components/activity/add-activity-modal";

export default function BottomNav() {
  const [location] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 inset-x-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-around">
            <Link href="/">
              <div className={`flex flex-col items-center py-3 px-3 ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
                <Home className="h-6 w-6" />
                <span className="text-xs mt-1 font-medium">Home</span>
              </div>
            </Link>
            
            <Link href="/stats">
              <div className={`flex flex-col items-center py-3 px-3 ${location === '/stats' ? 'text-primary' : 'text-gray-500'}`}>
                <BarChart2 className="h-6 w-6" />
                <span className="text-xs mt-1">Stats</span>
              </div>
            </Link>
            
            <button 
              className="flex flex-col items-center py-2 px-3 add-activity-button"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="bg-accent rounded-full p-1 -mt-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs mt-1 text-gray-500">Add</span>
            </button>
            
            <Link href="/insights">
              <div className={`flex flex-col items-center py-3 px-3 ${location === '/insights' ? 'text-primary' : 'text-gray-500'}`}>
                <Zap className="h-6 w-6" />
                <span className="text-xs mt-1">Insights</span>
              </div>
            </Link>
            
            <Link href="/settings">
              <div className={`flex flex-col items-center py-3 px-3 ${location === '/settings' ? 'text-primary' : 'text-gray-500'}`}>
                <Settings className="h-6 w-6" />
                <span className="text-xs mt-1">Settings</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>
      
      <AddActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
