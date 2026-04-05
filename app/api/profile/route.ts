import { connectDB } from "@/lib/db";
import { UserProfile } from "@/lib/models/UserProfile";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (_req, { user }) => {
  await connectDB();
  const profile = await UserProfile.findOne({ username: user.username }).lean();
  if (!profile) {
    return Response.json({ data: { displayName: "", intro: "", resumeLinks: [], avatarUrl: "" } });
  }
  const { _id, __v, ...rest } = profile as Record<string, unknown>;
  void _id; void __v;
  return Response.json({ data: rest });
});

export const PUT = withAuth(async (req, { user }) => {
  const { displayName, intro, resumeLinks, avatarUrl } = await req.json();
  await connectDB();
  const profile = await UserProfile.findOneAndUpdate(
    { username: user.username },
    { $set: { displayName, intro, resumeLinks, avatarUrl } },
    { upsert: true, new: true }
  ).lean();
  const { _id, __v, ...rest } = profile as Record<string, unknown>;
  void _id; void __v;
  return Response.json({ data: rest });
});
