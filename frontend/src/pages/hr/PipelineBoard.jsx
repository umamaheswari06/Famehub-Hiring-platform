import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, FileText, CheckCircle, Video, Star, Loader2, ArrowRight, X, ClipboardList, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const PIPELINE_STAGES = [
  { id: 'APPLIED', title: 'New Applied', icon: <FileText className="w-4 h-4" />, color: 'bg-primary/10 text-white border-primary/20' },
  { id: 'SCREENING', title: 'Screening', icon: <User className="w-4 h-4" />, color: 'bg-primary/10 text-white border-primary/20' },
  { id: 'ASSESSMENT', title: 'Assessment', icon: <ClipboardList className="w-4 h-4" />, color: 'bg-primary/10 text-white border-primary/20' },
  { id: 'INTERVIEW', title: 'Interview', icon: <Video className="w-4 h-4" />, color: 'bg-primary/10 text-white border-primary/20' },
  { id: 'OFFERED', title: 'Offered', icon: <Star className="w-4 h-4" />, color: 'bg-primary/10 text-white border-primary/20' },
  { id: 'REJECTED', title: 'Rejected', icon: <X className="w-4 h-4" />, color: 'bg-primary/10 text-white border-primary/20' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const columnVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function PipelineBoard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const handleCardClick = async (app) => {
    setSelectedApp(app);
    setSubmissions([]);
    setLoadingSubmissions(true);
    try {
      const res = await api.get(`/api/hr/coding/submissions/candidate/${app.candidateId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch coding submissions", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // Auto-refresh every 60 seconds so HR sees automated pipeline changes
    intervalRef.current = setInterval(() => {
      fetchApplications(false); // silent refresh (no loading spinner)
    }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fetchApplications = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get('/api/hr/applications/all');
      setApplications(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/api/hr/applications/${appId}/status`, null, { params: { status: newStatus } });
      setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update candidate status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const getAppsForStage = (stageId) => applications.filter(app => app.status === stageId);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 h-[calc(100vh-8rem)]"
    >
      <motion.div variants={columnVariants} className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Candidate Pipeline</h1>
          <p className="text-slate-600 mt-1">Track and move candidates through the hiring process.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => fetchApplications(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-secondary/50 bg-white text-xs text-slate-600 hover:text-primary hover:border-primary/30 transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </motion.div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x snap-mandatory">
        {PIPELINE_STAGES.map(stage => (
          <motion.div 
            variants={columnVariants}
            key={stage.id} 
            className="w-80 shrink-0 flex flex-col gap-4 snap-center h-full"
          >
            <div className={`flex items-center justify-between p-3 rounded-lg border ${stage.color} backdrop-blur-md`}>
              <div className="flex items-center gap-2 font-semibold">
                {stage.icon}
                {stage.title}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-xs font-bold">
                {getAppsForStage(stage.id).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 min-h-0">
              <AnimatePresence>
                {getAppsForStage(stage.id).map(app => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <Card 
                      hoverable 
                      className="cursor-pointer active:cursor-pointer border-secondary/50/80 bg-[#08566E]/90 hover:border-primary/35 transition duration-200"
                      onClick={(e) => {
                        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                          handleCardClick(app);
                        }
                      }}
                    >
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-primary text-sm">{app.candidateName}</h4>
                          <span className="text-xs text-slate-600 font-mono">{(app.candidateId || '').toString().padStart(4, '0')}</span>
                        </div>
                        
                        <div className="text-xs text-slate-600 flex flex-col gap-1">
                          <span className="text-primary font-medium">{app.jobTitle}</span>
                          <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                          {app.score !== undefined && app.score !== null && (
                            <span className="flex items-center gap-1 mt-1 text-primary">
                              <CheckCircle className="w-3 h-3" /> Score: {app.score.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2">
                          {(stage.id === 'APPLIED') && (
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleStatusChange(app.id, 'SCREENING')}>Screen</Button>
                          )}
                          {(stage.id === 'SCREENING') && (
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-primary/50 text-primary" onClick={() => handleStatusChange(app.id, 'ASSESSMENT')}>Assess</Button>
                          )}
                          {(stage.id === 'ASSESSMENT') && (
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs text-primary border-primary/50" onClick={() => handleStatusChange(app.id, 'INTERVIEW')}>Interview</Button>
                          )}
                          {(stage.id === 'INTERVIEW') && (
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-primary/50 text-primary" onClick={() => handleStatusChange(app.id, 'OFFERED')}>Offer</Button>
                          )}
                          {(stage.id !== 'REJECTED' && stage.id !== 'OFFERED') && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10 shrink-0" onClick={() => handleStatusChange(app.id, 'REJECTED')}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {getAppsForStage(stage.id).length === 0 && (
                <div className="p-8 border-[#362b4d] border-[#362b4d]ashed border-secondary/50 rounded-xl flex items-center justify-center text-sm text-slate-600 bg-surface-muted/30">
                  Drop candidates here
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Candidate Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#08566E] border border-secondary/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-secondary/50/60 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary">{selectedApp.candidateName}</h3>
                  <span className="text-xs text-primary font-mono">{selectedApp.candidateEmail}</span>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-muted hover:bg-secondary/20 text-slate-600 hover:text-primary transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                
                {/* Meta details */}
                <div className="md:col-span-1 flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-surface-muted/50 border border-secondary/50/60 flex flex-col gap-3">
                    <span className="text-xs text-slate-600 uppercase font-bold tracking-wide">Application Meta</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600">Job Profile</span>
                      <span className="text-primary font-semibold">{selectedApp.jobTitle}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600">Applied On</span>
                      <span className="text-primary">{new Date(selectedApp.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-600">Current Status</span>
                      <span className="text-primary font-semibold uppercase">{selectedApp.status}</span>
                    </div>
                    {selectedApp.resumeId && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-secondary/50/40">
                        <span className="text-xs text-slate-600 font-semibold">Resume: {selectedApp.resumeName}</span>
                        <div className="flex gap-2">
                          <a 
                            href={`http://localhost:8080/api/public/resume/${selectedApp.resumeId}/preview`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-1.5 rounded bg-primary/10 border border-primary/25 text-xs text-white hover:bg-primary/20 font-bold transition"
                          >
                            Preview
                          </a>
                          <a 
                            href={`http://localhost:8080/api/public/resume/${selectedApp.resumeId}/download`}
                            download
                            className="flex-1 text-center py-1.5 rounded bg-surface-muted hover:bg-secondary/20 border border-surface-border text-xs text-primary hover:bg-secondary/30 transition"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submissions & Reports */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider">AI Coding Trajectory & Cognitive Report</h4>
                  
                  {loadingSubmissions ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <span className="text-xs text-slate-600">Analyzing developer journey log...</span>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="p-8 border border-dashed border-secondary/50 rounded-xl flex items-center justify-center text-sm text-slate-600 bg-surface-muted/20">
                      No coding submissions completed by this candidate yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {submissions.map((sub, sIdx) => (
                        <div key={sub.submissionId || sIdx} className="flex flex-col gap-4 border border-secondary/50 p-5 rounded-xl bg-surface-muted/40">
                          {/* Submission Meta */}
                          <div className="flex justify-between items-center pb-2 border-b border-secondary/50/40">
                            <span className="text-xs font-semibold text-primary">Score: {sub.score.toFixed(1)}%</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.status === 'ACCEPTED' ? 'bg-primary/10 text-white' : 'bg-primary/10 text-white'
                            }`}>{sub.status}</span>
                          </div>

                          {/* Markdown report from Gemini */}
                          {sub.cognitiveJourneyReport ? (
                            <div className="prose prose-invert max-w-none text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {sub.cognitiveJourneyReport}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-600 italic">
                              AI Trajectory Report is generating or was not recorded for this run.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
