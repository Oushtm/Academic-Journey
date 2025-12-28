import { Link } from 'react-router-dom';
import { useAcademic } from '../context/AcademicContext';
import { calculateSubjectScores } from '../utils/calculations';

export function Home() {
  const { years, getSubjectsForYear } = useAcademic();

  // Calculate overall statistics
  const totalModules = years.reduce((sum, y) => sum + y.modules.length, 0);
  const totalSubjects = years.reduce((sum, y) => 
    sum + y.modules.reduce((s, m) => s + m.subjects.length, 0), 0
  );
  
  // Get all subjects with user data
  const allSubjectsData = years.flatMap(year => 
    getSubjectsForYear(year.yearNumber).map(({ subject, module }) => ({
      subject,
      module,
      year,
    }))
  );
  
  const totalAbsences = allSubjectsData.reduce((sum, { subject }) => sum + subject.missedSessions, 0);

  // Get all subjects with scores
  const allSubjectsWithScores = allSubjectsData
    .filter(({ subject }) => subject.assignmentScore !== undefined && subject.examScore !== undefined)
    .map(({ subject, module, year }) => ({
      subject,
      module,
      year,
      calculations: calculateSubjectScores(subject),
    }));

  const averageScore = allSubjectsWithScores.length > 0
    ? allSubjectsWithScores.reduce((sum, item) => sum + item.calculations.finalS1Score, 0) / allSubjectsWithScores.length
    : null;

  // Get subjects needing attention
  const prioritySubjects = [...allSubjectsWithScores]
    .filter(item => item.calculations.finalS1Score > 0 && item.calculations.finalS1Score < 10)
    .sort((a, b) => a.calculations.finalS1Score - b.calculations.finalS1Score)
    .slice(0, 5);

  const subjectsWithAbsences = allSubjectsData
    .filter(({ subject }) => subject.missedSessions > 0)
    .map(({ subject, module, year }) => ({
      subject,
      module,
      year,
      calculations: calculateSubjectScores(subject),
    }))
    .sort((a, b) => b.calculations.penalty - a.calculations.penalty)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl shadow-2xl p-8 md:p-12 text-white animate-slide-up">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-4xl z-10 space-y-6">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/30">
            👋 Welcome back!
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Your Academic Journey
              <span className="block text-white/90">at EMSI</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 leading-relaxed">
              Track your 5-year academic progress, manage grades, monitor attendance, and stay organized.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="group px-8 py-4 bg-white text-primary-700 rounded-xl font-bold hover:bg-primary-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
            >
              <span>View Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/profile"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105 shadow-lg"
            >
              Manage Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group glass-effect rounded-2xl shadow-soft p-6 border border-white/50 card-hover animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Overall Average</div>
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">📊</div>
          </div>
          <div className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
            {averageScore !== null ? averageScore.toFixed(2) : '—'}
          </div>
          {averageScore !== null && (
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              averageScore >= 14 ? 'bg-green-100 text-green-700' : 
              averageScore >= 10 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {averageScore >= 14 ? '★ Excellent' : averageScore >= 10 ? '✓ Good' : '⚠ Needs Improvement'}
            </div>
          )}
        </div>

        <div className="group glass-effect rounded-2xl shadow-soft p-6 border border-white/50 card-hover animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Modules</div>
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">📚</div>
          </div>
          <div className="text-4xl font-extrabold text-gray-900 mb-2">{totalModules}</div>
          <div className="text-sm text-gray-500 font-medium">Across all years</div>
        </div>

        <div className="group glass-effect rounded-2xl shadow-soft p-6 border border-white/50 card-hover animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Subjects</div>
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">📖</div>
          </div>
          <div className="text-4xl font-extrabold text-gray-900 mb-2">{totalSubjects}</div>
          <div className="text-sm text-gray-500 font-medium">In your curriculum</div>
        </div>

        <div className="group glass-effect rounded-2xl shadow-soft p-6 border border-white/50 card-hover animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Absences</div>
            <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">⚠️</div>
          </div>
          <div className={`text-4xl font-extrabold mb-2 ${totalAbsences > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {totalAbsences}
          </div>
          <div className="text-sm text-gray-500 font-medium">Sessions missed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-2xl shadow-medium p-8 border border-white/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
          <h2 className="text-3xl font-extrabold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {years.map((year, index) => (
            <Link
              key={year.id}
              to={`/year/${year.yearNumber}`}
              className="group relative p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative flex items-center justify-between z-10">
                <div>
                  <div className="font-bold text-xl text-gray-900 group-hover:text-primary-700 mb-1">
                    Year {year.yearNumber}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {year.modules.length} modules • {year.modules.reduce((sum, m) => sum + m.subjects.length, 0)} subjects
                  </div>
                </div>
                <div className="text-2xl text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300">→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Priority Subjects */}
      {prioritySubjects.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl shadow-medium p-8 border-2 border-red-200/50 animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">🔴</span>
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent">
                Subjects Requiring Attention
              </h2>
            </div>
            <div className="space-y-3">
              {prioritySubjects.map(({ subject, module, year, calculations }) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="block group p-5 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900 group-hover:text-red-700 mb-1">
                        Year {year.yearNumber} • {module.name} • {subject.name}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Score: <span className="font-bold text-red-600">{calculations.finalS1Score.toFixed(2)}/20</span>
                      </div>
                    </div>
                    <div className="ml-4 px-4 py-2 bg-red-100 rounded-lg">
                      <div className="text-2xl font-extrabold text-red-600">
                        {calculations.finalS1Score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Absence Warnings */}
      {subjectsWithAbsences.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl shadow-medium p-8 border-2 border-orange-200/50 animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                Most Affected by Absences
              </h2>
            </div>
            <div className="space-y-3">
              {subjectsWithAbsences.map(({ subject, module, year, calculations }) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.id}`}
                  className="block group p-5 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900 group-hover:text-orange-700 mb-1">
                        Year {year.yearNumber} • {module.name} • {subject.name}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {subject.missedSessions} absence{subject.missedSessions !== 1 ? 's' : ''} • 
                        <span className="font-bold text-orange-600 ml-1">Penalty: -{calculations.penalty.toFixed(2)} points</span>
                      </div>
                    </div>
                    <div className="ml-4 px-4 py-2 bg-orange-100 rounded-lg">
                      <div className="text-2xl font-extrabold text-orange-600">
                        -{calculations.penalty.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Year Progress Overview */}
      <div className="glass-effect rounded-2xl shadow-medium p-8 border border-white/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
          <h2 className="text-3xl font-extrabold text-gray-900">Academic Years Overview</h2>
        </div>
        <div className="space-y-4">
          {years.map((year) => {
            const yearSubjectsData = getSubjectsForYear(year.yearNumber);
            const yearSubjects = yearSubjectsData.map(({ subject }) => subject);
            const yearSubjectsWithScores = yearSubjects.filter(
              s => s.assignmentScore !== undefined && s.examScore !== undefined
            );
            const yearAverage = yearSubjectsWithScores.length > 0
              ? yearSubjectsWithScores.reduce((sum, s) => {
                  const calc = calculateSubjectScores(s);
                  return sum + calc.finalS1Score;
                }, 0) / yearSubjectsWithScores.length
              : null;

             return (
               <Link
                 key={year.id}
                 to={`/year/${year.yearNumber}`}
                 className="block p-6 border-2 rounded-xl hover:border-primary-500 hover:shadow-lg transition-all group bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-primary-500/10"
               >
                 <div className="flex items-center justify-between">
                   <div className="flex-1">
                     <div className="flex items-center space-x-4 mb-3">
                       <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-700">
                         Year {year.yearNumber}
                       </h3>
                       {yearAverage !== null && (
                         <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                           yearAverage >= 14 
                             ? 'bg-green-100 text-green-700 border-green-300' :
                           yearAverage >= 12 
                             ? 'bg-blue-100 text-blue-700 border-blue-300' :
                           yearAverage >= 10 
                             ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                             'bg-red-100 text-red-700 border-red-300'
                         }`}>
                           {yearAverage.toFixed(2)}
                         </span>
                       )}
                     </div>
                     <div className="flex items-center space-x-6 text-sm text-gray-600 font-medium">
                       <span>{year.modules.length} modules</span>
                       <span>{yearSubjects.length} subjects</span>
                       <span>
                         {yearSubjects.reduce((sum: number, s) => sum + s.missedSessions, 0)} absences
                       </span>
                     </div>
                   </div>
                   <div className="text-gray-400 group-hover:text-primary-600 text-2xl group-hover:translate-x-2 transition-all duration-300">→</div>
                 </div>
               </Link>
             );
          })}
        </div>
      </div>
    </div>
  );
}

