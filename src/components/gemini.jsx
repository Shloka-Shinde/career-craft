import React, { useState } from "react";

const GitHubToGemini = () => {
  const [username, setUsername] = useState("");
  const [reposText, setReposText] = useState(""); // Store repo list as text
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGitHubData = async () => {
    setLoading(true);
    setError("");
    setSummary("");
    setReposText("");

    try {
      // Fetch GitHub repositories
      const res = await fetch(`https://api.github.com/users/${username}/repos`);
      if (!res.ok) throw new Error("GitHub user not found");
      const data = await res.json();

      // Convert repositories to a single text variable
      const repoText = data
        .map(
          (repo) =>
            `${repo.name} - ${repo.description || "No description"} (${repo.language || "N/A"})`
        )
        .join("\n");
      setReposText(repoText);

      // Prepare Gemini prompt using the reposText variable
      const prompt = `Analyze the following GitHub repositories and provide insights:\n${repoText}`;

      // Gemini API call using curl-style JSON payload
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

      // Properly extract text from Gemini response
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

  return (
    <div className="p-6 max-w-xl mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">GitHub to Gemini Summary</h2>
      <input
        type="text"
        placeholder="Enter GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={fetchGitHubData}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={!username || loading}
      >
        {loading ? "Fetching..." : "Fetch & Summarize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {reposText && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Repositories:</h3>
          <pre className="bg-gray-100 p-3 rounded">{reposText}</pre>
        </div>
      )}

      {summary && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">AI Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default GitHubToGemini;