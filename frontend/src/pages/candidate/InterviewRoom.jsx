import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Code2, Users, Settings, PhoneOff } from 'lucide-react';
import api from '../../utils/api';

export default function InterviewRoom() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState('video'); // 'video' or 'code'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // In a real application, we would initialize WebRTC and WebSocket connections here
  // based on the `roomName` and the user's auth token.

  const handleLeave = () => {
    if (user.roles?.includes('ROLE_HR')) {
      navigate('/hr/interviews');
    } else {
      navigate('/candidate/dashboard');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-slate-50 -m-8">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-primary">Live Interview Room</span>
          </div>
          <span className="text-slate-600 text-sm hidden md:inline">ID: {roomName}</span>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('video')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'video' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-primary'}`}
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Gallery</div>
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-primary'}`}
          >
            <div className="flex items-center gap-2"><Code2 className="w-4 h-4" /> Code Share</div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" /> 00:15:23
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane - Video/Code */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {activeTab === 'video' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Remote Video (Mock) */}
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm text-primary font-medium">
                  {user.roles?.includes('ROLE_HR') ? 'Candidate' : 'Interviewer'}
                </div>
              </div>

              {/* Local Video (Mock) */}
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {videoOn ? (
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-600">
                      <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                      <span>Camera is off</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm text-primary font-medium flex items-center gap-2">
                  You ({user.name})
                  {!micOn && <MicOff className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 justify-between">
                <span className="text-sm font-mono text-slate-600">shared-editor.js</span>
                <span className="text-xs text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Sync Active
                </span>
              </div>
              <textarea 
                className="flex-1 bg-transparent p-4 text-primary font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
                spellCheck="false"
                defaultValue={"// Shared collaborative coding environment\n\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));"}
              />
            </div>
          )}

          {/* Bottom Controls */}
          <div className="h-20 bg-white border border-slate-200 shadow-sm rounded-2xl backdrop-blur-md flex items-center justify-center gap-4 px-6 shrink-0">
            <button 
              onClick={() => setMicOn(!micOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setVideoOn(!videoOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${videoOn ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <MonitorUp className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <button onClick={handleLeave} className="px-6 h-12 rounded-full bg-primary hover:bg-primary text-white font-medium flex items-center gap-2 transition-all shadow-md shadow-primary/10">
              <PhoneOff className="w-5 h-5" /> Leave Room
            </button>
          </div>
        </div>

        {/* Right pane - Chat */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2 text-primary">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Meeting Chat</span>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-600">System • 10:00 AM</span>
              <div className="bg-slate-100 text-sm text-slate-700 p-2.5 rounded-lg rounded-tl-none">
                Recording has started.
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
