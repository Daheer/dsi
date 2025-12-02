"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
            {/* Cinematic Background */}
            <motion.div style={{ y, scale }} className="absolute inset-0 z-0 will-change-transform">
                <Image
                    src="/images/external-view-hotel.jpg"
                    alt="The Grand Hotel Exterior"
                    fill
                    className="object-cover brightness-[0.6]"
                    priority
                />
            </motion.div>

            {/* Floating Navigation */}
            <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-8 md:px-16 mix-blend-difference text-white">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-2xl font-serif font-bold tracking-widest"
                >
                    DE SIGNATURE
                </motion.div>
                <div className="hidden md:flex space-x-12 font-light tracking-widest text-xs uppercase">
                    {["About", "Rooms", "Gallery", "Contact"].map((item, i) => (
                        <motion.a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                            className="hover:text-hotel-light-brown transition-colors relative group"
                        >
                            {item}
                            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-hotel-light-brown transition-all duration-300 group-hover:w-full" />
                        </motion.a>
                    ))}
                </div>
                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="border border-white/30 backdrop-blur-sm px-8 py-3 rounded-full uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all duration-500"
                >
                    Book Your Stay
                </motion.button>
            </nav>

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                >
                    <h2 className="text-sm md:text-base uppercase tracking-[0.4em] mb-6 text-hotel-light-brown">
                        Beyond Expectations
                    </h2>
                </motion.div>

                <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-medium mb-8 leading-none tracking-tight mix-blend-overlay">
                    <motion.span
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="block"
                    >
                        MODERN
                    </motion.span>
                    <motion.span
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="block italic font-light"
                    >
                        LUXURY
                    </motion.span>
                </h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 1.5 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">Scroll to Explore</span>
                    <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent opacity-50" />
                </motion.div>
            </div>
        </section>
    );
}

