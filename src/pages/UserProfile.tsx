import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { calculateSubjectScores } from '../utils/calculations';

export function UserProfile() {
  const { currentUser } = useAuth();
  const { years, getSubjectsForYear } = useAcademic();

  if (!currentUser) {
    return null;
  }

  // Get all user's subjects with their data
  const allUserSubjects = years.flatMap(year => 
    getSubjectsForYear(year.yearNumber).map(({ subject, module }) => ({
      subject,
      module,
      year,
      calculations: calculateSubjectScores(subject),
    }))
  );

  // Statistics
  const subjectsWithScores = allUserSubjects.filter(
    ({ subject }) => subject.assignmentScore !== undefined && subject.examScore !== undefined
  );
  const averageScore = subjectsWithScores.length > 0
    ? subjectsWithScores.reduce((sum, { calculations }) => sum + calculations.finalS1Score, 0) / subjectsWithScores.length
    : null;

  const totalAbsences = allUserSubjects.reduce((sum, { subject }) => sum + subject.missedSessions, 0);
  const totalLessons = allUserSubjects.reduce((sum, { subject }) => sum + (subject.lessons?.length || 0), 0);
  const reviewedLessons = allUserSubjects.reduce(
    (sum, { subject }) => sum + (subject.lessons?.filter(l => l.reviewStatus === 'Reviewed').length || 0),
    0
  );

  const subjectsWithHighAbsences = allUserSubjects
    .filter(({ subject }) => subject.missedSessions > 0)
    .sort((a, b) => b.calculations.penalty - a.calculations.penalty)
    .slice(0, 5);

  const prioritySubjects = subjectsWithScores
    .filter(({ calculations }) => calculations.finalS1Score > 0 && calculations.finalS1Score < 10)
    .sort((a, b) => a.calculations.finalS1Score - b.calculations.finalS1Score)
    .slice(0, 5);

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
            👤 Your Profile
          </div>
          <div className="space-y-2 sm:space-y-3 mt-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">My Profile</h2>
            <p className="text-base sm:text-lg md:text-xl text-primary-100 leading-relaxed">Your personal academic statistics and overview</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-5 sm:p-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center border-2 border-primary-300 flex-shrink-0">
            <span className="text-3xl sm:text-4xl">👤</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{currentUser.username}</h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Member since {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-soft group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-2">Average Score</div>
            <div className="text-3xl font-extrabold text-blue-900">
              {averageScore !== null ? averageScore.toFixed(2) : '—'}
            </div>
            {averageScore !== null && (
              <div className={`text-xs font-bold mt-1 ${
                averageScore >= 14 ? 'text-green-700' :
                averageScore >= 10 ? 'text-yellow-700' :
                'text-red-700'
              }`}>
                / 20.00
              </div>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 shadow-soft group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="text-sm text-orange-700 font-bold uppercase tracking-wide mb-2">Total Absences</div>
            <div className="text-3xl font-extrabold text-orange-900">{totalAbsences}</div>
            <div className="text-xs text-orange-600 mt-1">Sessions missed</div>
          </div>
        </div>

        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-soft group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="text-sm text-green-700 font-bold uppercase tracking-wide mb-2">Total Lessons</div>
            <div className="text-3xl font-extrabold text-green-900">{totalLessons}</div>
            <div className="text-xs text-green-600 mt-1">
              {reviewedLessons} reviewed
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-soft group hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="text-sm text-purple-700 font-bold uppercase tracking-wide mb-2">Subjects</div>
            <div className="text-3xl font-extrabold text-purple-900">{allUserSubjects.length}</div>
            <div className="text-xs text-purple-600 mt-1">
              {subjectsWithScores.length} with scores
            </div>
          </div>
        </div>
      </div>

      {/* Priority Subjects */}
      {prioritySubjects.length > 0 && (
        <div className="glass-effect rounded-2xl shadow-medium border border-red-200 bg-red-50/50 p-8">
          <h3 className="text-2xl font-extrabold text-red-900 mb-6">⚠️ Subjects Requiring Attention</h3>
          <div className="space-y-4">
            {prioritySubjects.map(({ subject, module, year, calculations }) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="block p-6 bg-white rounded-xl border-2 border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      Year {year.yearNumber} • {module.name} • {subject.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Score: {calculations.finalS1Score.toFixed(2)}/20
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-red-600">
                    {calculations.finalS1Score.toFixed(1)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Subjects with Absences */}
      {subjectsWithHighAbsences.length > 0 && (
        <div className="glass-effect rounded-2xl shadow-medium border border-orange-200 bg-orange-50/50 p-8">
          <h3 className="text-2xl font-extrabold text-orange-900 mb-6">⚠️ Subjects with Absences</h3>
          <div className="space-y-4">
            {subjectsWithHighAbsences.map(({ subject, module, year, calculations }) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="block p-6 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      Year {year.yearNumber} • {module.name} • {subject.name}
                    </div>
                    <div className="text-sm text-orange-700 mt-1">
                      {subject.missedSessions} absence{subject.missedSessions !== 1 ? 's' : ''} • 
                      Penalty: -{calculations.penalty.toFixed(2)} pts
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-orange-900">
                    -{calculations.penalty.toFixed(1)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Subjects Overview */}
      <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-6">All Your Subjects</h3>
        <div className="space-y-4">
          {years.map((year) => {
            const yearSubjects = getSubjectsForYear(year.yearNumber);
            if (yearSubjects.length === 0) return null;
            
            return (
              <div key={year.id} className="border-2 border-gray-200 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Year {year.yearNumber}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearSubjects.map(({ subject, module }) => {
                    const calc = calculateSubjectScores(subject);
                    return (
                      <Link
                        key={subject.id}
                        to={`/subject/${subject.id}`}
                        className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                      >
                        <div className="font-semibold text-gray-900 mb-1">{subject.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{module.name}</div>
                        {subject.assignmentScore !== undefined && subject.examScore !== undefined ? (
                          <div className="text-lg font-extrabold text-primary-600">
                            {calc.finalS1Score.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">No scores yet</div>
                        )}
                        {subject.missedSessions > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            {subject.missedSessions} absence{subject.missedSessions !== 1 ? 's' : ''}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



