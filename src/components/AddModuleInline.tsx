import { useState } from 'react';
import { generateId } from '../services/sharedStorage';
import type { Module } from '../types';

interface AddModuleInlineProps {
  onAdd: (module: Module) => void;
  onCancel: () => void;
}

export function AddModuleInline({ onAdd, onCancel }: AddModuleInlineProps) {
  const [moduleName, setModuleName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleName.trim()) return;

    const newModule: Module = {
      id: generateId(),
      name: moduleName.trim(),
      subjects: [],
    };

    onAdd(newModule);
    setModuleName('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-2 border-dashed border-primary-400 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl shadow-soft animate-scale-in">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Module Name</label>
          <input
            type="text"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            placeholder="Enter module name"
            autoFocus
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
          >
            ➕ Add Module
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm font-bold hover:shadow-md"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

