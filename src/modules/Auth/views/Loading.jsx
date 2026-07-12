import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Loading() {
    const [filled, setFilled] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setFilled((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    navigate('/dashboard');
                    return 100;
                }
                return prev + 10;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{
                width: '80%',
                backgroundColor: '#e0e0df',
                borderRadius: '50px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '20px',
                    width: `${filled}%`,
                    backgroundColor: '#1E2A5E',
                    transition: 'width 0.5s'
                }}></div>
            </div>
        </div>
    );
}

export default Loading;