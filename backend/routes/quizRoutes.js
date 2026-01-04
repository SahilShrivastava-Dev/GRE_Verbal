import express from 'express';
import { WordsDB, QuizAttemptsDB } from '../database/db.js';
import { generateQuizQuestion } from '../services/llmService.js';

const router = express.Router();

// Generate daily quiz
router.get('/daily', async (req, res) => {
  try {
    const words = WordsDB.getAll();

    if (words.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No words available. Please add some words first.'
      });
    }

    // Quiz generation logic:
    // 1. Prioritize words marked as weak
    // 2. Prioritize recently added words (last 7 days)
    // 3. Prioritize words with high error rate
    // 4. Random selection from remaining

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const scoredWords = words.map(word => {
      let priority = 0;

      // Weak words get highest priority
      if (word.markedWeak) priority += 100;

      // High error rate
      if (word.timesQuizzed > 0) {
        const errorRate = word.timesWrong / word.timesQuizzed;
        if (errorRate > 0.5) priority += 50;
        if (errorRate > 0.7) priority += 30;
      }

      // Recently added words
      if (new Date(word.dateAdded) > sevenDaysAgo) {
        priority += 40;
      }

      // Words never quizzed should be included
      if (word.timesQuizzed === 0) priority += 20;

      // Add some randomness
      priority += Math.random() * 10;

      return { ...word, priority };
    });

    // Sort by priority and select top 15 words (or all if less than 15)
    const selectedWords = scoredWords
      .sort((a, b) => b.priority - a.priority)
      .slice(0, Math.min(15, words.length));

    // Generate questions for selected words using AI
    console.log(`\n🎯 Generating ${selectedWords.length} quiz questions with AI...`);
    const questions = await Promise.all(
      selectedWords.map(async (word, index) => {
        try {
          console.log(`  ${index + 1}/${selectedWords.length} - Generating question for "${word.word}"`);
          const question = await generateQuizQuestion(word.word, word, words);
          
          // Validate question quality
          if (!question.options || question.options.length !== 4) {
            throw new Error('Invalid question format');
          }
          
          // Check for duplicate options
          const uniqueOptions = [...new Set(question.options)];
          if (uniqueOptions.length !== 4) {
            console.warn(`  ⚠️ Duplicate options detected for "${word.word}", regenerating...`);
            throw new Error('Duplicate options');
          }
          
          console.log(`  ✅ Generated quality question for "${word.word}"`);
          return question;
        } catch (error) {
          console.error(`  ❌ Error generating question for ${word.word}:`, error.message);
          // Use improved fallback
          return {
            word: word.word,
            question: `What does '${word.word}' mean?`,
            options: [
              word.meaning,
              'To express in a different manner or form',
              'Characterized by careful consideration',
              'Lacking in substance or significance'
            ].sort(() => Math.random() - 0.5),
            correctIndex: 0 // Will be recalculated
          };
        }
      })
    );
    
    // Post-process to ensure correctIndex is accurate
    questions.forEach(q => {
      const selectedWord = selectedWords.find(w => w.word === q.word);
      if (selectedWord) {
        q.correctIndex = q.options.indexOf(selectedWord.meaning);
        if (q.correctIndex === -1) {
          // Meaning not found, add it and shuffle
          q.options[0] = selectedWord.meaning;
          q.correctIndex = 0;
        }
      }
    });
    
    console.log(`✅ Successfully generated ${questions.length} quiz questions\n`);

    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      data: {
        questions: questions.map(q => ({
          word: q.word,
          question: q.question,
          options: q.options
        })),
        answers: questions.map(q => ({
          word: q.word,
          correctIndex: q.correctIndex
        }))
      }
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating quiz',
      error: error.message
    });
  }
});

// Submit quiz answers
router.post('/submit', (req, res) => {
  try {
    const { questions, userAnswers } = req.body;

    if (!questions || !userAnswers || questions.length !== userAnswers.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz submission'
      });
    }

    let score = 0;
    const results = questions.map((q, index) => {
      const isCorrect = q.correctIndex === userAnswers[index];
      if (isCorrect) score++;

      // Update word statistics
      const word = WordsDB.findByWord(q.word);
      if (word) {
        WordsDB.updateStats(word.id, isCorrect);
      }

      return {
        word: q.word,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        userAnswer: userAnswers[index],
        isCorrect: isCorrect
      };
    });

    // Save quiz attempt
    const attempt = QuizAttemptsDB.add({
      questions: results,
      score: score,
      totalQuestions: questions.length
    });

    res.json({
      success: true,
      data: {
        score: score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        results: results,
        attemptId: attempt.id
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
});

// Get quiz history
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const attempts = QuizAttemptsDB.getRecent(limit);

    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz history',
      error: error.message
    });
  }
});

export default router;

