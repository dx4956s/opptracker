import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/auth";
import { withAuth } from "@/lib/withAuth";

export const PATCH = withAuth(async (req, { params }) => {
  const { id } = await params;
  const { username, password, role } = await req.json();

  await connectDB();
  const user = await User.findById(id);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  if (username) user.username = username;
  if (role)     user.role = role;
  if (password) user.passwordHash = hashPassword(password);

  await user.save();
  return Response.json({ id: user._id.toString(), username: user.username, role: user.role });
}, { adminOnly: true });

export const DELETE = withAuth(async (_req, { params }) => {
  const { id } = await params;
  await connectDB();
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return Response.json({ error: "User not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}, { adminOnly: true });
