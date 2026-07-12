import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { durations, ease, fadeIn } from '../../../shared/animations';

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

    return (
        <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
        >
            <div style={{
                width: '80%',
                backgroundColor: '#e0e0df',
                borderRadius: '50px',
                overflow: 'hidden'
            }}>
                <motion.div
                    style={{
                        height: '20px',
                        backgroundColor: '#1E2A5E',
                        borderRadius: '50px'
                    }}
                    animate={{
                        width: `${filled}%`,
                        opacity: [1, 0.75, 1],
                    }}
                    transition={{
                        width: { duration: durations.emphasis, ease },
                        opacity: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
                    }}
                />
            </div>
        </motion.div>
    );
}

export default Loading;
