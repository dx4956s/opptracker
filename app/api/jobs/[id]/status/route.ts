import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { withAuth } from "@/lib/withAuth";

function serialize<T extends { _id?: unknown; __v?: unknown }>(doc: T) {
  return { id: String(doc._id), ...doc, _id: undefined, __v: undefined };
}

export const PATCH = withAuth(async (req, { params, user }) => {
  const { id } = await params;
  const { status } = await req.json();

  await connectDB();
  const doc = await Job.findOneAndUpdate(
    { _id: id, username: user.username },
    { $set: { status: status ?? null } },
    { new: true }
  ).lean();
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: serialize(doc) });
});
