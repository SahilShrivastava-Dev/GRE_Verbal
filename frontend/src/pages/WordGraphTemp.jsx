import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wordAPI } from '../services/api';

const WordGraph = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const response = await wordAPI.getAll();
      const wordsData = response.data.data;
      setWords(wordsData);
      analyzeConnections(wordsData);
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeConnections = (wordsData) => {
    const connectionsList = [];
    const wordMap = new Map(wordsData.map(w => [w.word.toLowerCase(), w]));

    wordsData.forEach(word => {
      // Check synonyms
      if (word.synonyms && word.synonyms.length > 0) {
        word.synonyms.forEach(syn => {
          if (wordMap.has(syn.toLowerCase())) {
            connectionsList.push({
              from: word.word,
              to: syn,
              type: 'synonym'
            });
          }
        });
      }

      // Check antonyms
      if (word.antonyms && word.antonyms.length > 0) {
        word.antonyms.forEach(ant => {
          if (wordMap.has(ant.toLowerCase())) {
            connectionsList.push({
              from: word.word,
              to: ant,
              type: 'antonym'
            });
          }
        });
      }
    });

    setConnections(connectionsList);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-700 text-lg font-semibold animate-pulse">Analyzing word relationships...</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">📚</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Words Yet!</h2>
        <p className="text-gray-600 text-lg mb-6">
          Add some words to your vocabulary to see their relationships.
        </p>
        <Link to="/add-word" className="btn-primary inline-block">
          Add Your First Word
        </Link>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'hard': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-orange-500 bg-orange-50';
      case 'easy': return 'border-green-500 bg-green-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card">
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center">
          <span className="mr-3">🕸️</span>
          Word Relationship Network
        </h1>
        <p className="text-gray-600 mb-4">
          Explore connections between words with similar or opposite meanings
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-800">
            <strong>📊 Interactive Graph Coming Soon!</strong> For now, view your word connections in list format below.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{words.length}</div>
          <div className="text-gray-600 font-medium">Total Words</div>
        </div>
        <div className="glass-card text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{connections.filter(c => c.type === 'synonym').length}</div>
          <div className="text-gray-600 font-medium">Synonym Connections</div>
        </div>
        <div className="glass-card text-center">
          <div className="text-4xl font-bold text-red-600 mb-2">{connections.filter(c => c.type === 'antonym').length}</div>
          <div className="text-gray-600 font-medium">Antonym Connections</div>
        </div>
      </div>

      {/* Connections List */}
      {connections.length > 0 ? (
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Word Connections</h2>
          <div className="space-y-3">
            {connections.map((conn, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-xl border-2 ${
                  conn.type === 'synonym' ? 'border-blue-300 bg-blue-50' : 'border-red-300 bg-red-50'
                } hover:shadow-lg transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg capitalize text-gray-900">{conn.from}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      conn.type === 'synonym' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {conn.type === 'synonym' ? '↔️ Synonym' : '⚡ Antonym'}
                    </span>
                    <span className="font-bold text-lg capitalize text-gray-900">{conn.to}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Connections Found</h3>
          <p className="text-gray-600 mb-4">
            Your words don't have overlapping synonyms or antonyms yet.
          </p>
          <p className="text-sm text-gray-500">
            As you add more related words, connections will appear here!
          </p>
        </div>
      )}

      {/* Word List */}
      <div className="glass-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Vocabulary ({words.length} words)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((word) => (
            <div 
              key={word.id} 
              className={`p-4 rounded-xl border-2 ${getDifficultyColor(word.difficulty)} hover:shadow-lg transition-all`}
            >
              <h3 className="font-bold text-lg capitalize text-gray-900 mb-2">{word.word}</h3>
              <p className="text-sm text-gray-700 mb-2">{word.meaning}</p>
              {word.synonyms && word.synonyms.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-semibold text-blue-600">Synonyms: </span>
                  <span className="text-xs text-gray-600">{word.synonyms.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-xl font-bold text-gray-900 mb-3">💡 About Word Networks</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">🔗</span>
            <span>Words are connected when they share synonym or antonym relationships</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎨</span>
            <span>Colors indicate difficulty: green (easy), orange (medium), red (hard)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📈</span>
            <span>The more words you add, the richer your network becomes!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WordGraph;

