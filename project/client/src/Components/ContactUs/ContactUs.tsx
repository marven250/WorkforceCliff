import { Box, Button, Card, CardActions, CardContent, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function ContactUs() {
  return (
    <Box>
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
            Get started
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Choose your Workforce Cliff path
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.92, fontWeight: 400, maxWidth: 720 }}>
            Learners create an account to explore benefits and programs. Employers and education
            providers can reach our teams through tailored inquiry forms—with clear paths for
            individuals versus organizations.
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                I&apos;m a learner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign up to access your learner hub, explore connected schools, and prepare for
                advising conversations.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button component={RouterLink} to="/sign-in" variant="contained" color="secondary">
                Create learner account
              </Button>
              <Button component={RouterLink} to="/sign-in" variant="text" color="inherit">
                Sign in
              </Button>
            </CardActions>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                I represent an employer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tell us about your workforce priorities, benefits stack, and talent outcomes so we
                can follow up with a tailored conversation.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button component={RouterLink} to="/for-employers" variant="contained">
                Employer inquiry
              </Button>
            </CardActions>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                I represent an education provider
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share your institution, program strengths, and partnership goals for our
                partnerships team to review.
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button component={RouterLink} to="/for-partners" variant="contained">
                Provider inquiry
              </Button>
            </CardActions>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
