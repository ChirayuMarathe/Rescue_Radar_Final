// Removed custom Button import
import { Play, Heart } from "lucide-react";
import RotatingText from "./Styles/RotatingText/RotatingText";
import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();
  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-orange-50 to-pink-50 min-h-screen flex items-center overflow-hidden"
    >
      {/* Overlapping background image */}
      <img
        src="/pexels-ifaw-5487067.jpg"
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover opacity-70 z-0 pointer-events-none"
        style={{ objectPosition: "center" }}
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
                Every Animal
                <br />
                Deserves
                <br />
                <span className="inline-block align-middle">
                  <RotatingText
                    texts={["Protection", "Care", "Rescue", "Hope"]}
                    mainClassName="text-orange-400 drop-shadow-lg px-2"
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
                <Heart className="inline-block h-12 w-12 text-pink-400 ml-2 align-middle drop-shadow-lg" />
              </h1>
              <p className="text-xl text-white/90 max-w-lg drop-shadow">
                Report animal cruelty and help us create a safer world for all
                animals. Our AI-powered system ensures rapid response and proper
                routing to authorities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4 shadow-xl shadow-orange-200/40 font-semibold rounded-lg transition-colors"
                onClick={() => router.push("/report")}
              >
                Report Now
              </button>
              <button
                type="button"
                className="text-lg px-8 py-4 bg-white/80 border-white/60 text-gray-900 hover:bg-white font-semibold shadow rounded-lg transition-colors flex items-center"
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
