import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { AddModuleInline } from '../components/AddModuleInline';
import { AddSubjectInline } from '../components/AddSubjectInline';
import { UserProfile } from './UserProfile';
import type { Module, SubjectStructure } from '../types';

export function Profile() {
  const { currentUser } = useAuth();
  const { years, updateStructure } = useAcademic();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<{ [yearNumber: number]: 1 | 2 }>({});
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState<{ year: number; semester: 1 | 2 } | null>(null);
  const [addingSubject, setAddingSubject] = useState<{ year: number; semester: 1 | 2; module: string } | null>(null);

  // If not admin, redirect to user profile
  if (!currentUser?.isAdmin) {
    return <UserProfile />;
  }

  // Helper to get current semester for a year
  const getCurrentSemester = (yearNumber: number): 1 | 2 => {
    return selectedSemester[yearNumber] || 1;
  };

  const handleAddModule = (yearNumber: number, semesterNum: 1 | 2, module: Module) => {
    const updatedYears = years.map((y) =>
      y.yearNumber === yearNumber && y.semesters
        ? {
            ...y,
            semesters: y.semesters.map((s) =>
              s.semesterNumber === semesterNum
                ? { ...s, modules: [...s.modules, module] }
                : s
            ),
          }
        : y
    );

    updateStructure(updatedYears);
    setAddingModule(null);
  };

  const handleAddSubject = (yearNumber: number, semesterNum: 1 | 2, moduleId: string, subject: SubjectStructure) => {
    const updatedYears = years.map((y) =>
      y.yearNumber === yearNumber && y.semesters
        ? {
            ...y,
            semesters: y.semesters.map((s) =>
              s.semesterNumber === semesterNum
                ? {
                    ...s,
                    modules: s.modules.map((m) =>
                      m.id === moduleId
                        ? { ...m, subjects: [...m.subjects, subject] }
                        : m
                    ),
                  }
                : s
            ),
          }
        : y
    );

    updateStructure(updatedYears);
    setAddingSubject(null);
  };

  const handleDeleteModule = (yearNumber: number, semesterNum: 1 | 2, moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? All subjects will be deleted.')) return;

    const updatedYears = years.map((y) =>
      y.yearNumber === yearNumber && y.semesters
        ? {
            ...y,
            semesters: y.semesters.map((s) =>
              s.semesterNumber === semesterNum
                ? { ...s, modules: s.modules.filter((m) => m.id !== moduleId) }
                : s
            ),
          }
        : y
    );

    updateStructure(updatedYears);
  };

  const handleDeleteSubject = (yearNumber: number, semesterNum: 1 | 2, moduleId: string, subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? All data will be lost.')) return;

    const updatedYears = years.map((y) =>
      y.yearNumber === yearNumber && y.semesters
        ? {
            ...y,
            semesters: y.semesters.map((s) =>
              s.semesterNumber === semesterNum
                ? {
                    ...s,
                    modules: s.modules.map((m) =>
                      m.id === moduleId
                        ? { ...m, subjects: m.subjects.filter((s) => s.id !== subjectId) }
                        : m
                    ),
                  }
                : s
            ),
          }
        : y
    );

    updateStructure(updatedYears);
  };

  const handleRenameModule = (yearNumber: number, semesterNum: 1 | 2, moduleId: string, newName: string) => {
    const updatedYears = years.map((y) =>
      y.yearNumber === yearNumber && y.semesters
        ? {
            ...y,
            semesters: y.semesters.map((s) =>
              s.semesterNumber === semesterNum
                ? {
                    ...s,
                    modules: s.modules.map((m) =>
                      m.id === moduleId ? { ...m, name: newName } : m
                    ),
                  }
                : s
            ),
          }
        : y
    );

    updateStructure(updatedYears);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <Link to="/" className="text-white/80 hover:text-white text-sm inline-block font-medium hover:underline mb-4 block">
            ← Back to Home
          </Link>
          <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold border border-white/30 mb-4">
            ⚙️ Admin Control Panel
          </div>
          <div className="space-y-2 sm:space-y-3 mt-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">Admin Profile & Management</h2>
            <p className="text-base sm:text-lg md:text-xl text-primary-100 leading-relaxed">Manage academic structure, modules, subjects, and users</p>
          </div>
          <div className="flex gap-4 mt-4">
            <Link
              to="/users"
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-bold border border-white/30"
            >
              👥 Manage Users
            </Link>
          </div>
        </div>
      </div>

      {/* Academic Structure */}
      <div className="space-y-6">
        {years.map((year, yearIndex) => (
          <div key={year.id} className="glass-effect rounded-2xl shadow-large border border-white/50 overflow-hidden animate-slide-up" style={{ animationDelay: `${yearIndex * 0.1}s` }}>
            {/* Year Header */}
            <div
              className="p-8 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white cursor-pointer hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 transition-all duration-300 relative overflow-hidden group"
              onClick={() => setExpandedYear(expandedYear === year.yearNumber ? null : year.yearNumber)}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border-2 border-white/30">
                    <span className="text-3xl font-extrabold">{year.yearNumber}</span>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold mb-1">Year {year.yearNumber}</div>
                    <div className="text-primary-100 font-medium">
                      {year.semesters ? (
                        <>
                          {year.semesters.reduce((sum, s) => sum + s.modules.length, 0)} modules •{' '}
                          {year.semesters.reduce((sum, s) => sum + s.modules.reduce((mSum: number, m) => mSum + m.subjects.length, 0), 0)} subjects
                        </>
                      ) : (
                        <>
                          {year.modules?.length || 0} modules •{' '}
                          {year.modules?.reduce((sum: number, m) => sum + m.subjects.length, 0) || 0} subjects
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-3xl transform transition-transform duration-300">
                  {expandedYear === year.yearNumber ? '▲' : '▼'}
                </div>
              </div>
            </div>
            </div>

            {/* Year Content */}
            {expandedYear === year.yearNumber && year.semesters && (
              <div className="bg-white/50">
                {/* Semester Tabs */}
                <div className="flex border-b-2 border-gray-200">
                  {year.semesters.map((semester) => (
                    <button
                      key={semester.id}
                      onClick={() => setSelectedSemester({ ...selectedSemester, [year.yearNumber]: semester.semesterNumber })}
                      className={`flex-1 px-6 py-4 font-bold text-lg transition-all duration-300 ${
                        getCurrentSemester(year.yearNumber) === semester.semesterNumber
                          ? 'bg-white text-primary-700 border-b-4 border-primary-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      📚 Semester {semester.semesterNumber} (S{semester.semesterNumber})
                    </button>
                  ))}
                </div>

                {/* Semester Content */}
                {year.semesters.map((semester) => (
                  getCurrentSemester(year.yearNumber) === semester.semesterNumber && (
                    <div key={semester.id} className="p-8 space-y-6">
                      {addingModule?.year === year.yearNumber && addingModule?.semester === semester.semesterNumber ? (
                        <AddModuleInline
                          onAdd={(module) => handleAddModule(year.yearNumber, semester.semesterNumber, module)}
                          onCancel={() => setAddingModule(null)}
                        />
                      ) : semester.modules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-4">No modules in S{semester.semesterNumber} yet</p>
                          <button
                            onClick={() => setAddingModule({ year: year.yearNumber, semester: semester.semesterNumber })}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            + Add Module to S{semester.semesterNumber}
                          </button>
                        </div>
                      ) : (
                        <>
                          {semester.modules.map((module, moduleIndex) => (
                      <div key={module.id} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 animate-scale-in" style={{ animationDelay: `${moduleIndex * 0.05}s` }}>
                        {/* Module Header */}
                        <div
                          className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border-b-2 border-gray-200"
                          onClick={() =>
                            setExpandedModule(expandedModule === module.id ? null : module.id)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <span className="text-primary-700 font-bold">📚</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{module.name}</h3>
                                <span className="text-sm text-gray-600 font-medium">
                                  {module.subjects.length} subject{module.subjects.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newName = prompt('Enter new module name:', module.name);
                                  if (newName?.trim()) {
                                    handleRenameModule(year.yearNumber, semester.semesterNumber, module.id, newName.trim());
                                  }
                                }}
                                className="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 hover:shadow-md transition-all duration-300"
                              >
                                ✏️ Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModule(year.yearNumber, semester.semesterNumber, module.id);
                                }}
                                className="px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-300"
                              >
                                🗑️ Delete
                              </button>
                              <div className="text-gray-500 ml-3 text-xl transform transition-transform duration-300">
                                {expandedModule === module.id ? '▲' : '▼'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Module Content */}
                        {expandedModule === module.id && (
                          <div className="p-6 bg-white space-y-4">
                            {addingSubject?.year === year.yearNumber && addingSubject?.semester === semester.semesterNumber && addingSubject?.module === module.id ? (
                              <AddSubjectInline
                                onAdd={(subject) => handleAddSubject(year.yearNumber, semester.semesterNumber, module.id, subject)}
                                onCancel={() => setAddingSubject(null)}
                              />
                            ) : module.subjects.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                <p className="mb-3">No subjects added yet</p>
                                <button
                                  onClick={() => setAddingSubject({ year: year.yearNumber, semester: semester.semesterNumber, module: module.id })}
                                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                >
                                  + Add Subject
                                </button>
                              </div>
                            ) : (
                              <>
                                {module.subjects.map((subject) => (
                                  <div key={subject.id} className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 transition-all duration-300 shadow-soft hover:shadow-medium group">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center border border-primary-300">
                                            <span className="text-primary-700 font-bold">📖</span>
                                          </div>
                                          <div className="flex-1">
                                            <Link
                                              to={`/subject/${subject.id}`}
                                              className="font-bold text-lg text-gray-900 hover:text-primary-700 transition-colors"
                                            >
                                              {subject.name}
                                            </Link>
                                            {subject.coefficient && (
                                              <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold border border-primary-300">
                                                Coef: {subject.coefficient}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 ml-6">
                                        <button
                                          onClick={() => handleDeleteSubject(year.yearNumber, semester.semesterNumber, module.id, subject.id)}
                                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-300 text-sm font-semibold"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  onClick={() => setAddingSubject({ year: year.yearNumber, semester: semester.semesterNumber, module: module.id })}
                                  className="w-full px-6 py-4 border-2 border-dashed border-primary-300 bg-primary-50 text-primary-700 rounded-xl hover:border-primary-500 hover:bg-primary-100 hover:shadow-md transition-all duration-300 font-semibold"
                                >
                                  ➕ Add Subject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setAddingModule({ year: year.yearNumber, semester: semester.semesterNumber })}
                      className="w-full px-6 py-4 border-2 border-dashed border-primary-300 bg-primary-50 text-primary-700 rounded-xl hover:border-primary-500 hover:bg-primary-100 hover:shadow-md transition-all duration-300 font-bold text-lg"
                    >
                      ➕ Add Module to S{semester.semesterNumber}
                    </button>
                  </>
                )}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


