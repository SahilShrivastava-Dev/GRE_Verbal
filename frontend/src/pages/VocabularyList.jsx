import React, { useState, useEffect } from 'react';
import { wordAPI } from '../services/api';

const VocabularyList = () => {
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, alphabetical, weak
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    let result = [...words];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.word.toLowerCase().includes(query) ||
        w.meaning.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      result = result.filter(w => w.difficulty === filterDifficulty);
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'weak':
        result.sort((a, b) => {
          const aRate = a.timesQuizzed > 0 ? a.timesWrong / a.timesQuizzed : 0;
          const bRate = b.timesQuizzed > 0 ? b.timesWrong / b.timesQuizzed : 0;
          return bRate - aRate;
        });
        break;
      default: // recent
        result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    setFilteredWords(result);
  }, [words, searchQuery, filterDifficulty, sortBy]);

  const loadWords = async () => {
    try {
      setLoading(true);
      const response = await wordAPI.getAll();
      setWords(response.data.data);
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWeak = async (wordId, isWeak) => {
    try {
      await wordAPI.update(wordId, { markedWeak: !isWeak });
      loadWords();
    } catch (error) {
      console.error('Error updating word:', error);
    }
  };

  const handleDelete = async (wordId) => {
    if (!window.confirm('Are you sure you want to delete this word?')) return;
    
    try {
      await wordAPI.delete(wordId);
      loadWords();
      setSelectedWord(null);
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const WordCard = ({ word }) => {
    const accuracy = word.timesQuizzed > 0
      ? Math.round(((word.timesQuizzed - word.timesWrong) / word.timesQuizzed) * 100)
      : 100;

    return (
      <div
        onClick={() => setSelectedWord(word)}
        className="card cursor-pointer hover:scale-102 transform transition-all border-2 border-transparent hover:border-primary-500"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-primary-700 capitalize">{word.word}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                word.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {word.difficulty}
              </span>
              {word.markedWeak && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                  ⚠️ Weak
                </span>
              )}
            </div>
          </div>
          {word.timesQuizzed > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-700">{accuracy}%</div>
              <div className="text-xs text-gray-500">{word.timesQuizzed} attempts</div>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-3">{word.meaning}</p>
        
        <div className="text-sm text-gray-500 italic border-t pt-2">
          "{word.example}"
        </div>
      </div>
    );
  };

  const WordDetailModal = ({ word, onClose }) => {
    if (!word) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-primary-700 capitalize">{word.word}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Difficulty & Stats */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                word.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {word.difficulty}
              </span>
              {word.timesQuizzed > 0 && (
                <span className="text-sm text-gray-600">
                  Quizzed: {word.timesQuizzed} times • Wrong: {word.timesWrong} times
                </span>
              )}
            </div>

            {/* Meaning */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">📖 Meaning:</h3>
              <p className="text-gray-900 text-lg">{word.meaning}</p>
            </div>

            {/* Synonyms */}
            {word.synonyms && word.synonyms.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-2">🔄 Synonyms:</h3>
                <div className="flex flex-wrap gap-2">
                  {word.synonyms.map((syn, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {word.antonyms && word.antonyms.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-2">↔️ Antonyms:</h3>
                <div className="flex flex-wrap gap-2">
                  {word.antonyms.map((ant, index) => (
                    <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Example */}
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <h3 className="font-bold text-gray-700 mb-2">💡 Example:</h3>
              <p className="text-gray-900 italic">"{word.example}"</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleMarkWeak(word.id, word.markedWeak)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  word.markedWeak
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {word.markedWeak ? '✓ Remove from Weak' : '⚠️ Mark as Weak'}
              </button>
              <button
                onClick={() => handleDelete(word.id)}
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-4xl font-bold text-gray-900">My Vocabulary 📚</h1>
          <button
            onClick={loadWords}
            disabled={loading}
            className="ml-4 text-primary-600 hover:text-primary-700 disabled:opacity-50"
            title="Refresh vocabulary"
          >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 text-lg">{words.length} words in your collection</p>
      </div>

      {/* Filters & Search */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words..."
              className="input-field"
            />
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty:</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input-field"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="recent">Recently Added</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="weak">Weakest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No words found</h3>
          <p className="text-gray-600 mb-6">
            {words.length === 0
              ? "Start building your vocabulary by adding your first word!"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  );
};

export default VocabularyList;

