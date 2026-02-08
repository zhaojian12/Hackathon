import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'zh-CN', label: '简体中文' },
        { code: 'zh-TW', label: '繁體中文' },
        { code: 'de', label: 'Deutsch' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const toggleOpen = () => setIsOpen(!isOpen);

    const selectLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 1000, userSelect: 'none' }}>
            <button
                onClick={toggleOpen}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontSize: '0.85rem',
                    lineHeight: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '32px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}
                className="hover:bg-slate-800"
            >
                <Globe size={14} className="text-indigo-400" style={{ color: '#818cf8', opacity: 0.9 }} />
                <span style={{ paddingTop: '1px' }}>{currentLang.label}</span>
                <ChevronDown size={12} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: '0.1rem' }} />
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.3rem)',
                        left: 0,
                        minWidth: '140px',
                        background: '#1e293b',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        borderRadius: '8px',
                        padding: '0.3rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.1rem'
                    }}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => selectLanguage(lang.code)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.6rem',
                                borderRadius: '6px',
                                background: i18n.language === lang.code ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                color: i18n.language === lang.code ? '#818cf8' : '#94a3b8',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'background 0.1s'
                            }}
                            onMouseEnter={(e) => {
                                if (i18n.language !== lang.code) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.color = '#f1f5f9';
                            }}
                            onMouseLeave={(e) => {
                                if (i18n.language !== lang.code) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#94a3b8';
                                } else {
                                    e.currentTarget.style.color = '#818cf8';
                                }
                            }}
                        >
                            <span>{lang.label}</span>
                            {i18n.language === lang.code && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
