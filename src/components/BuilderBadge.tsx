import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Linkedin, X, ExternalLink } from 'lucide-react';

export default function BuilderBadge() {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            {/* Wiggling button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-accent/10 to-violet-500/10 hover:from-accent/20 hover:to-violet-500/20 border border-accent/20 hover:border-accent/40 transition-all duration-200"
                title="Meet the builder"
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: 'easeInOut',
                    }}
                >
                    <Sparkles size={13} className="text-accent" />
                </motion.div>
                <span className="text-[11px] font-semibold text-slate-600 group-hover:text-accent transition-colors hidden sm:inline">
                    Built by
                </span>
            </button>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[60]"
                    >
                        {/* Gradient header */}
                        <div className="relative bg-gradient-to-br from-accent via-indigo-500 to-violet-600 px-5 pt-5 pb-8">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={14} />
                            </button>
                            <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium mb-1">
                                Designed & Built by
                            </p>
                            <h3 className="text-lg font-bold text-white">
                                Asjad Nirban
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-4 pt-4">
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                I love building things that make hard topics simple. This simulator comes from my own need to experiment with architecture, and I'd love for it to be a useful part of your toolkit.
                            </p>

                            {/* LinkedIn Link */}
                            <a
                                href="https://linkedin.com/in/AsjadNirban"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 border border-[#0A66C2]/10 hover:border-[#0A66C2]/20 transition-all duration-200 group"
                            >
                                <div className="p-1.5 rounded-lg bg-[#0A66C2] text-white">
                                    <Linkedin size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">
                                        Connect on LinkedIn
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                        linkedin.com/in/AsjadNirban
                                    </p>
                                </div>
                                <ExternalLink size={12} className="text-slate-300 group-hover:text-[#0A66C2] transition-colors" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
