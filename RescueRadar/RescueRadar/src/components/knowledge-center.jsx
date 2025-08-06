import { useEffect, useState } from "react";

const API_KEY = "7bf9de05ef324402b01935a87d4ad98d";

export default function KnowledgeCenter() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(
      `https://newsapi.org/v2/everything?q=Animal+Rescue&language=en&pageSize=3&apiKey=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Knowledge Center & Resources
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {articles.map((article, index) => (
          <div
            key={index}
            className="w-72 bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
          >
            <span className="text-orange-500 font-medium text-sm mb-2 block">
              Article
            </span>
            <h3 className="font-semibold text-lg">{article.title}</h3>
            <p className="text-gray-600 text-sm my-2 line-clamp-3">
              {article.description}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 font-medium text-sm"
            >
              Read More
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
