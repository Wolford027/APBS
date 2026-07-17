import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ContactlessIcon from '@mui/icons-material/Contactless';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'motion/react';
import { Reveal, staggerContainer, staggerItem } from '../../../shared/animations';
import Logo from '../../../assets/Logo.png';

const FEATURES = [
  {
    icon: <PaymentsIcon fontSize="large" />,
    title: 'Automated Payroll',
    description:
      'Compute salaries, overtime, holiday pay, taxes, and government contributions automatically — every cycle, without spreadsheets.',
  },
  {
    icon: <ContactlessIcon fontSize="large" />,
    title: 'RFID Attendance',
    description:
      'Employees tap in and out with RFID. Time-ins, breaks, and overtime flow straight into payroll with zero manual encoding.',
  },
  {
    icon: <EventNoteIcon fontSize="large" />,
    title: 'Leave Management',
    description:
      'File, approve, and track leaves with automatic balance computation, so HR always knows who is in and who is out.',
  },
  {
    icon: <AssessmentIcon fontSize="large" />,
    title: 'Reports & Audit Trail',
    description:
      'Generate employee and payroll reports in one click, with a full audit trail of every action in the system.',
  },
];

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Top bar */}
      <AppBar position="sticky">
        <Toolbar>
          <Box component="img" src={Logo} alt="APBS" sx={{ height: 40, mr: 2 }} />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            size="medium"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            sx={{
              color: '#fff',
              px: 2.5,
              py: 0.9,
              fontWeight: 600,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
              '& .MuiButton-endIcon': { ml: 0.75, transition: 'transform 0.2s ease' },
              '&:hover': {
                color: '#fff',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.42)',
                transform: 'translateY(-1px)',
                filter: 'brightness(1.05)',
              },
              '&:hover .MuiButton-endIcon': { transform: 'translateX(3px)' },
              '&:active': { transform: 'translateY(0)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)' },
            }}
          >
            Sign in
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #2563EB 100%)',
          color: '#fff',
          pt: { xs: 10, md: 14 },
          pb: { xs: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative glow */}
        <Box
          sx={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.35) 0%, transparent 70%)',
            top: -120,
            right: -100,
            pointerEvents: 'none',
          }}
        />
        <Container
          maxWidth="md"
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          sx={{ position: 'relative', textAlign: 'center' }}
        >
          <Typography
            variant="overline"
            component={motion.span}
            variants={staggerItem}
            sx={{ letterSpacing: '0.25em', color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'inline-block' }}
          >
            ATTENDEEPAY BUSINESS SUITE
          </Typography>
          <Typography
            variant="h2"
            component={motion.h1}
            variants={staggerItem}
            sx={{
              mt: 2,
              fontSize: { xs: 34, sm: 44, md: 56 },
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Payroll and attendance,
            <Box component="span" sx={{ color: '#7DD3FC' }}> on autopilot.</Box>
          </Typography>
          <Typography
            component={motion.p}
            variants={staggerItem}
            sx={{
              mt: 3,
              mx: 'auto',
              maxWidth: 560,
              color: 'rgba(255,255,255,0.75)',
              fontSize: { xs: 15, md: 17 },
              lineHeight: 1.7,
            }}
          >
            APBS combines RFID time tracking, leave management, and fully automated
            payroll computation in one system — so you close every payroll cycle
            accurately, on time, every time.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            component={motion.div}
            variants={staggerItem}
            sx={{ mt: 5 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#fff',
                  color: 'primary.dark',
                  px: 4,
                  '&:hover': { bgcolor: '#E0F2FE' },
                }}
              >
                Sign in to your workspace
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
              <Button
                href="#features"
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  px: 4,
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Explore features
              </Button>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, mt: { xs: -8, md: -10 } }}>
        <Grid
          container
          spacing={3}
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {FEATURES.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title} component={motion.div} variants={staggerItem}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.10)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontSize: 16 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA band */}
        <Reveal>
        <Box
          sx={{
            mt: { xs: 8, md: 12 },
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            color: '#fff',
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 32 } }}>
            Ready to run payroll the easy way?
          </Typography>
          <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,0.75)' }}>
            Sign in with your company account to get started.
          </Typography>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                bgcolor: '#fff',
                color: 'primary.dark',
                px: 5,
                '&:hover': { bgcolor: '#E0F2FE' },
              }}
            >
              Sign in
            </Button>
          </motion.div>
        </Box>
        </Reveal>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 4, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box component="img" src={Logo} alt="APBS" sx={{ height: 34 }} />
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} APBS — AttendeePay Business Suite. All rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
