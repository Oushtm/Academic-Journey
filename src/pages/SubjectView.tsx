import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import { calculateSubjectScores } from '../utils/calculations';
import { generateId } from '../services/sharedStorage';
import type { ReviewStatus, Lesson } from '../types';

export function SubjectView() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { currentUser } = useAuth();
  const { getSubject, updateUserSubjectData, years } = useAcademic();
  const isAdmin = currentUser?.isAdmin ?? false;
  
  const subject = subjectId ? getSubject(subjectId) : null;

  // Find module and year info
  let module = null;
  let year = null;
  if (subjectId) {
    for (const y of years) {
      for (const m of y.modules) {
        if (m.subjects.some((s) => s.id === subjectId)) {
          module = m;
          year = y;
          break;
        }
      }
      if (module) break;
    }
  }

  if (!subject || !module || !year) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Subject not found</h2>
        <p className="text-gray-600 mb-6">The subject you're looking for doesn't exist.</p>
        <Link 
          to="/dashboard" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
        >
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const calculations = calculateSubjectScores(subject);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    assignmentScore: subject.assignmentScore?.toString() || '',
    examScore: subject.examScore?.toString() || '',
    missedSessions: subject.missedSessions.toString(),
  });

  const handleSave = async () => {
    if (!subjectId) return;
    await updateUserSubjectData(subjectId, {
      assignmentScore: formData.assignmentScore ? parseFloat(formData.assignmentScore) : undefined,
      examScore: formData.examScore ? parseFloat(formData.examScore) : undefined,
      missedSessions: parseInt(formData.missedSessions) || 0,
    });
    setIsEditing(false);
    // Refresh subject data after save
    const updatedSubject = getSubject(subjectId);
    if (updatedSubject) {
      setFormData({
        assignmentScore: updatedSubject.assignmentScore?.toString() || '',
        examScore: updatedSubject.examScore?.toString() || '',
        missedSessions: updatedSubject.missedSessions.toString(),
      });
    }
  };

  const handleAddLesson = async () => {
    if (!subjectId || !isAdmin) return; // Only admin can add lessons
    const newLesson: Lesson = {
      id: generateId(),
      title: 'New Lesson',
      notes: '',
      reviewStatus: 'Not Reviewed' as ReviewStatus,
    };
    const currentLessons = subject.lessons || [];
    await updateUserSubjectData(subjectId, {
      lessons: [...currentLessons, newLesson],
    });
  };

  const handleLessonUpdate = async (lessonId: string, updates: Partial<Lesson>) => {
    if (!subjectId) return;
    const currentLessons = subject.lessons || [];
    await updateUserSubjectData(subjectId, {
      lessons: currentLessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      ),
    });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!subjectId || !isAdmin) return; // Only admin can delete lessons
    const currentLessons = subject.lessons || [];
    await updateUserSubjectData(subjectId, {
      lessons: currentLessons.filter((l) => l.id !== lessonId),
    });
  };

  // Update form data when subject changes
  useEffect(() => {
    if (subject) {
      setFormData({
        assignmentScore: subject.assignmentScore?.toString() || '',
        examScore: subject.examScore?.toString() || '',
        missedSessions: subject.missedSessions.toString(),
      });
    }
  }, [subject]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 space-y-4">
          <Link
            to={`/year/${year.yearNumber}`}
            className="text-white/80 hover:text-white text-sm inline-block font-medium hover:underline"
          >
            ← Back to Year {year.yearNumber}
          </Link>
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/30">
            📖 Subject Details
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              {module.name}
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-primary-100">
              {subject.name}
            </h3>
          </div>
          {subject.coefficient && (
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
              <span className="text-primary-100 font-semibold">Coefficient: {subject.coefficient}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scores Card */}
      <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8 animate-slide-up">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
            <h3 className="text-2xl font-extrabold text-gray-900">S1 Grading</h3>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
            >
              ✏️ Edit Scores
            </button>
          ) : (
            <div className="space-x-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                ✓ Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    assignmentScore: subject.assignmentScore?.toString() || '',
                    examScore: subject.examScore?.toString() || '',
                    missedSessions: subject.missedSessions.toString(),
                  });
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm font-bold hover:shadow-md"
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border-2 border-primary-300 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Assignment Score (Control / DS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.assignmentScore}
                  onChange={(e) => setFormData({ ...formData, assignmentScore: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📄 Final Exam Score
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={formData.examScore}
                  onChange={(e) => setFormData({ ...formData, examScore: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ⚠️ Missed Sessions
              </label>
              <input
                type="number"
                min="0"
                value={formData.missedSessions}
                onChange={(e) => setFormData({ ...formData, missedSessions: e.target.value })}
                className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-lg"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-soft group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-2">Assignment Score</div>
                <div className="text-3xl font-extrabold text-blue-900">
                  {subject.assignmentScore !== undefined ? subject.assignmentScore.toFixed(2) : '—'}
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 shadow-soft group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-sm text-purple-700 font-bold uppercase tracking-wide mb-2">Exam Score</div>
                <div className="text-3xl font-extrabold text-purple-900">
                  {subject.examScore !== undefined ? subject.examScore.toFixed(2) : '—'}
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-soft group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-sm text-green-700 font-bold uppercase tracking-wide mb-2">Initial S1 Score</div>
                <div className="text-3xl font-extrabold text-green-900">
                  {subject.assignmentScore !== undefined && subject.examScore !== undefined
                    ? calculations.initialS1Score.toFixed(2)
                    : '—'}
                </div>
              </div>
            </div>
            <div className={`relative overflow-hidden p-6 rounded-xl border-2 shadow-soft group hover:shadow-lg transition-all ${
              calculations.penalty > 0 
                ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500 ${
                calculations.penalty > 0 ? 'bg-orange-200/50' : 'bg-gray-200/50'
              }`}></div>
              <div className="relative z-10">
                <div className={`text-sm font-bold uppercase tracking-wide mb-2 ${
                  calculations.penalty > 0 ? 'text-orange-700' : 'text-gray-600'
                }`}>
                  Penalty
                </div>
                <div className={`text-3xl font-extrabold ${
                  calculations.penalty > 0 ? 'text-orange-900' : 'text-gray-900'
                }`}>
                  -{calculations.penalty.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Score Display */}
        {!isEditing && subject.assignmentScore !== undefined && subject.examScore !== undefined && (
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-primary-200">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm font-semibold text-gray-700">
                    <span className="px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      ⚠️ Absences: <strong className="text-gray-900">{subject.missedSessions}</strong>
                    </span>
                    <span className="px-3 py-1.5 bg-white rounded-lg border border-orange-200 text-orange-700">
                      Penalty: <strong>-{calculations.penalty.toFixed(2)} pts</strong>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">Final S1 Score</div>
                  <div className={`text-5xl font-extrabold ${
                    calculations.finalS1Score >= 14 ? 'text-green-600' :
                    calculations.finalS1Score >= 12 ? 'text-blue-600' :
                    calculations.finalS1Score >= 10 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {calculations.finalS1Score.toFixed(2)}
                  </div>
                  <div className={`text-xs font-bold mt-1 ${
                    calculations.finalS1Score >= 14 ? 'text-green-700' :
                    calculations.finalS1Score >= 12 ? 'text-blue-700' :
                    calculations.finalS1Score >= 10 ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    / 20.00
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lessons & Revision */}
      <div className="glass-effect rounded-2xl shadow-medium border border-white/50 p-8 animate-slide-up">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-800 rounded-full"></div>
            <h3 className="text-2xl font-extrabold text-gray-900">Lessons & Revision Notes</h3>
          </div>
               {isAdmin && (
                 <button
                   onClick={handleAddLesson}
                   className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105"
                 >
                   ➕ Add Lesson
                 </button>
               )}
        </div>

        {!subject.lessons || subject.lessons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-500 text-lg font-medium mb-2">No lessons added yet</p>
            <p className="text-gray-400 text-sm">Click "Add Lesson" to get started with your revision notes</p>
          </div>
        ) : (
          <div className="space-y-4">
                 {subject.lessons.map((lesson) => (
                   <LessonCard
                     key={lesson.id}
                     lesson={lesson}
                     onUpdate={(updates) => handleLessonUpdate(lesson.id, updates)}
                     onDelete={() => handleDeleteLesson(lesson.id)}
                     isAdmin={isAdmin}
                   />
                 ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LessonCardProps {
  lesson: Lesson;
  onUpdate: (updates: Partial<Lesson>) => void;
  onDelete: () => void;
  isAdmin: boolean; // Add isAdmin prop
}

function LessonCard({ lesson, onUpdate, onDelete, isAdmin }: LessonCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(lesson);
  
  // Sync localData when lesson prop changes
  useEffect(() => {
    setLocalData(lesson);
  }, [lesson]);

  const statusColors = {
    'Not Reviewed': 'bg-gray-100 text-gray-700 border-gray-300',
    'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Reviewed': 'bg-green-100 text-green-700 border-green-300',
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('File size must be less than 100MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLocalData({
        ...localData,
        pdfFile: {
          name: file.name,
          data: base64.split(',')[1], // Remove data:application/pdf;base64, prefix
          size: file.size,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setLocalData({
      ...localData,
      pdfFile: undefined,
    });
  };

  const handleSave = () => {
    onUpdate(localData);
    setIsEditing(false);
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-md transition-all duration-300 bg-white group">
      {isEditing ? (
        <div className="space-y-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border-2 border-primary-300">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">📝 Lesson Title</label>
            <input
              type="text"
              value={localData.title}
              onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">📄 Revision Notes</label>
            <textarea
              value={localData.notes}
              onChange={(e) => setLocalData({ ...localData, notes: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium resize-none"
              placeholder="Add your revision notes here..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">✅ Review Status</label>
            <select
              value={localData.reviewStatus}
              onChange={(e) => setLocalData({ ...localData, reviewStatus: e.target.value as ReviewStatus })}
              className="w-full px-4 py-3 border-2 border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium bg-white"
            >
              <option value="Not Reviewed">Not Reviewed</option>
              <option value="In Progress">In Progress</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">📎 PDF File (Optional)</label>
            {localData.pdfFile ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📄</div>
                  <div>
                    <div className="font-semibold text-gray-900">{localData.pdfFile.name}</div>
                    <div className="text-sm text-gray-600">
                      {(localData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`pdf-upload-${lesson.id}`}
                />
                <label
                  htmlFor={`pdf-upload-${lesson.id}`}
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-primary-300 rounded-xl bg-primary-50 hover:bg-primary-100 hover:border-primary-400 cursor-pointer transition-all"
                >
                  <span className="text-primary-700 font-semibold">📎 Click to upload PDF</span>
                </label>
                <p className="text-xs text-gray-500 mt-2 text-center">Max file size: 100MB</p>
              </div>
            )}
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
            >
              ✓ Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setLocalData(lesson);
              }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold hover:shadow-md"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{lesson.title}</h4>
              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${statusColors[lesson.reviewStatus]}`}>
                {lesson.reviewStatus}
              </span>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 hover:shadow-md transition-all duration-300 text-sm font-semibold"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:shadow-md transition-all duration-300 text-sm font-semibold"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
          {lesson.notes && (
            <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
              {lesson.notes}
            </div>
          )}
          {lesson.pdfFile && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{lesson.pdfFile.name}</div>
                    <div className="text-sm text-gray-600">
                      {(lesson.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <a
                  href={`data:application/pdf;base64,${lesson.pdfFile.data}`}
                  download={lesson.pdfFile.name}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                >
                  ⬇️ Download
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
