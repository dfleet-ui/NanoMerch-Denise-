import React from 'react';
import { Loader2, Check, AlertCircle, Clock, Bot } from 'lucide-react';
import { AgentStatus } from '../types';

interface AgentCardProps {
  title: string;
  role: string;
  status: AgentStatus;
  accent: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const statusLabel: Record<AgentStatus, string> = {
  idle: 'Idle',
  queued: 'Queued',
  running: 'Thinking',
  done: 'Done',
  error: 'Error',
};

const statusPill = (s: AgentStatus) => {
  switch (s) {
    case 'done': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'running': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    case 'queued': return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30';
    default: return 'bg-zinc-800 text-zinc-500 border-zinc-800';
  }
};

const statusIcon = (s: AgentStatus) => {
  switch (s) {
    case 'done': return <Check className="w-3.5 h-3.5" />;
    case 'running': return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    case 'queued': return <Clock className="w-3.5 h-3.5" />;
    case 'error': return <AlertCircle className="w-3.5 h-3.5" />;
    default: return null;
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ title, role, status, accent, icon, children }) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
            {icon ?? <Bot className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{title}</div>
            <div className="text-[11px] text-zinc-500">{role}</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusPill(status)}`}>
          {statusIcon(status)}
          {statusLabel[status]}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
