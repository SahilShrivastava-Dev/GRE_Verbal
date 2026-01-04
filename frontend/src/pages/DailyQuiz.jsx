import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI, wordAPI } from '../services/api';

const DailyQuiz = () => {
  const [quizState, setQuizState] = useState('idle'); // idle, loading, active, completed
  const [quizType, setQuizType] = useState('mixed'); // meaning, synonym, antonym, completion, mixed
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    checkWordsCount();
  }, []);

  const checkWordsCount = async () => {
    try {
      const response = await wordAPI.getAll();
      setTotalWords(response.data.count);
    } catch (error) {
      console.error('Error checking words:', error);
    }
  };

  const startQuiz = async (type) => {
    setQuizState('loading');
    setQuizType(type);
    try {
      const response = await quizAPI.getDailyQuiz(type);
      const quizData = response.data.data;
      setQuestions(quizData.questions);
      setUserAnswers(new Array(quizData.questions.length).fill(null));
      setCurrentQuestion(0);
      setSelectedOption(null);
      setShowFeedback(false);
      setQuizState('active');
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert(error.response?.data?.message || 'Failed to load quiz. Please try again.');
      setQuizState('idle');
    }
  };

  const handleOptionSelect = (optionIndex) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedOption;
    setUserAnswers(newUserAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(userAnswers[currentQuestion + 1]);
      setShowFeedback(userAnswers[currentQuestion + 1] !== null);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(userAnswers[currentQuestion - 1]);
      setShowFeedback(userAnswers[currentQuestion - 1] !== null);
    }
  };

  const submitQuiz = async () => {
    setQuizState('loading');
    try {
      const results = questions.map((q, i) => ({
        word: q.word,
        correct: userAnswers[i] === q.correctIndex
      }));
      
      const response = await quizAPI.submitQuiz({ results });
      setResults({
        ...response.data.data,
        results: questions.map((q, i) => ({
          word: q.word,
          question: q.question,
          sentence: q.sentence,
          hint: q.hint,
          type: q.type,
          options: q.options,
          correctIndex: q.correctIndex,
          userAnswer: userAnswers[i],
          isCorrect: userAnswers[i] === q.correctIndex
        }))
      });
      setQuizState('completed');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setQuizState('active');
    }
  };

  const restartQuiz = () => {
    setQuizState('idle');
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setResults(null);
  };

  // Idle State - Quiz Type Selection
  if (quizState === 'idle') {
    const quizTypes = [
      {
        id: 'mixed',
        name: 'Mixed Quiz',
        icon: '🎲',
        description: 'Random mix of all question types',
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: 'meaning',
        name: 'Meaning Quiz',
        icon: '📖',
        description: 'What does this word mean?',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'synonym',
        name: 'Synonym Quiz',
        icon: '🔄',
        description: 'Find words with similar meanings',
        color: 'from-green-500 to-emerald-500'
      },
      {
        id: 'antonym',
        name: 'Antonym Quiz',
        icon: '⚡',
        description: 'Find words with opposite meanings',
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'completion',
        name: 'Text Completion',
        icon: '✍️',
        description: 'Fill in the blank (GRE style)',
        color: 'from-indigo-500 to-purple-500'
      }
    ];

    return (
      <div className="max-w-5xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-3">Daily Quiz 🎯</h1>
          <p className="text-gray-600 text-xl">Choose your quiz type and test your knowledge</p>
        </div>

        {totalWords < 4 ? (
          <div className="glass-card text-center py-16">
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Need More Words!</h3>
            <p className="text-gray-600 text-lg mb-8">
              You need at least 4 words in your vocabulary to take a quiz.<br />
              Currently you have: <span className="font-bold text-primary-600">{totalWords}</span> word{totalWords !== 1 ? 's' : ''}
            </p>
            <Link to="/add-word" className="btn-primary inline-block text-lg px-8 py-3">
              Add More Words →
            </Link>
          </div>
        ) : (
          <>
            <div className="glass-card mb-6 text-center py-6">
              <p className="text-gray-700 text-lg">
                <span className="font-bold text-primary-600">{totalWords}</span> words in your vocabulary
              </p>
              <p className="text-gray-600 mt-2">
                Quiz will include up to <span className="font-semibold">10 questions</span>, prioritizing weak areas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => startQuiz(type.id)}
                  className="glass-card hover:scale-105 transition-all cursor-pointer group"
                >
                  <div className={`w-full h-2 bg-gradient-to-r ${type.color} rounded-t-xl mb-4`}></div>
                  <div className="text-center">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                    <button className="btn-primary w-full group-hover:shadow-lg transition-shadow">
                      Start Quiz →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">📊 Quiz Features:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                <li className="flex items-center"><span className="mr-2">✓</span> Adaptive difficulty</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Prioritizes weak words</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Instant feedback</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Detailed results</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Progress tracking</li>
                <li className="flex items-center"><span className="mr-2">✓</span> GRE-style questions</li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  }

  // Loading State
  if (quizState === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-700 text-lg font-semibold animate-pulse">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Completed State - Results
  if (quizState === 'completed' && results) {
    const percentage = results.score;
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '🤔' : '📚';
    const message = percentage >= 80 ? 'Outstanding!' : percentage >= 60 ? 'Well Done!' : percentage >= 40 ? 'Keep Practicing!' : 'Review & Try Again!';

    return (
      <div className="max-w-5xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-3">Quiz Results {emoji}</h1>
        </div>

        {/* Score Card */}
        <div className="glass-card text-center mb-8 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 border-2 border-primary-300">
          <div className="text-7xl mb-4 animate-bounce">{emoji}</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{message}</h2>
          <div className="text-6xl font-bold gradient-text mb-3">
            {results.correctCount} / {results.totalQuestions}
          </div>
          <div className="text-2xl text-gray-700 font-semibold">
            {percentage}% Correct
          </div>
          <p className="text-gray-600 mt-4 text-lg">{results.message}</p>
        </div>

        {/* Detailed Results */}
        <div className="glass-card mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">📝 Detailed Review</h3>
          <div className="space-y-6">
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 ${
                  result.isCorrect
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-xl capitalize text-gray-900">
                      {index + 1}. {result.word}
                    </h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      result.type === 'meaning' ? 'bg-blue-100 text-blue-700' :
                      result.type === 'synonym' ? 'bg-green-100 text-green-700' :
                      result.type === 'antonym' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {result.type === 'meaning' ? '📖 Meaning' :
                       result.type === 'synonym' ? '🔄 Synonym' :
                       result.type === 'antonym' ? '⚡ Antonym' :
                       '✍️ Completion'}
                    </span>
                  </div>
                  <span className="text-4xl">
                    {result.isCorrect ? '✅' : '❌'}
                  </span>
                </div>
                
                <p className="text-gray-800 font-medium mb-2">{result.question}</p>
                
                {result.sentence && (
                  <p className="text-gray-700 italic mb-3 bg-white p-3 rounded-lg">
                    "{result.sentence}"
                  </p>
                )}
                
                {result.hint && (
                  <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded">
                    💡 {result.hint}
                  </p>
                )}
                
                <div className="space-y-2 mt-4">
                  {result.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-4 rounded-lg ${
                        optIndex === result.correctIndex
                          ? 'bg-green-100 border-2 border-green-600 font-bold'
                          : optIndex === result.userAnswer && !result.isCorrect
                          ? 'bg-red-100 border-2 border-red-600'
                          : 'bg-white border border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {optIndex === result.correctIndex && (
                          <span className="text-green-700 font-bold">✓ Correct Answer</span>
                        )}
                        {optIndex === result.userAnswer && !result.isCorrect && (
                          <span className="text-red-700 font-bold">✗ Your Answer</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={restartQuiz} className="btn-primary flex-1 text-lg py-4">
            🎯 Take Another Quiz
          </button>
          <Link to="/vocabulary" className="btn-secondary flex-1 text-center text-lg py-4">
            📚 Review Vocabulary
          </Link>
        </div>
      </div>
    );
  }

  // Active State - Quiz in Progress
  const currentQ = questions[currentQuestion];
  const isCorrect = selectedOption === currentQ.correctIndex;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Progress Bar */}
      <div className="glass-card mb-6 p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-800">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-semibold text-primary-600">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-purple-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            {progress > 10 && <span className="text-white text-xs font-bold">🎯</span>}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card mb-6 p-8">
        <div className="mb-2">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
            currentQ.type === 'meaning' ? 'bg-blue-100 text-blue-700' :
            currentQ.type === 'synonym' ? 'bg-green-100 text-green-700' :
            currentQ.type === 'antonym' ? 'bg-orange-100 text-orange-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {currentQ.type === 'meaning' ? '📖 Meaning Question' :
             currentQ.type === 'synonym' ? '🔄 Synonym Question' :
             currentQ.type === 'antonym' ? '⚡ Antonym Question' :
             '✍️ Text Completion'}
          </span>
        </div>
        
        <h3 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{currentQ.question}</h3>
        
        {currentQ.sentence && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
            <p className="text-gray-800 text-lg italic">"{currentQ.sentence}"</p>
          </div>
        )}
        
        {currentQ.hint && !showFeedback && (
          <p className="text-sm text-gray-600 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            💡 <span className="font-semibold">Hint:</span> {currentQ.hint}
          </p>
        )}
        
        <div className="space-y-3 mt-6">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const showCorrect = showFeedback && index === currentQ.correctIndex;
            const showWrong = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showFeedback}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all font-medium text-lg ${
                  showCorrect
                    ? 'bg-green-100 border-green-500 text-green-900 shadow-lg'
                    : showWrong
                    ? 'bg-red-100 border-red-500 text-red-900 shadow-lg'
                    : isSelected
                    ? 'bg-primary-100 border-primary-500 text-primary-900 shadow-md'
                    : 'bg-white border-gray-300 hover:border-primary-400 hover:shadow-md text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option}</span>
                  {showCorrect && <span className="text-green-600 font-bold text-2xl ml-3">✓</span>}
                  {showWrong && <span className="text-red-600 font-bold text-2xl ml-3">✗</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-5 rounded-xl ${isCorrect ? 'bg-green-100 border-2 border-green-400' : 'bg-orange-100 border-2 border-orange-400'}`}>
            <p className="font-bold text-lg mb-2">
              {isCorrect ? '✅ Excellent! That\'s correct!' : '❌ Not quite right'}
            </p>
            <p className="text-gray-800">
              {isCorrect
                ? 'You\'re mastering this word! Keep up the great work.'
                : 'Take a moment to review this word. You\'ll get it next time!'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-secondary px-8 py-4 text-lg disabled:opacity-30"
        >
          ← Previous
        </button>

        {!showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="btn-primary flex-1 py-4 text-lg disabled:opacity-50"
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary flex-1 py-4 text-lg">
            {currentQuestion === questions.length - 1 ? 'Finish Quiz 🎉' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyQuiz;
