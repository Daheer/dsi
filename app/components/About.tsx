"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function About() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

    return (
        <section id="about" ref={containerRef} className="relative py-32 bg-hotel-white overflow-hidden">
            {/* Decorative Background Text */}
            <div className="absolute top-20 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03]">
                <h1 className="text-[20vw] font-serif whitespace-nowrap leading-none text-hotel-gray">
                    THE DUALITY THE DUALITY
                </h1>
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Text Content - Sticky */}
                    <div className="lg:sticky lg:top-32 self-start">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h3 className="text-hotel-light-brown uppercase tracking-[0.2em] text-xs font-bold mb-6 flex items-center gap-4">
                                <span className="w-12 h-[1px] bg-hotel-light-brown"></span>
                                Two Worlds
                            </h3>
                            <h2 className="text-5xl md:text-7xl font-serif text-hotel-gray mb-10 leading-[0.9]">
                                Designed for <br />
                                <span className="italic text-hotel-light-brown">Contrast</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-light leading-relaxed mb-8 max-w-md">
                                We believe in the separation of church and state, of work and rest. Our architecture reflects this philosophy with two distinct wings.
                            </p>

                            <div className="space-y-8">
                                <div className="group cursor-pointer">
                                    <h4 className="text-2xl font-serif mb-2 group-hover:text-hotel-light-brown transition-colors">The Executive Wing</h4>
                                    <p className="text-sm text-gray-400 pl-4 border-l border-gray-200 group-hover:border-hotel-light-brown transition-colors">
                                        Sharp lines, glass facades, and dynamic energy. Home to our conference center and fine dining.
                                    </p>
                                </div>
                                <div className="group cursor-pointer">
                                    <h4 className="text-2xl font-serif mb-2 group-hover:text-hotel-light-brown transition-colors">The Residence</h4>
                                    <p className="text-sm text-gray-400 pl-4 border-l border-gray-200 group-hover:border-hotel-light-brown transition-colors">
                                        Warm brick patterns, soft lighting, and absolute silence. Your sanctuary in the city.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image Grid - Parallax */}
                    <div className="relative h-[120vh] w-full flex flex-col justify-center gap-12">
                        <motion.div style={{ y: y1 }} className="relative h-[600px] w-full lg:w-[90%] self-end will-change-transform">
                            <Image
                                src="/images/conference-room-view.jpg"
                                alt="Executive Wing"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out"
                            />
                            <div className="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl max-w-xs hidden md:block">
                                <p className="font-serif italic text-hotel-gray">"Where decisions are made."</p>
                            </div>
                        </motion.div>

                        <motion.div style={{ y: y2 }} className="relative h-[500px] w-full lg:w-[80%] self-start mt-[-100px] z-20 will-change-transform">
                            <Image
                                src="/images/room-view-1.jpg"
                                alt="Residential Wing"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-out"
                            />
                            <div className="absolute -top-8 -right-8 bg-hotel-light-brown p-6 shadow-xl max-w-xs hidden md:block text-white">
                                <p className="font-serif italic">"Where peace is found."</p>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
