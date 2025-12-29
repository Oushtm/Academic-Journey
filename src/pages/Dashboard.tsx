import { Link } from 'react-router-dom';
import { useAcademic } from '../context/AcademicContext';
import { calculateSubjectScores } from '../utils/calculations';

export function Dashboard() {
  const { years, getSubjectsForYear } = useAcademic();

  // Calculate statistics for each year
  const yearStats = years.map((year) => {
    const allSubjectsData = getSubjectsForYear(year.yearNumber);
    const allSubjects = allSubjectsData.map(({ subject }) => subject);
    const subjectsWithScores = allSubjects.filter(
      (s) => s.assignmentScore !== undefined && s.examScore !== undefined
    );
    
    const scores = subjectsWithScores.map((subject) => {
      const calc = calculateSubjectScores(subject);
      return calc.finalS1Score;
    });

    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    const totalAbsences = allSubjects.reduce((sum, s) => sum + s.missedSessions, 0);
    const subjectsWithHighAbsences = allSubjects.filter(
      (s) => s.missedSessions > 0
    );

    return {
      year,
      averageScore,
      totalAbsences,
      subjectsWithHighAbsences: subjectsWithHighAbsences.length,
      totalSubjects: allSubjects.length,
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 lg:p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-3 md:space-y-4">
          <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs md:text-sm font-semibold border border-white/30">
            📊 Performance Overview
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">Academic Dashboard</h2>
            <p className="text-base md:text-xl text-primary-100">Your complete 5-year journey at EMSI • Track your progress and achievements</p>
          </div>
        </div>
      </div>

      {/* Year Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {yearStats.map(({ year, averageScore, totalAbsences, subjectsWithHighAbsences, totalSubjects }, index) => (
          <Link
            key={year.id}
            to={`/year/${year.yearNumber}`}
            className="group glass-effect rounded-2xl shadow-medium border border-white/50 p-5 md:p-6 lg:p-8 card-hover animate-scale-in relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Year {year.yearNumber}
                </h3>
                {averageScore !== null && (
                  <div className={`px-4 py-2 rounded-xl font-extrabold text-2xl shadow-lg ${
                    averageScore >= 14 ? 'bg-green-100 text-green-700' :
                    averageScore >= 12 ? 'bg-blue-100 text-blue-700' :
                    averageScore >= 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {averageScore.toFixed(1)}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-semibold">📚 Modules</span>
                  <span className="font-bold text-gray-900 text-lg">{year.semesters ? year.semesters.reduce((sum, s) => sum + s.modules.length, 0) : (year.modules?.length || 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-semibold">📖 Subjects</span>
                  <span className="font-bold text-gray-900 text-lg">{totalSubjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-semibold">⚠️ Absences</span>
                  <span className={`font-bold text-lg ${totalAbsences > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                    {totalAbsences}
                  </span>
                </div>
                {subjectsWithHighAbsences > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-orange-700 font-semibold">⚠️ Affected Subjects</span>
                    <span className="font-bold text-orange-700 text-lg">{subjectsWithHighAbsences}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-4 md:p-6 lg:p-8">
        <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
          <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Quick Statistics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-soft group hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-2">Total Modules</div>
              <div className="text-4xl font-extrabold text-blue-900">
                {years.reduce((sum, y) => sum + (y.semesters ? y.semesters.reduce((s, sem) => s + sem.modules.length, 0) : (y.modules?.length || 0)), 0)}
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-soft group hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="text-sm text-green-700 font-bold uppercase tracking-wide mb-2">Total Subjects</div>
              <div className="text-4xl font-extrabold text-green-900">
                {years.reduce((sum, y) => sum + (y.semesters ? y.semesters.reduce((s, sem) => s + sem.modules.reduce((ms, m) => ms + m.subjects.length, 0), 0) : (y.modules?.reduce((s, m) => s + m.subjects.length, 0) || 0)), 0)}
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 shadow-soft group hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="text-sm text-orange-700 font-bold uppercase tracking-wide mb-2">Total Absences</div>
              <div className="text-4xl font-extrabold text-orange-900">
                {yearStats.reduce((sum, stat) => sum + stat.totalAbsences, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

