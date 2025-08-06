import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

function Marquee({
  children,
  direction = "left",
  speed = 50,
  pauseOnHover = true,
  className = "",
}) {
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, [children]);

  return (
    <div
      className={`overflow-hidden relative ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className={`flex min-w-full gap-4`}
        style={{
          transform: `translateX(${direction === "left" ? "-" : ""}${
            isPaused ? contentWidth / 4 : 0
          }px)`,
          animation: `scroll-${direction} ${
            contentWidth / speed
          }s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        <div ref={contentRef} className="flex gap-4 shrink-0">
          {children}
        </div>
        <div className="flex gap-4 shrink-0">{children}</div>
      </div>
      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function ReviewCard({ avatar, name, rating, review }) {
  return (
    <div className="w-80 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 bg-gray-100"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
        ) : null}
        {/* Default SVG icon if no avatar or image fails to load */}
        <svg
          className="w-10 h-10 rounded-full border border-gray-300 bg-gray-100"
          style={{ display: avatar ? "none" : "block" }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="8" r="4" fill="#e5e7eb" />
          <rect x="4" y="16" width="16" height="6" rx="3" fill="#e5e7eb" />
        </svg>
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                fill={i < rating ? "#fbbf24" : "#e5e7eb"}
                viewBox="0 0 20 20"
                className={`w-4 h-4 ${
                  i < rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{review}</p>
    </div>
  );
}

// Testimonials / Partner Logos
export function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Priya S.",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      review:
        "RescueRadar helped us find help for a stray dog in minutes. Amazing work!",
    },
    {
      id: 2,
      name: "Dr. Ramesh K.",
      avatar: "/placeholder-user.jpg",
      rating: 4,
      review:
        "As a vet, I love how easy it is to connect with NGOs and volunteers.",
    },
    {
      id: 3,
      name: "Anjali NGO",
      avatar: "/placeholder-logo.png",
      rating: 5,
      review:
        "Our rescue operations have become more efficient thanks to this platform.",
    },
    {
      id: 4,
      name: "Amit P.",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      review: "The platform is intuitive and the response time is fantastic!",
    },
  ];

  const partners = [
    "/placeholder-logo.png",
    "/placeholder-logo.svg",
    "/placeholder.svg",
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
          Testimonials & Partners
        </h2>
        <Marquee direction="left" className="py-4" speed={30}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              avatar={review.avatar}
              name={review.name}
              rating={review.rating}
              review={review.review}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
