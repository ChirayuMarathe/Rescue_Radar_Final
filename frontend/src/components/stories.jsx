import { useEffect, useState } from "react";

// Rescue Stories / Impact Wall
export function Stories() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_KEY = "7bf9de05ef324402b01935a87d4ad98d";
    const query = "Animal Rescue";
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Only include direct animal rescue and welfare stories
        const rescueKeywords = [
          "animal rescue",
          "rescued",
          "saved animal",
          "animal shelter",
          "adopted animal",
          "adoption",
          "animal welfare",
          "stray rescue",
          "pet rescue",
          "wildlife rescue",
          "dog rescue",
          "cat rescue",
          "puppy rescue",
          "kitten rescue",
          "rehabilitation",
          "foster animal",
          "rehomed animal",
        ];
        const excludeKeywords = [
          "brain",
          "agent",
          "machine",
          "toy",
          "claw",
          "robot",
          "study",
          "scientific",
          "discovery",
          "therapeutic",
          "video game",
          "stuffed animal",
        ];
        const filtered = (data.articles || []).filter((article) => {
          const text = `${article.title} ${article.description}`.toLowerCase();
          const isRescue = rescueKeywords.some((kw) => text.includes(kw));
          const isExcluded = excludeKeywords.some((kw) => text.includes(kw));
          return isRescue && !isExcluded;
        });
        setArticles(filtered.slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load stories.");
        setLoading(false);
      });
  }, []);

  return (
    <section id="stories" className="py-20 bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Rescue Stories & Impact
        </h2>
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Loading stories...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition"
              >
                <img
                  src={article.urlToImage || "/placeholder.jpg"}
                  alt={article.title}
                  className="h-32 w-full object-cover rounded mb-4"
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
                <div className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </div>
                <div className="text-gray-600 text-sm mb-2 line-clamp-3">
                  {article.description}
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  {article.source?.name} &middot;{" "}
                  {article.publishedAt?.slice(0, 10)}
                </div>
                <span className="text-sm text-orange-600 underline mt-2">
                  Read More
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
