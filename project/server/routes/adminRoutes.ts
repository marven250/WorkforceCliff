import { Router, type Request, type Response } from "express";
import { authenticate, requireRoles } from "../middleware/auth";
import { listEducationProviderInquiries, listEmployerInquiries } from "../repos/inquiries";

const router = Router();

router.get(
  "/inquiries",
  authenticate,
  requireRoles("platform_admin"),
  async (_req: Request, res: Response) => {
    const employers = await listEmployerInquiries();
    const providers = await listEducationProviderInquiries();
    res.json({
      employerInquiries: employers.map((r) => ({
        id: r.id,
        organizationLegalName: r.organization_legal_name,
        contactFirstName: r.contact_first_name,
        contactLastName: r.contact_last_name,
        email: r.email,
        phone: r.phone,
        state: r.state,
        approximateEmployees: r.approximate_employees,
        message: r.message,
        createdAt: r.created_at,
      })),
      educationProviderInquiries: providers.map((r) => ({
        id: r.id,
        institutionName: r.institution_name,
        contactName: r.contact_name,
        email: r.email,
        phone: r.phone,
        state: r.state,
        website: r.website,
        programsSummary: r.programs_summary,
        message: r.message,
        createdAt: r.created_at,
      })),
    });
  },
);

export default router;
