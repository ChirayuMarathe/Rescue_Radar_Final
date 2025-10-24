import { AnimatedNumber } from "./Styles/AnimatedNumber";

export function Stats() {
  const stats = [
    { number: "3,102", label: "Animals Rescued", icon: "🐾" },
    { number: "$2.5M", label: "Funds Raised", icon: "💰" },
    { number: "120", label: "NGO Partners", icon: "🤝" },
    { number: "45", label: "Cities Covered", icon: "🏙️" },
    { number: "8,900+", label: "Volunteers", icon: "👥" },
    { number: "1,200+", label: "Successful Adoptions", icon: "❤️" },
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            📊 Our Impact
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Real numbers showing the difference we're making together
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="text-2xl sm:text-3xl mb-2">
                {stat.icon}
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">
                <AnimatedNumber value={stat.number} />
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to action for mobile */}
        <div className="text-center mt-8 lg:mt-12">
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Join thousands of animal lovers making a difference
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base">
              🚨 Report Emergency
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-all duration-300 border border-gray-300 shadow-sm text-sm sm:text-base">
              💝 Volunteer Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
