import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Search, MapPin, Briefcase, ChevronDown, X,
  CheckCircle, Loader2, Star, User, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import ApplyModal from '../../components/ui/ApplyModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Apply Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);

  const openApplyModal = (job) => {
    setJobToApply(job);
    setShowApplyModal(true);
  };

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds(prev => new Set([...prev, jobId]));
  };

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); // 'type' | 'location' | 'department' | null

  const toggleDropdown = (name) => setOpenDropdown(prev => prev === name ? null : name);
  const closeDropdowns = () => setOpenDropdown(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsRes = await api.get('/api/public/jobs');
        setJobs(jobsRes.data);
        if (jobsRes.data.length > 0) {
          setSelectedJob(jobsRes.data[0]);
        }

        // Fetch candidate dashboard to see what jobs they already applied to
        const dashboardRes = await api.get('/api/dashboard/candidate');
        const appliedIds = dashboardRes.data.applications?.map(app => app.jobId) || [];
        setAppliedJobIds(new Set(appliedIds));

      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    setApplyingTo(jobId);
    try {
      await api.post('/api/candidate/applications', null, { params: { jobId } });
      setAppliedJobIds(new Set([...appliedJobIds, jobId]));
    } catch (err) {
      console.error("Failed to apply", err);
      alert(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplyingTo(null);
    }
  };


  // Safe tag helper
  const getJobTags = (job) => {
    if (job.requirements) {
      return job.requirements.split(',');
    }
    // Dynamic tags based on job title/description keywords
    const text = `${job.title || ''} ${job.description || ''}`.toLowerCase();
    const tagMap = [
      ['java', 'Java'], ['spring boot', 'Spring Boot'], ['mysql', 'MySQL'],
      ['react', 'React'], ['typescript', 'TypeScript'], ['next.js', 'Next.js'],
      ['python', 'Python'], ['tensorflow', 'TensorFlow'], ['pytorch', 'PyTorch'],
      ['figma', 'Figma'], ['ux', 'UX Research'], ['ui', 'UI Design'],
      ['aws', 'AWS'], ['kubernetes', 'Kubernetes'], ['terraform', 'Terraform'],
      ['gcp', 'GCP'], ['docker', 'Docker'], ['ci/cd', 'CI/CD'],
      ['seo', 'SEO'], ['google analytics', 'Analytics'], ['content marketing', 'Content'],
      ['sql', 'SQL'], ['tableau', 'Tableau'], ['selenium', 'Selenium'],
      ['cypress', 'Cypress'], ['junit', 'JUnit'], ['agile', 'Agile'],
      ['microservices', 'Microservices'], ['saas', 'SaaS'], ['api', 'API'],
      ['documentation', 'Documentation'], ['brand', 'Branding']
    ];
    const matched = tagMap.filter(([key]) => text.includes(key)).map(([, label]) => label);
    return matched.length > 0 ? matched.slice(0, 4) : ['General'];
  };

  // Filter Jobs list in-memory with safety checks
  const filteredJobs = jobs.filter(job => {
    const titleMatch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const deptMatch = job.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = searchTerm === "" || titleMatch || deptMatch || descMatch;

    const matchesLocation = !locationFilter ||
      (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));

    const matchesType = !typeFilter ||
      (job.type && job.type.toLowerCase().replace('-', ' ').includes(typeFilter.toLowerCase().replace('-', ' ')));

    const matchesDept = !departmentFilter ||
      (job.departmentName && job.departmentName.toLowerCase() === departmentFilter.toLowerCase());

    return matchesSearch && matchesLocation && matchesType && matchesDept;
  });

  const hasActiveFilters = locationFilter || typeFilter || departmentFilter;

  const allLocations = [...new Set(jobs.map(j => j.location).filter(Boolean))];
  const allTypes = [...new Set(jobs.map(j => j.type).filter(Boolean))];
  const allDepartments = [...new Set(jobs.map(j => j.departmentName).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 h-full text-slate-600"
    >
      {/* 1. Search Bar */}
      <motion.div variants={itemVariants} className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by role, skills, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm transition"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-4 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* 2. Google Jobs-style filter chip row */}
      <motion.div variants={itemVariants} className="relative flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>

        {/* Job Type chip */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('type')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              typeFilter
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            {typeFilter || 'Job type'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'type' && (
            <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 min-w-[180px] overflow-hidden">
              <button
                onClick={() => { setTypeFilter(''); closeDropdowns(); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                  !typeFilter ? 'text-primary font-semibold' : 'text-slate-600'
                }`}
              >All types</button>
              {allTypes.map(t => (
                <button
                  key={t}
                  onClick={() => { setTypeFilter(t); closeDropdowns(); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                    typeFilter === t ? 'text-primary font-semibold bg-primary/5' : 'text-slate-600'
                  }`}
                >{t}</button>
              ))}
            </div>
          )}
        </div>

        {/* Location chip */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('location')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              locationFilter
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {locationFilter || 'Location'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'location' && (
            <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 min-w-[220px] overflow-hidden">
              <button
                onClick={() => { setLocationFilter(''); closeDropdowns(); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                  !locationFilter ? 'text-primary font-semibold' : 'text-slate-600'
                }`}
              >All locations</button>
              {allLocations.map(loc => (
                <button
                  key={loc}
                  onClick={() => { setLocationFilter(loc); closeDropdowns(); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                    locationFilter === loc ? 'text-primary font-semibold bg-primary/5' : 'text-slate-600'
                  }`}
                >{loc}</button>
              ))}
            </div>
          )}
        </div>

        {/* Department chip */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('department')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              departmentFilter
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            {departmentFilter || 'Department'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'department' ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === 'department' && (
            <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 min-w-[200px] overflow-hidden">
              <button
                onClick={() => { setDepartmentFilter(''); closeDropdowns(); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                  !departmentFilter ? 'text-primary font-semibold' : 'text-slate-600'
                }`}
              >All departments</button>
              {allDepartments.map(d => (
                <button
                  key={d}
                  onClick={() => { setDepartmentFilter(d); closeDropdowns(); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-50 ${
                    departmentFilter === d ? 'text-primary font-semibold bg-primary/5' : 'text-slate-600'
                  }`}
                >{d}</button>
              ))}
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={() => { setLocationFilter(''); setTypeFilter(''); setDepartmentFilter(''); }}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}

        {/* Result count - push right */}
        <span className="ml-auto text-sm text-slate-500">{filteredJobs.length} {filteredJobs.length === 1 ? 'role' : 'roles'} found</span>
      </motion.div>

      {/* 3. Content Layout */}
      <div className="flex flex-col gap-6" onClick={closeDropdowns}>
          <motion.div variants={containerVariants} className="flex flex-col gap-4">
            {filteredJobs.map(job => {
              const isApplied = appliedJobIds.has(job.id);
              const isSelected = selectedJob?.id === job.id;
              return (
                <motion.div 
                  key={job.id} 
                  variants={itemVariants}
                  onClick={() => setSelectedJob(job)}
                  className="cursor-pointer"
                >
                  <div className={`bg-white border rounded-2xl p-6 relative transition-all duration-300 shadow-sm flex flex-col gap-4 ${
                    isSelected ? 'border-primary/80 shadow-md bg-slate-50' : 'border-slate-200 hover:border-primary/40'
                  }`}>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary shrink-0">
                          {job.departmentName ? job.departmentName.charAt(0) : 'J'}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-lg font-extrabold text-primary group-hover:text-primary transition-colors leading-tight">
                            {job.title}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500 mt-0.5">
                            {job.departmentName || 'General'} Department
                          </span>
                        </div>
                      </div>
                      <button className="p-2.5 rounded-full border border-slate-200 text-slate-400 hover:text-primary hover:bg-slate-50 transition shrink-0">
                        <Star className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <User className="w-3.5 h-3.5 text-primary" /> Mid-Senior
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Briefcase className="w-3.5 h-3.5 text-primary" /> {job.type || 'Full-time'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <DollarSign className="w-3.5 h-3.5 text-primary" /> {job.salaryRange || '$10,520 PA'}
                      </span>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {job.description || "Join our team to build state of the art solutions and shape the future of our digital platform."}
                    </p>

                    {/* Required Skills Badges */}
                    <div className="flex flex-wrap gap-2">
                      {getJobTags(job).map((req, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg">
                          {req.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Footer Row */}
                    <div className="flex justify-end items-center pt-4 border-t border-slate-200 mt-2">

                      <Button 
                        variant={isApplied ? "outline" : "primary"} 
                        className={`px-5 py-2 h-auto text-xs rounded-xl font-bold shadow-sm transition-all ${
                          isApplied 
                            ? 'text-primary border-primary/20 bg-primary/5 hover:bg-primary/10' 
                            : 'bg-primary hover:bg-primary-dark text-white border-0'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card selection trigger
                          openApplyModal(job);
                        }}
                        disabled={isApplied}
                      >
                        {applyingTo === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isApplied ? (
                          <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Applied</span>
                        ) : (
                          'Apply Now'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary">No jobs found</h3>
                <p className="text-slate-500 mt-1">Try resetting your search query or filters.</p>
              </div>
            )}
          </motion.div>
      </div>

      {/* Apply Modal */}
      <ApplyModal 
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={jobToApply}
        onApplySuccess={handleApplySuccess}
      />
    </motion.div>
  );
}
