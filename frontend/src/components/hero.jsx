// Removed custom Button import
import { Play, Heart } from "lucide-react";
import RotatingText from "./Styles/RotatingText/RotatingText";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);

  // Fallback image URLs if local image fails to load
  const heroImages = [
    "/pexels-ifaw-5487067.jpg",
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&h=800&fit=crop", // Dog
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&h=800&fit=crop", // Cat
    "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=1200&h=800&fit=crop" // Animals
  ];

  const handleImageError = () => {
    setImageFailed(true);
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-orange-50 to-pink-50 min-h-screen flex items-center overflow-hidden pt-16 lg:pt-0"
    >
      {/* Overlapping background image */}
      <img
        src={imageFailed ? heroImages[1] : heroImages[0]}
        alt="Hero Background - Rescue Animals"
        onError={handleImageError}
        className="absolute inset-0 w-full h-full object-cover opacity-60 lg:opacity-70 z-0 pointer-events-none"
        style={{ objectPosition: "center" }}
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 lg:bg-black/30 z-0" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh] lg:min-h-[60vh]">
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
                Every Animal
                <br />
                Deserves
                <br />
                <span className="inline-block align-middle">
                  <RotatingText
                    texts={["Protection", "Care", "Rescue", "Hope"]}
                    mainClassName="text-orange-400 drop-shadow-lg px-1 lg:px-2"
                    staggerFrom={"last"}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-120%", opacity: 0 }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </span>
                <Heart className="inline-block h-8 w-8 lg:h-12 lg:w-12 text-pink-400 ml-2 align-middle drop-shadow-lg" />
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-lg lg:max-w-2xl mx-auto lg:mx-0 drop-shadow leading-relaxed px-2 lg:px-0">
                Report animal cruelty and help us create a safer world for all
                animals. Our AI-powered system ensures rapid response and proper
                routing to authorities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 lg:px-0">
              <button
                type="button"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 shadow-xl shadow-orange-200/40 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-white"
                onClick={() => router.push("/report")}
              >
                🚨 Report Now
              </button>
              <button
                type="button"
                className="w-full sm:w-auto text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 bg-white/90 hover:bg-white border-white/60 text-gray-900 font-semibold shadow rounded-lg transition-all duration-300 flex items-center justify-center"
                onClick={() => router.push("/reports-map")}
              >
                <Play className="h-5 w-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>

          {/* You can add illustration or icons here if needed */}
        </div>
      </div>
    </section>
  );
}
