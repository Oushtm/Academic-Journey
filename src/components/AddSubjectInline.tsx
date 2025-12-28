import { useState } from 'react';
import { generateId } from '../services/sharedStorage';
import type { SubjectStructure } from '../types';

interface AddSubjectInlineProps {
  onAdd: (subject: SubjectStructure) => void;
  onCancel: () => void;
}

export function AddSubjectInline({ onAdd, onCancel }: AddSubjectInlineProps) {
  const [subjectName, setSubjectName] = useState('');
  const [coefficient, setCoefficient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const newSubject: SubjectStructure = {
      id: generateId(),
      name: subjectName.trim(),
      coefficient: coefficient ? parseFloat(coefficient) : undefined,
    };

    onAdd(newSubject);
    setSubjectName('');
    setCoefficient('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-2 border-dashed border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-soft animate-scale-in">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Subject Name</label>
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            placeholder="Enter subject name"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Coefficient (Optional)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={coefficient}
            onChange={(e) => setCoefficient(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            placeholder="Enter coefficient"
          />
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
          >
            ➕ Add Subject
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

