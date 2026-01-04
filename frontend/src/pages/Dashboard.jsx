import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wordAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWords: 0,
    wordsToday: 0,
    weakWords: 0,
    averageAccuracy: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentWords, setRecentWords] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, wordsResponse] = await Promise.all([
        wordAPI.getStats(),
        wordAPI.getAll()
      ]);

      setStats(statsResponse.data.data);
      
      // Get 5 most recent words
      const sortedWords = wordsResponse.data.data
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 5);
      setRecentWords(sortedWords);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon, gradient, subtitle }) => (
    <div className={`stat-card ${gradient} group relative overflow-hidden`}>
      <div className="absolute inset-0 bg-white/10 transform -skew-y-6 scale-150 group-hover:scale-100 transition-transform duration-700"></div>
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-5xl font-extrabold mb-2 text-white drop-shadow-lg">{value}</p>
          {subtitle && <p className="text-white/80 text-sm font-medium">{subtitle}</p>}
        </div>
        <div className="text-6xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300 transform group-hover:rotate-12">
          {icon}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-700 text-lg font-semibold animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-slideUp">
      {/* Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-3xl -z-10"></div>
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-5xl md:text-6xl font-extrabold gradient-text animate-fadeIn">
            Welcome to Your GRE Journey! 🚀
          </h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="ml-4 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Refresh data"
          >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 text-xl font-medium animate-fadeIn">
          Consistent practice is the key to conquering GRE verbal ✨
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scaleIn">
        <StatCard
          title="Total Words"
          value={stats.totalWords}
          icon="📚"
          gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
        />
        <StatCard
          title="Today's Progress"
          value={stats.wordsToday}
          icon="⭐"
          gradient="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600"
        />
        <StatCard
          title="Weak Words"
          value={stats.weakWords}
          icon="⚠️"
          gradient="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600"
          subtitle="Need more practice"
        />
        <StatCard
          title="Accuracy"
          value={`${stats.averageAccuracy}%`}
          icon="🎯"
          gradient="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/add-word" className="group glass-card hover:scale-105 transform transition-all cursor-pointer border-2 border-transparent hover:border-purple-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="text-center relative z-10">
            <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">✨</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Add New Word</h3>
            <p className="text-gray-600 font-medium">Log a word and let AI enrich it instantly</p>
          </div>
        </Link>

        <Link to="/quiz" className="group glass-card hover:scale-105 transform transition-all cursor-pointer border-2 border-transparent hover:border-orange-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="text-center relative z-10">
            <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🎯</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">Daily Quiz</h3>
            <p className="text-gray-600 font-medium">Test with AI-powered adaptive questions</p>
          </div>
        </Link>

        <Link to="/vocabulary" className="group glass-card hover:scale-105 transform transition-all cursor-pointer border-2 border-transparent hover:border-green-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="text-center relative z-10">
            <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">📚</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Browse Words</h3>
            <p className="text-gray-600 font-medium">Review your vocabulary collection</p>
          </div>
        </Link>
      </div>

      {/* Recent Words */}
      {recentWords.length > 0 && (
        <div className="glass-card">
          <h2 className="text-3xl font-bold gradient-text mb-6 flex items-center">
            <span className="mr-3">📝</span>
            Recently Added Words
          </h2>
          <div className="space-y-4">
            {recentWords.map((word, index) => (
              <div 
                key={word.id} 
                className="group relative bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm p-5 rounded-xl hover:shadow-lg transition-all duration-300 border border-white/50 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize">
                        {word.word}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        word.difficulty === 'hard' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                        word.difficulty === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {word.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-3">{word.meaning}</p>
                    <p className="text-gray-600 text-sm italic bg-blue-50/50 p-3 rounded-lg border-l-4 border-blue-400">
                      "{word.example}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-10 text-center text-white group">
        <div className="absolute inset-0 bg-white/10 transform -skew-y-6 group-hover:skew-y-6 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-float">💪</div>
          <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Keep Going!</h2>
          <p className="text-xl font-medium opacity-95 max-w-2xl mx-auto">
            {stats.totalWords === 0 
              ? "🌟 Start by adding your first word today!"
              : stats.totalWords < 50
              ? "🎯 You're building a strong foundation. Keep adding words!"
              : stats.totalWords < 200
              ? "🚀 Great progress! You're on track for GRE success!"
              : "🏆 Amazing! You have a powerful vocabulary arsenal!"}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;

