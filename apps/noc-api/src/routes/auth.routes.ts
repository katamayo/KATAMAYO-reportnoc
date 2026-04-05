import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

const router = Router();

/**
 * Mount Better Auth handler as a catch-all under /api/auth/*.
 * Better Auth handles sign-up, sign-in, sign-out, get-session, etc.
 */
router.all("/*splat", toNodeHandler(auth));

export default router;
