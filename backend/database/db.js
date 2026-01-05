import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { put, head } from '@vercel/blob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const WORDS_FILE = path.join(DB_DIR, 'words.json');
const QUIZ_ATTEMPTS_FILE = path.join(DB_DIR, 'quiz_attempts.json');

// Check if running on Vercel
const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;
const WORDS_BLOB_PATH = 'words.json';
const QUIZ_BLOB_PATH = 'quiz_attempts.json';

// Debug logging
console.log('🔧 Database Config:', {
  isVercel,
  hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length,
  wordsPath: WORDS_BLOB_PATH
});

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

// Read data from Vercel Blob or local file
async function readData(filename) {
  try {
    if (isVercel) {
      // Use Vercel Blob
      const blobPath = filename.includes('words') ? WORDS_BLOB_PATH : QUIZ_BLOB_PATH;
      
      try {
        // Try to list blobs to find ours
        const { list } = await import('@vercel/blob');
        const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
        const existingBlob = blobs.find(b => b.pathname === blobPath);
        
        if (existingBlob) {
          // Fetch blob content
          console.log(`📖 Reading from Blob: ${existingBlob.url}`);
          const response = await fetch(existingBlob.url);
          const data = await response.json();
          console.log(`✅ Blob read successful: ${data.length} items`);
          return data;
        } else {
          // If blob doesn't exist, initialize from local file
          console.log(`Blob ${blobPath} not found, initializing from local file...`);
          const localData = fs.existsSync(filename) 
            ? JSON.parse(fs.readFileSync(filename, 'utf8')) 
            : [];
          
          // Upload to blob
          await writeData(filename, localData);
          return localData;
        }
      } catch (error) {
        console.error(`Error accessing blob ${blobPath}:`, error);
        // Fallback to local file if available
        if (fs.existsSync(filename)) {
          console.log(`Falling back to local file: ${filename}`);
          return JSON.parse(fs.readFileSync(filename, 'utf8'));
        }
        return [];
      }
    } else {
      // Local development - use filesystem
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Write data to Vercel Blob or local file
async function writeData(filename, data) {
  try {
    if (isVercel) {
      // Use Vercel Blob
      const blobPath = filename.includes('words') ? WORDS_BLOB_PATH : QUIZ_BLOB_PATH;
      const jsonString = JSON.stringify(data, null, 2);
      
      console.log(`📝 Writing to Blob: ${blobPath}, items: ${data.length}`);
      
      const result = await put(blobPath, jsonString, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: 'application/json'
      });
      
      console.log(`✅ Blob write successful: ${result.url}`);
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
    }
  },
  
  delete: async (id) => {
    const words = await readData(WORDS_FILE);
    const filtered = words.filter(w => w.id !== id);
    await writeData(WORDS_FILE, filtered);
    return filtered.length < words.length;
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
    return newAttempt;
  },
  
  getRecent: async (limit = 10) => {
    const attempts = await readData(QUIZ_ATTEMPTS_FILE);
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

