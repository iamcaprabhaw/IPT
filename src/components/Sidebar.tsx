import React from 'react';
import { LayoutDashboard, Upload, FileText, Settings, LogOut } from 'lucide-react';
import { ViewType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload' as ViewType, label: 'Invoice Upload', icon: Upload },
    { id: 'reports' as ViewType, label: 'Reports', icon: FileText },
  ];

  return (
    <div className="w-64 h-screen bg-blue-700 text-white flex flex-col fixed left-0 top-0 shadow-xl">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight">IPT</h1>
        <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-semibold">Invoice Processor</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-white text-blue-700 shadow-lg" 
                  : "hover:bg-blue-600 text-blue-100"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-blue-700" : "text-blue-200 group-hover:text-white")} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-600">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-600 text-blue-100 transition-all">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white text-blue-100 transition-all mt-2">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
