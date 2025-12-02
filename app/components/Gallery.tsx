"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const galleryImages = [
    { src: "/images/reception-1.jpg", alt: "Grand Reception", title: "Arrival" },
    { src: "/images/restaurant-1.jpg", alt: "Fine Dining", title: "Taste" },
    { src: "/images/brick-pattern.jpg", alt: "Architectural Details", title: "Detail" },
    { src: "/images/pool-area-view.jpg", alt: "Poolside Relaxation", title: "Unwind" },
    { src: "/images/conference-room-view-2.jpg", alt: "Executive Boardroom", title: "Focus" },
    { src: "/images/external-view-hotel-2.jpg", alt: "Night View", title: "Atmosphere" },
];

export default function Gallery() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);

    return (
        <section id="gallery" ref={targetRef} className="relative h-[300vh] bg-hotel-gray text-white">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">

                {/* Section Title Overlay */}
                <div className="absolute top-12 left-8 md:left-16 z-20 mix-blend-difference">
                    <h2 className="text-4xl md:text-6xl font-serif">The Collection</h2>
                    <p className="text-sm uppercase tracking-widest mt-2 opacity-70">Scroll to explore</p>
                </div>

                <motion.div style={{ x }} className="flex gap-16 pl-[20vw] will-change-transform">
                    {galleryImages.map((img, index) => (
                        <div key={index} className="relative h-[60vh] w-[40vh] md:h-[70vh] md:w-[50vh] flex-shrink-0 group">
                            <div className="relative h-full w-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    className="object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                                />
                            </div>
                            <div className="absolute -bottom-12 left-0 overflow-hidden">
                                <h3 className="text-6xl md:text-8xl font-serif text-transparent stroke-text opacity-20 group-hover:opacity-100 group-hover:translate-y-0 translate-y-full transition-all duration-500">
                                    {img.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Custom CSS for stroke text */}
            <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
        }
      `}</style>
        </section>
    );
}
