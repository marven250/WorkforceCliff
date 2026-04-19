import { Box, Container, Link, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

export default function TermsOfUse() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Terms of Use
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: "1.05rem" }}>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of the websites,
          applications, and related services offered by or on behalf of Workforce Cliff
          (&quot;Workforce Cliff,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
          accessing or using Workforce Cliff, you agree to these Terms. If you do not agree, do not
          use the services.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Last updated: April 19, 2026
        </Typography>

        <Section title="Agreement to electronic communications">
          <Body>
            By using Workforce Cliff, you consent to receive communications from us electronically,
            including by email or through notices posted on the service, and you agree that such
            communications satisfy any legal requirement that communications be in writing.
          </Body>
        </Section>

        <Section title="Description of services">
          <Body>
            Workforce Cliff provides an education-benefits and upskilling experience that may
            include tools for learners, employers, and education providers—such as account
            registration, program exploration, inquiry forms, and related features. Features
            available to you depend on how your organization configures and licenses the platform.
          </Body>
        </Section>

        <Section title="Eligibility and accounts">
          <Body>
            You must have authority to enter these Terms. If you use Workforce Cliff on behalf of an
            employer or other organization, you represent that you have authority to bind that
            organization to these Terms. You are responsible for maintaining the confidentiality of
            your credentials and for all activity under your account. Notify your administrator
            promptly if you suspect unauthorized access.
          </Body>
        </Section>

        <Section title="Acceptable use">
          <Body>You agree that you will not, and will not permit others to:</Body>
          <Bullets
            items={[
              "Violate any applicable law, regulation, or third-party rights.",
              "Attempt to gain unauthorized access to Workforce Cliff, other users’ accounts, or our systems or networks.",
              "Interfere with or disrupt the integrity or performance of the services, including by transmitting malware or conducting denial-of-service attacks.",
              "Scrape, crawl, harvest, or automate access to the services in a manner that impairs or circumvents intended use, except as allowed by applicable law or with our prior written consent.",
              "Submit false, misleading, or fraudulent information through forms or APIs.",
              "Use the services to send unsolicited or unlawful commercial communications.",
            ]}
          />
        </Section>

        <Section title="User content">
          <Body>
            If you submit content to Workforce Cliff (such as inquiry messages or profile
            information), you grant us and our service providers a non-exclusive license to use,
            host, store, reproduce, and display that content as needed to operate, improve, and
            secure the services. You represent that you have the rights necessary to grant this
            license and that your content does not violate these Terms or applicable law.
          </Body>
        </Section>

        <Section title="Intellectual property">
          <Body>
            Workforce Cliff, its logos, and the content, features, and functionality of the
            services are owned by Workforce Cliff or its licensors and are protected by intellectual
            property laws. Except for the limited rights expressly granted in these Terms, no
            rights are granted to you. You may not copy, modify, distribute, sell, or lease any part
            of the services without our prior written consent.
          </Body>
        </Section>

        <Section title="Privacy">
          <Body>
            Our collection and use of personal information is described in the{" "}
            <Link component={RouterLink} to="/privacy">
              Online Privacy Policy
            </Link>{" "}
            and{" "}
            <Link component={RouterLink} to="/cookie-policy">
              Online Cookie Policy
            </Link>
            , which are incorporated into these Terms by reference.
          </Body>
        </Section>

        <Section title="Third-party services and links">
          <Body>
            Workforce Cliff may contain links to third-party websites or integrate third-party
            services (for example, education providers or authentication tools). We do not control
            third parties and are not responsible for their content, policies, or practices. Your use
            of third-party services may be subject to separate terms.
          </Body>
        </Section>

        <Section title="Disclaimers">
          <Body>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICES ARE PROVIDED &quot;AS
            IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
            IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES
            WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
          </Body>
        </Section>

        <Section title="Limitation of liability">
          <Body>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL WORKFORCE CLIFF OR
            ITS AFFILIATES, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
            SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
            GOODWILL, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE
            SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR AGGREGATE
            LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICES WILL NOT EXCEED THE GREATER OF (A) ONE
            HUNDRED U.S. DOLLARS (US$100) OR (B) THE AMOUNTS YOU PAID US FOR THE SERVICES GIVING RISE
            TO THE CLAIM DURING THE TWELVE (12) MONTHS BEFORE THE CLAIM (IF ANY FEES APPLY IN YOUR
            DEPLOYMENT). SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE CASES, OUR
            LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
          </Body>
        </Section>

        <Section title="Indemnity">
          <Body>
            You will defend, indemnify, and hold harmless Workforce Cliff and its affiliates,
            officers, directors, employees, and agents from and against any claims, damages,
            obligations, losses, liabilities, costs, or debt, and expenses (including reasonable
            attorneys’ fees) arising from your use of the services, your content, or your violation of
            these Terms or applicable law.
          </Body>
        </Section>

        <Section title="Suspension and termination">
          <Body>
            We may suspend or terminate your access to Workforce Cliff at any time, with or without
            cause or notice, including for conduct that we believe violates these Terms or creates
            risk or legal exposure. Provisions of these Terms that by their nature should survive
            will survive termination, including disclaimers, limitations of liability, and indemnity.
          </Body>
        </Section>

        <Section title="Changes to these Terms">
          <Body>
            We may modify these Terms from time to time. If we make material changes, we will post
            the updated Terms and revise the &quot;Last updated&quot; date. Your continued use after
            the effective date constitutes acceptance of the revised Terms. If you do not agree, you
            must stop using the services.
          </Body>
        </Section>

        <Section title="Governing law and disputes">
          <Body>
            These Terms are governed by the laws of the jurisdiction in which the operator of your
            Workforce Cliff deployment is located, without regard to conflict-of-law principles,
            except where prohibited by applicable law. Courts in that jurisdiction will have
            exclusive jurisdiction over disputes arising from or relating to these Terms or the
            services, unless a different forum is required by applicable law or by a written
            agreement between you and the operator of your deployment.
          </Body>
        </Section>

        <Section title="General">
          <Body>
            These Terms constitute the entire agreement between you and Workforce Cliff regarding
            the subject matter here and supersede any prior agreements or understandings. If any
            provision is held unenforceable, the remaining provisions remain in effect. Our failure
            to enforce a provision is not a waiver of our right to do so later. You may not assign
            these Terms without our consent; we may assign them in connection with a merger,
            acquisition, or sale of assets.
          </Body>
        </Section>

        <Section title="How to contact us">
          <Body>
            For questions about these Terms, contact the administrator or legal team responsible for
            your Workforce Cliff deployment. If you are using a demonstration environment, contact
            the owner of that environment before relying on these Terms for production purposes.
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
