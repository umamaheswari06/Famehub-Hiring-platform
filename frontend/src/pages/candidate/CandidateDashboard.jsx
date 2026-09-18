import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileText, CheckCircle, Clock, Video, Code2, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

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

export default function CandidateDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    else setSyncing(true);
    try {
      const res = await api.get('/api/dashboard/candidate');
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch candidate dashboard", err);
    } finally {
      if (!silent) setLoading(false);
      else setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Poll every 30 seconds — auto-pipeline changes (MCQ grading, coding eval)
    // will reflect without page reload
    intervalRef.current = setInterval(() => fetchDashboard(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, []);


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
      className="flex flex-col gap-8 h-full"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {user.name?.split(' ')[0]}!</h1>
            <p className="text-slate-600 mt-1">Here's the status of your current applications and upcoming tasks.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {syncing ? (
              <span className="flex items-center gap-1.5 text-primary">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Live updates on
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable className="bg-white border-slate-200 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Applications Submitted</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{dashboardData?.applications?.length || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:-translate-y-1 transition-transform duration-300">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hoverable className="bg-white border-slate-200 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Assessments</p>
                <h3 className="text-3xl font-bold text-primary mt-2">
                  {(dashboardData?.upcomingAssessments?.length || 0) + (dashboardData?.upcomingCoding?.length || 0)}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:-translate-y-1 transition-transform duration-300">
                <Code2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hoverable className="bg-white border-slate-200 relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming Interviews</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{dashboardData?.upcomingInterviews?.length || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:-translate-y-1 transition-transform duration-300">
                <Video className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Active Applications */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="flex flex-col gap-4">
              {dashboardData?.applications?.map(app => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-colors shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-primary">{app.jobTitle}</h4>
                      <p className="text-xs text-slate-600 mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={
                      app.status === 'APPLIED' ? 'neutral' : 
                      app.status === 'SCREENING' ? 'warning' :
                      app.status === 'INTERVIEW' ? 'default' : 'success'
                    }>
                      {app.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!dashboardData?.applications || dashboardData.applications.length === 0) && (
                <div className="text-center py-12 text-slate-600">
                  You haven't applied to any jobs yet.
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate('/candidate/jobs')}>Browse Jobs</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Center */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Action Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {dashboardData?.upcomingAssessments?.map(assessment => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">MCQ: {assessment.title}</h4>
                        <p className="text-xs text-primary/80">Required for {assessment.jobTitle} • {assessment.duration} mins</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate(`/candidate/assessment/${assessment.id}`)}>
                      Start MCQ
                    </Button>
                  </div>
                ))}

                {dashboardData?.upcomingCoding?.map(coding => (
                  <div key={coding.id} className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Coding: {coding.title}</h4>
                        <p className="text-xs text-primary/80">Required for {coding.jobTitle} • <span className="uppercase font-semibold text-primary">{coding.difficulty}</span></p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={() => navigate(`/candidate/coding/${coding.id}`)}>
                      Solve Challenge
                    </Button>
                  </div>
                ))}

                {dashboardData?.upcomingInterviews?.map(interview => (
                  <div key={interview.id} className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Interview for {interview.jobTitle}</h4>
                        <p className="text-xs text-primary/80">{new Date(interview.scheduleTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate(`/candidate/interview/${interview.meetingRoomId}`)}>
                      Join Room
                    </Button>
                  </div>
                ))}

                {(!dashboardData?.upcomingAssessments?.length && !dashboardData?.upcomingCoding?.length && !dashboardData?.upcomingInterviews?.length) && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                    <CheckCircle className="w-12 h-12 mb-3 opacity-20 text-primary" />
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
