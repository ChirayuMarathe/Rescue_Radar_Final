import { PawPrint, HeartHandshake, Leaf } from "lucide-react";
export function NgoMap() {
  const ngos = [
    {
      name: "Animal Aid Unlimited",
      city: "Udaipur",
      lat: 24.5854,
      lng: 73.7125,
      logo: "/placeholder-logo.png",
      color: "bg-orange-50",
      icon: <PawPrint size={32} color="#fbbf24" />,
    },
    {
      name: "Blue Cross",
      city: "Chennai",
      lat: 13.0827,
      lng: 80.2707,
      logo: "/placeholder-logo.svg",
      color: "bg-blue-50",
      icon: <HeartHandshake size={32} color="#60a5fa" />,
    },
    {
      name: "People For Animals",
      city: "Delhi",
      lat: 28.6139,
      lng: 77.209,
      logo: "/placeholder.svg",
      color: "bg-green-50",
      icon: <Leaf size={32} color="#34d399" />,
    },
  ];
  return (
    <section
      id="ngo-map"
      className="py-20 bg-gradient-to-br from-orange-50 to-pink-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">
          Find Nearby NGOs & Shelters
        </h2>
        <div className="w-full flex flex-wrap justify-center gap-8 px-8 py-8">
          {ngos.map((ngo, i) => (
            <div
              key={i}
              className={`relative ${ngo.color} rounded-xl shadow-lg p-7 flex flex-col items-center transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl border border-gray-100 min-w-[260px]`}
              style={{ boxShadow: "0 8px 32px 0 rgba(255, 182, 193, 0.15)" }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-md border border-gray-200">
                {ngo.icon}
              </div>

              <div className="font-bold text-lg text-gray-900 text-center mb-1 tracking-tight">
                {ngo.name}
              </div>
              <div className="text-orange-500 font-semibold mb-1 text-center text-base">
                {ngo.city}
              </div>
              <div className="text-xs text-gray-500 text-center mb-2">
                Lat: {ngo.lat}, Lng: {ngo.lng}
              </div>
              <div className="flex justify-center gap-2 mt-2">
                <span className="bg-white text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  Nearby
                </span>
                <span className="bg-orange-100 text-orange-500 text-xs px-3 py-1 rounded-full shadow-sm border border-orange-200">
                  Open
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
