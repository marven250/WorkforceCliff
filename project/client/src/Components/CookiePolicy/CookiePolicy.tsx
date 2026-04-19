import { Box, Container, Link, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

export default function CookiePolicy() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Online Cookie Policy
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: "1.05rem" }}>
          Workforce Cliff takes your privacy seriously. This policy explains how we use cookies and
          similar technologies when you visit or use the Workforce Cliff website and related
          education-benefits and upskilling services for employers, learners, and education partners.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Last updated: April 19, 2026
        </Typography>

        <Section title="What are cookies and similar technologies?">
          <Body>
            Cookies are small text files stored on your device when you visit a website. We also
            refer to related technologies such as local storage, session storage, pixels, and
            software development kits (SDKs) that can serve similar purposes. Together, we call these
            &quot;cookies&quot; in this policy unless we specify otherwise.
          </Body>
        </Section>

        <Section title="How Workforce Cliff uses cookies">
          <Body>We use cookies and similar technologies to:</Body>
          <Bullets
            items={[
              "Keep the site functioning securely, including load balancing, fraud prevention, and abuse detection where enabled.",
              "Remember that you are signed in and maintain your session, including storing an authentication token in your browser when your deployment is configured that way.",
              "Save preferences you select (such as language or display options) when those features are available.",
              "Understand how the service is used so we can improve performance, reliability, and user experience when analytics are enabled for your environment.",
            ]}
          />
        </Section>

        <Section title="Types of cookies you may encounter">
          <Body>Depending on configuration, Workforce Cliff may use:</Body>
          <Bullets
            items={[
              "Strictly necessary cookies and storage — required for core functionality such as security, network management, accessibility, and authentication.",
              "Functional cookies — enable enhanced features and personalization you request.",
              "Performance or analytics cookies — help us measure traffic, navigation patterns, and errors. These may be first-party or provided by a vendor your organization approves.",
            ]}
          />
          <Body>
            In a typical single-tenant or self-hosted setup, Workforce Cliff may rely primarily on
            technologies needed to run the application (for example, local storage for session tokens
            in a single-page app) and may not load third-party advertising cookies.
          </Body>
        </Section>

        <Section title="Third-party cookies">
          <Body>
            If your employer or administrator connects Workforce Cliff to analytics, authentication,
            video, chat, or marketing tools, those providers may set their own cookies subject to
            their policies. Where required, we work with customers to describe those integrations and
            obtain appropriate consent.
          </Body>
        </Section>

        <Section title="How long cookies last">
          <Body>
            Some cookies expire when you close your browser (&quot;session&quot; cookies). Others
            remain for a longer period (&quot;persistent&quot; cookies) based on their purpose—for
            example, to keep you signed in for a limited time or to remember settings you have chosen.
          </Body>
        </Section>

        <Section title="Your choices">
          <Body>
            Most browsers let you refuse or delete cookies through settings. If you block or delete
            cookies, parts of Workforce Cliff may not work as intended (for example, staying signed
            in). You can also use private or incognito browsing modes for a temporary session. For
            rights related to personal data more broadly, see our{" "}
            <Link component={RouterLink} to="/privacy">
              Online Privacy Policy
            </Link>
            .
          </Body>
        </Section>

        <Section title="Do Not Track">
          <Body>
            There is no consistent industry standard for how to respond to &quot;Do Not Track&quot;
            browser signals. Workforce Cliff may not respond to such signals in all configurations.
          </Body>
        </Section>

        <Section title="Changes to this policy">
          <Body>
            We may update this Online Cookie Policy to reflect changes to our practices, technologies,
            or legal requirements. When we post an update, we will revise the &quot;Last updated&quot;
            date at the top of this page and may provide additional notice as required.
          </Body>
        </Section>

        <Section title="How to contact us">
          <Body>
            Questions about cookies or this policy should be directed to your program administrator
            or the team responsible for your Workforce Cliff deployment.
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
