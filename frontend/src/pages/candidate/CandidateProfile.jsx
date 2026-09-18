import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  User, Mail, Phone, MapPin, Upload, FileText, CheckCircle2, 
  Github, Linkedin, Plus, X, Loader2, Award, Briefcase, Sparkles, Link as LinkIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08, duration: 0.5 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function CandidateProfile() {
  const initialUser = JSON.parse(localStorage.getItem('user') || '{"name":"Alex River","email":"candidate@famehub.com"}');
  
  const [name, setName] = useState(initialUser.name || 'Alex River');
  const [phone, setPhone] = useState(initialUser.phone || '+1 (555) 000-0000');
  const [location, setLocation] = useState(initialUser.location || 'San Francisco, CA');
  const [title, setTitle] = useState(initialUser.title || 'Full Stack Developer');
  const [githubUrl, setGithubUrl] = useState(initialUser.githubUrl || 'https://github.com');
  const [linkedinUrl, setLinkedinUrl] = useState(initialUser.linkedinUrl || 'https://linkedin.com');
  const [skills, setSkills] = useState(initialUser.skills || ['Java', 'Spring Boot', 'React', 'TypeScript', 'Node.js', 'Docker', 'AWS', 'Kubernetes', 'PostgreSQL', 'MongoDB']);
  
  const [profilePic, setProfilePic] = useState(initialUser.profilePic || null);
  const [resumeList, setResumeList] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const profilePicRef = useRef(null);

  // Fetch resumes
  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const res = await api.get('/api/candidate/resume/my');
      setResumeList(res.data);
    } catch (err) {
      console.error("Failed to fetch resumes", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSaveChanges = () => {
    const updatedUser = {
      ...initialUser,
      name,
      phone,
      location,
      title,
      githubUrl,
      linkedinUrl,
      skills,
      profilePic
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Dispatch custom event and reload layout
    window.location.reload();
  };

  const handleAddSkill = () => {
    const skill = prompt("Add skill tag:");
    if (skill) {
      const trimmed = skill.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      await api.post('/api/candidate/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchResumes();
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to color skill tags dynamically based on hash code
  const getSkillBadgeColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return {
      background: `hsla(${h}, 60%, 15%, 0.5)`,
      color: `hsl(${h}, 90%, 80%)`,
      border: `1px solid hsla(${h}, 60%, 30%, 0.3)`
    };
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 h-full max-w-6xl mx-auto w-full pb-12"
    >
      {/* Title Header with Save Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2.5">
            My Portfolio Profile
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h1>
          <p className="text-slate-600 mt-1">Manage and edit your developer credentials, social links, and resume.</p>
        </div>
        <Button variant="primary" className="shadow-md shadow-primary/10 px-6" onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Developer Card, Resume, Completion Gauge */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Unified Dev Card with Banner Backdrop */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm relative">
              <div className="h-24 w-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent"></div>
              </div>
              <div className="px-6 pb-6 flex flex-col items-center text-center -mt-12 relative z-10">
                <div className="relative group cursor-pointer mb-3">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full border-4 border-[#120f1a] shadow-2xl object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary flex items-center justify-center font-bold text-3xl text-white uppercase border-4 border-[#120f1a] shadow-2xl transition duration-300 group-hover:scale-105">
                      {name ? name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div 
                    onClick={() => profilePicRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <input 
                    type="file" 
                    ref={profilePicRef} 
                    onChange={handleProfilePicChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <h2 className="text-xl font-bold text-primary tracking-tight">{name}</h2>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="text-slate-600 text-sm text-center bg-transparent border-b border-transparent hover:border-[#362b4d] focus:border-primary/50 focus:outline-none py-0.5 w-full font-medium"
                />

                {/* Profile Completion Bar */}
                <div className="w-full mt-6 pt-5 border-t border-secondary/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold uppercase tracking-wider">Profile Strength</span>
                    <span className="text-primary font-bold">85% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden border border-secondary/50">
                    <div className="h-full bg-gradient-to-r from-primary to-primary rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="flex items-center gap-3 mt-6 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 border-secondary/50 hover:bg-surface-muted text-slate-600"
                    onClick={() => window.open(githubUrl, '_blank')}
                  >
                    <Github className="w-4 h-4 text-slate-600" /> GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 border-secondary/50 hover:bg-surface-muted text-slate-600"
                    onClick={() => window.open(linkedinUrl, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 text-primary" /> LinkedIn
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Resumes Attachment Panel */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">Attachments</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="border-dashed border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 hover:border-primary transition-all cursor-pointer group"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-600 group-hover:text-primary mb-2" />
                  )}
                  <p className="text-xs font-semibold text-primary">Upload New Resume</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleUploadResume} 
                    accept=".pdf,.docx" 
                    className="hidden" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {loadingResumes ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    resumeList.map(res => (
                      <div key={res.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-primary/50 transition-all">
                        <FileText className="w-5 h-5 text-primary shrink-0" />
                        <a 
                          href={`/api/public/resume/${res.id}/download`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-medium text-primary truncate hover:underline flex-1"
                        >
                          {res.fileName}
                        </a>
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      </div>
                    ))
                  )}
                  {!loadingResumes && resumeList.length === 0 && (
                    <p className="text-xs text-slate-600 text-center italic py-1">No resumes uploaded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Editable Forms & Skills Cloud */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Personal Information Form */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 text-base">
                  <User className="w-4 h-4 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                    <div className="relative group">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
                      />
                    </div>
                  </div>

                  {/* Email (Disabled) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600/40" />
                      <input 
                        type="email" 
                        value={initialUser.email} 
                        disabled 
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-500 cursor-not-allowed text-sm" 
                      />
                    </div>
                  </div>

                  {/* Phone input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
                    <div className="relative group">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
                      />
                    </div>
                  </div>

                  {/* Location input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Location</label>
                    <div className="relative group">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="text" 
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
                      />
                    </div>
                  </div>

                  {/* GitHub link */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">GitHub Profile URL</label>
                    <div className="relative group">
                      <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="url" 
                        value={githubUrl}
                        onChange={e => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/your-username"
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
                      />
                    </div>
                  </div>

                  {/* LinkedIn link */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">LinkedIn Profile URL</label>
                    <div className="relative group">
                      <Linkedin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="url" 
                        value={linkedinUrl}
                        onChange={e => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/your-username"
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" 
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Color-Coded Skills cloud */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row justify-between items-center pb-3">
                <CardTitle className="text-primary flex items-center gap-2 text-base">
                  <Award className="w-4 h-4 text-primary" />
                  Expertise Skills
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddSkill}
                  className="gap-1.5 text-primary hover:text-primary px-2.5"
                >
                  <Plus className="w-3.5 h-3.5"/> Add Skill
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map(skill => {
                    const colors = getSkillBadgeColor(skill);
                    return (
                      <Badge 
                        key={skill} 
                        variant="neutral" 
                        style={colors}
                        className="px-3.5 py-1.5 text-xs transition-transform hover:-translate-y-0.5 cursor-pointer group flex items-center gap-1.5 font-semibold rounded-lg"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill}
                        <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 hover:text-primary transition-colors" />
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
