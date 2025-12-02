"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const rooms = [
    {
        id: 1,
        name: "Deluxe Suite",
        image: "/images/room-view-1.jpg",
        price: "$250",
        description: "Spacious suite with city views and modern amenities.",
    },
    {
        id: 2,
        name: "Executive Room",
        image: "/images/room-view-2.jpg",
        price: "$180",
        description: "Perfect for business travelers with a dedicated workspace.",
    },
    {
        id: 3,
        name: "Presidential Penthouse",
        image: "/images/external-view-hotel-2.jpg",
        price: "$550",
        description: "The ultimate luxury experience with panoramic views.",
    },
];

export default function RoomAvailability() {
    const [activeRoom, setActiveRoom] = useState(rooms[0].id);

    return (
        <section id="rooms" className="py-32 bg-hotel-white">
            <div className="container mx-auto px-4 md:px-8">
                <h2 className="text-5xl md:text-7xl font-serif text-hotel-gray mb-16 text-center">
                    Your Sanctuary
                </h2>

                <div className="flex flex-col lg:flex-row gap-4 h-[80vh]">
                    {rooms.map((room) => (
                        <motion.div
                            key={room.id}
                            onClick={() => setActiveRoom(room.id)}
                            className={`relative overflow-hidden cursor-pointer transition-all duration-700 ease-[0.22, 1, 0.36, 1] ${activeRoom === room.id ? "lg:flex-[3]" : "lg:flex-[1]"
                                } h-[300px] lg:h-full rounded-sm`}
                        >
                            <Image
                                src={room.image}
                                alt={room.name}
                                fill
                                className={`object-cover transition-transform duration-1000 ${activeRoom === room.id ? "scale-100" : "scale-110 grayscale"
                                    } `}
                            />
                            <div className="absolute inset-0 bg-black/30 transition-opacity duration-500 hover:bg-black/10" />

                            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-3xl font-serif mb-2">{room.name}</h3>
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: activeRoom === room.id ? "auto" : 0,
                                                opacity: activeRoom === room.id ? 1 : 0
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-white/80 mb-4 max-w-md">{room.description}</p>
                                            <button className="bg-white text-black px-6 py-3 uppercase tracking-widest text-xs hover:bg-hotel-light-brown hover:text-white transition-colors">
                                                Book Now — {room.price}
                                            </button>
                                        </motion.div>
                                    </div>
                                    {activeRoom !== room.id && (
                                        <span className="text-2xl font-serif opacity-50 hidden lg:block">0{room.id}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
