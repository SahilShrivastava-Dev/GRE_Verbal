import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const WORDS_FILE = path.join(DB_DIR, 'words.json');
const QUIZ_ATTEMPTS_FILE = path.join(DB_DIR, 'quiz_attempts.json');

// Check if running on Vercel with Google Drive
const isVercel = !!process.env.VERCEL;
const GDRIVE_WORDS_URL = process.env.GDRIVE_WORDS_URL;
const GDRIVE_QUIZ_URL = process.env.GDRIVE_QUIZ_URL;

// In-memory cache to avoid too many Drive requests
let wordsCache = null;
let wordsCacheTime = 0;
let quizCache = null;
let quizCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Initialize database directory and files (local development only)
function initDatabase() {
  if (isVercel) return; // Skip for Vercel
  
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

// Read data from Google Drive or local file
async function readData(filename) {
  try {
    const isWords = filename.includes('words');
    
    if (isVercel && isWords && GDRIVE_WORDS_URL) {
      // Check cache first
      const now = Date.now();
      if (wordsCache && (now - wordsCacheTime) < CACHE_DURATION) {
        console.log('📦 Using cached words data');
        return wordsCache;
      }
      
      try {
        console.log('☁️ Fetching words from Google Drive...');
        const response = await axios.get(GDRIVE_WORDS_URL, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const data = response.data;
        
        // Update cache
        wordsCache = data;
        wordsCacheTime = now;
        
        console.log(`✅ Loaded ${data.length} words from Google Drive`);
        return data;
      } catch (error) {
        console.error('❌ Error fetching from Google Drive:', error.message);
        
        // Fallback to local file if Drive fails
        if (fs.existsSync(filename)) {
          console.log('📁 Falling back to local file');
          const localData = JSON.parse(fs.readFileSync(filename, 'utf8'));
          wordsCache = localData;
          wordsCacheTime = now;
          return localData;
        }
        
        // Return cached data if available
        if (wordsCache) {
          console.log('📦 Using stale cached data');
          return wordsCache;
        }
        
        return [];
      }
    } else if (isVercel && !isWords && GDRIVE_QUIZ_URL) {
      // Quiz attempts from Google Drive
      const now = Date.now();
      if (quizCache && (now - quizCacheTime) < CACHE_DURATION) {
        return quizCache;
      }
      
      try {
        const response = await axios.get(GDRIVE_QUIZ_URL, { timeout: 10000 });
        quizCache = response.data;
        quizCacheTime = now;
        return response.data;
      } catch (error) {
        console.error('Error fetching quiz data from Drive:', error.message);
        if (quizCache) return quizCache;
        return [];
      }
    } else {
      // Local development - use filesystem
      if (!fs.existsSync(filename)) {
        return [];
      }
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Write data to Google Drive or local file
async function writeData(filename, data) {
  try {
    const isWords = filename.includes('words');
    
    if (isVercel && isWords && GDRIVE_WORDS_URL) {
      // For Google Drive, we can't write directly
      // Instead, we'll update the cache and log a message
      console.log('⚠️ Google Drive is read-only from backend. Please update the file manually in Google Drive.');
      console.log('💡 Updated data (copy this to your Google Drive file):');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
      
      // Update cache so reads work immediately
      wordsCache = data;
      wordsCacheTime = Date.now();
      
      // Also save to local file as backup
      if (fs.existsSync(WORDS_FILE)) {
        fs.writeFileSync(WORDS_FILE, JSON.stringify(data, null, 2));
      }
      
      return true;
    } else if (isVercel && !isWords && GDRIVE_QUIZ_URL) {
      // Same for quiz data
      quizCache = data;
      quizCacheTime = Date.now();
      if (fs.existsSync(QUIZ_ATTEMPTS_FILE)) {
        fs.writeFileSync(QUIZ_ATTEMPTS_FILE, JSON.stringify(data, null, 2));
      }
      return true;
    } else {
      // Local development - use filesystem
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      return true;
    }
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    return false;
  }
}

// Words Database Operations
export const WordsDB = {
  getAll: async () => await readData(WORDS_FILE),
  
  findByWord: async (word) => {
    const words = await readData(WORDS_FILE);
    return words.find(w => w.word.toLowerCase() === word.toLowerCase());
  },
  
  search: async (query) => {
    const words = await readData(WORDS_FILE);
    const lowerQuery = query.toLowerCase();
    return words.filter(w => 
      w.word.toLowerCase().includes(lowerQuery) ||
      w.meaning.toLowerCase().includes(lowerQuery)
    );
  },
  
  add: async (wordData) => {
    const words = await readData(WORDS_FILE);
    
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
    await writeData(WORDS_FILE, words);
    
    // Clear cache to force refresh on next read
    wordsCache = words;
    wordsCacheTime = Date.now();
    
    return newWord;
  },
  
  update: async (id, updates) => {
    const words = await readData(WORDS_FILE);
    const index = words.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error('Word not found');
    }
    
    words[index] = {
      ...words[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(WORDS_FILE, words);
    
    // Update cache
    wordsCache = words;
    wordsCacheTime = Date.now();
    
    return words[index];
  },
  
  updateStats: async (wordId, isCorrect) => {
    const words = await readData(WORDS_FILE);
    const index = words.findIndex(w => w.id === wordId);
    
    if (index !== -1) {
      words[index].timesQuizzed = (words[index].timesQuizzed || 0) + 1;
      if (!isCorrect) {
        words[index].timesWrong = (words[index].timesWrong || 0) + 1;
      }
      words[index].updatedAt = new Date().toISOString();
      await writeData(WORDS_FILE, words);
      
      // Update cache
      wordsCache = words;
      wordsCacheTime = Date.now();
    }
  },
  
  delete: async (id) => {
    const words = await readData(WORDS_FILE);
    const filtered = words.filter(w => w.id !== id);
    await writeData(WORDS_FILE, filtered);
    
    // Update cache
    wordsCache = filtered;
    wordsCacheTime = Date.now();
    
    return filtered.length < words.length;
  },
  
  // Helper to manually refresh cache
  clearCache: () => {
    wordsCache = null;
    wordsCacheTime = 0;
    console.log('🔄 Words cache cleared');
  }
};

// Quiz Attempts Database Operations
export const QuizAttemptsDB = {
  getAll: async () => await readData(QUIZ_ATTEMPTS_FILE),
  
  add: async (attemptData) => {
    const attempts = await readData(QUIZ_ATTEMPTS_FILE);
    
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
    await writeData(QUIZ_ATTEMPTS_FILE, attempts);
    
    // Update cache
    quizCache = attempts;
    quizCacheTime = Date.now();
    
    return newAttempt;
  },
  
  getRecent: async (limit = 10) => {
    const attempts = await readData(QUIZ_ATTEMPTS_FILE);
    return attempts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  },
  
  clearCache: () => {
    quizCache = null;
    quizCacheTime = 0;
  }
};

// Initialize on module load
initDatabase();

// Export with both naming conventions for compatibility
export const words = WordsDB;
export const quizAttempts = QuizAttemptsDB;
export default { WordsDB, QuizAttemptsDB, words: WordsDB, quizAttempts: QuizAttemptsDB };

