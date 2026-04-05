import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models/Job";
import { withAuth } from "@/lib/withAuth";

function serialize(doc: Record<string, unknown>) {
  return { id: String(doc._id), ...doc, _id: undefined, __v: undefined };
}

export const GET = withAuth(async (_req, { params, user }) => {
  const { id } = await params;
  await connectDB();
  const doc = await Job.findOne({ _id: id, username: user.username }).lean();
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: serialize(doc as Record<string, unknown>) });
});

export const PATCH = withAuth(async (req, { params, user }) => {
  const { id } = await params;
  const body = await req.json();

  // Strip protected fields
  delete body.username;
  delete body._id;
  delete body.id;

  await connectDB();
  const doc = await Job.findOneAndUpdate(
    { _id: id, username: user.username },
    { $set: body },
    { new: true }
  ).lean();
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: serialize(doc as Record<string, unknown>) });
});

export const DELETE = withAuth(async (_req, { params, user }) => {
  const { id } = await params;
  await connectDB();
  const deleted = await Job.findOneAndDelete({ _id: id, username: user.username });
  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
});
