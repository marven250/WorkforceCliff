/** B2B lead from an employer organization (e.g. employer inquiry / talk to sales). */
export interface EmployerInquiryInput {
  organizationLegalName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  state: string;
  approximateEmployees?: string;
  message?: string;
}

/** Partnership / OPM-style inquiry from a school or provider organization. */
export interface EducationProviderInquiryInput {
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  state: string;
  website?: string;
  programsSummary?: string;
  message?: string;
}

export interface EmployerInquiryRow extends EmployerInquiryInput {
  id: number;
  createdAt: string;
}

export interface EducationProviderInquiryRow extends EducationProviderInquiryInput {
  id: number;
  createdAt: string;
}
