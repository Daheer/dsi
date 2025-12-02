export default function Footer() {
    return (
        <footer id="contact" className="bg-hotel-gray text-white pt-32 pb-12 overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">

                    {/* Address */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-6">Location</h4>
                        <p className="font-light text-lg leading-relaxed">
                            123 Luxury Avenue <br />
                            Metropolis, NY 10012 <br />
                            United States
                        </p>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-6">Contact</h4>
                        <p className="font-light text-lg leading-relaxed">
                            +1 (555) 123-4567 <br />
                            reservations@designature.com
                        </p>
                    </div>

                    {/* Socials */}
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-6">Follow</h4>
                        <div className="flex flex-col gap-2 font-light text-lg">
                            <a href="#" className="hover:text-hotel-light-brown transition-colors">Instagram</a>
                            <a href="#" className="hover:text-hotel-light-brown transition-colors">LinkedIn</a>
                            <a href="#" className="hover:text-hotel-light-brown transition-colors">Facebook</a>
                        </div>
                    </div>

                </div>

                {/* Massive Footer Text */}
                <div className="border-t border-white/10 pt-8">
                    <h1 className="text-[10vw] font-serif leading-none text-center tracking-tight opacity-30 select-none">
                        DE SIGNATURE
                    </h1>
                    <div className="flex justify-between items-center mt-8 text-xs text-gray-500 uppercase tracking-widest">
                        <p>&copy; {new Date().getFullYear()} De Signature International</p>
                        <p>Designed for Excellence</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
