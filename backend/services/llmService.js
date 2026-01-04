import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Helper to check if definition is circular (uses the word itself)
function isCircularDefinition(word, definition) {
  const wordRoot = word.toLowerCase().slice(0, -3); // Remove common endings
  const defLower = definition.toLowerCase();
  
  // Check if definition contains the word or its root
  return defLower.includes(word.toLowerCase()) || 
         (wordRoot.length > 4 && defLower.includes(wordRoot));
}

// Helper function to get word from Free Dictionary API
async function getDictionaryData(word) {
  try {
    const response = await axios.get(`${DICTIONARY_API}${word.toLowerCase()}`);
    const data = response.data[0];
    
    if (!data || !data.meanings || data.meanings.length === 0) {
      return null;
    }

    // Collect ALL meanings (for comprehensive GRE prep)
    const allMeanings = [];
    const synonyms = [];
    const antonyms = [];
    
    data.meanings.forEach(meaning => {
      const partOfSpeech = meaning.partOfSpeech;
      
      meaning.definitions.forEach((def, idx) => {
        // Only include non-circular definitions
        if (!isCircularDefinition(word, def.definition) && idx < 2) {
          allMeanings.push({
            definition: def.definition,
            partOfSpeech: partOfSpeech,
            example: def.example || null
          });
        }
        
        if (def.synonyms) synonyms.push(...def.synonyms);
        if (def.antonyms) antonyms.push(...def.antonyms);
      });
      
      if (meaning.synonyms) synonyms.push(...meaning.synonyms);
      if (meaning.antonyms) antonyms.push(...meaning.antonyms);
    });

    // Remove duplicates and limit
    const uniqueSynonyms = [...new Set(synonyms)].slice(0, 5);
    const uniqueAntonyms = [...new Set(antonyms)].slice(0, 3);

    if (allMeanings.length === 0) {
      return null; // All definitions were circular, let AI handle it
    }

    // Combine multiple meanings if available
    const primaryMeaning = allMeanings[0];
    const secondaryMeaning = allMeanings[1];
    
    let combinedMeaning = primaryMeaning.definition;
    if (secondaryMeaning && secondaryMeaning.partOfSpeech !== primaryMeaning.partOfSpeech) {
      combinedMeaning += ` | As ${secondaryMeaning.partOfSpeech}: ${secondaryMeaning.definition}`;
    }

    return {
      meaning: combinedMeaning,
      synonyms: uniqueSynonyms,
      antonyms: uniqueAntonyms,
      example: primaryMeaning.example || null,
      partOfSpeech: primaryMeaning.partOfSpeech || 'unknown',
      hasMultipleMeanings: allMeanings.length > 1
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
    prompt = `You are a GRE vocabulary expert. For the word "${word}", create a sophisticated example sentence.

Word: ${word}
Part of Speech: ${dictionaryData.partOfSpeech}
Definition: ${dictionaryData.meaning}

Create a GRE-level example sentence that:
1. Uses "${word}" naturally in an academic/intellectual context
2. Clearly demonstrates the meaning through context clues
3. Is 15-25 words long
4. Resembles sentences from actual GRE reading comprehension passages
5. Shows the word in a realistic scenario (history, science, literature, philosophy, etc.)

GOOD EXAMPLES:
- "ameliorate": "The new economic policies helped ameliorate the dire conditions faced by small business owners during the recession."
- "ephemeral": "The artist's ice sculptures were deliberately ephemeral, designed to melt and disappear within hours of their creation."
- "pragmatic": "Rather than pursuing idealistic reforms, the senator adopted a pragmatic approach to healthcare legislation."

Now create ONE sophisticated sentence for "${word}".

Return ONLY valid JSON (no markdown, no code blocks):
{"example":"your sentence here","difficulty":"easy/medium/hard"}`;
  } else {
    // No dictionary data, AI creates everything
    prompt = `You are a GRE vocabulary expert. Create a complete, comprehensive entry for "${word}".

REQUIREMENTS:
1. Definition: Clear, non-circular (DON'T use the word itself), GRE-appropriate
2. If multiple meanings exist, include the most common ones separated by " | "
3. Synonyms: 3-5 accurate synonyms
4. Antonyms: 2-3 antonyms (if applicable)
5. Example: Sophisticated sentence (15-25 words) in academic context
6. Difficulty: Assess as easy/medium/hard for GRE students

AVOID:
- Circular definitions (don't use the word to define itself)
- Generic examples
- Overly simple language

Return ONLY valid JSON:
{"meaning":"clear, comprehensive definition","synonyms":["syn1","syn2","syn3","syn4"],"antonyms":["ant1","ant2"],"example":"Sophisticated academic sentence using ${word} naturally","difficulty":"medium"}`;
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a GRE vocabulary expert. You create clear, non-circular definitions and sophisticated example sentences. You respond ONLY with valid JSON. No markdown, no code blocks, no explanations - just pure JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 500
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
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate no circular definition
      if (parsed.meaning && isCircularDefinition(word, parsed.meaning)) {
        console.log('⚠️ AI returned circular definition, rejecting...');
        return null;
      }
      
      return parsed;
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

// Smart example generator for specific parts of speech (last resort only)
function generateSmartExample(word, partOfSpeech, meaning) {
  // Extract key concept from meaning
  const meaningWords = meaning.toLowerCase().split(' ').filter(w => w.length > 4);
  const concept = meaningWords[0] || 'quality';
  
  const examples = {
    'noun': [
      `The ${word} evident in the historical documents provided scholars with valuable insights into the era.`,
      `Researchers have long debated the nature and implications of ${word} in contemporary society.`,
      `The concept of ${word} plays a crucial role in understanding this philosophical framework.`
    ],
    'verb': [
      `Effective leaders must ${word} carefully to address the complex challenges facing their organizations.`,
      `The study examined how different cultures ${word} in response to similar environmental pressures.`,
      `To ${word} successfully requires both theoretical knowledge and practical experience.`
    ],
    'adjective': [
      `The ${word} characteristics of the material made it ideal for industrial applications.`,
      `Critics praised the author's ${word} approach to exploring these controversial themes.`,
      `The ${word} nature of the evidence presented made it difficult to draw definitive conclusions.`
    ],
    'adverb': [
      `The committee members debated ${word}, considering all possible implications of their decision.`,
      `She approached the complex problem ${word}, demonstrating both skill and patience.`,
      `The professor explained the theory ${word}, ensuring all students grasped the key concepts.`
    ]
  };
  
  const exampleSet = examples[partOfSpeech] || examples['noun'];
  return exampleSet[Math.floor(Math.random() * exampleSet.length)];
}

export async function enrichWord(word) {
  console.log(`\n🔍 Enriching word: "${word}"`);
  
  // Step 1: Try Dictionary API first (fast, reliable, free)
  console.log('📚 Checking dictionary...');
  const dictionaryData = await getDictionaryData(word);
  
  if (dictionaryData) {
    console.log('✅ Found in dictionary!');
    
    // Check if definition is circular
    if (isCircularDefinition(word, dictionaryData.meaning)) {
      console.log('⚠️ Circular definition detected, using AI for better definition...');
      const aiData = await enhanceWithAI(word, null);
      
      if (aiData && aiData.meaning && !isCircularDefinition(word, aiData.meaning)) {
        return {
          meaning: aiData.meaning,
          synonyms: aiData.synonyms || dictionaryData.synonyms,
          antonyms: aiData.antonyms || dictionaryData.antonyms,
          example: aiData.example || generateSmartExample(word, dictionaryData.partOfSpeech, aiData.meaning),
          difficulty: aiData.difficulty || determineDifficulty(word, aiData.meaning)
        };
      }
    }
    
    // If dictionary has example, we're good
    if (dictionaryData.example && dictionaryData.example.length > 20) {
      return {
        meaning: dictionaryData.meaning,
        synonyms: dictionaryData.synonyms,
        antonyms: dictionaryData.antonyms,
        example: dictionaryData.example,
        difficulty: determineDifficulty(word, dictionaryData.meaning)
      };
    }
    
    // Dictionary lacks good example, enhance with AI
    console.log('🤖 Enhancing with AI for better example...');
    const aiEnhancement = await enhanceWithAI(word, dictionaryData);
    
    if (aiEnhancement && aiEnhancement.example && aiEnhancement.example.length > 20) {
      return {
        meaning: dictionaryData.meaning,
        synonyms: dictionaryData.synonyms,
        antonyms: dictionaryData.antonyms,
        example: aiEnhancement.example,
        difficulty: aiEnhancement.difficulty || determineDifficulty(word, dictionaryData.meaning)
      };
    }
    
    // Use smart example generator as last resort
    return {
      meaning: dictionaryData.meaning,
      synonyms: dictionaryData.synonyms,
      antonyms: dictionaryData.antonyms,
      example: generateSmartExample(word, dictionaryData.partOfSpeech, dictionaryData.meaning),
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
  
  // Step 3: Everything failed, return better fallback
  console.log('⚠️ Using fallback data');
  return {
    meaning: `A GRE-level vocabulary word (complete definition temporarily unavailable - please check spelling and try again)`,
    synonyms: [],
    antonyms: [],
    example: `Mastering words like "${word}" requires understanding both their denotative meanings and connotative implications in academic contexts.`,
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
