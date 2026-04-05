import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { verifyPassword, signToken } from "@/lib/auth";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return Response.json({ error: "Missing credentials" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ username });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = await signToken({
    userId: user._id.toString(),
    username: user.username,
    role: user.role,
  });

  const isProd = process.env.NODE_ENV === "production";

  const cookie = [
    `session=${token}`,
    `HttpOnly`,
    isProd ? `Secure` : "",
    `SameSite=Strict`,
    `Path=/`,
    `Max-Age=${COOKIE_MAX_AGE}`,
  ].filter(Boolean).join("; ");

  return new Response(JSON.stringify({ username: user.username, role: user.role }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
