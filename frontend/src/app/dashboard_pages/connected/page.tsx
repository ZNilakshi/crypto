"use client";
import { useEffect, useState } from "react";

interface NewsArticle {
  id: string;
  title: string;
  body: string;
  source: string;
  published_on: number;
  url: string;
  imageurl: string;
  categories: string;
}

export default function UserFriends() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(
          "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
        );
        const data = await res.json();
        setNews(data.Data.slice(0, 9)); // limit to 9 articles
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen rounded-3xl text-black bg-emerald-900 p-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-green-400 bg-clip-text text-transparent">
            Crypto News & Blockchain Daily
          </h1>
          <p className="mt-2 text-gray-400">
            Stay updated with the latest trends in Bitcoin, Ethereum, NFTs, and
            blockchain technology.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mr-3"></div>
              <span className="text-gray-400 text-lg">Loading news...</span>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article) => (
              <div
                key={article.id}
                className="bg-gray-800/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition transform duration-300"
              >
                <div className="h-48 w-full relative">
                  {article.imageurl ? (
                    <img
                      src={article.imageurl}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-green-700 to-green-900">
                      <span className="text-5xl">₿</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-xs bg-black/60 px-3 py-1 rounded-full text-green-300">
                    {article.categories.split("|")[0] || "Crypto"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(article.published_on * 1000).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span className="text-xs text-green-400 font-medium">
                      {article.source}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-green-300 cursor-pointer transition">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {article.body}
                  </p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 text-sm font-medium hover:underline"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
