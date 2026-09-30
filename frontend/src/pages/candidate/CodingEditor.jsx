import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Code2, Play, Send, Clock, CheckCircle2, XCircle, Loader2, Sparkles, Lock, Cpu, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import api from '../../utils/api';
import AiTutorPanel from '../../components/ui/AiTutorPanel';

export default function CodingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your code here...\n\nfunction solve() {\n  \n}');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);
  const [journey, setJourney] = useState([]);

  const addJourneyEvent = (eventType, details) => {
    setJourney(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.eventType === eventType && last.details === details) {
          return prev;
        }
      }
      return [...prev, {
        timestamp: Date.now(),
        eventType,
        details
      }];
    });
  };

  useEffect(() => {
    if (assessment && assessment.questions && assessment.questions[0]) {
      setJourney([{
        timestamp: Date.now(),
        eventType: 'INITIAL_DRAFT',
        details: `Started coding challenge: ${assessment.title}`
      }]);
    }
  }, [assessment]);

  useEffect(() => {
    if (!assessment) return;
    const timer = setTimeout(() => {
      addJourneyEvent('CODE_REVISION', `Code updated. Length: ${code.length} chars.`);
    }, 20000);
    return () => clearTimeout(timer);
  }, [code, assessment]);

  useEffect(() => {
    const initTest = async () => {
      try {
        await api.post(`/api/candidate/coding/${id}/start`);
        const res = await api.get(`/api/candidate/coding/${id}`);
        setAssessment(res.data);
      } catch (err) {
        console.error("Failed to load coding test", err);
        alert("Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    };
    initTest();
  }, [id]);

  // Dynamically load coding question template code when language changes
  useEffect(() => {
    if (assessment && assessment.questions && assessment.questions[0]) {
      const q = assessment.questions[0];
      if (language === 'javascript' && q.templateJs) {
        setCode(q.templateJs);
      } else if (language === 'python' && q.templatePython) {
        setCode(q.templatePython);
      } else if (language === 'java' && q.templateJava) {
        setCode(q.templateJava);
      } else if (language === 'cpp' && q.templateCpp) {
        setCode(q.templateCpp);
      } else {
        setCode('// Write your code here...');
      }
    }
  }, [assessment, language]);

  const handleSubmit = async () => {
    setRunning(true);
    setResult(null);
    addJourneyEvent('COMPILE_RUN', `Submitting code execution. Language: ${language}. Length: ${code.length} chars.`);
    try {
      const q = assessment.questions?.[0] || {};
      const res = await api.post('/api/candidate/coding/submit', {
        codingQuestionId: q.id || id,
        language: language,
        sourceCode: code,
        journeyEvents: journey
      });
      setResult(res.data);
      addJourneyEvent('COMPILE_RUN', `Execution completed. Status: ${res.data.status}. Score: ${res.data.score}%`);
      setActiveTestCaseTab(0);
    } catch (err) {
      console.error("Execution failed", err);
      const errMsg = err.response?.data?.message || 'Execution failed';
      setResult({ status: 'ERROR', error: errMsg });
      addJourneyEvent('COMPILE_RUN', `Execution failed. Error: ${errMsg}`);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!assessment) {
    return <div className="text-primary text-center">Assessment not found.</div>;
  }

  const question = assessment.questions?.[0] || { questionText: 'No problem statement provided.' };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 border-b border-slate-200 rounded-t-xl">
        <div className="flex items-center gap-4">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="font-bold text-primary text-lg">{assessment.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className={`gap-2 transition-all duration-300 ${tutorOpen ? 'border-primary bg-primary/15 text-white font-semibold' : 'border-primary/30 text-primary hover:bg-primary/10'}`} 
              onClick={() => setTutorOpen(!tutorOpen)}
            >
              <Sparkles className="w-4 h-4 text-primary" /> AI Tutor
            </Button>
            <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10" onClick={handleSubmit} disabled={running}>
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run Code
            </Button>
            <Button variant="primary" className="gap-2 bg-primary hover:bg-primary" onClick={handleSubmit} disabled={running}>
              <Send className="w-4 h-4" /> Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-b-xl border border-t-0 border-slate-200 bg-slate-50">
        {/* Left pane: Problem Description */}
        <div className="w-[350px] flex-shrink-0 border-r border-slate-200 p-6 overflow-y-auto hidden md:block">
          <h2 className="text-xl font-semibold text-primary mb-4">Problem Statement</h2>
          <div className="prose prose-invert max-w-none text-sm text-slate-600">
             {question.questionText.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>

        {/* Right pane: Editor and Terminal */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Editor */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : 'java'}
              value={code}
              theme="light"
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible'
                },
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 }
              }}
            />
          </div>

          {/* Terminal / Output */}
          <div className="h-80 border-t border-slate-200 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <span>Execution Results</span>
              {result && result.status && (
                <div className="flex items-center gap-3">
                  {result.executionTime !== undefined && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Runtime: {(result.executionTime * 1000).toFixed(0)} ms
                    </span>
                  )}
                  {result.memoryUsage !== undefined && result.memoryUsage > 0 && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      Memory: {(result.memoryUsage / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {result ? (
                result.status === 'COMPILATION_ERROR' || result.status === 'RUNTIME_ERROR' || !result.testCaseResults || result.testCaseResults.length === 0 ? (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="flex items-center gap-2 text-primary">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-bold">{result.status || 'ERROR'}</span>
                    </div>
                    <pre className="flex-1 p-3 bg-primary/20 border border-primary/20 rounded-lg text-white text-xs overflow-auto whitespace-pre-wrap">
                      {result.errorMessage || result.error || 'No detailed error message was returned.'}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col h-full gap-4">
                    {/* Overall Summary */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          result.status === 'ACCEPTED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {result.status === 'ACCEPTED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {result.status}
                        </span>
                        <span className="text-primary font-semibold text-sm">
                          Score: <span className={result.score === 100 ? 'text-emerald-600' : 'text-slate-700'}>{result.score}%</span>
                        </span>
                      </div>
                      <span className="text-xs text-slate-600">
                        {result.testCaseResults.filter(tc => tc.passed).length} / {result.testCaseResults.length} test cases passed
                      </span>
                    </div>

                    {/* Test Case Tabs */}
                    <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                      {/* Left: Tab selectors */}
                      <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto md:w-44 border-r border-slate-200 pr-2 flex-shrink-0">
                        {result.testCaseResults.map((tc, idx) => {
                          const isSelected = activeTestCaseTab === idx;
                          return (
                            <button
                              key={tc.testCaseId || idx}
                              onClick={() => setActiveTestCaseTab(idx)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition text-left border ${
                                isSelected
                                  ? 'bg-primary/15 text-white border-primary/30'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-transparent'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tc.passed ? 'bg-primary' : 'bg-primary'}`} />
                              <span className="truncate">
                                Case {idx + 1} {tc.hidden ? '(Hidden)' : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: Tab content details */}
                      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3 min-h-0">
                        {(() => {
                          const tc = result.testCaseResults[activeTestCaseTab];
                          if (!tc) return <div className="text-slate-600 text-xs">No test case selected.</div>;
                          
                          if (tc.hidden) {
                            return (
                              <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                                <Lock className="w-8 h-8 text-primary mb-2 animate-pulse" />
                                <h4 className="font-semibold text-primary text-sm">Hidden Test Case</h4>
                                <p className="text-xs text-slate-600 max-w-xs mt-1">
                                  Inputs, expected outputs, and execution stdout are hidden for grading integrity.
                                </p>
                                <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-600">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                                    Runtime: {(tc.executionTime * 1000).toFixed(0)} ms
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                                    Status: {tc.status}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 gap-3 text-xs">
                              {/* Input panel */}
                              <div className="flex flex-col gap-1">
                                <span className="text-slate-600 font-semibold">Input</span>
                                <pre className="bg-white border border-slate-200 rounded-lg p-2.5 overflow-x-auto text-slate-600 whitespace-pre-wrap">
                                  {tc.input || 'No input'}
                                </pre>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Expected Output */}
                                <div className="flex flex-col gap-1">
                                  <span className="text-slate-600 font-semibold">Expected Output</span>
                                  <pre className="bg-white border border-slate-200 rounded-lg p-2.5 overflow-x-auto text-primary whitespace-pre-wrap">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                                {/* Actual Output */}
                                <div className="flex flex-col gap-1">
                                  <span className="text-slate-600 font-semibold">Your Output</span>
                                  <pre className={`border rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap ${
                                    tc.passed 
                                      ? 'bg-white border-slate-200 text-slate-800' 
                                      : 'bg-red-50 border-red-200 text-red-600'
                                  }`}>
                                    {tc.actualOutput || (tc.status !== 'ACCEPTED' ? `[${tc.status}]` : 'No stdout')}
                                  </pre>
                                </div>
                              </div>

                              {/* TestCase Level Metrics */}
                              <div className="flex items-center gap-4 border-t border-slate-200 pt-2 text-slate-600 text-[11px] font-mono">
                                <span>Status: <span className={tc.passed ? 'text-primary' : 'text-primary'}>{tc.status}</span></span>
                                <span>Runtime: {(tc.executionTime * 1000).toFixed(0)} ms</span>
                                <span>Memory: {(tc.memoryUsage / 1024).toFixed(1)} MB</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-slate-600 flex items-center justify-center h-full">
                  Run or submit code to see output here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Tutor Panel */}
        <AiTutorPanel 
          isOpen={tutorOpen}
          onClose={() => setTutorOpen(false)}
          questionTitle={assessment.title}
          questionDescription={question.questionText}
          code={code}
          language={language}
          errorMessage={result ? (result.error || result.stderr || result.compile_output || (result.status !== 'ACCEPTED' ? `Status: ${result.status}` : '')) : ''}
          type="CODING"
          onTutorQuery={(text) => addJourneyEvent('AI_TUTOR_ASK', `Asked AI: "${text}"`)}
        />
      </div>
    </div>
  );
}
