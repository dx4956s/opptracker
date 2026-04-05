import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (_req, { user }) => {
  return Response.json({ username: user.username, role: user.role });
});
