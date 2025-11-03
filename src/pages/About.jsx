import React from "react";
import { Github, Sparkles, Users, Rocket, Heart, Code, Globe, Shield } from "lucide-react";

const AboutPage = () => {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights about GitHub profiles using advanced AI technology"
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Tech Stack Detection",
      description: "Automatically identify programming languages and frameworks used across repositories"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Profile Insights",
      description: "Understand developer interests, specialties, and project patterns"
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Quick & Easy",
      description: "Get comprehensive analysis in seconds with just a username"
    }
  ];

  const team = [
    {
      name: "Developer Team",
      role: "Open Source Contributors",
      description: "Passionate about building tools that help developers showcase their work"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Github className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-4">
            About GitHub Profile Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Revolutionizing how developers discover and understand GitHub profiles with AI-powered insights
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We believe every developer has a unique story told through their code. Our mission is to 
              make GitHub profile analysis accessible, insightful, and valuable for everyone - from 
              hiring managers to open source enthusiasts.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Why Choose Our Analyzer?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Enter Username</h3>
              <p className="text-gray-600 text-sm">Provide any GitHub username to analyze</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">Our AI processes repositories and patterns</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Get Insights</h3>
              <p className="text-gray-600 text-sm">Receive concise, actionable insights</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Our Team</h2>
          <div className="max-w-md mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Open Source</h3>
            <p className="text-gray-600 text-sm">Built with love for the developer community</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
            <div className="p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Privacy First</h3>
            <p className="text-gray-600 text-sm">We don't store any personal data</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-100">
            <div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Free Forever</h3>
            <p className="text-gray-600 text-sm">Completely free tool for everyone</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Analyze Profiles?</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Start discovering insights about any GitHub profile in seconds
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Try It Now
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Made with ❤️ for the developer community</p>
          <p className="text-sm mt-2">© 2024 GitHub Profile Analyzer. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;