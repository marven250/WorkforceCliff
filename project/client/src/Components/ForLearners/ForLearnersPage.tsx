import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  InputAdornment,
  Link,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EMPLOYER_PARTNERS = [
  "Summit Hospitality Group",
  "Lakeside Health System",
  "Ridgeline Health Services",
  "Granite Ridge Federal Credit Union",
  "Northwind Logistics",
  "Harborline Financial",
];

const LEARNER_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "How do I access the Workforce Cliff platform?",
    answer:
      "When your employer offers Workforce Cliff, you will typically receive a link to sign up or log in, browse schools and programs where integrations exist, and submit requests or documentation your program requires. Use the employer search above as a demo, or go straight to Log in if you already have credentials.",
  },
  {
    question: "My employer doesn't use Workforce Cliff. How can I share information?",
    answer:
      "Share this site with your HR or benefits team and invite them to explore employer options. They can reach out through the employer inquiry experience to learn whether Workforce Cliff is a fit.",
  },
  {
    question: "How do I transfer college credits to a new school?",
    answer:
      "Each school sets transfer rules. Start with the admissions or registrar office at your target institution, gather syllabi and transcripts, and ask your Workforce Cliff advisor (when available in your deployment) to help you compare program requirements.",
  },
  {
    question: "What if I'm not sure what I want to study?",
    answer:
      "That's common. Advisors can help you map interests and experience to credentials that align with roles at your employer. In this demo, use Get support to see how a contact flow would work.",
  },
  {
    question: "What kinds of education are available with my benefit?",
    answer:
      "Workforce Cliff is built to support a wide range of options—degrees, certificates, short courses, and online formats—depending on your employer's policy. Your dashboard and provider connections reflect what your organization enables.",
  },
];

export default function ForLearnersPage() {
  const { user } = useAuth();
  const [employerQuery, setEmployerQuery] = useState("");

  const filteredEmployers = useMemo(() => {
    const q = employerQuery.trim().toLowerCase();
    if (!q) return EMPLOYER_PARTNERS;
    return EMPLOYER_PARTNERS.filter((name) => name.toLowerCase().includes(q));
  }, [employerQuery]);

  return (
    <Box component="article">
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
            For learners
          </Typography>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, maxWidth: 900 }}>
            Grow your skills. Expand your opportunities.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, maxWidth: 720 }}>
            Your employer&apos;s education benefits could help pay for job-relevant learning. See
            how Workforce Cliff helps you turn programs and pathways into career potential.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Your growth starts here
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Log in or create an account
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Already registered? Sign in to access your benefits and dashboard. New to Workforce
                  Cliff? Create your learner account in just a few minutes.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button component={RouterLink} to="/sign-in" variant="contained" color="secondary" size="small">
                    Log in
                  </Button>
                  <Button component={RouterLink} to="/sign-up" variant="outlined" size="small">
                    Create account
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Explore your dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Find programs—from short courses to degrees—see connected schools where available,
                  and track how you use your education benefit.
                </Typography>
                {user ? (
                  <Button component={RouterLink} to="/dashboard" variant="contained" size="small">
                    Go to dashboard
                  </Button>
                ) : null}
                {user?.role === "learner" ? (
                  <Button component={RouterLink} to="/providers" variant="text" size="small" sx={{ ml: 1 }}>
                    Browse providers
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Questions? Let&apos;s connect.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Workforce Cliff benefits advisors can help you understand eligible programs,
                  navigate your benefit, and plan next steps—from enrollment questions to program fit.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "grey.100", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Find your employer and login link
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Type your employer name, pick a result, and you&apos;ll be taken to the sign-in page to
            continue.
          </Typography>
          <TextField
            fullWidth
            placeholder="Search employers"
            value={employerQuery}
            onChange={(e) => setEmployerQuery(e.target.value)}
            sx={{ mb: 2, bgcolor: "background.paper" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Paper variant="outlined">
            <List disablePadding>
              {filteredEmployers.map((name) => (
                <ListItemButton key={name} component={RouterLink} to="/sign-in">
                  <Typography variant="body1">{name}</Typography>
                </ListItemButton>
              ))}
              {filteredEmployers.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No matches. Try the full legal name of your employer or parent company, or{" "}
                    <Link component={RouterLink} to="/contact-us" fontWeight={600}>
                      contact us
                    </Link>{" "}
                    for help.
                  </Typography>
                </Box>
              ) : null}
            </List>
          </Paper>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Don&apos;t see your organization? Your HR team may issue a direct Workforce Cliff link
            for your company&apos;s program.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderLeft: 4,
            borderColor: "secondary.main",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="body1" fontStyle="italic" color="text.secondary" paragraph>
            &quot;After starting the Workforce Cliff pilot and going back to school, I built stronger
            time management and confidence in how I support teammates and clients. That pushed me to
            apply for a team lead role—and I was promoted with a move that came with more
            responsibility and better pay.&quot;
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            — John Clifford
          </Typography>
        </Paper>
      </Container>

      <Box sx={{ bgcolor: "primary.dark", color: "primary.contrastText", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Support at every step
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, mb: 3, maxWidth: 640 }}>
            Education benefits can feel complex. Workforce Cliff is designed so learners can get
            answers about programs, eligibility, and timelines from your benefits and advising team
            when your employer enables those services.
          </Typography>
          <Button component={RouterLink} to="/contact-us" variant="contained" color="secondary">
            Get support
          </Button>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Frequently asked questions
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Common questions about Workforce Cliff and your education benefits.
        </Typography>
        {LEARNER_FAQS.map((item) => (
          <FaqAccordion key={item.question} question={item.question} answer={item.answer} />
        ))}
      </Container>
    </Box>
  );
}

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", mb: 1, "&:before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary">
          {answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
