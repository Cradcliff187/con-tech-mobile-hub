
import { MessageSquare, Users } from 'lucide-react';

interface MessageListProps {
  onChatSelect: (chatId: number) => void;
  selectedChat: number | null;
}

export const MessageList = ({ onChatSelect, selectedChat }: MessageListProps) => {
  const chats = [
    {
      id: 1,
      name: 'Downtown Office - General',
      type: 'group',
      lastMessage: 'Foundation inspection scheduled for tomorrow',
      lastTime: '10:30 AM',
      unread: 3,
      participants: 12
    },
    {
      id: 2,
      name: 'Mike Johnson',
      type: 'direct',
      lastMessage: 'Equipment delivery confirmed for 2 PM',
      lastTime: '9:45 AM',
      unread: 1,
      participants: 1
    },
    {
      id: 3,
      name: 'Safety Team',
      type: 'group',
      lastMessage: 'Weekly safety report attached',
      lastTime: 'Yesterday',
      unread: 0,
      participants: 8
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      type: 'direct',
      lastMessage: 'Material costs updated in spreadsheet',
      lastTime: 'Yesterday',
      unread: 0,
      participants: 1
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Messages</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
              selectedChat === chat.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {chat.type === 'group' ? (
                  <Users size={16} className="text-slate-500 mt-1" />
                ) : (
                  <MessageSquare size={16} className="text-slate-500 mt-1" />
                )}
                <h4 className="font-medium text-slate-800 text-sm">
                  {chat.name}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{chat.lastTime}</span>
                {chat.unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-slate-600 line-clamp-2">
              {chat.lastMessage}
            </p>
            
            {chat.type === 'group' && (
              <p className="text-xs text-slate-500 mt-1">
                {chat.participants} participants
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
