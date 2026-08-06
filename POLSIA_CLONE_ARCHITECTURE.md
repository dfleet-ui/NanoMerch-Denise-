# Building a Polsia-style System — Architecture & Roadmap

**Author:** Claude (research spike on `claude/research-pulsia-7S9kJ`)
**Reference product:** [polsia.com](https://polsia.com) — "AI that runs your company while you sleep"

---

## 1. What Polsia actually does (functional decomposition)

At the product surface, Polsia takes a business idea and returns a running online business. Under the hood, that decomposes into ~7 layers:

| Layer | Responsibility | Third-party dependencies |
|---|---|---|
| **1. Ideation UI** | Chat/wizard that captures the user's idea, target market, budget | (none — LLM only) |
| **2. Agent runtime** | Long-running scheduled agents (CEO, Engineer, Marketer, Support), tool use, memory, retries | LLM API (Anthropic/OpenAI/Gemini), a queue (Redis + BullMQ / Temporal / Inngest), a vector store for memory |
| **3. Code + hosting** | Agents commit code to a repo and deploy it | GitHub App API, Vercel/Fly/Render API, Cloudflare (DNS + CDN) |
| **4. Storefront primitives** | DB per tenant, auth, email sending | Neon/Supabase per-project provisioning, Postmark/Resend, Clerk/WorkOS |
| **5. Money** | Take payments from end customers of the AI-built business; take a 20% platform cut | Stripe Connect (Standard or Express accounts per tenant) |
| **6. Growth** | Post to social, buy ads, track conversions | X API, Meta Marketing API, Google Ads API, GA4/PostHog |
| **7. Customer support** | Read incoming customer emails, draft/send replies | IMAP/Gmail API + Postmark inbound + LLM |

Everything the user sees ("your AI just closed a sale") is these seven layers wired together.

---

## 2. Reference architecture

```
                           ┌────────────────────────────────┐
                           │   Web UI (React/Next.js)       │
                           │   dashboard · agent activity   │
                           └───────────────┬────────────────┘
                                           │ (auth via Clerk/WorkOS)
                           ┌───────────────▼────────────────┐
                           │   API Gateway (Node/Fastify)   │
                           └─────┬──────────────────┬───────┘
                                 │                  │
                       ┌─────────▼─────┐   ┌────────▼─────────┐
                       │ Orchestrator  │   │  Billing service │
                       │ (Temporal or  │   │  (Stripe Connect)│
                       │  Inngest)     │   └──────────────────┘
                       └───┬───────┬───┘
                           │       │
        ┌──────────────────┘       └──────────────────────────┐
        │                                                     │
┌───────▼────────┐                                    ┌───────▼────────┐
│ Agent workers  │  ── LLM API (Claude/Gemini) ──┐   │ Provisioner    │
│ (CEO/Eng/Mkt/  │                               │   │  · GitHub App  │
│  Support)      │  ── Vector store (memory) ────┤   │  · Vercel API  │
└───┬──────┬─────┘                               │   │  · Cloudflare  │
    │      │                                     │   │  · Neon/Supabase│
    │      │                                     │   │  · Postmark    │
    │      └── Tool use ──► [Integrations]  ◄────┘   └────────────────┘
    │                       X API, Meta Ads API, Gmail/IMAP,
    │                       Stripe API, GA4, PostHog
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Postgres (control plane):                                    │
│   tenants, businesses, agent_runs, artifacts, ledger, keys   │
│ Postgres per tenant business (application data)              │
│ Redis: queues, rate limits                                   │
│ Object storage (R2/S3): generated assets, HTML snapshots     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. The hard parts (in order of pain)

### 3.1 Stripe Connect + KYC — hardest
Polsia takes a 20% cut of revenue the *AI-run business* earns. That's a marketplace pattern that requires **Stripe Connect** with Express or Standard accounts per tenant. Each end business needs its own onboarding: legal name, address, tax ID, bank account, ID verification, MCC code. Stripe will hold funds if KYC is incomplete or if MCC/business description doesn't match traffic patterns. This is a **months-long** compliance workstream on its own and has real legal exposure (money-transmitter rules vary by state/province).

### 3.2 Ad platforms hate autonomous agents
Meta and Google Ads APIs technically allow programmatic buys, but:
- Ad account setup requires a business manager, verified domain, verified payment method.
- New accounts have low daily caps and manual review on many creatives.
- Automated policy violations (misleading claims, unsupported categories) get accounts suspended within hours.
- Terms of service prohibit some forms of full automation without human review.

A real product must proxy through a **house ad account** with strict content-safety gates, or accept that end-user ad accounts will be suspended regularly and design UX around that.

### 3.3 Cost of goods
Each Polsia-run business consumes tokens 24/7. A "CEO agent wakes hourly and reasons about priorities" loop can easily burn $10–$50/day in tokens per tenant on frontier models. At $49/mo subscription, you lose money on any actively-used tenant unless:
- You use small/cheap models for routine loops and reserve big models for decisions.
- You cache aggressively (system prompts, tools, memory).
- You throttle agents to only run when there's something to react to (webhooks/queues), not on a fixed clock.

Budget the LLM bill as your #1 cost line.

### 3.4 Agents hallucinating into shared systems
An agent that invents facts is annoying. An agent that invents facts *while sending emails to real customers, buying real ads with real money, or committing real code to production* is a liability. You need:
- **Dry-run** mode for every external tool call (log the intended action; require review for high-risk actions).
- **Spend caps** at multiple layers (per-agent, per-day, per-account).
- **Kill switch** the user can hit to freeze all outbound actions.
- **Audit log** of every tool call the user can replay.

### 3.5 Multi-tenancy at the infra layer
"Each business gets its own GitHub repo, its own database, its own domain, its own email sender, its own Stripe account." That's ~6 provisioning API calls per new business, each with its own failure mode, quotas, and rate limits. Idempotent provisioning with retries and human-visible failure states is non-negotiable.

---

## 4. Realistic phased roadmap

Numbers are for a **small team (1–2 engineers)** working full-time. Solo founders should ~2x.

### Phase 0 — Prototype (this session, weeks 0–1)
- Local single-shot agent orchestrator: user enters idea → 3 agents produce a plan, a landing page, and a marketing kit.
- No auth, no persistence, no provisioning. Runs in the browser.
- **Purpose:** proves the LLM outputs are useful enough to justify the infra investment. **This is what we're building in this repo today.**

### Phase 1 — Authenticated SaaS (weeks 2–6)
- Auth (Clerk/WorkOS).
- Postgres control plane (tenants, businesses, agent_runs).
- Server-side agent execution (move Gemini calls off the browser).
- Real background jobs (Inngest is the fastest path — no infra to run).
- Persistent agent memory (start with just Postgres + full-text search; add vector store later).
- **Ship:** authenticated users can create a "business", run agents, see history.

### Phase 2 — Real deploys (weeks 7–12)
- GitHub App integration: agents create repos, open PRs, merge.
- Vercel/Fly integration: agents deploy the generated landing page to a real URL.
- Cloudflare: subdomain per business (`<slug>.yourdomain.com` first, custom domains later).
- Postmark/Resend for outbound email.
- **Ship:** the AI-built business is actually online and reachable.

### Phase 3 — Money (weeks 13–24)
- Stripe Connect Express onboarding flow.
- Products/prices creation on behalf of the tenant.
- 20% platform fee (application_fee_amount).
- Refund + chargeback handling.
- Ledger for revenue-share accounting.
- **Ship:** a business built on the platform can take real payments.

### Phase 4 — Growth automation (weeks 25–40)
- X API integration (agent posts).
- Meta Marketing API + house ad account model.
- Content-safety gate (LLM-based classifier + policy rules) before any outbound content.
- GA4/PostHog analytics per tenant, fed back into the CEO agent's context.
- **Ship:** agents can drive traffic and read whether it converted.

### Phase 5 — Support & long-tail ops (weeks 41–52+)
- Postmark inbound webhook → support agent → drafted reply → approval queue.
- Refund policies, dispute drafting, canned tax questions.
- Recurring "founder digest" emails to the human user.
- **Ship:** the human user can genuinely go days without checking in.

**Total realistic timeline to a real Polsia-competitor: 9–12 months for a small team.**

---

## 5. Cost model (rough, per-tenant, at scale)

| Line item | Monthly cost | Notes |
|---|---|---|
| LLM tokens (cheap model for loops, big model for decisions) | $15–$40 | Assumes aggressive caching and event-triggered (not clock-triggered) agents |
| Hosting (Vercel/Fly for landing page) | $2–$10 | Hobby tier free; scales with traffic |
| Database (Neon/Supabase branch) | $1–$5 | Cheap at rest |
| Email (Postmark/Resend) | $1–$10 | ~$0.001 per email |
| DNS/CDN (Cloudflare) | ~$0.10 | Cheap |
| Stripe Connect fees | 0.25% + $0.25 per tx | Passed through |
| **Your cost per tenant** | **~$20–$65/mo** | |
| **Revenue** | **$49/mo + 20% of tenant revenue** | Margin only works if the AI actually generates revenue for the tenant |

The math only closes when the AI-built businesses are earning real money. If most tenants churn before generating revenue, you're paying $30–$60/mo to subsidize a failed experiment. Polsia's $200K → $2M run-rate story is probably measuring subscriptions, not durable revenue-share income.

---

## 6. Recommended tech choices (opinionated)

- **LLM:** Anthropic Claude (Sonnet for routine loops, Opus for planning). Better tool-use reliability than most alternatives.
- **Agent runtime:** Anthropic Agent SDK or a hand-rolled loop on top of Messages API with `tool_runner`. Skip LangChain — too much magic for a system you need to debug at 2am.
- **Job orchestration:** Inngest (serverless, cron + event, cheap to start). Graduate to Temporal only when you have workflows that must survive weeks.
- **Frontend:** Next.js App Router. Server components make streaming agent output easy.
- **Auth:** Clerk (fastest); WorkOS if you need SSO/enterprise later.
- **DB:** Postgres (Neon for branching, Supabase for auth+DB combo).
- **Queue:** Inngest handles this — no separate Redis needed at the start.
- **Provisioning:** GitHub Octokit, Vercel SDK, Cloudflare API. Write thin idempotent wrappers.
- **Observability:** PostHog for product analytics + LLM cost tracking, Sentry for errors, LangSmith or Braintrust for agent trace debugging.

---

## 7. What we're NOT building today

To be clear about the gap between this prototype and a real Polsia:

- ❌ Server-side agent execution
- ❌ Persistent memory
- ❌ Real code deploys
- ❌ Scheduled/recurring agent runs
- ❌ Stripe / billing
- ❌ Ad platform integrations
- ❌ Multi-tenancy / auth
- ❌ Human-in-the-loop approval queues

What we ARE building today:
- ✅ A browser-based 3-agent orchestrator that proves the core LLM prompts work
- ✅ Structured outputs (business plan, landing page HTML, marketing kit) that a user can copy/download
- ✅ The prompt engineering foundation the Phase 1+ server will inherit

Treat the prototype as a **proof-of-value spike**, not a product. Ship it, see if the outputs are compelling, then decide whether to invest 9–12 months of engineering.

---

## 8. Legal & policy considerations (do not skip)

Before any user's money touches your Stripe account, get:
- **Terms of Service** covering: no warranty on AI outputs, user is responsible for business content, no illegal categories (firearms, gambling, adult, etc.).
- **Acceptable Use Policy** covering: no impersonation, no scams, no MLM.
- **Content moderation pipeline** that scans generated landing pages and ads before publication.
- **DMCA / IP takedown** process.
- **Privacy policy** for both your users AND their downstream customers (you're a processor for the tenant's customer data — GDPR/CCPA apply).
- **State money-transmitter analysis** (US) or PSP/PI licensing analysis (EU/UK) — Stripe Connect handles most of this, but not all fact patterns.

A lawyer is a bigger unlock here than an extra engineer.
