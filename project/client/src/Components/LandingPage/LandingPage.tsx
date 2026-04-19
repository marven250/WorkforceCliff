import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SavingsIcon from "@mui/icons-material/Savings";
import SchoolIcon from "@mui/icons-material/School";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pillars = [
  {
    title: "Fill skill gaps, build pathways",
    body: "Upskill employees for in-demand roles with stackable, workforce-ready learning that supports real career advancement.",
    icon: <TrendingUpIcon fontSize="large" color="primary" />,
  },
  {
    title: "Cut costs and complexity",
    body: "More budget control, transparency, and ROI—without the hidden fees that make benefits programs hard to defend.",
    icon: <SavingsIcon fontSize="large" color="primary" />,
  },
  {
    title: "Expand access and choice",
    body: "Degrees, certifications, bootcamps, and short-form learning so every employee can find a path that fits.",
    icon: <SchoolIcon fontSize="large" color="primary" />,
  },
  {
    title: "Support learners at every step",
    body: "Personalized advising and one-to-one success coaching so completion—not just enrollment—is the goal.",
    icon: <SupportAgentIcon fontSize="large" color="primary" />,
  },
];

const caseStudies = [
  {
    tag: "Retention and engagement",
    title: "Summit Hospitality bets big on education",
    body: "Summit consolidated fragmented tuition programs onto Workforce Cliff—hitting strong engagement and measurable retention and mobility gains.",
  },
  {
    tag: "Benefits as strategy",
    title: "Lakeside Health lifts participation",
    body: "When Lakeside Health invested in a healthier culture, education became the centerpiece. Participation climbed, administration eased, and engagement followed.",
  },
  {
    tag: "Career mobility",
    title: "Ridgeline Health System grows talent from within",
    body: "Facing turnover and training cost pressure, this multi-site system needed affordable, job-relevant pathways. Workforce Cliff expanded clinical and nonclinical options while maximizing education ROI.",
  },
];

const industries = [
  {
    title: "Healthcare",
    icon: <LocalHospitalIcon fontSize="large" color="secondary" />,
    body: "From allied health to nursing and beyond, build frontline employees into critical roles with scalable, job-relevant learning that supports retention, growth, and patient outcomes.",
  },
  {
    title: "Supply chain, manufacturing, and logistics",
    icon: <PrecisionManufacturingIcon fontSize="large" color="secondary" />,
    body: "Critical roles are changing fast. Use education benefits as a strategic lever to build in-demand skills with measurable ROI.",
  },
  {
    title: "Financial services",
    icon: <AccountBalanceIcon fontSize="large" color="secondary" />,
    body: "Close skill gaps as finance and insurance evolve with data, AI, and digital services—through accessible, career-relevant education.",
  },
  {
    title: "IT and cybersecurity",
    icon: <SecurityIcon fontSize="large" color="secondary" />,
    body: "Deliver job-ready learning that supports advancement and retention so your teams can grow without waiting—and you see impact quickly.",
  },
];

const insights = [
  {
    title: "Workforce Cliff: new avenues for talent mobility",
    subtitle: "How unified education benefits connect learning to promotion-ready skills.",
  },
  {
    title: "Retail leader expands access to education for hourly teams",
    subtitle: "Partnerships that remove friction so frontline workers can start—and finish—credentials.",
  },
  {
    title: "Why leadership development is still the retention unlock",
    subtitle: "Pairing manager capability with education strategy for durable engagement.",
  },
];

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <Box component="main">
      <Box
        id="top"
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "primary.contrastText",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 45%, ${theme.palette.primary.light} 100%)`,
          py: { xs: 10, md: 14 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
                Education benefits and upskilling
              </Typography>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
                Get your workforce ready for what&apos;s next
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, mb: 4, maxWidth: 560 }}>
                Connect employee learning to your talent needs. Build career pathways, close skill
                gaps, and elevate your education strategy to drive business results—with Workforce
                Cliff.
              </Typography>
              <Button
                component={RouterLink}
                to="/contact-us"
                variant="contained"
                color="secondary"
                size="large"
              >
                Talk to an expert
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  p: 3,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Platform snapshot
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Align budgets, providers, and learner success in one place—so HR, finance, and
                  operations see the same story about skills, completions, and mobility.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="platform" sx={{ py: { xs: 8, md: 10 }, scrollMarginTop: 72 }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="secondary">
            Why Workforce Cliff
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Platform-powered. Talent-focused. Outcomes-driven.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 6 }}>
            The same pillars you expect from a modern education-benefits partner—reimagined for
            clarity, speed, and measurable workforce impact.
          </Typography>
          <Grid container spacing={3}>
            {pillars.map((p) => (
              <Grid item xs={12} sm={6} key={p.title}>
                <Card sx={{ height: "100%", borderTop: 4, borderColor: "secondary.main" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      {p.icon}
                      <Typography variant="h6">{p.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {p.body}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: "grey.100", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Make learning a talent strategy
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                In Workforce Cliff pilot surveys, the vast majority of participants report using
                education benefits to improve promotion readiness, career advancement, or earning
                potential—when programs are designed around mobility, not paperwork.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Align employee goals with organizational needs to fill high-demand roles, close
                critical skills gaps, and power measurable business outcomes.
              </Typography>
              <Button
                component={RouterLink}
                to="/contact-us"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3 }}
              >
                Talk to an industry expert
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    96%
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2, opacity: 0.95 }}>
                    of surveyed users connect benefits to promotion, advancement, or higher salary
                    goals—when advising and pathways are part of the design.
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    Illustrative metric for demonstration purposes; your results will vary by
                    population and program design.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: 700, mb: 1 }}>
            Leading organizations. Proven impact.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 720, mx: "auto", mb: 6 }}
          >
            Teams across the U.S. rely on Workforce Cliff for scalable learning that supports
            performance, mobility, and retention—without losing the human touch.
          </Typography>
          <Grid container spacing={3}>
            {caseStudies.map((c) => (
              <Grid item xs={12} md={4} key={c.title}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="overline" color="secondary">
                      {c.tag}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {c.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.body}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Card sx={{ mt: 6, bgcolor: "grey.50", borderLeft: 4, borderColor: "secondary.main" }}>
            <CardContent>
              <Typography variant="body1" fontStyle="italic" color="text.secondary">
                &quot;There aren&apos;t many downsides to offering education as a benefit—it creates
                real value for employees and is straightforward to budget when the platform is
                transparent. That combination is rare.&quot;
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                — Jordan Ellis, HR Operations, Granite Ridge Federal Credit Union (fictional demo
                quote)
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Box id="industries" sx={{ bgcolor: "grey.100", py: { xs: 8, md: 10 }, scrollMarginTop: 72 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" sx={{ fontWeight: 700, mb: 1 }}>
            Driving results across industries
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 640, mx: "auto", mb: 6 }}
          >
            Whatever sector you are in, you can build a winning talent strategy with Workforce
            Cliff.
          </Typography>
          <Grid container spacing={3}>
            {industries.map((ind) => (
              <Grid item xs={12} sm={6} key={ind.title}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      {ind.icon}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {ind.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ind.body}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="insights" sx={{ py: { xs: 8, md: 10 }, scrollMarginTop: 72 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            Relevant news. Expert insights. Strategic impact.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Stay current on workforce development, talent mobility, and education benefits design.
          </Typography>
          <Grid container spacing={3}>
            {insights.map((n) => (
              <Grid item xs={12} md={4} key={n.title}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {n.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: { xs: 8, md: 10 },
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          color: "primary.contrastText",
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to transform your talent strategy?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, mb: 4 }}>
            Develop talent at scale and boost your education ROI. Talk to an expert to get started.
          </Typography>
          <Button
            component={RouterLink}
            to="/contact-us"
            variant="contained"
            color="secondary"
            size="large"
          >
            Talk to an expert
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
