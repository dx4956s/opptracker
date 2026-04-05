import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth";
import { withAuth } from "@/lib/withAuth";

function safe(user: { _id: unknown; username: string; role: string; createdAt: unknown }) {
  return { id: String(user._id), username: user.username, role: user.role };
}

export const GET = withAuth(async (_req) => {
  await connectDB();
  const users = await User.find({}).lean();
  return Response.json(users.map(safe));
}, { adminOnly: true });

export const POST = withAuth(async (req) => {
  const { username, password, role } = await req.json();

  if (!username || !password || !role) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  if (role !== "admin" && role !== "user") {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  await connectDB();

  const exists = await User.findOne({ username });
  if (exists) return Response.json({ error: "Username already taken" }, { status: 409 });

  const created = await User.create({ username, passwordHash: hashPassword(password), role });
  return Response.json(safe(created), { status: 201 });
}, { adminOnly: true });
