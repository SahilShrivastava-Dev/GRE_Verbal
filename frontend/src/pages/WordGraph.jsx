import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { wordAPI } from '../services/api';

// Lazy load the graph component to prevent breaking the app if package isn't installed
const ForceGraph2D = lazy(() => 
  import('react-force-graph-2d').then(module => ({ default: module.ForceGraph2D })).catch(() => ({ default: () => null }))
);

const WordGraph = () => {
  const [words, setWords] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const graphRef = useRef();

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    if (words.length > 0) {
      generateGraphData();
    }
  }, [words, filterDifficulty]);

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

  const generateGraphData = () => {
    let filteredWords = words;
    
    if (filterDifficulty !== 'all') {
      filteredWords = words.filter(w => w.difficulty === filterDifficulty);
    }

    const nodes = filteredWords.map(word => ({
      id: word.word,
      name: word.word,
      meaning: word.meaning,
      difficulty: word.difficulty,
      synonyms: word.synonyms || [],
      antonyms: word.antonyms || [],
      val: 15 // Node size
    }));

    const links = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Create links based on synonyms
    filteredWords.forEach(word => {
      if (word.synonyms && word.synonyms.length > 0) {
        word.synonyms.forEach(synonym => {
          const synonymLower = synonym.toLowerCase();
          
          // Check if synonym exists as a word in our vocabulary
          const targetNode = nodeMap.get(synonymLower);
          if (targetNode && word.word !== synonymLower) {
            links.push({
              source: word.word,
              target: synonymLower,
              type: 'synonym',
              value: 2 // Link strength
            });
          }
        });
      }

      // Create links for antonyms
      if (word.antonyms && word.antonyms.length > 0) {
        word.antonyms.forEach(antonym => {
          const antonymLower = antonym.toLowerCase();
          const targetNode = nodeMap.get(antonymLower);
          
          if (targetNode && word.word !== antonymLower) {
            links.push({
              source: word.word,
              target: antonymLower,
              type: 'antonym',
              value: 1
            });
          }
        });
      }
    });

    setGraphData({ nodes, links });
  };

  const handleNodeClick = (node) => {
    setSelectedWord(node);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'hard': return '#ef4444'; // red
      case 'medium': return '#f59e0b'; // orange
      case 'easy': return '#10b981'; // green
      default: return '#6366f1'; // indigo
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-700 text-lg font-semibold animate-pulse">Building word network...</p>
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
          Add some words to your vocabulary to see the relationship graph.
        </p>
        <a href="/add-word" className="btn-primary inline-block">
          Add Your First Word
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center">
              <span className="mr-3">🕸️</span>
              Word Relationship Network
            </h1>
            <p className="text-gray-600">
              Visualize connections between words with similar or opposite meanings
            </p>
          </div>
          
          {/* Filter */}
          <div className="mt-4 md:mt-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Difficulty:</label>
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
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="glass-card p-0 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
          <h3 className="font-bold text-gray-900 mb-2">Legend:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Easy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Hard</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span>Synonym</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-red-500 border-dashed"></div>
                <span>Antonym</span>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading graph visualization...</p>
            </div>
          </div>
        }>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={window.innerWidth > 768 ? 1200 : window.innerWidth - 40}
            height={600}
            backgroundColor="#ffffff"
            nodeLabel="name"
            nodeColor={node => getDifficultyColor(node.difficulty)}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 14 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              // Draw node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
              ctx.fillStyle = getDifficultyColor(node.difficulty);
              ctx.fill();
              
              // Draw label
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#1f2937';
              ctx.fillText(label, node.x, node.y + node.val + fontSize);
            }}
            linkColor={link => link.type === 'synonym' ? '#3b82f6' : '#ef4444'}
            linkWidth={2}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={link => link.type === 'synonym' ? '#3b82f6' : '#ef4444'}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        </Suspense>
      </div>

      {/* Selected Word Details */}
      {selectedWord && (
        <div className="glass-card animate-scaleIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold gradient-text capitalize">{selectedWord.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                selectedWord.difficulty === 'hard' ? 'bg-red-500 text-white' :
                selectedWord.difficulty === 'medium' ? 'bg-orange-500 text-white' :
                'bg-green-500 text-white'
              }`}>
                {selectedWord.difficulty}
              </span>
            </div>
            <button
              onClick={() => setSelectedWord(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">📖 Meaning:</h3>
              <p className="text-gray-900">{selectedWord.meaning}</p>
            </div>

            {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-2">🔄 Synonyms:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWord.synonyms.map((syn, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedWord.antonyms && selectedWord.antonyms.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-2">↔️ Antonyms:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWord.antonyms.map((ant, index) => (
                    <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="glass-card bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-xl font-bold text-gray-900 mb-3">💡 How to Use the Graph</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">🖱️</span>
            <span><strong>Click</strong> on any word to see its details</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔍</span>
            <span><strong>Zoom</strong> with mouse wheel to explore clusters</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">👆</span>
            <span><strong>Drag</strong> nodes to rearrange the network</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔗</span>
            <span><strong>Blue lines</strong> connect synonyms, <strong>red lines</strong> connect antonyms</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🎨</span>
            <span><strong>Colors</strong> indicate difficulty: green (easy), orange (medium), red (hard)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WordGraph;

