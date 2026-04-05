import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { withAuth } from "@/lib/withAuth";

function serialize(doc: Record<string, unknown>) {
  return { id: String(doc._id), ...doc, _id: undefined, __v: undefined };
}

export const PATCH = withAuth(async (req, { params, user }) => {
  const { id } = await params;
  const { type, date, expectedPackage, currency, salaryInDiscussion } = await req.json();

  const validTypes = ["applied", "working", "left", "rejected"];
  if (!validTypes.includes(type)) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  await connectDB();
  const job = await Job.findOne({ _id: id, username: user.username });
  if (!job) return Response.json({ error: "Not found" }, { status: 404 });

  // Capture old type before overwriting
  const oldType = job.type;
  job.type = type;

  // Status reset: always null on type change — user sets it after
  // Exception: freelance-style defaults are not used here; null is the safe default
  job.status = null;

  // Date fields — clear all, then set relevant one
  if (type !== "working" && type !== "left")    job.startDate    = null;
  if (type !== "left")                          job.endDate      = null;
  if (type !== "rejected")                      job.rejectedDate = null;

  if (type === "working")  job.startDate    = date ?? null;
  if (type === "left")     job.endDate      = date ?? null;
  if (type === "rejected") job.rejectedDate = date ?? null;

  // Preserve appliedOn when moving back to applied from any other type
  // (it was set at creation, don't wipe it)
  void oldType; // used for clarity — no conditional needed after full date reset above

  // Optional package fields (passed from WorkingTransitionPopup)
  if (expectedPackage    !== undefined) job.expectedPackage    = expectedPackage;
  if (currency           !== undefined) job.currency           = currency;
  if (salaryInDiscussion !== undefined) job.salaryInDiscussion = salaryInDiscussion;

  await job.save();
  return Response.json({ data: serialize(job.toObject()) });
});
