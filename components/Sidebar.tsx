import React from 'react';
import { Braces, FileCode, Key, Fingerprint, Menu, X, ShieldCheck } from 'lucide-react';
import { ToolType } from '../types';

interface SidebarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, isOpen, setIsOpen }) => {
  const tools = [
    { id: ToolType.JSON, label: 'JSON Formatter', icon: Braces, desc: 'Format, Validate, Tree View' },
    { id: ToolType.BASE64, label: 'Base64', icon: FileCode, desc: 'Encode & Decode Strings' },
    { id: ToolType.UUID, label: 'UUID Generator', icon: Fingerprint, desc: 'Generate Unique IDs' },
    { id: ToolType.JWT, label: 'JWT Decoder', icon: ShieldCheck, desc: 'Decode Tokens securely' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-dark-800 border-r border-dark-700 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:relative md:inset-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">DevForge</h1>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary-600/10 border border-primary-600/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]' 
                      : 'hover:bg-dark-700 border border-transparent hover:border-dark-600'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {tool.label}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-primary-300' : 'text-slate-500'}`}>
                      {tool.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-dark-700">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Client-side secure environment</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};