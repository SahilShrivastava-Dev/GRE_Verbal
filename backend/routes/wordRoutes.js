import express from 'express';
import { WordsDB } from '../database/db.js';
import { enrichWord } from '../services/llmService.js';

const router = express.Router();

// Get all words
router.get('/all', (req, res) => {
  try {
    const words = WordsDB.getAll();
    res.json({
      success: true,
      data: words,
      count: words.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching words',
      error: error.message
    });
  }
});

// Search words
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = WordsDB.search(query);
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching words',
      error: error.message
    });
  }
});

// Add new word with LLM enrichment
router.post('/add', async (req, res) => {
  try {
    const { word } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Word is required'
      });
    }

    // Check if word already exists
    const existing = WordsDB.findByWord(word);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `The word "${word}" is already in your vocabulary! Added on ${new Date(existing.dateAdded).toLocaleDateString()}`,
        data: existing,
        hint: 'You can view it in the Vocabulary List page or try adding a different word form (e.g., if you added "trifle", you could add "trifling")'
      });
    }

    // Enrich word using LLM
    console.log(`Enriching word: ${word}`);
    const enrichedData = await enrichWord(word.trim());

    // Save to database
    const newWord = WordsDB.add({
      word: word.trim(),
      ...enrichedData
    });

    res.status(201).json({
      success: true,
      message: 'Word added successfully',
      data: newWord
    });
  } catch (error) {
    console.error('Error adding word:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding word',
      error: error.message
    });
  }
});

// Update word (mark as weak, etc.)
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedWord = WordsDB.update(id, updates);
    
    res.json({
      success: true,
      message: 'Word updated successfully',
      data: updatedWord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating word',
      error: error.message
    });
  }
});

// Delete word
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = WordsDB.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: 'Word deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting word',
      error: error.message
    });
  }
});

// Get statistics
router.get('/stats', (req, res) => {
  try {
    const words = WordsDB.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalWords: words.length,
      wordsToday: words.filter(w => new Date(w.dateAdded) >= today).length,
      weakWords: words.filter(w => w.markedWeak || (w.timesQuizzed > 0 && (w.timesWrong / w.timesQuizzed) > 0.5)).length,
      averageAccuracy: words.length > 0
        ? Math.round((words.reduce((sum, w) => sum + (w.timesQuizzed > 0 ? ((w.timesQuizzed - w.timesWrong) / w.timesQuizzed) : 1), 0) / words.length) * 100)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

export default router;

