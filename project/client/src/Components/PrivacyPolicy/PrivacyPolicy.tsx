import { Box, Container, Link, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Online Privacy Policy
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: "1.05rem" }}>
          Workforce Cliff takes your privacy seriously. This policy describes how we collect, use,
          share, and protect personal information when you use the Workforce Cliff website and
          related services—an education-benefits and upskilling platform for employers, learners, and
          education partners.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Last updated: April 19, 2026
        </Typography>

        <Section title="Who we are">
          <Body>
            Workforce Cliff provides tools for employers, education partners, and learners to explore
            education benefits, pathways, and program connections. Depending on how Workforce Cliff
            is deployed, it may be operated by your employer, a service provider on their behalf, or
            a demonstration environment for evaluation.
          </Body>
        </Section>

        <Section title="Information we collect">
          <Body>
            We collect information you choose to give us and limited technical information needed to
            run the service securely. Categories may include:
          </Body>
          <Bullets
            items={[
              "Account and profile information for learners (for example, name, email, phone, state, and credentials used to secure your account).",
              "Employer inquiry information submitted through Workforce Cliff forms (for example, organization name, contact details, approximate workforce size, and messages you include).",
              "Education provider inquiry information (for example, institution name, contact details, program descriptions, and messages you include).",
              "Support and communications you send to us, including the content of those messages.",
              "Device and usage data such as browser type, general log information, and security signals to help prevent abuse.",
            ]}
          />
        </Section>

        <Section title="How we use information">
          <Body>We use personal information to:</Body>
          <Bullets
            items={[
              "Create and maintain accounts, authenticate users, and provide the features you request.",
              "Respond to employer and education-provider inquiries and route requests to the appropriate internal teams.",
              "Operate, secure, and improve Workforce Cliff, including troubleshooting, analytics appropriate to the deployment, and fraud prevention.",
              "Comply with law, enforce our terms, and protect the rights, safety, and integrity of users and the service.",
            ]}
          />
        </Section>

        <Section title="How we share information">
          <Body>
            Workforce Cliff does not sell your personal information. We may share information with
            service providers who assist us in hosting, security, communications, or analytics,
            subject to contractual safeguards. We may also disclose information if required by law,
            if we believe disclosure is necessary to protect rights or safety, or in connection with
            a business transaction (such as a merger) where permitted by law and consistent with this
            policy.
          </Body>
          <Body>
            When Workforce Cliff is deployed by an employer, certain information may be visible to
            authorized administrators within that organization consistent with the program&apos;s
            design.
          </Body>
        </Section>

        <Section title="Cookies and similar technologies">
          <Body>
            We may use cookies and similar technologies to keep you signed in, remember preferences,
            measure performance, and support security. For more detail, see our{" "}
            <Link component={RouterLink} to="/cookie-policy">
              Cookie Policy
            </Link>
            .
          </Body>
        </Section>

        <Section title="Security">
          <Body>
            We use administrative, technical, and organizational measures designed to protect
            personal information. For example, this application may store passwords using one-way
            hashing and use signed session tokens for API access. No method of transmission or
            storage is completely secure; please use strong passwords and protect your credentials.
          </Body>
        </Section>

        <Section title="Data retention">
          <Body>
            We retain information for as long as needed to provide the service, meet legal
            obligations, resolve disputes, and enforce our agreements. Retention periods may depend
            on how your organization configures Workforce Cliff.
          </Body>
        </Section>

        <Section title="Your choices and rights">
          <Body>
            Depending on where you live, you may have rights to access, correct, delete, or restrict
            certain processing of your personal information, or to object to certain uses. You may
            also have the right to lodge a complaint with a supervisory authority. To exercise rights
            available to you, contact the administrator responsible for your Workforce Cliff deployment
            or follow the instructions your employer provides.
          </Body>
        </Section>

        <Section title="Children’s privacy">
          <Body>
            Workforce Cliff is not directed to children under 13 (or the age required by applicable
            law), and we do not knowingly collect personal information from children. If you believe
            we have collected information from a child inappropriately, please contact us so we can
            take appropriate action.
          </Body>
        </Section>

        <Section title="Changes to this policy">
          <Body>
            We may update this Online Privacy Policy from time to time. When we make material changes,
            we will take steps to notify you as appropriate, such as posting an updated policy with a
            new “Last updated” date or providing additional notice required by law.
          </Body>
        </Section>

        <Section title="How to contact us">
          <Body>
            Questions about this policy or Workforce Cliff privacy practices should be directed to
            your program administrator or the team responsible for your organization&apos;s deployment.
            If you are evaluating a demonstration build, contact the owner of that environment before
            submitting sensitive personal information.
          </Body>
        </Section>
      </Container>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.75 }}>
      {children}
    </Typography>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2, color: "text.secondary" }}>
      {items.map((item) => (
        <Typography key={item} component="li" variant="body1" sx={{ mb: 1, lineHeight: 1.75 }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
}
