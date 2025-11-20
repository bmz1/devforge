import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { JsonTool } from './components/JsonTool';
import { Base64Tool } from './components/Base64Tool';
import { UuidTool } from './components/UuidTool';
import { JwtTool } from './components/JwtTool';
import { ToolType } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.JSON);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderTool = () => {
    switch (activeTool) {
      case ToolType.JSON: return <JsonTool />;
      case ToolType.BASE64: return <Base64Tool />;
      case ToolType.UUID: return <UuidTool />;
      case ToolType.JWT: return <JwtTool />;
      default: return <JsonTool />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-900 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        activeTool={activeTool} 
        onSelectTool={setActiveTool} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center p-4 border-b border-dark-700 bg-dark-800">
           <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 hover:text-white">
             <Menu size={24} />
           </button>
           <span className="ml-4 font-semibold text-white">DevForge</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 md:p-2">
          {renderTool()}
        </div>
      </main>

      {/* Global Styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;