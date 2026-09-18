import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, Loader2, CheckCircle, Briefcase, Phone, Mail, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const STEPS = [
  { id: 1, label: 'Careers profile',     sub: '5-10 minutes' },
  { id: 2, label: 'Role Information',    sub: 'less than 1 minute' },
  { id: 3, label: 'Self-identification', sub: 'less than 1 minute' },
  { id: 4, label: 'Review & apply',      sub: '' },
];

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="flex items-start px-6 pt-5 pb-4 border-b border-slate-100 overflow-x-auto gap-0">
      {STEPS.map((step, idx) => {
        const done = completedSteps.includes(step.id);
        const active = currentStep === step.id;
        const isLast = idx === STEPS.length - 1;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-[90px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 transition-all ${
                done || active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {done && !active ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              <p className={`text-[11px] font-semibold text-center mt-1.5 leading-tight ${active || done ? 'text-blue-700' : 'text-slate-400'}`}>
                {step.label}
              </p>
              {step.sub && <p className="text-[10px] text-slate-400 text-center">{step.sub}</p>}
            </div>
            {!isLast && (
              <div className={`h-[2px] flex-1 mt-4 mx-1 rounded transition-all ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function ApplyModal({ isOpen, onClose, job, onApplySuccess }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    experience: 'Mid Level',
    coverLetter: '',
    gender: '',
    ethnicity: '',
    veteranStatus: '',
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCompleted([]);
      setDirection(1);
      setFormData({ name: user.name || '', email: user.email || '', phone: '', experience: 'Mid Level', coverLetter: '', gender: '', ethnicity: '', veteranStatus: '' });
      setFile(null);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const goNext = () => {
    if (step === 1 && (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim())) {
      setError('Please fill in all required fields.');
      return;
    }
    if (step === 3 && !file) {
      setError('Please upload your resume.');
      return;
    }
    setError('');
    setCompleted(prev => [...new Set([...prev, step])]);
    setDirection(1);
    setStep(s => s + 1);
  };

  const goBack = () => { setError(''); setDirection(-1); setStep(s => s - 1); };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return; }
    setFile(f); setError('');
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await api.post('/api/candidate/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.post('/api/candidate/applications', null, { params: { jobId: job.id, resumeId: uploadRes.data.id } });
      setSuccess(true);
      setTimeout(() => { onApplySuccess(job.id); onClose(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder-slate-400 bg-white";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Apply for <span className="text-blue-700">{job?.title}</span></h2>
              <p className="text-xs text-slate-500 mt-0.5">{job?.departmentName} · {job?.location}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <StepIndicator currentStep={step} completedSteps={completed} />

          {success ? (
            <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Application Submitted!</h3>
              <p className="text-sm text-slate-500">Your application for <strong>{job?.title}</strong> has been received. The HR team will be in touch soon.</p>
            </div>
          ) : (
            <>
              {/* Step Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-[280px]">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">{error}</div>
                )}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div key={step} custom={direction} variants={slideVariants}
                    initial="enter" animate="center" exit="exit"
                    transition={{ duration: 0.22, ease: 'easeInOut' }}>

                    {/* Step 1 — Careers Profile */}
                    {step === 1 && (
                      <div className="flex flex-col gap-4">
                        <p className="text-xs text-slate-500 mb-1">Tell us about yourself so the hiring team can reach you.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}><User className="inline w-3.5 h-3.5 mr-1 text-blue-500" />Full Name *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="Alex River" />
                          </div>
                          <div>
                            <label className={labelCls}><Mail className="inline w-3.5 h-3.5 mr-1 text-blue-500" />Email Address *</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} placeholder="alex@example.com" />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}><Phone className="inline w-3.5 h-3.5 mr-1 text-blue-500" />Phone Number *</label>
                          <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="+1 (555) 000-0000" />
                        </div>
                      </div>
                    )}

                    {/* Step 2 — Role Information */}
                    {step === 2 && (
                      <div className="flex flex-col gap-4">
                        <p className="text-xs text-slate-500 mb-1">Provide details relevant to this specific role.</p>
                        <div>
                          <label className={labelCls}><Briefcase className="inline w-3.5 h-3.5 mr-1 text-blue-500" />Experience Level</label>
                          <select value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className={inputCls}>
                            <option>Entry Level</option>
                            <option>Mid Level</option>
                            <option>Senior</option>
                            <option>Lead / Manager</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Cover Letter / Why are you a great fit?</label>
                          <textarea rows="6" value={formData.coverLetter} onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                            className={`${inputCls} resize-none`}
                            placeholder="Tell us why you're excited about this role and what makes you a strong candidate..." />
                        </div>
                      </div>
                    )}

                    {/* Step 3 — Self-Identification + Resume */}
                    {step === 3 && (
                      <div className="flex flex-col gap-5">
                        <p className="text-xs text-slate-500">This information is voluntary and will not affect your application.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelCls}>Gender</label>
                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className={inputCls}>
                              <option value="">Prefer not to say</option>
                              <option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Ethnicity</label>
                            <select value={formData.ethnicity} onChange={e => setFormData({ ...formData, ethnicity: e.target.value })} className={inputCls}>
                              <option value="">Prefer not to say</option>
                              <option>Asian</option><option>Black or African American</option>
                              <option>Hispanic or Latino</option><option>White</option>
                              <option>Two or more races</option><option>Other</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Veteran Status</label>
                            <select value={formData.veteranStatus} onChange={e => setFormData({ ...formData, veteranStatus: e.target.value })} className={inputCls}>
                              <option value="">Prefer not to say</option>
                              <option>Not a veteran</option><option>Protected veteran</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Resume / CV * (PDF or DOCX, max 10MB)</label>
                          <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative transition ${file ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-slate-50'}`}>
                            <input type="file" accept=".pdf,.docx,.doc" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {file ? (
                              <><FileText className="w-9 h-9 text-blue-500 mb-2" />
                                <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB · Click to replace</p></>
                            ) : (
                              <><UploadCloud className="w-9 h-9 text-slate-400 mb-2" />
                                <p className="text-sm font-semibold text-slate-600">Drag & drop or click to upload</p>
                                <p className="text-xs text-slate-400">PDF, DOCX up to 10MB</p></>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4 — Review & Apply */}
                    {step === 4 && (
                      <div className="flex flex-col gap-4">
                        <p className="text-xs text-slate-500 mb-1">Review your details before submitting.</p>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 text-sm">
                          {[
                            { label: 'Full Name', value: formData.name },
                            { label: 'Email', value: formData.email },
                            { label: 'Phone', value: formData.phone },
                            { label: 'Experience', value: formData.experience },
                          ].map(row => (
                            <div key={row.label} className="flex justify-between items-center px-4 py-3">
                              <span className="text-slate-500 font-medium">{row.label}</span>
                              <span className="text-slate-800 font-semibold">{row.value}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center px-4 py-3">
                            <span className="text-slate-500 font-medium">Resume</span>
                            <span className="text-blue-600 font-semibold flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />{file?.name}
                            </span>
                          </div>
                          {formData.coverLetter && (
                            <div className="px-4 py-3">
                              <span className="text-slate-500 font-medium block mb-1">Cover Letter</span>
                              <p className="text-slate-700 text-xs leading-relaxed line-clamp-3">{formData.coverLetter}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">By submitting, you confirm all information is accurate and consent to your resume being shared with the hiring team.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                <button type="button" onClick={step === 1 ? onClose : goBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition">
                  {step === 1 ? 'Cancel' : <><ChevronLeft className="w-4 h-4" /> Back</>}
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Step {step} of {STEPS.length}</span>
                  {step < STEPS.length ? (
                    <button type="button" onClick={goNext}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-sm">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-60">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

