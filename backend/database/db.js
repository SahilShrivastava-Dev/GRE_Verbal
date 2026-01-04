import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const WORDS_FILE = path.join(DB_DIR, 'words.json');
const QUIZ_ATTEMPTS_FILE = path.join(DB_DIR, 'quiz_attempts.json');

// Initialize database directory and files
function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(WORDS_FILE)) {
    fs.writeFileSync(WORDS_FILE, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(QUIZ_ATTEMPTS_FILE)) {
    fs.writeFileSync(QUIZ_ATTEMPTS_FILE, JSON.stringify([], null, 2));
  }
}

// Read data from JSON file
function readData(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Write data to JSON file
function writeData(filename, data) {
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    return false;
  }
}

// Words Database Operations
export const WordsDB = {
  getAll: () => readData(WORDS_FILE),
  
  findByWord: (word) => {
    const words = readData(WORDS_FILE);
    return words.find(w => w.word.toLowerCase() === word.toLowerCase());
  },
  
  search: (query) => {
    const words = readData(WORDS_FILE);
    const lowerQuery = query.toLowerCase();
    return words.filter(w => 
      w.word.toLowerCase().includes(lowerQuery) ||
      w.meaning.toLowerCase().includes(lowerQuery)
    );
  },
  
  add: (wordData) => {
    const words = readData(WORDS_FILE);
    
    // Check if word already exists
    const exists = words.find(w => w.word.toLowerCase() === wordData.word.toLowerCase());
    if (exists) {
      throw new Error('Word already exists');
    }
    
    const newWord = {
      id: Date.now().toString(),
      word: wordData.word.toLowerCase().trim(),
      meaning: wordData.meaning,
      synonyms: wordData.synonyms || [],
      antonyms: wordData.antonyms || [],
      example: wordData.example,
      difficulty: wordData.difficulty || 'medium',
      timesQuizzed: 0,
      timesWrong: 0,
      markedWeak: false,
      dateAdded: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    words.push(newWord);
    writeData(WORDS_FILE, words);
    return newWord;
  },
  
  update: (id, updates) => {
    const words = readData(WORDS_FILE);
    const index = words.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error('Word not found');
    }
    
    words[index] = {
      ...words[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    writeData(WORDS_FILE, words);
    return words[index];
  },
  
  updateStats: (wordId, isCorrect) => {
    const words = readData(WORDS_FILE);
    const index = words.findIndex(w => w.id === wordId);
    
    if (index !== -1) {
      words[index].timesQuizzed = (words[index].timesQuizzed || 0) + 1;
      if (!isCorrect) {
        words[index].timesWrong = (words[index].timesWrong || 0) + 1;
      }
      words[index].updatedAt = new Date().toISOString();
      writeData(WORDS_FILE, words);
    }
  },
  
  delete: (id) => {
    const words = readData(WORDS_FILE);
    const filtered = words.filter(w => w.id !== id);
    writeData(WORDS_FILE, filtered);
    return filtered.length < words.length;
  }
};

// Quiz Attempts Database Operations
export const QuizAttemptsDB = {
  getAll: () => readData(QUIZ_ATTEMPTS_FILE),
  
  add: (attemptData) => {
    const attempts = readData(QUIZ_ATTEMPTS_FILE);
    
    const newAttempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      questions: attemptData.questions,
      score: attemptData.score,
      totalQuestions: attemptData.totalQuestions,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    attempts.push(newAttempt);
    writeData(QUIZ_ATTEMPTS_FILE, attempts);
    return newAttempt;
  },
  
  getRecent: (limit = 10) => {
    const attempts = readData(QUIZ_ATTEMPTS_FILE);
    return attempts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
};

// Initialize on module load
initDatabase();

// Export with both naming conventions for compatibility
export const words = WordsDB;
export const quizAttempts = QuizAttemptsDB;
export default { WordsDB, QuizAttemptsDB, words: WordsDB, quizAttempts: QuizAttemptsDB };

