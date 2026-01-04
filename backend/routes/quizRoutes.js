import express from 'express';
import { words, quizAttempts } from '../database/db.js';
import { generateQuizQuestion, generateSynonymOptions, generateAntonymOptions } from '../services/llmService.js';

const router = express.Router();

// Generate a synonym quiz question with AI enhancement
async function generateSynonymQuestion(word, wordData, allWords) {
  if (!wordData.synonyms || wordData.synonyms.length === 0) {
    return null; // Skip if no synonyms
  }

  // Get correct synonym
  const correctSynonym = wordData.synonyms[0];
  
  // Try to use AI to generate better distractor options
  const aiOptions = await generateSynonymOptions(word, wordData, correctSynonym);
  
  if (aiOptions && aiOptions.length >= 3) {
    // Use AI-generated options
    const options = [correctSynonym, ...aiOptions].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctSynonym);
    
    return {
      word: word,
      type: 'synonym',
      question: `Which word is a SYNONYM (similar meaning) of "${word}"?`,
      hint: `Meaning: ${wordData.meaning.substring(0, 100)}...`,
      options: options,
      correctIndex: correctIndex
    };
  }
  
  // Fallback: Get wrong options from other words' synonyms
  const wrongOptions = [];
  const otherWords = allWords.filter(w => w.word !== word);
  
  for (const w of otherWords) {
    if (w.synonyms && w.synonyms.length > 0) {
      wrongOptions.push(...w.synonyms);
    }
  }
  
  // Add some general distractors
  const generalDistractors = [
    'ubiquitous', 'ephemeral', 'pragmatic', 'verbose', 'benevolent', 
    'malicious', 'obscure', 'lucid', 'astute', 'frivolous',
    'candid', 'zealous', 'tenuous', 'verbose', 'stoic'
  ];
  wrongOptions.push(...generalDistractors);
  
  // Shuffle and pick 3 unique wrong options
  const shuffled = wrongOptions.filter(opt => 
    opt.toLowerCase() !== correctSynonym.toLowerCase() && 
    opt.toLowerCase() !== word.toLowerCase() &&
    !wordData.synonyms.map(s => s.toLowerCase()).includes(opt.toLowerCase())
  );
  const uniqueWrong = [...new Set(shuffled)].sort(() => Math.random() - 0.5).slice(0, 3);
  
  if (uniqueWrong.length < 3) {
    return null; // Not enough options
  }
  
  // Create options array
  const options = [correctSynonym, ...uniqueWrong].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(correctSynonym);
  
  return {
    word: word,
    type: 'synonym',
    question: `Which word is a SYNONYM (similar meaning) of "${word}"?`,
    hint: `Meaning: ${wordData.meaning.substring(0, 100)}...`,
    options: options,
    correctIndex: correctIndex
  };
}

// Generate an antonym quiz question with AI enhancement
async function generateAntonymQuestion(word, wordData, allWords) {
  if (!wordData.antonyms || wordData.antonyms.length === 0) {
    return null; // Skip if no antonyms
  }

  // Get correct antonym
  const correctAntonym = wordData.antonyms[0];
  
  // Try to use AI to generate better distractor options
  const aiOptions = await generateAntonymOptions(word, wordData, correctAntonym);
  
  if (aiOptions && aiOptions.length >= 3) {
    // Use AI-generated options
    const options = [correctAntonym, ...aiOptions].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAntonym);
    
    return {
      word: word,
      type: 'antonym',
      question: `Which word is an ANTONYM (opposite meaning) of "${word}"?`,
      hint: `Meaning: ${wordData.meaning.substring(0, 100)}...`,
      options: options,
      correctIndex: correctIndex
    };
  }
  
  // Fallback: Get wrong options (synonyms and other words' antonyms)
  const wrongOptions = [...(wordData.synonyms || [])];
  
  const otherWords = allWords.filter(w => w.word !== word);
  for (const w of otherWords) {
    if (w.antonyms && w.antonyms.length > 0) {
      wrongOptions.push(...w.antonyms);
    }
  }
  
  // Add general distractors
  const generalDistractors = [
    'similar', 'different', 'opposite', 'related', 'unrelated',
    'positive', 'negative', 'neutral', 'beneficial', 'harmful'
  ];
  wrongOptions.push(...generalDistractors);
  
  // Shuffle and pick 3 unique wrong options
  const shuffled = wrongOptions.filter(opt => 
    opt.toLowerCase() !== correctAntonym.toLowerCase() && 
    opt.toLowerCase() !== word.toLowerCase() &&
    !wordData.antonyms.map(a => a.toLowerCase()).includes(opt.toLowerCase())
  );
  const uniqueWrong = [...new Set(shuffled)].sort(() => Math.random() - 0.5).slice(0, 3);
  
  if (uniqueWrong.length < 3) {
    return null; // Not enough options
  }
  
  // Create options array
  const options = [correctAntonym, ...uniqueWrong].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(correctAntonym);
  
  return {
    word: word,
    type: 'antonym',
    question: `Which word is an ANTONYM (opposite meaning) of "${word}"?`,
    hint: `Meaning: ${wordData.meaning.substring(0, 100)}...`,
    options: options,
    correctIndex: correctIndex
  };
}

// Generate a text completion question
function generateCompletionQuestion(word, wordData, allWords) {
  // Create a sentence with a blank
  const templates = [
    `The scholar's research was notably _____, demonstrating exceptional insight and thorough analysis.`,
    `Critics described the author's style as remarkably _____, setting it apart from contemporary works.`,
    `The committee's _____ approach to the problem earned praise from all stakeholders.`,
    `Her _____ behavior during the crisis revealed her true character and leadership abilities.`,
    `The politician's speech was surprisingly _____, affecting public opinion significantly.`,
    `The artist's work remained _____ throughout the decades, maintaining its original vision.`,
    `Despite the challenges, the team remained _____ in their pursuit of excellence.`,
    `The professor's lectures were consistently _____, engaging students with complex ideas.`,
    `The organization's _____ policies reflected modern understanding of social dynamics.`,
    `His _____ manner of speaking made even difficult concepts accessible to students.`
  ];
  
  const sentence = templates[Math.floor(Math.random() * templates.length)];
  
  // Get wrong options from other words
  const wrongOptions = allWords
    .filter(w => w.word !== word)
    .map(w => w.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  if (wrongOptions.length < 3) {
    return null; // Not enough words
  }
  
  // Create options array
  const options = [word, ...wrongOptions].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(word);
  
  return {
    word: word,
    type: 'completion',
    question: `Choose the word that best completes the sentence:`,
    sentence: sentence,
    hint: `Meaning: ${wordData.meaning.substring(0, 100)}...`,
    options: options,
    correctIndex: correctIndex
  };
}

// Enhanced adaptive quiz generation
router.get('/daily', async (req, res) => {
  try {
    const { type = 'mixed' } = req.query; // Quiz type from query
    
    const allWords = await words.getAll();
    
    if (allWords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No words in vocabulary yet. Add some words first!'
      });
    }

    if (allWords.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'You need at least 4 words in your vocabulary to take a quiz.'
      });
    }

    // Sort words by priority (weak words, recently wrong, new words, etc.)
    const sortedWords = allWords.sort((a, b) => {
      // Prioritize marked weak words
      if (a.markedWeak && !b.markedWeak) return -1;
      if (!a.markedWeak && b.markedWeak) return 1;
      
      // Then prioritize words with high error rate
      const aErrorRate = a.timesQuizzed > 0 ? a.timesWrong / a.timesQuizzed : 0;
      const bErrorRate = b.timesQuizzed > 0 ? b.timesWrong / b.timesQuizzed : 0;
      if (Math.abs(aErrorRate - bErrorRate) > 0.2) return bErrorRate - aErrorRate;
      
      // Then prioritize less practiced words
      return a.timesQuizzed - b.timesQuizzed;
    });

    // Select up to 10 words for quiz
    const quizWords = sortedWords.slice(0, Math.min(10, allWords.length));

    // Filter words that can be used for the selected quiz type
    let eligibleWords = [];
    
    if (type === 'synonym') {
      // Only include words with synonyms
      eligibleWords = quizWords.filter(w => w.synonyms && w.synonyms.length > 0);
      console.log(`📊 Synonym quiz: Found ${eligibleWords.length} words with synonyms out of ${quizWords.length} total`);
    } else if (type === 'antonym') {
      // Only include words with antonyms
      eligibleWords = quizWords.filter(w => w.antonyms && w.antonyms.length > 0);
      console.log(`📊 Antonym quiz: Found ${eligibleWords.length} words with antonyms out of ${quizWords.length} total`);
    } else {
      // For mixed, meaning, and completion - all words are eligible
      eligibleWords = quizWords;
    }

    // If not enough eligible words for the specific type, return error
    if ((type === 'synonym' || type === 'antonym') && eligibleWords.length < 4) {
      return res.status(400).json({
        success: false,
        message: `Not enough words with ${type}s in your vocabulary. You need at least 4 words with ${type}s. Currently you have: ${eligibleWords.length}. Try adding more words or choose a different quiz type.`
      });
    }

    // Use eligible words
    const wordsForQuiz = eligibleWords;
    const questions = [];

    // Generate questions based on type
    for (const wordData of wordsForQuiz) {
      let question = null;

      // Determine quiz type for this question
      let questionType = type;
      if (type === 'mixed') {
        // For mixed, try different types based on word availability
        const types = [];
        types.push('meaning'); // Always available
        if (wordData.synonyms && wordData.synonyms.length > 0) types.push('synonym');
        if (wordData.antonyms && wordData.antonyms.length > 0) types.push('antonym');
        types.push('completion'); // Always available
        questionType = types[Math.floor(Math.random() * types.length)];
      }

      console.log(`🎯 Generating ${questionType} question for word: ${wordData.word}`);

      // Generate question of the specified type
      try {
        switch (questionType) {
          case 'synonym':
            question = await generateSynonymQuestion(wordData.word, wordData, allWords);
            if (!question) {
              console.log(`⚠️ Failed to generate synonym question for ${wordData.word}`);
            }
            break;
          
          case 'antonym':
            question = await generateAntonymQuestion(wordData.word, wordData, allWords);
            if (!question) {
              console.log(`⚠️ Failed to generate antonym question for ${wordData.word}`);
            }
            break;
          
          case 'completion':
            question = generateCompletionQuestion(wordData.word, wordData, allWords);
            if (!question) {
              console.log(`⚠️ Failed to generate completion question for ${wordData.word}`);
            }
            break;
          
          case 'meaning':
          default:
            question = await generateQuizQuestion(wordData.word, wordData, allWords);
            if (!question) {
              console.log(`⚠️ Failed to generate meaning question for ${wordData.word}`);
            }
            break;
        }

        if (question) {
          console.log(`✅ Successfully generated ${question.type} question for ${wordData.word}`);
          questions.push(question);
        }
      } catch (error) {
        console.error(`❌ Error generating question for ${wordData.word}:`, error.message);
      }
    }

    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate quiz questions. Please try again or choose a different quiz type.'
      });
    }

    console.log(`✅ Generated ${questions.length} questions for ${type} quiz`);

    res.json({
      success: true,
      data: {
        quizType: type,
        questions: questions,
        totalQuestions: questions.length
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
});

// Submit quiz and update word stats
router.post('/submit', async (req, res) => {
  try {
    const { results } = req.body; // Array of {word, correct: boolean}
    
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz results'
      });
    }

    // Update each word's statistics
    for (const result of results) {
      const word = await words.findByWord(result.word);
      if (word) {
        word.timesQuizzed = (word.timesQuizzed || 0) + 1;
        if (!result.correct) {
          word.timesWrong = (word.timesWrong || 0) + 1;
        }
        word.updatedAt = new Date().toISOString();
        await words.update(word.id, word);
      }
    }

    // Save quiz attempt
    const correctCount = results.filter(r => r.correct).length;
    const totalCount = results.length;
    const score = Math.round((correctCount / totalCount) * 100);

    const quizAttempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: score,
      correctCount: correctCount,
      totalQuestions: totalCount,
      results: results
    };

    await quizAttempts.add(quizAttempt);

    res.json({
      success: true,
      data: {
        score: score,
        correctCount: correctCount,
        totalQuestions: totalCount,
        message: score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep practicing!'
      }
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

export default router;
