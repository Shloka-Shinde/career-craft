import React, { useState } from "react";
import { Search, Github, Star, ExternalLink, Loader2, Sparkles, GitFork } from "lucide-react";

const GitHubToGemini = () => {
  const [username, setUsername] = useState("");
  const [reposText, setReposText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repos, setRepos] = useState([]);

  const fetchGitHubData = async () => {
    setLoading(true);
    setError("");
    setSummary("");
    setReposText("");
    setRepos([]);

    try {
      // Fetch GitHub repositories
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error("GitHub user not found or rate limit exceeded");
      const data = await res.json();

      if (data.length === 0) {
        throw new Error("No repositories found for this user");
      }

      setRepos(data);

      // Convert repositories to a single text variable
      const repoText = data
        .map(
          (repo) =>
            `${repo.name} - ${repo.description || "No description"} (${repo.language || "N/A"}) - ${repo.stargazers_count} stars`
        )
        .join("\n");
      setReposText(repoText);

      // Prepare Gemini prompt for concise bullet points
      const prompt = `Analyze the following GitHub repositories for user ${username} and provide a concise 2-3 bullet point summary focusing on:

• Main technology stacks and primary programming languages
• Key project domains or areas of focus
• Notable achievements or interesting patterns

Format your response as clear, concise bullet points only. No introductory text.

Repositories:\n${repoText}

Summary:`;

      // Gemini API call
      const geminiRes = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyDQWx6lqPUMdYScT23g-A3id7R7V4Fuid0",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        throw new Error(geminiData.error?.message || "Failed to generate summary");
      }

      // Extract text from Gemini response
      const aiSummary =
        geminiData?.candidates?.[0]?.content?.parts?.map(
          (item) => item.text
        ).join("\n") || "No summary generated.";

      setSummary(aiSummary);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && username && !loading) {
      fetchGitHubData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Github className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            GitHub Profile Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get AI-powered insights about any GitHub user's repositories, tech stack, and coding profile
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
              />
            </div>
            <button
              onClick={fetchGitHubData}
              disabled={!username || loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 min-w-[160px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Search className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Repositories Panel */}
          {(repos.length > 0 || loading) && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repositories ({repos.length})
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {repos.map((repo) => (
                      <div key={repo.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg hover:text-blue-600 transition-colors">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              {repo.name}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </h3>
                          {repo.language && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {repo.stargazers_count}
                            </span>
                          )}
                          {repo.forks_count > 0 && (
                            <span className="flex items-center gap-1">
                              <GitFork className="h-4 w-4" />
                              {repo.forks_count}
                            </span>
                          )}
                          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Summary Panel */}
          {(summary || loading) && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Analysis
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                    <p className="text-gray-600">Analyzing repositories with AI...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {summary.split('\n').map((line, index) => (
                      line.trim() && (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 leading-relaxed">{line.replace(/^[•\-*\s]+/, '')}</p>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && !error && repos.length === 0 && !summary && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
                <Github className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Enter a GitHub Username
              </h3>
              <p className="text-gray-500">
                Start by entering a GitHub username above to analyze their repositories and get AI-powered insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubToGemini;