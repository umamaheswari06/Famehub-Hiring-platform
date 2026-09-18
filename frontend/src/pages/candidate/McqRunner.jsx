import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, AlertTriangle, CheckCircle2, Loader2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import AiTutorPanel from '../../components/ui/AiTutorPanel';

export default function McqRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // mapping question ID to list of option IDs
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [tutorOpen, setTutorOpen] = useState(false);

  useEffect(() => {
    const initTest = async () => {
      try {
        await api.post(`/api/candidate/assessments/${id}/start`);
        const res = await api.get(`/api/candidate/assessments/${id}`);
        setAssessment(res.data);
        setTimeLeft(res.data.durationMinutes * 60);
      } catch (err) {
        console.error("Failed to load test", err);
        alert("Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    };
    initTest();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0 && !result) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && assessment && !result) {
      handleSubmit(); // Auto submit
    }
  }, [timeLeft, result, assessment]);

  const handleSelectOption = (qId, optionId) => {
    setAnswers({
      ...answers,
      [qId]: [optionId] // Currently assuming single-choice for UI simplicity
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/candidate/assessments/submit', {
        assessmentId: assessment.id,
        answers: answers,
        tabSwitches: 0,
        copyPasteDetects: 0
      });
      setResult(res.data);
    } catch (err) {
      console.error("Submission failed", err);
      alert("Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 animate-in fade-in zoom-in duration-500">
        <div className={`p-6 rounded-full ${result.passed ? 'bg-primary/10 text-white shadow-md shadow-primary/10' : 'bg-primary/10 text-white'}`}>
          {result.passed ? <CheckCircle2 className="w-16 h-16" /> : <AlertTriangle className="w-16 h-16" />}
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Assessment Submitted</h1>
          <p className="text-xl text-slate-600">Your Score: <span className={result.passed ? 'text-primary font-bold' : 'text-primary font-bold'}>{result.score.toFixed(1)}%</span></p>
          <p className={`mt-2 font-semibold ${result.passed ? 'text-primary' : 'text-primary'}`}>
            {result.passed ? 'Congratulations, you passed!' : 'Unfortunately, you did not meet the passing score.'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/candidate/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return <div className="text-primary text-center">Assessment data is empty.</div>;
  }

  const question = assessment.questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 rounded-t-xl">
        <h1 className="font-bold text-lg text-primary">{assessment.title}</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className={`gap-2 transition-all duration-300 ${tutorOpen ? 'border-primary bg-primary/15 text-white font-semibold' : 'border-primary/30 text-primary hover:bg-primary/10'}`} 
            onClick={() => setTutorOpen(!tutorOpen)}
          >
            <Sparkles className="w-4 h-4 text-primary" /> AI Tutor
          </Button>
          <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-mono">
            <Clock className="w-4 h-4" />
            <span className="font-bold tracking-wider">{formatTime(timeLeft)}</span>
          </div>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Test'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-slate-50 rounded-b-xl border border-t-0 border-slate-200">
        {/* Main Question Area */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Question {currentQ + 1} of {assessment.questions.length}</span>
            <span>{question.points} Points</span>
          </div>

          <h2 className="text-xl font-medium text-primary leading-relaxed">
            {question.questionText}
          </h2>

          <div className="flex flex-col gap-3 mt-4">
            {question.options.map((opt) => {
              const isSelected = answers[question.id]?.includes(opt.id);
              return (
                <label 
                  key={opt.id} 
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-primary' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <input 
                    type="radio" 
                    name={`q-${question.id}`} 
                    className="hidden"
                    checked={isSelected}
                    onChange={() => handleSelectOption(question.id, opt.id)}
                  />
                  <span className="text-sm md:text-base">{opt.optionText}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-auto pt-8 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQ(prev => prev - 1)} 
              disabled={currentQ === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setCurrentQ(prev => prev + 1)} 
              disabled={currentQ === assessment.questions.length - 1}
              className="gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="w-64 flex-shrink-0 border-l border-slate-200 bg-white p-6 flex flex-col gap-6 overflow-y-auto hidden lg:flex">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-primary">Question Navigator</span>
            <span className="text-xs text-slate-600">{answeredCount} of {assessment.questions.length} answered</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {assessment.questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentQ;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(idx)}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-medium transition-all ${
                    isCurrent 
                      ? 'ring-2 ring-primary bg-primary/20 text-white' 
                      : isAnswered 
                        ? 'bg-primary text-white shadow-md shadow-primary/10' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-primary'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Tutor Panel */}
        <AiTutorPanel 
          isOpen={tutorOpen}
          onClose={() => setTutorOpen(false)}
          questionTitle={assessment.title}
          questionDescription={question.questionText}
          options={question.options.map(opt => opt.optionText)}
          selectedOption={answers[question.id] ? question.options.find(opt => answers[question.id].includes(opt.id))?.optionText : ''}
          type="MCQ"
        />
      </div>
    </div>
  );
}
