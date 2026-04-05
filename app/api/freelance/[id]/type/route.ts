import { connectDB } from "@/lib/db";
import { Freelance } from "@/lib/models/Freelance";
import { withAuth } from "@/lib/withAuth";

function serialize(doc: Record<string, unknown>) {
  return { id: String(doc._id), ...doc, _id: undefined, __v: undefined };
}

export const PATCH = withAuth(async (req, { params, user }) => {
  const { id } = await params;
  const { type, date, currency, hourlyRate, hoursPerDay, totalEarnings } = await req.json();

  const validTypes = ["bidding", "in_progress", "completed", "lost"];
  if (!validTypes.includes(type)) return Response.json({ error: "Invalid type" }, { status: 400 });

  await connectDB();
  const freelance = await Freelance.findOne({ _id: id, username: user.username });
  if (!freelance) return Response.json({ error: "Not found" }, { status: 404 });

  freelance.type = type;

  // Default status per type
  if (type === "bidding")          freelance.status = "proposal_sent";
  else if (type === "in_progress") freelance.status = "on_track";
  else                             freelance.status = null;

  // bidDate is historical — preserve across all states; only overwrite when going (back) to bidding
  // startDate preserved in completed (work did start); cleared for bidding/lost
  if (type !== "in_progress" && type !== "completed") freelance.startDate     = null;
  if (type !== "completed")                           freelance.endDate       = null;
  if (type !== "lost")                                freelance.lostDate      = null;
  if (type !== "completed")                           freelance.totalEarnings = null;

  if (type === "bidding")     freelance.bidDate   = date ?? null;
  if (type === "in_progress") freelance.startDate = date ?? null;
  if (type === "completed")   { freelance.endDate = date ?? null; freelance.totalEarnings = totalEarnings ?? null; }
  if (type === "lost")        freelance.lostDate  = date ?? null;

  if (currency    !== undefined) freelance.currency    = currency;
  if (hourlyRate  !== undefined) freelance.hourlyRate  = hourlyRate;
  if (hoursPerDay !== undefined) freelance.hoursPerDay = hoursPerDay;

  await freelance.save();
  return Response.json({ data: serialize(freelance.toObject()) });
});
