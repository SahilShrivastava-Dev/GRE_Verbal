# Quick Setup Guide for GRE Vocab Builder

## Step-by-Step Installation

### 1️⃣ Get OpenRouter API Key (5 minutes)

1. Go to https://openrouter.ai
2. Click "Sign Up" (free account)
3. After signing in, go to "Keys" in the menu
4. Click "Create Key"
5. Copy your API key

### 2️⃣ Setup Backend (2 minutes)

Open terminal/command prompt and run:

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
# On Windows:
copy .env.example .env
# On Mac/Linux:
cp .env.example .env
```

Now open `backend/.env` in a text editor and paste your API key:
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

Start the backend:
```bash
npm start
```

You should see:
```
🚀 GRE Vocab Builder API running on port 5000
```

Keep this terminal window open!

### 3️⃣ Setup Frontend (2 minutes)

Open a NEW terminal/command prompt:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the app
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:3000/
```

### 4️⃣ Open the App

Open your browser and go to: **http://localhost:3000**

## ✅ Verify Everything Works

1. You should see the Dashboard page
2. Click "Add Word"
3. Type a word like "ameliorate"
4. Click "Add & Enrich Word"
5. Wait a few seconds for AI to process
6. You should see the enriched word with definition, synonyms, etc.

If it works, you're all set! 🎉

## 🔧 Troubleshooting

### "Port already in use" error

**Backend (port 5000):**
- Windows: `netstat -ano | findstr :5000`
- Mac/Linux: `lsof -i :5000`
- Kill the process or change the port in `.env`

**Frontend (port 3000):**
- Close other apps using port 3000
- Or Vite will automatically suggest port 3001

### "API key invalid" error

- Double-check your OpenRouter API key
- Make sure there are no extra spaces
- Verify the key starts with `sk-or-v1-`

### LLM not working

- Check your OpenRouter account has free credits
- Try a different free model in `.env`:
  ```
  OPENROUTER_MODEL=google/gemma-7b-it:free
  ```

### "Cannot connect to backend"

- Make sure backend is running (check terminal)
- Verify it's on http://localhost:5000
- Check for error messages in backend terminal

## 📱 Daily Usage Workflow

1. **Morning**: Add 5-10 new GRE words
2. **Evening**: Take the daily quiz (10-15 minutes)
3. **Review**: Check weak words and review them
4. **Track**: Monitor your progress on Dashboard

## 🎯 Quick Tips

- Add words consistently (5-10 per day)
- Take quizzes regularly
- Mark difficult words as "weak"
- Review example sentences carefully
- Focus on synonyms for Text Completion questions

## 💾 Backing Up Your Data

Your vocabulary is stored in:
- `backend/database/data/words.json`
- `backend/database/data/quiz_attempts.json`

Copy these files periodically to back up your progress!

---

**Need Help?**
- Check the main README.md for detailed documentation
- Create an issue if you encounter problems

Happy studying! 📚🎯

