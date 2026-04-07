import { connectDB } from "@/lib/db";
import { Contract } from "@/lib/models/Contract";
import { withAuth } from "@/lib/withAuth";

function serialize<T extends { _id?: unknown; __v?: unknown }>(doc: T) {
  return { id: String(doc._id), ...doc, _id: undefined, __v: undefined };
}

export const PATCH = withAuth(async (req, { params, user }) => {
  const { id } = await params;
  const {
    type, date,
    contractValue, currency, valueInDiscussion,
    durationValue, durationUnit, durationInDiscussion,
    completionStatus,
  } = await req.json();

  const validTypes = ["pending", "active", "completed", "cancelled"];
  if (!validTypes.includes(type)) return Response.json({ error: "Invalid type" }, { status: 400 });

  await connectDB();
  const contract = await Contract.findOne({ _id: id, username: user.username });
  if (!contract) return Response.json({ error: "Not found" }, { status: 404 });

  contract.type = type;

  // Status reset on every type change
  contract.status = null;

  // Date fields: only clear startDate when reverting to pending (not yet started)
  // Preserve startDate on cancelled/completed (contract did start)
  if (type === "pending")   contract.startDate      = null;
  if (type !== "completed") contract.endDate        = null;
  if (type !== "cancelled") contract.cancelledDate  = null;
  if (type !== "completed") contract.completionStatus = null;

  if (type === "active")    contract.startDate      = date ?? null;
  if (type === "completed") { contract.endDate = date ?? null; contract.completionStatus = completionStatus ?? null; }
  if (type === "cancelled") contract.cancelledDate  = date ?? null;

  if (contractValue      !== undefined) contract.contractValue      = contractValue;
  if (currency           !== undefined) contract.currency           = currency;
  if (valueInDiscussion  !== undefined) contract.valueInDiscussion  = valueInDiscussion;
  if (durationValue      !== undefined) contract.durationValue      = durationValue;
  if (durationUnit       !== undefined) contract.durationUnit       = durationUnit;
  if (durationInDiscussion !== undefined) contract.durationInDiscussion = durationInDiscussion;

  await contract.save();
  return Response.json({ data: serialize(contract.toObject()) });
});
