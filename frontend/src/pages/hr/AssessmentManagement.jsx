import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, FileSpreadsheet, Code2, Clock, Users, Loader2, X, Trash2, CheckCircle2,
  Sparkles, Target, Timer, AlertCircle, ChevronDown
} from 'lucide-react';
import api from '../../utils/api';

export default function AssessmentManagement() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  // Modals state
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [showCodingModal, setShowCodingModal] = useState(false);

  // MCQ Form state
  const [mcqTitle, setMcqTitle] = useState('');
  const [mcqJobId, setMcqJobId] = useState('');
  const [mcqDuration, setMcqDuration] = useState(30);
  const [mcqPassingScore, setMcqPassingScore] = useState(60);
  const [mcqNegativeMarking, setMcqNegativeMarking] = useState(0);
  const [mcqQuestions, setMcqQuestions] = useState([
    { questionText: '', points: 5, type: 'SINGLE_CHOICE', options: [{ optionText: '', correct: false }] }
  ]);

  // Coding Form state
  const [codingTitle, setCodingTitle] = useState('');
  const [codingJobId, setCodingJobId] = useState('');
  const [codingDifficulty, setCodingDifficulty] = useState('MEDIUM');
  const [codingDescription, setCodingDescription] = useState('');
  const [codingConstraints, setCodingConstraints] = useState('');
  const [codingTemplateJava, setCodingTemplateJava] = useState('public class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your code here\n        return null;\n    }\n}');
  const [codingTemplatePython, setCodingTemplatePython] = useState('def reverseList(head):\n    # Write your code here\n    pass');
  const [codingTemplateJs, setCodingTemplateJs] = useState('function reverseList(head) {\n    // Write your code here\n    return null;\n}');
  const [codingTestCases, setCodingTestCases] = useState([
    { inputData: '', expectedOutput: '', hidden: false }
  ]);

  // Fetch assessments and jobs
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [assessmentsRes, jobsRes] = await Promise.all([
        api.get('/api/hr/assessments'),
        api.get('/api/public/jobs')
      ]);
      setAssessments(assessmentsRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error("Failed to load assessments or jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // MCQ questions helpers
  const handleAddQuestion = () => {
    setMcqQuestions([
      ...mcqQuestions,
      { questionText: '', points: 5, type: 'SINGLE_CHOICE', options: [{ optionText: '', correct: false }] }
    ]);
  };

  const handleRemoveQuestion = (qIdx) => {
    setMcqQuestions(mcqQuestions.filter((_, idx) => idx !== qIdx));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const newQs = [...mcqQuestions];
    newQs[qIdx][field] = value;
    setMcqQuestions(newQs);
  };

  const handleAddOption = (qIdx) => {
    const newQs = [...mcqQuestions];
    newQs[qIdx].options.push({ optionText: '', correct: false });
    setMcqQuestions(newQs);
  };

  const handleRemoveOption = (qIdx, oIdx) => {
    const newQs = [...mcqQuestions];
    newQs[qIdx].options = newQs[qIdx].options.filter((_, idx) => idx !== oIdx);
    setMcqQuestions(newQs);
  };

  const handleOptionChange = (qIdx, oIdx, field, value) => {
    const newQs = [...mcqQuestions];
    if (field === 'correct') {
      // If single choice, reset other options
      if (newQs[qIdx].type === 'SINGLE_CHOICE' || newQs[qIdx].type === 'TRUE_FALSE') {
        newQs[qIdx].options.forEach((opt, idx) => {
          opt.correct = idx === oIdx ? value : false;
        });
      } else {
        newQs[qIdx].options[oIdx].correct = value;
      }
    } else {
      newQs[qIdx].options[oIdx][field] = value;
    }
    setMcqQuestions(newQs);
  };

  // Coding test case helpers
  const handleAddTestCase = () => {
    setCodingTestCases([...codingTestCases, { inputData: '', expectedOutput: '', hidden: false }]);
  };

  const handleRemoveTestCase = (tcIdx) => {
    setCodingTestCases(codingTestCases.filter((_, idx) => idx !== tcIdx));
  };

  const handleTestCaseChange = (tcIdx, field, value) => {
    const newTCs = [...codingTestCases];
    newTCs[tcIdx][field] = value;
    setCodingTestCases(newTCs);
  };

  // Submissions
  const handleSubmitMcq = async (e) => {
    e.preventDefault();
    if (!mcqJobId) {
      alert("Please select a job target.");
      return;
    }
    try {
      const payload = {
        title: mcqTitle,
        jobId: parseInt(mcqJobId),
        durationMinutes: parseInt(mcqDuration),
        passingScore: parseFloat(mcqPassingScore),
        negativeMarkingFactor: parseFloat(mcqNegativeMarking),
        status: 'ACTIVE',
        questions: mcqQuestions
      };
      await api.post('/api/hr/assessments', payload);
      setShowMcqModal(false);
      // Reset form
      setMcqTitle('');
      setMcqJobId('');
      setMcqQuestions([{ questionText: '', points: 5, type: 'SINGLE_CHOICE', options: [{ optionText: '', correct: false }] }]);
      fetchAllData();
    } catch (err) {
      console.error("Failed to create MCQ assessment", err);
      alert("Error creating MCQ assessment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitCoding = async (e) => {
    e.preventDefault();
    if (!codingJobId) {
      alert("Please select a job target.");
      return;
    }
    try {
      const payload = {
        title: codingTitle,
        jobId: parseInt(codingJobId),
        difficulty: codingDifficulty,
        description: codingDescription,
        constraints: codingConstraints,
        templateJava: codingTemplateJava,
        templatePython: codingTemplatePython,
        templateJs: codingTemplateJs,
        testCases: codingTestCases
      };
      await api.post('/api/hr/coding', payload);
      setShowCodingModal(false);
      // Reset form
      setCodingTitle('');
      setCodingJobId('');
      setCodingDescription('');
      setCodingConstraints('');
      setCodingTestCases([{ inputData: '', expectedOutput: '', hidden: false }]);
      fetchAllData();
    } catch (err) {
      console.error("Failed to create coding question", err);
      alert("Error creating coding assessment: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Assessments Builder</h1>
          <p className="text-slate-600 mt-1 text-sm">Create and manage candidate skill tests.</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="primary" className="gap-2 flex-1 sm:flex-none justify-center" onClick={() => setShowMcqModal(true)}>
            <Plus className="w-4 h-4" /> New MCQ
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none justify-center text-primary border-primary/30 hover:bg-primary/10" onClick={() => setShowCodingModal(true)}>
            <Plus className="w-4 h-4" /> New Coding
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search assessments..." 
            className="w-full bg-surface-muted border border-secondary/50 rounded-lg pl-10 pr-4 py-2 text-sm text-primary focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {assessments.map(test => (
          <Card key={test.id} className="group hover:border-primary/50 transition-colors cursor-pointer bg-[#08566E]/40 border-secondary/50">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-lg ${test.type === 'CODING' ? 'bg-primary/10 text-white' : 'bg-primary/10 text-white'}`}>
                  {test.type === 'CODING' ? <Code2 className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                </div>
                <Badge variant={test.status === 'ACTIVE' ? 'success' : 'neutral'}>{test.status}</Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-primary text-lg group-hover:text-primary transition-colors truncate">{test.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{test.jobTitle || 'General Assessment'}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 pt-4 border-t border-secondary/50">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.durationMinutes} mins</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {test.type === 'CODING' ? '1 Code Task' : `${test.questions?.length || 0} Questions`}</span>
                </div>
                {test.type === 'CODING' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hr/coding/${test.id}`);
                    }}
                    className="text-xs text-primary hover:text-primary font-semibold flex items-center gap-0.5 border border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition"
                  >
                    Solve
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {assessments.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-600">
            <FileSpreadsheet className="w-12 h-12 mb-4 opacity-50" />
            <p>No assessments found.</p>
          </div>
        )}
      </div>

      {/* --- MCQ MODAL --- */}
      <AnimatePresence>
        {showMcqModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md"
          >
            {/* Centering wrapper — allows vertical scroll without clipping */}
            <div className="flex min-h-full items-center justify-center p-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-surface-border"
              style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 60%, #fff7ed 100%)' }}
            >
              {/* ── Premium Header ── */}
              <div className="relative overflow-hidden px-6 py-5 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)' }}
              >
                {/* Animated scan line */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-px bg-white animate-scan" />
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-secondary/30 blur-none" />
                <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-secondary/30 blur-lg" />

                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">Create MCQ Assessment</h2>
                    <p className="text-primary text-xs mt-0.5">Build a knowledge test with multiple choice questions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMcqModal(false)}
                  className="relative w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all text-primary hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitMcq} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">

                  {/* ── Section 1: Basic Info ── */}
                  <div className="rounded-xl border border-primary bg-primary/60 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary uppercase tracking-wider">Assessment Details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-dark-bg uppercase tracking-wide">Assessment Title</label>
                        <input
                          type="text" required
                          placeholder="e.g. Java Fundamentals Quiz"
                          value={mcqTitle}
                          onChange={e => setMcqTitle(e.target.value)}
                          className="rounded-xl border-2 border-primary bg-white px-4 py-2.5 text-sm text-dark-bg placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-dark-bg uppercase tracking-wide">Target Job Position</label>
                        <div className="relative">
                          <select
                            required value={mcqJobId}
                            onChange={e => setMcqJobId(e.target.value)}
                            className="w-full appearance-none rounded-xl border-2 border-primary bg-white px-4 py-2.5 text-sm text-dark-bg focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all pr-9"
                          >
                            <option value="">Select a job...</option>
                            {jobs.map(job => (
                              <option key={job.id} value={job.id}>{job.title} ({job.location})</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-bg pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: Config Metrics ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-primary bg-primary/50 p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-primary" />
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">Duration (mins)</label>
                      </div>
                      <input
                        type="number" required min="1"
                        value={mcqDuration}
                        onChange={e => setMcqDuration(e.target.value)}
                        className="rounded-lg border-2 border-primary bg-white px-3 py-2 text-sm font-bold text-dark-bg focus:border-primary outline-none transition-all text-center"
                      />
                    </div>
                    <div className="rounded-xl border border-primary bg-primary/50 p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-primary" />
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">Passing Score (%)</label>
                      </div>
                      <input
                        type="number" required min="1" max="100"
                        value={mcqPassingScore}
                        onChange={e => setMcqPassingScore(e.target.value)}
                        className="rounded-lg border-2 border-primary bg-white px-3 py-2 text-sm font-bold text-dark-bg focus:border-primary outline-none transition-all text-center"
                      />
                    </div>
                    <div className="rounded-xl border border-primary bg-primary/50 p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" />
                        <label className="text-xs font-bold text-primary uppercase tracking-wide">Negative Penalty</label>
                      </div>
                      <input
                        type="number" step="0.05" min="0" max="1"
                        value={mcqNegativeMarking}
                        onChange={e => setMcqNegativeMarking(e.target.value)}
                        placeholder="0.25"
                        className="rounded-lg border-2 border-primary bg-white px-3 py-2 text-sm font-bold text-dark-bg focus:border-primary outline-none transition-all text-center"
                      />
                    </div>
                  </div>

                  {/* ── Section 3: Questions ── */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary text-xs font-bold">{mcqQuestions.length}</span>
                        </div>
                        <h3 className="font-bold text-dark-bg text-base">Questions</h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="ripple-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary text-white text-xs font-bold transition-all hover:scale-105 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question
                      </button>
                    </div>

                    <AnimatePresence>
                      {mcqQuestions.map((q, qIdx) => (
                        <motion.div
                          key={qIdx}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="relative rounded-2xl border-2 border-primary bg-white shadow-sm overflow-hidden"
                        >
                          {/* Question number badge */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary" />
                          <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white text-xs font-black shadow-sm">
                                  {qIdx + 1}
                                </span>
                                <span className="text-sm font-bold text-dark-bg">Question</span>
                              </div>
                              {mcqQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(qIdx)}
                                  className="w-7 h-7 rounded-lg bg-primary hover:bg-primary flex items-center justify-center text-white hover:text-primary transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <input
                              type="text" required
                              placeholder="Type your question here..."
                              value={q.questionText}
                              onChange={e => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                              className="w-full rounded-xl border-2 border-surface-border bg-white px-4 py-3 text-sm text-dark-bg placeholder-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-dark-bg uppercase">Points</label>
                                <input
                                  type="number" required min="1"
                                  value={q.points}
                                  onChange={e => handleQuestionChange(qIdx, 'points', parseInt(e.target.value))}
                                  className="rounded-lg border-2 border-surface-border bg-white px-3 py-2 text-sm font-bold text-dark-bg focus:border-primary outline-none transition-all"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-dark-bg uppercase">Type</label>
                                <div className="relative">
                                  <select
                                    value={q.type}
                                    onChange={e => handleQuestionChange(qIdx, 'type', e.target.value)}
                                    className="w-full appearance-none rounded-lg border-2 border-surface-border bg-white px-3 py-2 text-sm text-dark-bg focus:border-primary outline-none transition-all pr-8"
                                  >
                                    <option value="SINGLE_CHOICE">Single Choice</option>
                                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                    <option value="TRUE_FALSE">True / False</option>
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-bg pointer-events-none" />
                                </div>
                              </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-dark-bg uppercase tracking-wide">Answer Options</span>
                                {q.type !== 'TRUE_FALSE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(qIdx)}
                                    className="text-xs text-primary hover:text-primary font-bold flex items-center gap-0.5 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" /> Add Option
                                  </button>
                                )}
                              </div>
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all ${
                                    opt.correct
                                      ? 'border-primary bg-primary'
                                      : 'border-surface-border bg-white hover:border-surface-border'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleOptionChange(qIdx, oIdx, 'correct', !opt.correct)}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                      opt.correct
                                        ? 'border-primary bg-primary'
                                        : 'border-surface-border bg-white hover:border-primary'
                                    }`}
                                  >
                                    {opt.correct && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                  </button>
                                  <input
                                    type="text" required
                                    placeholder={`Option ${oIdx + 1}`}
                                    value={opt.optionText}
                                    onChange={e => handleOptionChange(qIdx, oIdx, 'optionText', e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-dark-bg placeholder-gray-400 outline-none"
                                  />
                                  {opt.correct && (
                                    <span className="text-[10px] font-bold text-primary bg-primary px-1.5 py-0.5 rounded-full shrink-0">✓ Correct</span>
                                  )}
                                  {q.options.length > 1 && q.type !== 'TRUE_FALSE' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(qIdx, oIdx)}
                                      className="w-5 h-5 rounded-full bg-primary hover:bg-primary flex items-center justify-center text-white shrink-0 transition-all"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── Footer Actions ── */}
                <div className="sticky bottom-0 px-6 py-4 border-t border-primary bg-white/80 backdrop-blur-sm flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMcqModal(false)}
                    className="px-5 py-2.5 rounded-xl border-2 border-surface-border text-dark-bg text-sm font-semibold hover:bg-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ripple-btn px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-sm font-bold shadow-lg hover:shadow-primary hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Create Assessment
                  </button>
                </div>
              </form>
            </motion.div>
            </div>{/* end centering wrapper */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CODING MODAL --- */}
      {showCodingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto p-4 animate-in fade-in duration-200">
          <div className="bg-[#08566E] border border-secondary/50 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/50">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-primary">Create Coding Challenge</h2>
              </div>
              <button onClick={() => setShowCodingModal(false)} className="text-slate-600 hover:text-primary transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCoding} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Challenge Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Reverse a Linked List" 
                    value={codingTitle}
                    onChange={e => setCodingTitle(e.target.value)}
                    className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Target Job Position</label>
                  <select 
                    required 
                    value={codingJobId}
                    onChange={e => setCodingJobId(e.target.value)}
                    className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Select a job...</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title} ({job.location})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Difficulty Level</label>
                <select 
                  value={codingDifficulty}
                  onChange={e => setCodingDifficulty(e.target.value)}
                  className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-full"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Problem Description</label>
                <textarea 
                  required 
                  rows="4"
                  placeholder="Provide a detailed description of the task, input formats, expected outputs, etc." 
                  value={codingDescription}
                  onChange={e => setCodingDescription(e.target.value)}
                  className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-full font-sans"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">Constraints</label>
                <textarea 
                  rows="2"
                  placeholder="e.g. 1 <= N <= 10^5, time complexity O(N)" 
                  value={codingConstraints}
                  onChange={e => setCodingConstraints(e.target.value)}
                  className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 w-full font-sans"
                />
              </div>

              {/* Template Code Sections */}
              <div className="space-y-4 pt-4 border-t border-secondary/50">
                <h3 className="font-bold text-primary text-base">Initial Code Templates</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-primary">Java Template</label>
                    <textarea 
                      rows="4"
                      value={codingTemplateJava}
                      onChange={e => setCodingTemplateJava(e.target.value)}
                      className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-primary/50 w-full font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-primary">Python Template</label>
                    <textarea 
                      rows="4"
                      value={codingTemplatePython}
                      onChange={e => setCodingTemplatePython(e.target.value)}
                      className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-primary/50 w-full font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-primary">JavaScript Template</label>
                    <textarea 
                      rows="4"
                      value={codingTemplateJs}
                      onChange={e => setCodingTemplateJs(e.target.value)}
                      className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-primary/50 w-full font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Test Cases Area */}
              <div className="space-y-4 pt-4 border-t border-secondary/50">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary text-base">Test Cases</h3>
                  <Button type="button" variant="outline" size="sm" className="gap-1 border-primary/30 text-primary hover:bg-primary/10" onClick={handleAddTestCase}>
                    <Plus className="w-3.5 h-3.5" /> Add Test Case
                  </Button>
                </div>

                {codingTestCases.map((tc, tcIdx) => (
                  <div key={tcIdx} className="p-4 rounded-xl border border-secondary/50 bg-surface-muted/40 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-semibold text-primary">Test Case #{tcIdx + 1}</span>
                      {codingTestCases.length > 1 && (
                        <button type="button" onClick={() => handleRemoveTestCase(tcIdx)} className="text-primary hover:text-primary transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-600 uppercase">Input Data</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. 1 2 3 4 5" 
                          value={tc.inputData}
                          onChange={e => handleTestCaseChange(tcIdx, 'inputData', e.target.value)}
                          className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 w-full font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-slate-600 uppercase">Expected Output</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. 5 4 3 2 1" 
                          value={tc.expectedOutput}
                          onChange={e => handleTestCaseChange(tcIdx, 'expectedOutput', e.target.value)}
                          className="bg-surface-muted border border-secondary/50 text-primary rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 w-full font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={tc.hidden}
                        onChange={e => handleTestCaseChange(tcIdx, 'hidden', e.target.checked)}
                        className="w-4 h-4 rounded accent-emerald-500 bg-surface-muted border-secondary/50"
                      />
                      <label className="text-xs text-slate-600">Mark as Hidden Test Case (Sandbox Only)</label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-secondary/50">
                <Button type="button" variant="outline" onClick={() => setShowCodingModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary text-white">Create Coding Challenge</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
