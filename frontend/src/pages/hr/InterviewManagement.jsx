import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Video, Calendar, Clock, User, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function InterviewManagement() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/api/hr/interviews');
        setInterviews(res.data);
      } catch (err) {
        console.error("Failed to fetch interviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Interview Schedule</h1>
          <p className="text-slate-600 mt-1">Manage upcoming video interviews with candidates.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" /> Schedule Interview
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-primary">Upcoming Interviews</h2>
          
          <div className="flex flex-col gap-4">
            {interviews.map(interview => (
              <Card key={interview.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary">{interview.application?.candidate?.name || 'Candidate'}</h3>
                        <p className="text-slate-600">{interview.application?.job?.title || 'General Interview'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(interview.scheduleTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {new Date(interview.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Button variant="outline" className="gap-2 flex-1 md:flex-none">
                        <LinkIcon className="w-4 h-4" /> Copy Link
                      </Button>
                      <Button variant="primary" className="gap-2 flex-1 md:flex-none bg-primary hover:bg-primary" onClick={() => navigate(`/hr/interviews/room/${interview.meetingRoomId}`)}>
                        <Video className="w-4 h-4" /> Join Room
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {interviews.length === 0 && (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-slate-600">
                  <Calendar className="w-12 h-12 mb-4 opacity-50" />
                  <p>No upcoming interviews scheduled.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start text-primary bg-slate-50">Today's Interviews</Button>
              <Button variant="ghost" className="justify-start text-slate-600 hover:text-primary">This Week</Button>
              <Button variant="ghost" className="justify-start text-slate-600 hover:text-primary">Completed</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
