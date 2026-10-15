import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Hash,
  Send,
  Users,
  Flag,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../data/initialData';

export const DiscordChatPanel: React.FC = () => {
  const {
    isChatSidebarOpen,
    setIsChatSidebarOpen,
    activeChannel,
    setActiveChannel,
    channels,
    chatMessages,
    sendMessage,
    currentUser,
    setReportingTarget,
    isAdmin,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannelObj = channels.find(c => c.id === activeChannel) || channels[0];
  const channelMessages = chatMessages.filter(m => m.channelId === activeChannel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatSidebarOpen) {
      scrollToBottom();
    }
  }, [channelMessages, isChatSidebarOpen]);

  if (!isChatSidebarOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(activeChannel, inputMessage);
    setInputMessage('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#081022] border-l border-[#16274a] shadow-2xl flex flex-col text-slate-200">
      {/* Discord Channel Header */}
      <div className="h-16 px-4 border-b border-[#152445] bg-[#0c1830] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 truncate">
          <Hash className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="truncate">
            <h3 className="text-xs font-bold text-white truncate">#{currentChannelObj.name}</h3>
            <p className="text-[10px] text-slate-400 truncate">{currentChannelObj.description}</p>
          </div>
        </div>

        <button
          onClick={() => setIsChatSidebarOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cerrar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Channel Switcher Pills */}
      <div className="px-3 py-2 bg-[#091326] border-b border-[#152445] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {channels
          .filter(c => c.type === 'text')
          .map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                activeChannel === channel.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#121f3b]'
              }`}
            >
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{channel.name}</span>
            </button>
          ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Welcome message in channel */}
        <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-center text-xs text-slate-400">
          <p className="text-white font-semibold flex items-center justify-center gap-1">
            <span>¡Bienvenido al canal #{currentChannelObj.name}!</span>
          </p>
          <p className="text-[11px] mt-0.5">{currentChannelObj.description}</p>
        </div>

        {channelMessages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2.5 group relative hover:bg-[#0c162e]/50 p-1.5 rounded-xl transition-colors">
            <img
              src={msg.authorAvatar}
              alt={msg.authorName}
              className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5 border border-blue-500/30 bg-[#070e1c]"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                    {msg.authorName}
                  </span>
                  {msg.isAdmin && (
                    <span className="text-[9px] bg-blue-600 text-white font-mono px-1.5 py-0.2 rounded font-bold">
                      ADMIN
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                {/* Report message button */}
                <button
                  onClick={() => setReportingTarget({
                    type: 'chat',
                    id: msg.id,
                    title: `Mensaje en #${currentChannelObj.name}`,
                    content: msg.content,
                    authorEmail: msg.authorEmail,
                  })}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity cursor-pointer"
                  title="Denunciar mensaje inapropiado"
                >
                  <Flag className="w-3 h-3" />
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Online Members Peek */}
      <div className="px-4 py-2 border-t border-[#152445] bg-[#070e1c] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Comunidad activa (5 en línea)</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono">Conectado</span>
      </div>

      {/* Input Message Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#152445] bg-[#0c1830] shrink-0 space-y-1.5">
        <div className="relative flex items-center bg-[#070e1c] border border-[#1b2d54] rounded-2xl px-3 py-1.5 focus-within:border-blue-400 transition-colors">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={`Enviar a #${currentChannelObj.name}...`}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 py-1.5 focus:outline-none pr-8"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-1.5 rounded-lg text-blue-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-500 flex items-center gap-1 px-1">
          <ShieldAlert className="w-3 h-3 text-blue-400 shrink-0" />
          <span>Filtro activo: palabras ofensivas se sustituyen automáticamente por ####</span>
        </p>
      </form>
    </div>
  );
};
