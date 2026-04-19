import { Router, type Request, type Response } from "express";
import { authenticate, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.get("/home", authenticate, (req: Request, res: Response) => {
  const u = (req as AuthedRequest).auth!;
  switch (u.role) {
    case "learner":
      res.json({
        role: u.role,
        title: "Your learning hub",
        summary:
          u.organizationName != null
            ? `You're connected to ${u.organizationName}. Track benefits, explore programs, and connect coursework to mobility opportunities.`
            : "Track benefits, explore programs, and connect your coursework to internal mobility opportunities.",
        nextSteps: [
          "Complete your learner profile (demo)",
          "Browse eligible education providers",
          "Meet with a success coach when available",
        ],
      });
      return;
    case "employer":
      res.json({
        role: u.role,
        title: "Employer workspace",
        summary: `Signed in as ${u.organizationName ?? "your organization"}. Configure tuition policy, budgets, and approvals (demo).`,
        nextSteps: [
          "Review utilization and completion trends",
          "Align pathways to critical job families",
          "Invite HR partners to co-manage the program",
        ],
      });
      return;
    case "education_provider":
      res.json({
        role: u.role,
        title: "Partner workspace",
        summary: `Signed in as ${u.organizationName ?? "your institution"}. Manage catalog visibility and learner referrals (demo).`,
        nextSteps: ["Update program offerings", "Confirm accreditation documents", "Respond to employer pathway requests"],
      });
      return;
    case "platform_admin":
      res.json({
        role: u.role,
        title: "Platform administration",
        summary: "Operational tools for Workforce Cliff (demo environment).",
        nextSteps: ["Review B2B inquiries under Admin → Inquiries", "Rotate API secrets before production"],
      });
      return;
    default:
      res.status(403).json({ error: "Unknown role" });
  }
});

export default router;
