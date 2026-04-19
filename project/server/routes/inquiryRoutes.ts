import { Router, type Request, type Response } from "express";
import type { EducationProviderInquiryInput, EmployerInquiryInput } from "../../shared/Inquiry";
import { notifyAdminsEducationProviderInquiry, notifyAdminsEmployerInquiry } from "../mail/inquiryNotifications";
import { insertEducationProviderInquiry, insertEmployerInquiry } from "../repos/inquiries";

const router = Router();

router.post("/employer", async (req: Request, res: Response) => {
  const b = req.body as Partial<EmployerInquiryInput>;
  if (
    !b.organizationLegalName ||
    !b.contactFirstName ||
    !b.contactLastName ||
    !b.email ||
    !b.phone ||
    !b.state
  ) {
    res.status(400).json({ error: "Missing required employer inquiry fields" });
    return;
  }
  const input: EmployerInquiryInput = {
    organizationLegalName: String(b.organizationLegalName).trim(),
    contactFirstName: String(b.contactFirstName).trim(),
    contactLastName: String(b.contactLastName).trim(),
    email: String(b.email).trim(),
    phone: String(b.phone).trim(),
    state: String(b.state).trim(),
    approximateEmployees: b.approximateEmployees ? String(b.approximateEmployees) : undefined,
    message: b.message ? String(b.message) : undefined,
  };
  try {
    const id = await insertEmployerInquiry(input);
    console.info(`[employer inquiry] id=${id} org=${input.organizationLegalName} email=${input.email}`);
    void notifyAdminsEmployerInquiry(id, input).catch((err) =>
      console.error("[mail] employer inquiry notification failed:", err),
    );
    res.status(201).json({ id, message: "Thank you. A Workforce Cliff representative will follow up." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not save inquiry" });
  }
});

router.post("/education-provider", async (req: Request, res: Response) => {
  const b = req.body as Partial<EducationProviderInquiryInput>;
  if (!b.institutionName || !b.contactName || !b.email || !b.phone || !b.state) {
    res.status(400).json({ error: "Missing required education provider inquiry fields" });
    return;
  }
  const input: EducationProviderInquiryInput = {
    institutionName: String(b.institutionName).trim(),
    contactName: String(b.contactName).trim(),
    email: String(b.email).trim(),
    phone: String(b.phone).trim(),
    state: String(b.state).trim(),
    website: b.website ? String(b.website) : undefined,
    programsSummary: b.programsSummary ? String(b.programsSummary) : undefined,
    message: b.message ? String(b.message) : undefined,
  };
  try {
    const id = await insertEducationProviderInquiry(input);
    console.info(`[provider inquiry] id=${id} institution=${input.institutionName} email=${input.email}`);
    void notifyAdminsEducationProviderInquiry(id, input).catch((err) =>
      console.error("[mail] education provider inquiry notification failed:", err),
    );
    res.status(201).json({ id, message: "Thank you. Our partnerships team will be in touch." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not save inquiry" });
  }
});

export default router;
