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
    // Dictionary has good data, check if definition needs expansion
    const definitionLength = dictionaryData.meaning.split(' ').length;
    if (definitionLength < 15) {
      // Definition too short, enhance it
      return null; // Will trigger enhancement
    }
    return null; // Good definition and example, no enhancement needed
  } else if (dictionaryData) {
    // Dictionary has definition but needs enhancement
    const isShortDefinition = dictionaryData.meaning.split(' ').length < 15;
    
    if (isShortDefinition) {
      // Definition is too short, expand it + add example
      prompt = `You are a GRE vocabulary expert. Enhance the definition for "${word}" to make it more comprehensive like Google Dictionary.

Word: ${word}
Part of Speech: ${dictionaryData.partOfSpeech}
Current Definition: ${dictionaryData.meaning}

Task 1 - EXPAND THE DEFINITION (20-40 words):
- Keep the core meaning but add depth and context
- Explain nuances and usage
- Make it educational and comprehensive like Google Dictionary
- DON'T use the word itself

Task 2 - CREATE EXAMPLE:
- Sophisticated GRE-level sentence (15-25 words)
- Academic/intellectual context
- Natural usage

EXAMPLE OF EXPANSION:
Short: "pragmatic: dealing with things practically"
Expanded: "pragmatic: dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations; focusing on achieving concrete results through efficient means"

Return ONLY valid JSON:
{"meaning":"EXPANDED comprehensive definition (20-40 words)","example":"sophisticated sentence here","difficulty":"easy/medium/hard"}`;
    } else {
      // Definition is good, just need example
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
    }
  } else {
    // No dictionary data, AI creates everything
    prompt = `You are a GRE vocabulary expert. Create a complete, comprehensive entry for "${word}" in the style of Google Dictionary.

REQUIREMENTS FOR DEFINITION:
- Write a DETAILED, COMPREHENSIVE definition (20-40 words minimum)
- Explain the concept fully, don't just give a short synonym
- Include nuances, connotations, and usage context
- Be clear and educational, like explaining to a GRE student
- DON'T use the word itself in the definition (no circular logic)

EXAMPLE OF GOOD DEFINITIONS (like Google):
❌ BAD: "ephemeral: lasting briefly"
✅ GOOD: "ephemeral: lasting for a very short time; transient and fleeting in nature, often used to describe things that exist only temporarily before disappearing or fading away"

❌ BAD: "ameliorate: to improve"
✅ GOOD: "ameliorate: to make something bad or unsatisfactory better or more tolerable; to improve a situation or condition that was previously problematic or difficult"

❌ BAD: "pragmatic: practical approach"
✅ GOOD: "pragmatic: dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations; focusing on achieving results rather than following abstract principles"

Now create for "${word}":
- Synonyms: 3-5 accurate synonyms
- Antonyms: 2-3 antonyms (if applicable)
- Example: Sophisticated sentence (15-25 words) in academic context
- Difficulty: easy/medium/hard for GRE students

Return ONLY valid JSON:
{"meaning":"DETAILED comprehensive definition like Google Dictionary (20-40 words)","synonyms":["syn1","syn2","syn3","syn4"],"antonyms":["ant1","ant2"],"example":"Sophisticated academic sentence","difficulty":"medium"}`;
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
  // Create contextual examples based on part of speech
  const examples = {
    'noun': [
      `The study of ${word} has become increasingly important in contemporary academic discourse and research.`,
      `Historical analysis reveals that ${word} played a significant role in shaping cultural developments during this period.`,
      `Understanding the concept of ${word} is essential for comprehending the broader theoretical framework.`,
      `The prevalence of ${word} in modern society has prompted scholars to reassess traditional assumptions.`,
      `Philosophers have long debated the true nature and implications of ${word} in ethical considerations.`
    ],
    'verb': [
      `Successful practitioners must learn to ${word} effectively when confronting complex professional challenges.`,
      `The research team attempted to ${word} systematically, following rigorous methodological protocols throughout the investigation.`,
      `Leaders who ${word} judiciously tend to achieve better outcomes than those who act impulsively.`,
      `The ability to ${word} appropriately requires both extensive training and considerable practical experience.`,
      `Scientists ${word} cautiously when dealing with sensitive experimental data that could affect public policy.`
    ],
    'adjective': [
      `Her ${word} approach to problem-solving impressed colleagues and earned widespread professional recognition.`,
      `The committee's ${word} decision reflected careful consideration of all available evidence and expert testimony.`,
      `Critics described the author's narrative style as distinctly ${word}, setting it apart from conventional approaches.`,
      `The ${word} quality of the argument made it particularly compelling to academic audiences.`,
      `Researchers noted the ${word} pattern emerging from the data, which contradicted previous theoretical predictions.`
    ],
    'adverb': [
      `She spoke ${word} during the conference, articulating her position with remarkable clarity and precision.`,
      `The attorney argued ${word}, presenting evidence that systematically dismantled the opposition's claims.`,
      `Participants responded ${word} to the survey questions, providing researchers with valuable insights.`,
      `The professor lectured ${word}, ensuring that students comprehended the complex theoretical concepts.`,
      `He approached the delicate negotiation ${word}, demonstrating both tact and diplomatic skill.`
    ]
  };
  
  // Select appropriate example set based on part of speech
  let exampleSet = examples[partOfSpeech];
  if (!exampleSet) {
    exampleSet = examples['adjective']; // Default to adjective as most versatile
  }
  
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
    
    // Dictionary lacks good example OR has short definition, enhance with AI
    console.log('🤖 Enhancing with AI for better content...');
    const aiEnhancement = await enhanceWithAI(word, dictionaryData);
    
    if (aiEnhancement) {
      // Use AI-enhanced definition if provided and longer
      const finalMeaning = (aiEnhancement.meaning && aiEnhancement.meaning.split(' ').length > 15)
        ? aiEnhancement.meaning
        : dictionaryData.meaning;
      
      const finalExample = (aiEnhancement.example && aiEnhancement.example.length > 20)
        ? aiEnhancement.example
        : generateSmartExample(word, dictionaryData.partOfSpeech, finalMeaning);
      
      return {
        meaning: finalMeaning,
        synonyms: dictionaryData.synonyms,
        antonyms: dictionaryData.antonyms,
        example: finalExample,
        difficulty: aiEnhancement.difficulty || determineDifficulty(word, finalMeaning)
      };
    }
    
    // Use smart example generator as last resort
    console.log('⚠️ Using smart template for example...');
    const smartExample = generateSmartExample(word, dictionaryData.partOfSpeech, dictionaryData.meaning);
    
    return {
      meaning: dictionaryData.meaning,
      synonyms: dictionaryData.synonyms,
      antonyms: dictionaryData.antonyms,
      example: smartExample,
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
  
  // Create a more intelligent fallback
  const fallbackExamples = [
    `The term "${word}" frequently appears in advanced academic texts and standardized test materials.`,
    `Scholars have extensively analyzed the usage and implications of "${word}" in contemporary discourse.`,
    `Understanding "${word}" requires careful consideration of both its literal meaning and contextual applications.`,
    `The concept represented by "${word}" plays an important role in various academic disciplines.`,
    `Mastery of terms like "${word}" significantly enhances one's performance on graduate-level examinations.`
  ];
  
  return {
    meaning: `An advanced vocabulary term commonly found in GRE materials (detailed definition temporarily unavailable - please verify spelling or try again)`,
    synonyms: [],
    antonyms: [],
    example: fallbackExamples[Math.floor(Math.random() * fallbackExamples.length)],
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

// AI-powered synonym options generator
export async function generateSynonymOptions(word, wordData, correctSynonym) {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  const prompt = `You are a GRE vocabulary expert. Generate 3 PLAUSIBLE but INCORRECT synonym options for the word "${word}".

Word: "${word}"
Correct Synonym: "${correctSynonym}"
Meaning: ${wordData.meaning}

Requirements for the 3 WRONG options:
1. They should be real English words (GRE-level vocabulary)
2. They should sound plausible as synonyms but are NOT actually synonyms
3. They should be different from "${correctSynonym}"
4. They should NOT be actual synonyms of "${word}"
5. Make them challenging - similar in tone or context but different meaning

Example:
Word: "ameliorate" (to make better)
Correct Synonym: "improve"
Wrong options: ["deteriorate", "complicate", "maintain"]

Now generate 3 wrong options for "${word}".

Return ONLY valid JSON (no markdown, no explanations):
{"options":["word1","word2","word3"]}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a GRE test creator. Generate challenging distractor options. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
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
      const result = JSON.parse(jsonMatch[0]);
      if (result.options && Array.isArray(result.options) && result.options.length >= 3) {
        return result.options.slice(0, 3);
      }
    }
  } catch (error) {
    console.error('AI Synonym Options Error:', error.message);
  }
  
  return null;
}

// AI-powered antonym options generator
export async function generateAntonymOptions(word, wordData, correctAntonym) {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  const prompt = `You are a GRE vocabulary expert. Generate 3 PLAUSIBLE but INCORRECT antonym options for the word "${word}".

Word: "${word}"
Correct Antonym: "${correctAntonym}"
Meaning: ${wordData.meaning}

Requirements for the 3 WRONG options:
1. They should be real English words (GRE-level vocabulary)
2. They should sound plausible as antonyms but are NOT actually antonyms
3. They should be different from "${correctAntonym}"
4. They should NOT be actual antonyms of "${word}"
5. Include the actual synonyms as distractors to make it challenging

Example:
Word: "benevolent" (kind, generous)
Correct Antonym: "malicious"
Wrong options: ["generous", "kind", "neutral"]

Now generate 3 wrong options for "${word}".

Return ONLY valid JSON (no markdown, no explanations):
{"options":["word1","word2","word3"]}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a GRE test creator. Generate challenging distractor options. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
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
      const result = JSON.parse(jsonMatch[0]);
      if (result.options && Array.isArray(result.options) && result.options.length >= 3) {
        return result.options.slice(0, 3);
      }
    }
  } catch (error) {
    console.error('AI Antonym Options Error:', error.message);
  }
  
  return null;
}
