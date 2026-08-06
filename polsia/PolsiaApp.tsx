import React, { useState } from 'react';
import { Sparkles, Rocket, Brain, Code2, Megaphone, ArrowLeft, AlertCircle, Copy, Check, Download } from 'lucide-react';
import { AgentCard } from './components/AgentCard';
import { MarkdownView } from './components/MarkdownView';
import { LandingPreview } from './components/LandingPreview';
import { AgentId, AgentStates, BusinessIdea } from './types';
import { runStrategist, runEngineer, runMarketer } from './agents/runAgents';

const initialAgents = (): AgentStates => ({
  strategist: { id: 'strategist', status: 'idle', output: '' },
  engineer:   { id: 'engineer',   status: 'idle', output: '' },
  marketer:   { id: 'marketer',   status: 'idle', output: '' },
});

const EXAMPLE_IDEAS = [
  { idea: 'A subscription that mails 3 curated indie board games each month', audience: 'Board game hobbyists aged 25-45 in North America', budget: '$500' },
  { idea: 'An AI tool that turns a photo of a whiteboard into a shareable Notion doc', audience: 'Product managers and consultants', budget: '$1000' },
  { idea: 'Same-day dog walking marketplace for downtown Toronto', audience: 'Dog owners working long hours', budget: '$2000' },
];

interface PolsiaAppProps {
  onExit: () => void;
}

export const PolsiaApp: React.FC<PolsiaAppProps> = ({ onExit }) => {
  const [idea, setIdea] = useState<BusinessIdea>({ idea: '', audience: '', budget: '' });
  const [agents, setAgents] = useState<AgentStates>(initialAgents());
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const update = (id: AgentId, patch: Partial<AgentStates[AgentId]>) =>
    setAgents(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const run = async () => {
    if (!idea.idea.trim()) {
      setError('Enter a business idea first.');
      return;
    }
    setError(null);
    setRunning(true);
    setAgents({
      strategist: { id: 'strategist', status: 'queued', output: '' },
      engineer:   { id: 'engineer',   status: 'queued', output: '' },
      marketer:   { id: 'marketer',   status: 'queued', output: '' },
    });

    try {
      update('strategist', { status: 'running', startedAt: Date.now() });
      const strategy = await runStrategist(idea);
      update('strategist', { status: 'done', output: strategy, finishedAt: Date.now() });

      update('engineer', { status: 'running', startedAt: Date.now() });
      update('marketer', { status: 'running', startedAt: Date.now() });

      const [engineerResult, marketerResult] = await Promise.allSettled([
        runEngineer(idea, strategy),
        runMarketer(idea, strategy),
      ]);

      if (engineerResult.status === 'fulfilled') {
        update('engineer', { status: 'done', output: engineerResult.value, finishedAt: Date.now() });
      } else {
        update('engineer', { status: 'error', error: String(engineerResult.reason), finishedAt: Date.now() });
      }

      if (marketerResult.status === 'fulfilled') {
        update('marketer', { status: 'done', output: marketerResult.value, finishedAt: Date.now() });
      } else {
        update('marketer', { status: 'error', error: String(marketerResult.reason), finishedAt: Date.now() });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      update('strategist', { status: 'error', error: msg });
      update('engineer',   { status: 'error', error: 'Strategy step failed' });
      update('marketer',   { status: 'error', error: 'Strategy step failed' });
    } finally {
      setRunning(false);
    }
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const downloadMarkdown = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const slug = (idea.idea || 'my-business')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'my-business';

  const anyOutput = agents.strategist.output || agents.engineer.output || agents.marketer.output;
  const canRun = !running && idea.idea.trim().length > 3;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> NanoMerch
            </button>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30">
                <Rocket className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Co<span className="text-fuchsia-400">Founder</span>
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5 ml-1">
                Prototype
              </span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 hidden sm:block">3 agents · Gemini 2.5 Flash</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Your AI co-founder team
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Type a business idea. Three specialized agents — a Strategist, an Engineer, and a Marketer — will produce a plan, a working landing page, and a launch marketing kit.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT: Input */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                The idea
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Business idea *</label>
                  <textarea
                    value={idea.idea}
                    onChange={e => setIdea({ ...idea, idea: e.target.value })}
                    placeholder="e.g. A monthly subscription that mails 3 curated indie board games"
                    className="w-full min-h-[96px] rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-white placeholder-zinc-600 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Target audience <span className="text-zinc-600">(optional)</span></label>
                  <input
                    value={idea.audience}
                    onChange={e => setIdea({ ...idea, audience: e.target.value })}
                    placeholder="e.g. Board game hobbyists 25-45"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-600 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Starting budget <span className="text-zinc-600">(optional)</span></label>
                  <input
                    value={idea.budget}
                    onChange={e => setIdea({ ...idea, budget: e.target.value })}
                    placeholder="e.g. $500"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-white placeholder-zinc-600 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
                  />
                </div>
              </div>

              <button
                onClick={run}
                disabled={!canRun}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Rocket className="w-4 h-4" />
                {running ? 'Agents working…' : 'Launch the team'}
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Try an example</h3>
              <div className="space-y-2">
                {EXAMPLE_IDEAS.map((ex, i) => (
                  <button
                    key={i}
                    disabled={running}
                    onClick={() => setIdea(ex)}
                    className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-xs text-zinc-300 hover:border-fuchsia-500/40 hover:bg-zinc-900 transition disabled:opacity-50"
                  >
                    {ex.idea}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[11px] leading-relaxed text-amber-200/80">
              <strong className="text-amber-200">Prototype note.</strong> This runs Gemini calls from the browser. There's no persistence, no scheduling, no real deploys — see <code className="bg-black/40 px-1 py-0.5 rounded">POLSIA_CLONE_ARCHITECTURE.md</code> for the full-system plan.
            </div>
          </div>

          {/* RIGHT: Agent outputs */}
          <div className="lg:col-span-8 space-y-5">
            {!anyOutput && !running && (
              <div className="flex h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 text-center px-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-lg font-medium text-zinc-200">Nothing yet</p>
                <p className="mt-1 text-sm text-zinc-500 max-w-sm">Enter an idea on the left and hit <span className="text-zinc-300 font-medium">Launch the team</span>. Agents run in ~30–60 seconds total.</p>
              </div>
            )}

            {(anyOutput || running) && (
              <>
                <AgentCard
                  title="Strategist"
                  role="CEO · positioning, pricing, GTM"
                  status={agents.strategist.status}
                  accent="bg-indigo-500/20 text-indigo-300"
                  icon={<Brain className="w-4 h-4" />}
                >
                  {agents.strategist.status === 'running' && !agents.strategist.output && (
                    <div className="text-xs text-zinc-500 italic">Drafting a one-page business plan…</div>
                  )}
                  {agents.strategist.error && (
                    <div className="text-xs text-red-300">{agents.strategist.error}</div>
                  )}
                  {agents.strategist.output && (
                    <>
                      <MarkdownView text={agents.strategist.output} />
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => copy('strategist', agents.strategist.output)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                        >
                          {copiedKey === 'strategist' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey === 'strategist' ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadMarkdown(`${slug}-plan.md`, agents.strategist.output)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                        >
                          <Download className="w-3.5 h-3.5" /> Download .md
                        </button>
                      </div>
                    </>
                  )}
                </AgentCard>

                <AgentCard
                  title="Engineer"
                  role="Builds the landing page"
                  status={agents.engineer.status}
                  accent="bg-emerald-500/20 text-emerald-300"
                  icon={<Code2 className="w-4 h-4" />}
                >
                  {agents.engineer.status === 'queued' && (
                    <div className="text-xs text-zinc-500 italic">Waiting for the strategy to finish…</div>
                  )}
                  {agents.engineer.status === 'running' && !agents.engineer.output && (
                    <div className="text-xs text-zinc-500 italic">Writing HTML + Tailwind for a landing page…</div>
                  )}
                  {agents.engineer.error && (
                    <div className="text-xs text-red-300">{agents.engineer.error}</div>
                  )}
                  {agents.engineer.output && (
                    <LandingPreview html={agents.engineer.output} slug={slug} />
                  )}
                </AgentCard>

                <AgentCard
                  title="Marketer"
                  role="Tweets, cold emails, ads, SEO, content calendar"
                  status={agents.marketer.status}
                  accent="bg-fuchsia-500/20 text-fuchsia-300"
                  icon={<Megaphone className="w-4 h-4" />}
                >
                  {agents.marketer.status === 'queued' && (
                    <div className="text-xs text-zinc-500 italic">Waiting for the strategy to finish…</div>
                  )}
                  {agents.marketer.status === 'running' && !agents.marketer.output && (
                    <div className="text-xs text-zinc-500 italic">Drafting the launch kit…</div>
                  )}
                  {agents.marketer.error && (
                    <div className="text-xs text-red-300">{agents.marketer.error}</div>
                  )}
                  {agents.marketer.output && (
                    <>
                      <MarkdownView text={agents.marketer.output} />
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => copy('marketer', agents.marketer.output)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                        >
                          {copiedKey === 'marketer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey === 'marketer' ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadMarkdown(`${slug}-marketing.md`, agents.marketer.output)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                        >
                          <Download className="w-3.5 h-3.5" /> Download .md
                        </button>
                      </div>
                    </>
                  )}
                </AgentCard>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
