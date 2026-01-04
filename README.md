# GRE Verbal Vocabulary Builder 📚🎯

A comprehensive, AI-powered vocabulary learning system designed specifically for GRE verbal preparation. This tool helps you actively log words, get AI-enriched definitions, and practice with adaptive quizzes.

![GRE Vocab Builder](https://img.shields.io/badge/GRE-Vocab%20Builder-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## 🎯 Key Features

### 1. **Smart Word Logging**
- Add any GRE word and get instant AI-powered enrichment
- Automatic fetching of:
  - Clear, GRE-level definitions
  - 3-5 relevant synonyms
  - 2-3 antonyms
  - GRE-style example sentences
  - Difficulty classification

### 2. **Adaptive Daily Quizzes**
- Smart algorithm prioritizes:
  - Recently added words
  - Words marked as weak
  - Words with high error rates
- Instant feedback on each question
- Detailed results with explanations
- Tracks your progress over time

### 3. **Comprehensive Vocabulary Management**
- Search and filter your word collection
- Sort by: recent, alphabetical, or weakest first
- Filter by difficulty: easy, medium, hard
- Mark words as weak for more practice
- View detailed word information

### 4. **Progress Tracking**
- Total words learned
- Words added today
- Weak words count
- Average quiz accuracy
- Performance history

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Vite + Tailwind CSS)
│  Port: 3000     │
└────────┬────────┘
         │ REST API
┌────────┴────────┐
│  Express Server │ (Node.js)
│  Port: 5000     │
└────────┬────────┘
         │
┌────────┴────────┐      ┌─────────────────┐
│  JSON Database  │      │  OpenRouter LLM │
│  File Storage   │      │  (Mistral/Free) │
└─────────────────┘      └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **OpenRouter API Key** (free tier available at [openrouter.ai](https://openrouter.ai))

## 🚀 Quick Start

### 1. Clone or Download

```bash
cd "GRE Verbal Prep"
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
copy .env.example .env
# OR on Mac/Linux: cp .env.example .env
```

Edit `backend/.env` and add your OpenRouter API key:
```env
PORT=5000
OPENROUTER_API_KEY=your_actual_api_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

Start the backend server:
```bash
npm start
# OR for development with auto-reload:
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔑 Getting OpenRouter API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Go to Settings → API Keys
4. Create a new API key
5. Copy and paste it into your `backend/.env` file

**Free Models Available:**
- `mistralai/mistral-7b-instruct:free`
- `google/gemma-7b-it:free`
- `meta-llama/llama-3-8b-instruct:free`

## 📖 Usage Guide

### Adding Words

1. Navigate to **Add Word** page
2. Type any GRE word (e.g., "ameliorate", "pernicious")
3. Click **Add & Enrich Word**
4. AI will automatically fetch:
   - Definition
   - Synonyms and antonyms
   - Example sentence
   - Difficulty level

### Taking Quizzes

1. Go to **Daily Quiz** page
2. Click **Start Quiz**
3. Answer multiple-choice questions
4. Get instant feedback on each answer
5. Review detailed results at the end
6. Quiz adapts to focus on your weak areas!

### Managing Vocabulary

1. Visit **My Vocabulary** page
2. Use search to find specific words
3. Filter by difficulty level
4. Sort by recent, alphabetical, or weakest
5. Click any word to view full details
6. Mark words as weak for extra practice

### Tracking Progress

1. **Dashboard** shows:
   - Total words learned
   - Words added today
   - Weak words needing attention
   - Your quiz accuracy percentage
2. Recently added words display
3. Quick action buttons

## 📁 Project Structure

```
GRE Verbal Prep/
├── backend/
│   ├── database/
│   │   ├── db.js              # JSON database operations
│   │   └── data/              # JSON storage files
│   │       ├── words.json     # Word collection
│   │       └── quiz_attempts.json
│   ├── routes/
│   │   ├── wordRoutes.js      # Word API endpoints
│   │   └── quizRoutes.js      # Quiz API endpoints
│   ├── services/
│   │   └── llmService.js      # OpenRouter LLM integration
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx     # Navigation & layout
    │   ├── pages/
    │   │   ├── Dashboard.jsx  # Main dashboard
    │   │   ├── AddWord.jsx    # Add word page
    │   │   ├── VocabularyList.jsx
    │   │   └── DailyQuiz.jsx
    │   ├── services/
    │   │   └── api.js         # API client
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 🔧 API Endpoints

### Word APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/word/all` | Get all words |
| GET | `/api/word/search?query=word` | Search words |
| POST | `/api/word/add` | Add new word (with AI enrichment) |
| PATCH | `/api/word/:id` | Update word (mark weak, etc.) |
| DELETE | `/api/word/:id` | Delete word |
| GET | `/api/word/stats` | Get vocabulary statistics |

### Quiz APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz/daily` | Generate adaptive quiz |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/quiz/history` | Get quiz attempt history |

## 🎨 Features Walkthrough

### 1. Dashboard
- **Statistics Cards**: Visual overview of your progress
- **Quick Actions**: Jump to Add Word, Quiz, or Browse
- **Recent Words**: See your latest additions
- **Motivational Messages**: Context-aware encouragement

### 2. Add Word
- **Smart Input**: Type any word
- **AI Enrichment**: Automatic fetching of all details
- **Instant Feedback**: See enriched data immediately
- **Tips Section**: Learning best practices

### 3. Vocabulary List
- **Powerful Search**: Find words by name or meaning
- **Multiple Filters**: By difficulty level
- **Flexible Sorting**: Recent, alphabetical, or weak-first
- **Word Cards**: Clean, informative display
- **Detailed Modal**: Click for full information
- **Quick Actions**: Mark weak or delete

### 4. Daily Quiz
- **Adaptive Selection**: Smart word prioritization
- **Progress Indicator**: Visual progress bar
- **MCQ Format**: GRE-style questions
- **Instant Feedback**: Learn as you go
- **Detailed Results**: Review all answers
- **Performance Tracking**: See your improvement

## 💾 Data Storage

Data is stored in JSON files for simplicity:
- `backend/database/data/words.json` - All your vocabulary
- `backend/database/data/quiz_attempts.json` - Quiz history

**Backup Recommendation**: Periodically copy these files to backup your data!

## 🚀 Production Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Push your code to GitHub
2. Connect to deployment platform
3. Set environment variables:
   - `OPENROUTER_API_KEY`
   - `PORT` (usually auto-set)
4. Deploy!

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update `frontend/src/services/api.js` with your backend URL
2. Build: `npm run build`
3. Deploy the `dist` folder

## 🎯 GRE Strategy Integration

| GRE Challenge | Solution |
|---------------|----------|
| Limited vocabulary | Daily word logging with AI enrichment |
| Poor recall under pressure | Adaptive quiz system |
| Context understanding | GRE-style example sentences |
| Weak word retention | Spaced repetition through smart quizzes |
| Synonym confusion | Comprehensive synonym/antonym lists |

## 🔮 Future Enhancements

- [ ] Text Completion practice questions
- [ ] Sentence Equivalence exercises
- [ ] Export to Anki flashcards
- [ ] Word streak tracking & gamification
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Word pronunciation audio
- [ ] Etymology information
- [ ] Progress charts and analytics
- [ ] Study reminders

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify `.env` file exists with valid API key
- Run `npm install` again

### Frontend won't start
- Check if port 3000 is available
- Verify backend is running first
- Clear node_modules and reinstall

### LLM not enriching words
- Verify OpenRouter API key is correct
- Check API key has credits (free tier)
- Check console for error messages
- Fallback mode activates automatically

### Database not saving
- Check write permissions in `backend/database/data/`
- Verify JSON files are not corrupted

## 📝 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📧 Support

For issues or questions, create an issue in the repository.

---

**Built with ❤️ for GRE success!**

Remember: Consistency is key. Add 5-10 words daily and take regular quizzes for best results! 💪📚

