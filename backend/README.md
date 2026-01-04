# GRE Vocab Builder - Backend API

Express.js backend with JSON file storage and OpenRouter LLM integration.

## Setup

```bash
npm install
```

## Configuration

Create `.env` file:

```env
PORT=5000
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

## Running

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

## API Endpoints

### Words
- `GET /api/word/all` - Get all words
- `GET /api/word/search?query=term` - Search words
- `POST /api/word/add` - Add new word with AI enrichment
- `PATCH /api/word/:id` - Update word
- `DELETE /api/word/:id` - Delete word
- `GET /api/word/stats` - Get statistics

### Quiz
- `GET /api/quiz/daily` - Generate adaptive daily quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get quiz history

### Health
- `GET /api/health` - Health check endpoint

## Database

JSON file storage in `database/data/`:
- `words.json` - Vocabulary words
- `quiz_attempts.json` - Quiz history

## Dependencies

- **express** - Web framework
- **cors** - CORS middleware
- **axios** - HTTP client for LLM API
- **dotenv** - Environment variables

