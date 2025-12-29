import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { calculateSubjectScores } from '../utils/calculations';
import { AddModuleForm } from '../components/AddModuleForm';
import { AddSubjectForm } from '../components/AddSubjectForm';

export function YearView() {
  const { yearNumber } = useParams<{ yearNumber: string }>();
  const { currentUser } = useAuth();
  const { years, getSubjectsForYear } = useAcademic();
  const [addingModule, setAddingModule] = useState<string | null>(null);
  const [addingSubject, setAddingSubject] = useState<string | null>(null);
  const isAdmin = currentUser?.isAdmin ?? false;
  
  const year = years.find((y) => y.yearNumber === parseInt(yearNumber || '0'));

  if (!year) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">📅</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Year not found</h2>
        <p className="text-gray-600 mb-6">The academic year you're looking for doesn't exist.</p>
        <Link 
          to="/dashboard" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
        >
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  // Get all subjects with their calculations (merged with user data)
  const subjectDataList = getSubjectsForYear(year.yearNumber);
  const subjectData = subjectDataList.map(({ subject, module }) => ({
    subject,
    module,
    calculations: calculateSubjectScores(subject),
  }));

  // Sort by final score (lowest first) to show priority subjects
  const prioritySubjects = [...subjectData]
    .filter((s) => s.calculations.finalS1Score > 0)
    .sort((a, b) => a.calculations.finalS1Score - b.calculations.finalS1Score);

  // Subjects most affected by absences
  const subjectsWithAbsences = [...subjectData]
    .filter((s) => s.subject.missedSessions > 0)
    .sort((a, b) => b.calculations.penalty - a.calculations.penalty);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-3 md:space-y-4">
          <Link
            to="/dashboard"
            className="text-white/80 hover:text-white text-xs md:text-sm inline-block font-medium hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs md:text-sm font-semibold border border-white/30">
            📅 Academic Year {year.yearNumber}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">Year {year.yearNumber}</h2>
          <p className="text-base md:text-xl text-primary-100">
            {year.semesters ? year.semesters.reduce((sum, s) => sum + s.modules.length, 0) : (year.modules?.length || 0)} Module{((year.semesters ? year.semesters.reduce((sum, s) => sum + s.modules.length, 0) : (year.modules?.length || 0)) !== 1) ? 's' : ''} • {subjectData.length} Subject{subjectData.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Priority Subjects */}
      {prioritySubjects.length > 0 && (
        <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-4 md:p-6 lg:p-8">
          <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4 md:mb-6">⚠️ Priority Subjects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {prioritySubjects.slice(0, 6).map(({ subject, module, calculations }) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="font-bold text-lg text-gray-900 mb-2">{subject.name}</div>
                <div className="text-sm text-gray-600 mb-3">{module.name}</div>
                <div className="text-2xl font-extrabold text-red-600">{calculations.finalS1Score.toFixed(2)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Absences Warning */}
      {subjectsWithAbsences.length > 0 && (
        <div className="glass-effect rounded-2xl shadow-medium border border-orange-200 bg-orange-50/50 p-4 md:p-6 lg:p-8">
          <h3 className="text-xl md:text-2xl font-extrabold text-orange-900 mb-4 md:mb-6">⚠️ Subjects with Absences</h3>
          <div className="space-y-4">
            {subjectsWithAbsences.slice(0, 5).map(({ subject, module, calculations }) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="block p-6 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-gray-900">{subject.name}</div>
                    <div className="text-sm text-gray-600">{module.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-orange-700 font-semibold">
                      {subject.missedSessions} absence{subject.missedSessions !== 1 ? 's' : ''}
                    </div>
                    <div className="text-lg font-extrabold text-orange-900">
                      -{calculations.penalty.toFixed(2)} pts
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-6">
        {(year.semesters ? year.semesters.flatMap(s => s.modules) : (year.modules || [])).map((module) => (
          <div key={module.id} className="glass-effect rounded-2xl shadow-medium border border-white/50 p-4 md:p-6 lg:p-8">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                   <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">{module.name}</h3>
                   {isAdmin && (
                     addingSubject === module.id ? (
                       <button
                         onClick={() => setAddingSubject(null)}
                         className="px-3 md:px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-xs md:text-sm font-semibold active:scale-95 w-full sm:w-auto"
                       >
                         Cancel
                       </button>
                     ) : (
                       <button
                         onClick={() => setAddingSubject(module.id)}
                         className="px-3 md:px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-xs md:text-sm font-semibold active:scale-95 w-full sm:w-auto"
                       >
                         ➕ Add Subject
                       </button>
                     )
                   )}
                 </div>
            {addingSubject === module.id && (
              <div className="mb-6">
                <AddSubjectForm module={module} onClose={() => setAddingSubject(null)} />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {getSubjectsForYear(year.yearNumber)
                .filter(({ module: m }) => m.id === module.id)
                .map(({ subject }) => {
                  const calc = calculateSubjectScores(subject);
                  return (
                    <Link
                      key={subject.id}
                      to={`/subject/${subject.id}`}
                      className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                        {subject.name}
                      </div>
                      {subject.coefficient && (
                        <div className="text-sm text-gray-500 mb-3">Coefficient: {subject.coefficient}</div>
                      )}
                      {subject.assignmentScore !== undefined && subject.examScore !== undefined ? (
                        <div className="text-2xl font-extrabold text-primary-600">{calc.finalS1Score.toFixed(2)}</div>
                      ) : (
                        <div className="text-sm text-gray-400">No scores yet</div>
                      )}
                      {subject.missedSessions > 0 && (
                        <div className="text-xs text-orange-600 mt-2 font-semibold">
                          {subject.missedSessions} absence{subject.missedSessions !== 1 ? 's' : ''}
                        </div>
                      )}
                    </Link>
                  );
                })}
            </div>
            {getSubjectsForYear(year.yearNumber).filter(({ module: m }) => m.id === module.id).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No subjects yet. Add one to get started!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Module */}
      {addingModule ? (
        <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8">
          <AddModuleForm year={year} onClose={() => setAddingModule(null)} />
        </div>
      ) : (
        <button
          onClick={() => setAddingModule('new')}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
        >
          ➕ Add Module
        </button>
      )}
    </div>
  );
}
