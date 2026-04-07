import { connectDB } from "@/lib/db";
import { UserProfile } from "@/lib/models/UserProfile";
import { withAuth } from "@/lib/withAuth";

function omitMeta<T extends { _id?: unknown; __v?: unknown }>(doc: T) {
  const { _id, __v, ...rest } = doc;
  void _id;
  void __v;
  return rest;
}

export const GET = withAuth(async (_req, { user }) => {
  await connectDB();
  const profile = await UserProfile.findOne({ username: user.username }).lean();
  if (!profile) {
    return Response.json({ data: { displayName: "", intro: "", resumeLinks: [], avatarUrl: "" } });
  }
  return Response.json({ data: omitMeta(profile) });
});

export const PUT = withAuth(async (req, { user }) => {
  const { displayName, intro, resumeLinks, avatarUrl } = await req.json();
  await connectDB();
  const profile = await UserProfile.findOneAndUpdate(
    { username: user.username },
    { $set: { displayName, intro, resumeLinks, avatarUrl } },
    { upsert: true, new: true }
  ).lean();
  return Response.json({ data: omitMeta(profile) });
});
