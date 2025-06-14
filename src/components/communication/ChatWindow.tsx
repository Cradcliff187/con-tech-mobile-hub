
import { useState } from 'react';
import { Send, Image, Plus } from 'lucide-react';

interface ChatWindowProps {
  chatId: number | null;
}

export const ChatWindow = ({ chatId }: ChatWindowProps) => {
  const [message, setMessage] = useState('');

  if (!chatId) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex items-center justify-center">
        <p className="text-slate-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  const messages = [
    {
      id: 1,
      sender: 'Mike Johnson',
      content: 'Foundation inspection scheduled for tomorrow at 9 AM',
      time: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      content: 'Perfect, I\'ll make sure the crew is ready',
      time: '10:32 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'Sarah Wilson',
      content: 'Equipment delivery confirmed for 2 PM. Crane will be on site.',
      time: '10:45 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'You',
      content: 'Great! I\'ll coordinate with the steel team.',
      time: '10:47 AM',
      isOwn: true
    }
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Downtown Office - General</h3>
        <p className="text-sm text-slate-600">12 participants</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.isOwn 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-800'
            }`}>
              {!msg.isOwn && (
                <p className="text-xs font-medium mb-1 opacity-80">
                  {msg.sender}
                </p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.isOwn ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <Plus size={20} />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <Image size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSend}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
