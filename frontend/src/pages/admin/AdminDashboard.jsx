import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Briefcase, FileText, CheckCircle, Activity, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const activityData = [
  { name: 'Mon', active: 400, new: 240 },
  { name: 'Tue', active: 300, new: 139 },
  { name: 'Wed', active: 550, new: 400 },
  { name: 'Thu', active: 450, new: 280 },
  { name: 'Fri', active: 600, new: 390 },
  { name: 'Sat', active: 700, new: 480 },
  { name: 'Sun', active: 650, new: 430 },
];

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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/dashboard/admin');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
        <h1 className="text-3xl font-bold tracking-tight text-primary">Platform Overview</h1>
        <p className="text-slate-600 mt-1">Real-time metrics and system activity.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverable>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Candidates</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{stats?.totalCandidates || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-white">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-primary flex items-center"><Activity className="w-4 h-4 mr-1"/> +12%</span>
              <span className="text-slate-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">HR Accounts</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{stats?.totalHr || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-primary flex items-center"><Activity className="w-4 h-4 mr-1"/> +4%</span>
              <span className="text-slate-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Jobs</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{stats?.totalJobs || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-white">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-primary flex items-center"><Activity className="w-4 h-4 mr-1"/> -2%</span>
              <span className="text-slate-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card hoverable>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Applications</p>
                <h3 className="text-3xl font-bold text-primary mt-2">{stats?.totalApplications || 0}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-white">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-primary flex items-center"><Activity className="w-4 h-4 mr-1"/> +28%</span>
              <span className="text-slate-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>User Activity Traffic</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#08566E" vertical={false} />
                <XAxis dataKey="name" stroke="#8b949e" tick={{fill: '#8b949e'}} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b949e" tick={{fill: '#8b949e'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#08566E', borderColor: '#08566E', borderRadius: '8px', color: '#c9d1d9' }}
                  itemStyle={{ color: '#c9d1d9' }}
                />
                <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 6, strokeWidth: 0}} />
                <Line type="monotone" dataKey="new" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 0}} activeDot={{r: 6, strokeWidth: 0}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {[
              { label: 'API Servers', status: 'Operational', color: 'text-primary', bg: 'bg-primary' },
              { label: 'Database Cluster', status: 'Operational', color: 'text-primary', bg: 'bg-primary' },
              { label: 'Code Execution Sandbox', status: 'Degraded', color: 'text-primary', bg: 'bg-primary' },
              { label: 'Video Conferencing', status: 'Operational', color: 'text-primary', bg: 'bg-primary' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.bg} ${item.bg === 'bg-primary' ? 'animate-pulse' : ''}`}></span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
