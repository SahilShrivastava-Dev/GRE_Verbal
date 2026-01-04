import React, { useState } from 'react';
import { wordAPI } from '../services/api';

const AddWord = () => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!word.trim()) {
      setError('Please enter a word');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await wordAPI.add(word.trim());
      setResult(response.data.data);
      setWord('');
    } catch (err) {
      console.error('Error adding word:', err);
      
      if (err.response?.status === 409) {
        const message = err.response?.data?.message || 'This word already exists in your vocabulary!';
        const hint = err.response?.data?.hint;
        setError(hint ? `${message}\n\n💡 Tip: ${hint}` : message);
      } else {
        setError(err.response?.data?.message || 'Failed to add word. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setResult(null);
    setError('');
    setWord('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Word ➕</h1>
        <p className="text-gray-600 text-lg">
          Type a word and our AI will automatically fetch its meaning, synonyms, and more!
        </p>
      </div>

      {/* Input Form */}
      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="word" className="block text-sm font-semibold text-gray-700 mb-2">
              Enter a GRE word:
            </label>
            <input
              type="text"
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., ameliorate, pernicious, erudite..."
              className="input-field text-lg"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !word.trim()}
            className="btn-primary w-full text-lg py-3 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Enriching word with AI...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Add & Enrich Word</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Result */}
      {result && (
        <div className="card bg-green-50 border-2 border-green-500 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start">
              <span className="text-4xl mr-4">✅</span>
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-1">Word Added Successfully!</h2>
                <p className="text-green-700">The word has been enriched and saved to your vocabulary.</p>
              </div>
            </div>
            <button
              onClick={handleAddAnother}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              title="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 mt-6">
            {/* Word */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 capitalize mb-1">{result.word}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                result.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                result.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {result.difficulty}
              </span>
            </div>

            {/* Meaning */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">📖 Meaning:</h4>
              <p className="text-gray-900">{result.meaning}</p>
            </div>

            {/* Synonyms */}
            {result.synonyms && result.synonyms.length > 0 && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">🔄 Synonyms:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.synonyms.map((syn, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {result.antonyms && result.antonyms.length > 0 && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">↔️ Antonyms:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.antonyms.map((ant, index) => (
                    <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Example */}
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">💡 GRE-Style Example:</h4>
              <p className="text-gray-900 italic">"{result.example}"</p>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t">
              <button
                onClick={handleAddAnother}
                className="btn-primary w-full"
              >
                ➕ Add Another Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 card bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">💡 Tips for Building Vocabulary</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Add 5-10 new words daily for consistent progress</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Focus on high-frequency GRE words first</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Review your words regularly through daily quizzes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Pay attention to word roots, prefixes, and suffixes</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AddWord;

