import Hero from "./components/Hero";
import About from "./components/About";
import Gallery from "./components/Gallery";
import RoomAvailability from "./components/RoomAvailability";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <About />
      <Gallery />
      <RoomAvailability />
      <Footer />
    </main>
  );
}
