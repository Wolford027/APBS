import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, alpha } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { durations, ease, fadeIn, fadeInUp } from '../../../shared/animations';
import Logo from '../../../assets/Logo.png';

const STATUS_STEPS = [
    { at: 0, label: 'Authenticating…' },
    { at: 30, label: 'Loading your workspace…' },
    { at: 60, label: 'Fetching your data…' },
    { at: 90, label: 'Almost there…' },
];

function Loading() {
    const [filled, setFilled] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setFilled((prev) => (prev >= 100 ? 100 : prev + 10));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Navigating from inside the setFilled updater above triggers React's
    // "Cannot update a component while rendering a different component"
    // warning; doing it here, once filled reaches 100, is the safe way.
    useEffect(() => {
        if (filled >= 100) {
            navigate('/dashboard');
        }
    }, [filled, navigate]);

    const status = useMemo(() => {
        return STATUS_STEPS.filter((step) => filled >= step.at).pop().label;
    }, [filled]);

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ height: '100vh' }}
        >
            <Box
                sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                }}
            >
                {/* Ambient brand glow, echoes the login screen's brand panel */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: 480,
                        height: 480,
                        borderRadius: '50%',
                        background: (theme) =>
                            `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 70%)`,
                        top: -160,
                        right: -140,
                        pointerEvents: 'none',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        width: 420,
                        height: 420,
                        borderRadius: '50%',
                        background: (theme) =>
                            `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 70%)`,
                        bottom: -140,
                        left: -100,
                        pointerEvents: 'none',
                    }}
                />

                <Box
                    component={motion.div}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        px: 4,
                    }}
                >
                    <Box
                        component={motion.img}
                        src={Logo}
                        alt="APBS — AttendeePay Business Suite"
                        animate={{ scale: [1, 1.035, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        sx={{ height: 64, display: 'block' }}
                    />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={status}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: durations.standard, ease }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ mt: 3.5, mb: 3, color: 'text.secondary', fontWeight: 500 }}
                            >
                                {status}
                            </Typography>
                        </motion.div>
                    </AnimatePresence>

                    <Box
                        sx={{
                            width: 280,
                            height: 6,
                            borderRadius: 999,
                            bgcolor: 'divider',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <motion.div
                            style={{
                                height: '100%',
                                borderRadius: 999,
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'linear-gradient(90deg, #2563EB 0%, #0EA5E9 100%)',
                                boxShadow: '0 0 10px rgba(37, 99, 235, 0.45)',
                            }}
                            animate={{ width: `${filled}%` }}
                            transition={{ width: { duration: durations.emphasis, ease } }}
                        >
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    height: '100%',
                                    width: '50%',
                                    background:
                                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
                                }}
                                animate={{ x: ['-100%', '260%'] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </motion.div>
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{ mt: 1.5, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                    >
                        {filled}%
                    </Typography>
                </Box>
            </Box>
        </motion.div>
    );
}

export default Loading;
