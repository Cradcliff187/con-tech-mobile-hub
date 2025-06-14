
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMessages } from '@/hooks/useMessages';
import { useProjects } from '@/hooks/useProjects';
import { MessageSquare, Send, Users, Bell, Calendar } from 'lucide-react';

export const CommunicationHub = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'announcement' | 'alert' | 'update'>('text');
  
  const { messages, loading, sendMessage } = useMessages(selectedProjectId);
  const { projects } = useProjects();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const result = await sendMessage(newMessage, messageType, selectedProjectId);
    if (!result.error) {
      setNewMessage('');
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Bell size={16} className="text-blue-600" />;
      case 'alert': return <Bell size={16} className="text-red-600" />;
      case 'update': return <Calendar size={16} className="text-green-600" />;
      default: return <MessageSquare size={16} className="text-slate-600" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'update': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Communication Center</h2>
          <p className="text-slate-600">Stay connected with your project teams</p>
        </div>
      </div>

      {/* Project Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Project:</label>
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composer */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send size={20} />
              Send Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Message Type</label>
              <select 
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="text">General Message</option>
                <option value="announcement">Announcement</option>
                <option value="update">Status Update</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Message</label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !selectedProjectId}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Send size={16} className="mr-2" />
              Send Message
            </Button>

            {!selectedProjectId && (
              <p className="text-xs text-slate-500">Select a project to send messages</p>
            )}
          </CardContent>
        </Card>

        {/* Messages Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} />
              Messages
              {selectedProjectId && (
                <Badge variant="outline">
                  {projects.find(p => p.id === selectedProjectId)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No Messages Yet</h3>
                <p className="text-slate-500">
                  {selectedProjectId ? 'Be the first to send a message for this project!' : 'Select a project to view messages'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-800">
                          {message.sender?.full_name || message.sender?.email || 'Unknown User'}
                        </div>
                        <Badge className={getMessageTypeColor(message.message_type)}>
                          {getMessageTypeIcon(message.message_type)}
                          <span className="ml-1 capitalize">{message.message_type}</span>
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-slate-700">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Team Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Workers</p>
                  <p className="text-2xl font-bold text-green-800">24</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">On Break</p>
                  <p className="text-2xl font-bold text-orange-800">3</p>
                </div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Off Duty</p>
                  <p className="text-2xl font-bold text-slate-800">8</p>
                </div>
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
