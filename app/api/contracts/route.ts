import { connectDB } from "@/lib/db";
import { Contract } from "@/lib/models/Contract";
import { withAuth } from "@/lib/withAuth";

function serialize(doc: Record<string, unknown>) {
  return { id: String(doc._id), ...doc, _id: undefined, __v: undefined };
}

export const GET = withAuth(async (req, { user }) => {
  const url    = new URL(req.url);
  const type   = url.searchParams.get("type") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const search = url.searchParams.get("search") ?? "";
  const sort   = url.searchParams.get("sort") ?? "createdAt";
  const order  = url.searchParams.get("order") ?? "desc";
  const page   = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit  = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));

  await connectDB();

  const query: Record<string, unknown> = { username: user.username };
  if (type)   query.type   = type;
  if (status) query.status = status;
  if (search) query.client = { $regex: search, $options: "i" };

  const allowedSort = ["createdAt", "updatedAt", "client", "proposedOn", "startDate"];
  const sortField = allowedSort.includes(sort) ? sort : "createdAt";

  const total = await Contract.countDocuments(query);
  const docs  = await Contract.find(query)
    .sort({ [sortField]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return Response.json({ data: docs.map(serialize), total, page, pages: Math.ceil(total / limit), limit });
});

export const POST = withAuth(async (req, { user }) => {
  const body = await req.json();
  if (!body.client || !body.title) {
    return Response.json({ error: "client and title are required" }, { status: 400 });
  }
  await connectDB();
  const doc = await Contract.create({ ...body, username: user.username });
  return Response.json({ data: serialize(doc.toObject()) }, { status: 201 });
});
