import { useState } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { generateId } from '../services/sharedStorage';
import type { Module, SubjectStructure } from '../types';

interface AddSubjectFormProps {
  module: Module;
  onClose: () => void;
}

export function AddSubjectForm({ module, onClose }: AddSubjectFormProps) {
  const { years, updateStructure } = useAcademic();
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

    const updatedYears = years.map((y) => ({
      ...y,
      modules: y.modules.map((m) =>
        m.id === module.id
          ? { ...m, subjects: [...m.subjects, newSubject] }
          : m
      ),
    }));

    updateStructure(updatedYears);
    setSubjectName('');
    setCoefficient('');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          📖 Subject Name
        </label>
        <input
          type="text"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
          placeholder="Enter subject name"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          ⚖️ Coefficient (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={coefficient}
          onChange={(e) => setCoefficient(e.target.value)}
          className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
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
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm font-bold hover:shadow-md"
        >
          ✕ Cancel
        </button>
      </div>
    </form>
  );
}

