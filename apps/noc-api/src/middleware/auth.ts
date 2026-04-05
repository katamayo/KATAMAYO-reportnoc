import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request to carry user & session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
      };
      session?: {
        id: string;
        userId: string;
        expiresAt: Date;
      };
    }
  }
}

/**
 * Middleware that requires a valid Better Auth session.
 * Attaches `req.user` and `req.session` on success, or returns 401.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionResult = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResult || !sessionResult.user) {
      res.status(401).json({ error: "Unauthorized — no valid session" });
      return;
    }

    req.user = sessionResult.user as Express.Request["user"];
    req.session = sessionResult.session as Express.Request["session"];
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized — session validation failed" });
  }
}
