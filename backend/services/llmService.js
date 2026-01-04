import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Helper function to get word from Free Dictionary API
async function getDictionaryData(word) {
  try {
    const response = await axios.get(`${DICTIONARY_API}${word.toLowerCase()}`);
    const data = response.data[0];
    
    if (!data || !data.meanings || data.meanings.length === 0) {
      return null;
    }

    // Extract first definition
    const firstMeaning = data.meanings[0];
    const definition = firstMeaning.definitions[0];
    
    // Get synonyms and antonyms
    const synonyms = [];
    const antonyms = [];
    
    data.meanings.forEach(meaning => {
      meaning.definitions.forEach(def => {
        if (def.synonyms) synonyms.push(...def.synonyms);
        if (def.antonyms) antonyms.push(...def.antonyms);
      });
      if (meaning.synonyms) synonyms.push(...meaning.synonyms);
      if (meaning.antonyms) antonyms.push(...meaning.antonyms);
    });

    // Remove duplicates and limit
    const uniqueSynonyms = [...new Set(synonyms)].slice(0, 5);
    const uniqueAntonyms = [...new Set(antonyms)].slice(0, 3);

    return {
      meaning: definition.definition,
      synonyms: uniqueSynonyms,
      antonyms: uniqueAntonyms,
      example: definition.example || null,
      partOfSpeech: firstMeaning.partOfSpeech || 'unknown'
    };
  } catch (error) {
    console.log(`Dictionary API: Word "${word}" not found, trying AI...`);
    return null;
  }
}

// Helper function to use AI to enhance dictionary data or create from scratch
async function enhanceWithAI(word, dictionaryData = null) {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  let prompt;
  
  if (dictionaryData && dictionaryData.example) {
    // Dictionary has good data, just return it
    return null;
  } else if (dictionaryData) {
    // Dictionary has definition but needs better example
    prompt = `For the word "${word}" with definition "${dictionaryData.meaning}", create a GRE-style example sentence that uses the word in context. Also classify difficulty as easy, medium, or hard.

Return ONLY valid JSON:
{"example":"your sentence here","difficulty":"medium"}`;
  } else {
    // No dictionary data, AI creates everything
    prompt = `You are a GRE vocabulary expert. For the word "${word}", provide a complete entry:

Return ONLY valid JSON in this format:
{"meaning":"clear GRE-level definition","synonyms":["syn1","syn2","syn3"],"antonyms":["ant1","ant2"],"example":"GRE-style sentence using the word","difficulty":"easy/medium/hard"}`;
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You respond only with valid JSON. No markdown, no code blocks, just pure JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'GRE Vocab Builder'
        }
      }
    );

    let content = response.data.choices[0].message.content.trim();
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('AI Enhancement Error:', error.message);
  }
  
  return null;
}

// Helper function to determine difficulty
function determineDifficulty(word, meaning) {
  const wordLength = word.length;
  const meaningLength = meaning.split(' ').length;
  
  // Simple heuristic
  if (wordLength <= 6 && meaningLength <= 10) return 'easy';
  if (wordLength >= 10 || meaningLength >= 15) return 'hard';
  return 'medium';
}

export async function enrichWord(word) {
  console.log(`\n🔍 Enriching word: "${word}"`);
  
  // Step 1: Try Dictionary API first (fast, reliable, free)
  console.log('📚 Checking dictionary...');
  const dictionaryData = await getDictionaryData(word);
  
  if (dictionaryData) {
    console.log('✅ Found in dictionary!');
    
    // If dictionary has example, we're good
    if (dictionaryData.example) {
      return {
        meaning: dictionaryData.meaning,
        synonyms: dictionaryData.synonyms,
        antonyms: dictionaryData.antonyms,
        example: dictionaryData.example,
        difficulty: determineDifficulty(word, dictionaryData.meaning)
      };
    }
    
    // Dictionary lacks example, enhance with AI
    console.log('🤖 Enhancing with AI for better example...');
    const aiEnhancement = await enhanceWithAI(word, dictionaryData);
    
    if (aiEnhancement && aiEnhancement.example) {
      return {
        meaning: dictionaryData.meaning,
        synonyms: dictionaryData.synonyms,
        antonyms: dictionaryData.antonyms,
        example: aiEnhancement.example,
        difficulty: aiEnhancement.difficulty || determineDifficulty(word, dictionaryData.meaning)
      };
    }
    
    // AI failed, use dictionary data with generated example
    return {
      meaning: dictionaryData.meaning,
      synonyms: dictionaryData.synonyms,
      antonyms: dictionaryData.antonyms,
      example: `The ${dictionaryData.partOfSpeech} "${word}" can be used in a GRE-style sentence.`,
      difficulty: determineDifficulty(word, dictionaryData.meaning)
    };
  }
  
  // Step 2: Dictionary failed, try AI completely
  console.log('🤖 Not in dictionary, using AI...');
  const aiData = await enhanceWithAI(word, null);
  
  if (aiData && aiData.meaning && aiData.example) {
    console.log('✅ AI generated complete data!');
    return {
      meaning: aiData.meaning,
      synonyms: aiData.synonyms || [],
      antonyms: aiData.antonyms || [],
      example: aiData.example,
      difficulty: aiData.difficulty || 'medium'
    };
  }
  
  // Step 3: Everything failed, return basic fallback
  console.log('⚠️ Using fallback data');
  return {
    meaning: `A word used in GRE vocabulary context (sources temporarily unavailable)`,
    synonyms: [],
    antonyms: [],
    example: `The word "${word}" is commonly used in academic writing.`,
    difficulty: 'medium'
  };
}

export async function generateQuizQuestion(word, wordData, allWords) {
  if (!OPENROUTER_API_KEY) {
    // Fallback to basic question generation
    return generateBasicQuizQuestion(word, wordData, allWords);
  }

  const prompt = `You are a GRE test creator. Create a challenging multiple-choice question for the word "${word}".

CORRECT DEFINITION: ${wordData.meaning}

Create 3 PLAUSIBLE but INCORRECT options that:
- Sound academic and sophisticated (GRE-level language)
- Are similar enough to be confusing but clearly wrong
- Use different word patterns (not just synonyms)
- Test real understanding, not just memorization

Example of GOOD distractors:
Word: "ameliorate" (to make better)
✓ Good distractors: "to make worse gradually", "to remain unchanged over time", "to create confusion"
✗ Bad distractors: "to destroy", "a type of food", "number"

Return ONLY valid JSON with the question and 4 shuffled options:
{"question":"What does '${word}' mean?","options":["option1","option2","option3","option4"],"correctIndex":2}

Make sure correctIndex points to: "${wordData.meaning}"`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a GRE test creator. Generate challenging, realistic multiple-choice questions. Always return pure JSON, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'GRE Vocab Builder'
        }
      }
    );

    let content = response.data.choices[0].message.content.trim();
    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Validate that we have 4 unique options
      if (questionData.options && questionData.options.length === 4) {
        const uniqueOptions = [...new Set(questionData.options)];
        if (uniqueOptions.length === 4) {
          return {
            word: word,
            question: questionData.question,
            options: questionData.options,
            correctIndex: questionData.correctIndex
          };
        }
      }
    }
  } catch (error) {
    console.error('AI Quiz generation error:', error.message);
  }

  // Fallback to improved basic generation
  console.log(`Using improved fallback for ${word}`);
  return generateImprovedQuizQuestion(word, wordData, allWords);
}

// Improved fallback with better distractor generation
function generateImprovedQuizQuestion(word, wordData, allWords) {
  const otherWords = allWords.filter(w => w.word !== word);
  
  // Try to get distractors from words with similar difficulty
  let distractors = otherWords
    .filter(w => w.difficulty === wordData.difficulty)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(w => w.meaning);
  
  // If not enough, get from any other words
  if (distractors.length < 3) {
    const additionalDistractors = otherWords
      .filter(w => !distractors.includes(w.meaning))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 - distractors.length)
      .map(w => w.meaning);
    distractors.push(...additionalDistractors);
  }
  
  // If still not enough, create smart generic distractors
  const genericDistractors = [
    'to make less effective or diminish gradually',
    'relating to or characterized by complexity',
    'showing lack of proper consideration or care',
    'having an excessively elevated opinion',
    'characterized by a lack of clarity or precision',
    'to express disapproval or criticism strongly'
  ];
  
  while (distractors.length < 3) {
    const generic = genericDistractors[Math.floor(Math.random() * genericDistractors.length)];
    if (!distractors.includes(generic) && generic !== wordData.meaning) {
      distractors.push(generic);
    }
  }

  // Ensure unique distractors
  distractors = [...new Set(distractors)].slice(0, 3);

  const options = [wordData.meaning, ...distractors].sort(() => Math.random() - 0.5);
  const correctIndex = options.indexOf(wordData.meaning);

  return {
    word: word,
    question: `What does '${word}' mean?`,
    options: options,
    correctIndex: correctIndex
  };
}

// Keep old basic function for emergency fallback only
function generateBasicQuizQuestion(word, wordData, allWords) {
  return generateImprovedQuizQuestion(word, wordData, allWords);
}

