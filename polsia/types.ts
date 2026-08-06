export type AgentId = 'strategist' | 'engineer' | 'marketer';

export type AgentStatus = 'idle' | 'queued' | 'running' | 'done' | 'error';

export interface AgentState {
  id: AgentId;
  status: AgentStatus;
  output: string;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

export interface BusinessIdea {
  idea: string;
  audience: string;
  budget: string;
}

export type AgentStates = Record<AgentId, AgentState>;
