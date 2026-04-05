import { verifyToken, TokenPayload } from "./auth";

export type AuthedContext = {
  params: Promise<Record<string, string>>;
  user: TokenPayload;
};

type Handler = (req: Request, ctx: AuthedContext) => Promise<Response>;

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(";").find((c) => c.trim().startsWith(`${name}=`));
  return match ? match.trim().slice(name.length + 1) : null;
}

export function withAuth(handler: Handler, options: { adminOnly?: boolean } = {}) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    const token = parseCookie(req.headers.get("cookie"), "session");

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user: TokenPayload;
    try {
      user = await verifyToken(token);
    } catch {
      return Response.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    if (options.adminOnly && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, { ...ctx, user });
  };
}
