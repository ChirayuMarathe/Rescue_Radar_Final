import { AnimatedNumber } from "./Styles/AnimatedNumber";

export function Stats() {
  const stats = [
    { number: "3,102", label: "Animals Rescued" },
    { number: "$2.5M", label: "Funds Raised" },
    { number: "120", label: "NGO Partners" },
    { number: "45", label: "Cities Covered" },
    { number: "8,900+", label: "Volunteers" },
    { number: "1,200+", label: "Successful Adoptions" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-4xl font-bold text-orange-500">
                <AnimatedNumber value={stat.number} />
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
