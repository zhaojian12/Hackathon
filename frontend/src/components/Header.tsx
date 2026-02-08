import React, { useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ConnectWallet } from './ConnectWallet';
import logo from '../assets/logo.png';
import cfxLogo from '../assets/cfx.png';

interface HeaderProps {
    onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Particle Animation Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.floor(canvas.width / 10); // Density based on width
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.2, // Slow horizontal drift
                    vy: (Math.random() - 0.5) * 0.2, // Slow vertical drift
                    size: Math.random() * 2 + 1,
                    alpha: Math.random() * 0.5 + 0.1
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around screen
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha})`; // Violet particles
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleNavClick = (page: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        onNavigate(page);
    };

    return (
        <nav className="app-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'rgba(5, 5, 5, 0.6)', // More transparent for glass effect
            backdropFilter: 'blur(20px)',     // Stronger blur
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            // overflow: 'hidden' removed to allow dropdowns
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: -1
                }}
            />

            <div className="logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={logo} alt="WIS Pay Logo" style={{ height: '32px', width: 'auto' }} />
                <span>WIS Pay</span>
                <img src={cfxLogo} alt="CFX Logo" style={{ height: '20px', width: 'auto', marginLeft: '12px' }} />
            </div>

            <div className="nav-links" style={{ zIndex: 1 }}>
                <a href="#" className="nav-item" onClick={handleNavClick('home')}>{t('home.nav.home')}</a>
                <a href="#" className="nav-item" onClick={handleNavClick('dashboard')}>{t('home.nav.products')}</a>
                <a href="#" className="nav-item" onClick={handleNavClick('financing')}>{t('home.nav.financing')}</a>
            </div>

            <div className="nav-actions" style={{ zIndex: 1 }}>
                <LanguageSwitcher />
                <a
                    href="https://github.com/zhaojian12/Hackathon.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                    title="View on GitHub"
                >
                    <Github size={20} />
                </a>
                <ConnectWallet />
            </div>
        </nav>
    );
};
