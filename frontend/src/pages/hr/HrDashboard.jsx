import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, Briefcase, Clock, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
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

export default function HrDashboard() {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/api/dashboard/hr');
        setStats(statsRes.data);

        // Fetch recent applications for the table
        const appsRes = await api.get('/api/hr/applications/all');
        // Sort by id descending to get the newest (simulating recent)
        const sorted = appsRes.data.sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentApps(sorted);

      } catch (err) {
        console.error("Failed to fetch HR dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary animate-slide-in-left">Recruitment Hub</h1>
          <p className="text-slate-600 mt-1 animate-fade-in">Manage your active job postings and candidate pipeline.</p>
        </div>
        <button className="ripple-btn animate-glow-pulse flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm transition-all hover:scale-105 w-full sm:w-auto justify-center">
          Create Job Posting
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 stagger-children">
        <Card hoverable className="card-tilt">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Active Jobs</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-primary mt-1 sm:mt-2 stat-number">{stats?.activeJobs || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary animate-float">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hoverable className="card-tilt">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">New Candidates</p>
                <h3 className="text-3xl font-bold text-primary mt-2 stat-number">{stats?.newCandidates || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary animate-float-delay">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hoverable className="card-tilt">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Reviews</p>
                <h3 className="text-3xl font-bold text-primary mt-2 stat-number">{stats?.pendingReviews || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary animate-float-slow">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hoverable className="card-tilt">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Scheduled Interviews</p>
                <h3 className="text-3xl font-bold text-primary mt-2 stat-number">{stats?.interviewsScheduled || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-primary animate-float">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-1">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">View All <ChevronRight className="w-4 h-4 ml-1"/></Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary">
                          {app.candidateName ? app.candidateName.charAt(0) : 'C'}
                        </div>
                        <span className="font-medium text-primary">{app.candidateName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{app.jobTitle}</TableCell>
                    <TableCell>
                      <Badge variant={
                        app.status === 'APPLIED' ? 'neutral' : 
                        app.status === 'SCREENING' ? 'warning' :
                        app.status === 'INTERVIEW' ? 'default' : 'success'
                      }>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {recentApps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-600">No recent applications found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
               <Clock className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm">No interviews scheduled for today.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
