import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { Contract } from "@/lib/models/Contract";
import { Freelance } from "@/lib/models/Freelance";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req, { user }) => {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam   = searchParams.get("to");

  const dateFilter: Record<string, unknown> = {};
  if (fromParam || toParam) {
    dateFilter.createdAt = {};
    if (fromParam) (dateFilter.createdAt as Record<string, unknown>).$gte = new Date(fromParam);
    if (toParam)   (dateFilter.createdAt as Record<string, unknown>).$lte = new Date(toParam);
  }

  const base = { username: user.username, ...dateFilter };

  const [jobs, contracts, freelances] = await Promise.all([
    Job.find(base).lean(),
    Contract.find(base).lean(),
    Freelance.find(base).lean(),
  ]);

  // ── Job metrics ──
  const jobsByType = {
    applied:  jobs.filter((j) => j.type === "applied").length,
    working:  jobs.filter((j) => j.type === "working").length,
    left:     jobs.filter((j) => j.type === "left").length,
    rejected: jobs.filter((j) => j.type === "rejected").length,
  };

  const appliedJobs = jobs.filter((j) => j.type === "applied");
  const inInterviewPipeline = appliedJobs.filter((j) =>
    ["callback", "interview_scheduled", "post_interview"].includes(j.status ?? "")
  ).length;

  const planningToSwitch = jobs.filter(
    (j) => j.type === "working" && j.status === "planning_to_switch"
  ).length;

  // ── Contract metrics ──
  const contractsByType = {
    pending:   contracts.filter((c) => c.type === "pending").length,
    active:    contracts.filter((c) => c.type === "active").length,
    completed: contracts.filter((c) => c.type === "completed").length,
    cancelled: contracts.filter((c) => c.type === "cancelled").length,
  };

  const atRisk = contracts.filter(
    (c) => c.type === "active" && c.status === "at_risk"
  ).length;

  function sumVal(docs: typeof contracts) {
    return docs.reduce((s, c) => {
      if (c.valueInDiscussion || !c.contractValue) return s;
      return s + (parseFloat(c.contractValue.replace(/[^0-9.]/g, "")) || 0);
    }, 0);
  }

  const pipelineValue  = sumVal([...contracts.filter((c) => c.type === "pending"), ...contracts.filter((c) => c.type === "active")]);
  const completedValue = sumVal(contracts.filter((c) => c.type === "completed"));

  // ── Freelance metrics ──
  const freelanceByType = {
    bidding:     freelances.filter((f) => f.type === "bidding").length,
    in_progress: freelances.filter((f) => f.type === "in_progress").length,
    completed:   freelances.filter((f) => f.type === "completed").length,
    lost:        freelances.filter((f) => f.type === "lost").length,
  };

  const revisionRequested = freelances.filter(
    (f) => f.type === "in_progress" && f.status === "revision_requested"
  ).length;

  const completedFL = freelances.filter((f) => f.type === "completed");
  const totalEarnings = completedFL.reduce((s, f) => {
    if (!f.totalEarnings) return s;
    return s + (parseFloat(f.totalEarnings.replace(/[^0-9.]/g, "")) || 0);
  }, 0);

  const winTotal = freelanceByType.completed + freelanceByType.lost;
  const winRate  = winTotal > 0
    ? Math.round((freelanceByType.completed / winTotal) * 100)
    : null;

  const ratedFreelances = [...freelances.filter((f) => f.type === "bidding"), ...freelances.filter((f) => f.type === "in_progress")]
    .filter((f) => f.hourlyRate);
  const avgRate = ratedFreelances.length > 0
    ? Math.round(ratedFreelances.reduce((s, f) => s + (parseFloat(f.hourlyRate) || 0), 0) / ratedFreelances.length)
    : null;

  // ── Recent activity (last 6 across all three) ──
  type ActivityItem = { id: string; kind: string; name: string; subtitle: string; type: string; createdAt: string };

  const activity: ActivityItem[] = [
    ...jobs.map((j) => ({ id: j._id.toString(), kind: "job", name: j.company, subtitle: j.role, type: j.type, createdAt: j.createdAt.toISOString() })),
    ...contracts.map((c) => ({ id: c._id.toString(), kind: "contract", name: c.client, subtitle: c.title, type: c.type, createdAt: c.createdAt.toISOString() })),
    ...freelances.map((f) => ({ id: f._id.toString(), kind: "freelance", name: f.client, subtitle: f.title, type: f.type, createdAt: f.createdAt.toISOString() })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return Response.json({
    data: {
      jobs: { ...jobsByType, total: jobs.length, inInterviewPipeline, planningToSwitch },
      contracts: { ...contractsByType, total: contracts.length, atRisk, pipelineValue, completedValue },
      freelance: { ...freelanceByType, total: freelances.length, revisionRequested, totalEarnings, winRate, avgRate },
      recentActivity: activity,
    },
  });
});
