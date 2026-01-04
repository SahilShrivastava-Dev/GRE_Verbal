import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI, wordAPI } from '../services/api';

const DailyQuiz = () => {
  const [quizState, setQuizState] = useState('idle'); // idle, loading, active, completed
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
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

  const startQuiz = async () => {
    setQuizState('loading');
    try {
      const response = await quizAPI.getDailyQuiz();
      setQuestions(response.data.data.questions);
      setAnswers(response.data.data.answers);
      setUserAnswers(new Array(response.data.data.questions.length).fill(null));
      setCurrentQuestion(0);
      setSelectedOption(null);
      setShowFeedback(false);
      setQuizState('active');
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to load quiz. Please try again.');
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
      const questionsWithAnswers = questions.map((q, i) => ({
        ...q,
        correctIndex: answers[i].correctIndex
      }));

      const response = await quizAPI.submitQuiz(questionsWithAnswers, userAnswers);
      setResults(response.data.data);
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
    setAnswers([]);
    setUserAnswers([]);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setResults(null);
  };

  // Idle State - Before Quiz Starts
  if (quizState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Quiz 🎯</h1>
          <p className="text-gray-600 text-lg">Test your knowledge with adaptive questions</p>
        </div>

        {totalWords === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Words Yet!</h3>
            <p className="text-gray-600 mb-6">
              You need to add some words to your vocabulary before taking a quiz.
            </p>
            <Link to="/add-word" className="btn-primary inline-block">
              Add Your First Word
            </Link>
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Test Yourself?</h3>
            <p className="text-gray-600 mb-6">
              We'll quiz you on {Math.min(15, totalWords)} words from your vocabulary.<br />
              The quiz adapts based on your weak areas and recent additions.
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h4 className="font-bold text-primary-900 mb-2">Quiz Features:</h4>
              <ul className="text-left text-gray-700 space-y-1 text-sm">
                <li>✓ Prioritizes weak words</li>
                <li>✓ Focuses on recent additions</li>
                <li>✓ Instant feedback on each answer</li>
                <li>✓ Detailed results at the end</li>
              </ul>
            </div>
            <button onClick={startQuiz} className="btn-primary text-lg px-8 py-3">
              Start Quiz →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Loading State
  if (quizState === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Completed State - Results
  if (quizState === 'completed' && results) {
    const percentage = results.percentage;
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '🤔' : '📚';
    const message = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : percentage >= 40 ? 'Keep Practicing!' : 'Review Your Words!';

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Results {emoji}</h1>
        </div>

        {/* Score Card */}
        <div className="card text-center mb-8 bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{message}</h2>
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {results.score} / {results.totalQuestions}
          </div>
          <div className="text-xl text-gray-700">
            {percentage}% Correct
          </div>
        </div>

        {/* Detailed Results */}
        <div className="card mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Detailed Review</h3>
          <div className="space-y-4">
            {results.results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-lg capitalize">
                    {index + 1}. {result.word}
                  </h4>
                  <span className="text-2xl">
                    {result.isCorrect ? '✅' : '❌'}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{result.question}</p>
                <div className="space-y-2">
                  {result.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded ${
                        optIndex === result.correctIndex
                          ? 'bg-green-100 border-2 border-green-500 font-semibold'
                          : optIndex === result.userAnswer && !result.isCorrect
                          ? 'bg-red-100 border-2 border-red-500'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      {option}
                      {optIndex === result.correctIndex && (
                        <span className="ml-2 text-green-700">✓ Correct</span>
                      )}
                      {optIndex === result.userAnswer && !result.isCorrect && (
                        <span className="ml-2 text-red-700">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={restartQuiz} className="btn-primary flex-1">
            Take Another Quiz
          </button>
          <Link to="/vocabulary" className="btn-secondary flex-1 text-center">
            Review Vocabulary
          </Link>
        </div>
      </div>
    );
  }

  // Active State - Quiz in Progress
  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const isCorrect = selectedOption === currentAnswer.correctIndex;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{currentQ.question}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const showCorrect = showFeedback && index === currentAnswer.correctIndex;
              const showWrong = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showFeedback}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all font-medium ${
                    showCorrect
                      ? 'bg-green-50 border-green-500 text-green-900'
                      : showWrong
                      ? 'bg-red-50 border-red-500 text-red-900'
                      : isSelected
                      ? 'bg-primary-50 border-primary-500 text-primary-900'
                      : 'bg-white border-gray-200 hover:border-primary-300 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showCorrect && <span className="text-green-600 font-bold">✓</span>}
                    {showWrong && <span className="text-red-600 font-bold">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-orange-50'}`}>
            <p className="font-semibold mb-1">
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="text-sm text-gray-700">
              {isCorrect
                ? 'Great job! You know this word well.'
                : 'Review this word and try to remember it for next time.'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-secondary px-6"
        >
          ← Previous
        </button>

        {!showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className="btn-primary flex-1"
          >
            Submit Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary flex-1">
            {currentQuestion === questions.length - 1 ? 'Finish Quiz →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyQuiz;

