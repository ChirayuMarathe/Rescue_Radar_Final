import { Shield, Zap, Users } from "lucide-react";
import SpotlightCard from "./Styles/SpotlightCard/SpotlightCard";

export function About() {
  const features = [
    {
      icon: Shield,
      title: "AI-Powered Analysis",
      description:
        "Our advanced AI system analyzes reports to classify cruelty types and assign urgency levels.",
    },
    {
      icon: Zap,
      title: "Rapid Response",
      description:
        "Instant routing to appropriate authorities and rescue organizations for immediate action.",
    },
    {
      icon: Users,
      title: "Community Network",
      description:
        "Connected with NGOs and rescue organizations nationwide for comprehensive coverage.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Creating a World Where Every Animal
            <br />
            <span className="text-orange-500">Is Safe and Protected</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            RescueRadar uses cutting-edge AI technology to streamline animal
            cruelty reporting and ensure rapid response from the right
            authorities and rescue organizations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <SpotlightCard
              key={index}
              className="h-full bg-orange-50 border-orange-100"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <feature.icon className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
