# GRE Vocab Builder - Quick Reference Card

## 🚀 First Time Setup (5 minutes)

### 1. Get API Key
- Visit: https://openrouter.ai
- Sign up (free)
- Get API key from Settings → Keys

### 2. Configure Backend
```bash
cd backend
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux
```
- Open `backend/.env` in text editor
- Add your API key: `OPENROUTER_API_KEY=sk-or-v1-xxxxx`

### 3. Start App

**Option A - Easy Way (Windows):**
- Double-click `START_APP.bat`

**Option B - Manual Way:**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### 4. Open Browser
- Go to: http://localhost:3000

---

## 📚 Daily Workflow (15 mins/day)

### Morning Routine (5 mins)
1. Open app → Dashboard
2. Add 5-10 new GRE words
3. Quick review of yesterday's words

### Evening Routine (10 mins)
1. Take Daily Quiz (10-15 questions)
2. Review incorrect answers
3. Mark difficult words as "weak"

---

## 🎯 Page Guide

### Dashboard (`/`)
- **See**: Total words, today's count, weak words, accuracy
- **Do**: Quick stats overview, access other pages

### Add Word (`/add-word`)
- **Type**: Any GRE word (e.g., "pernicious")
- **Get**: Auto-fetched meaning, synonyms, antonyms, example
- **Time**: ~5 seconds per word

### My Vocabulary (`/vocabulary`)
- **Search**: By word name or meaning
- **Filter**: By difficulty (easy/medium/hard)
- **Sort**: Recent | Alphabetical | Weakest
- **Click**: Any word for full details
- **Actions**: Mark weak, delete

### Daily Quiz (`/quiz`)
- **Questions**: 10-15 adaptive MCQs
- **Focus**: Weak words + recent additions
- **Feedback**: Instant per question
- **Results**: Detailed review at end
- **Updates**: Auto-tracks word stats

---

## ⌨️ Keyboard Tips

| Action | Shortcut |
|--------|----------|
| Navigate pages | Click menu or use mouse |
| Submit form | Enter key |
| Close modal | Click outside or × button |

---

## 🔧 Troubleshooting

### Backend won't start
- ✓ Check `.env` file exists with valid API key
- ✓ Port 5000 not in use
- ✓ Run `npm install` in backend folder

### Frontend won't start
- ✓ Backend is running first
- ✓ Port 3000 not in use
- ✓ Run `npm install` in frontend folder

### Word enrichment fails
- ✓ Valid OpenRouter API key in `.env`
- ✓ API has free credits available
- ✓ Check backend terminal for errors
- ⚠️ Fallback mode activates automatically

### Quiz not loading
- ✓ Add at least 1 word first
- ✓ Backend running and responding
- ✓ Check browser console (F12)

---

## 📊 Progress Tracking

### Good Daily Targets
- **Week 1-2**: 5 words/day = 70 words
- **Week 3-4**: 10 words/day = 140 words
- **Month 2+**: 10-15 words/day = 300+ words

### Quiz Accuracy Goals
- **Week 1**: 40-60% (learning phase)
- **Week 2-4**: 60-75% (retention building)
- **Month 2+**: 75-90% (mastery)

### GRE Readiness
- **300+ words**: Decent foundation
- **500+ words**: Good preparation
- **800+ words**: Excellent preparation
- **1000+ words**: Outstanding vocabulary

---

## 🎓 Study Strategies

### For Memorization
1. Read example sentence carefully
2. Create your own sentence mentally
3. Connect to words you already know
4. Use word in conversation same day

### For Quiz Improvement
1. Review all wrong answers immediately
2. Mark difficult words as "weak"
3. Re-quiz weak words next day
4. Track accuracy trends weekly

### For GRE Day
1. Review weak words only
2. Light quiz (5-10 questions)
3. Don't cram new words
4. Focus on confidence

---

## 📱 Best Practices

✅ **DO**
- Add words consistently (daily)
- Take quizzes regularly (3-4x/week minimum)
- Review weak words frequently
- Read example sentences carefully
- Track your progress
- Back up data files periodically

❌ **DON'T**
- Cram 50 words in one day
- Skip quizzes for weeks
- Ignore weak words
- Rush through examples
- Delete words prematurely
- Only study the night before GRE

---

## 💾 Data Backup

Your data is in:
- `backend/database/data/words.json`
- `backend/database/data/quiz_attempts.json`

**Backup weekly**: Copy these files to cloud/USB

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| App | http://localhost:3000 |
| API | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |
| OpenRouter | https://openrouter.ai |
| GRE Word Lists | Search "Manhattan Prep GRE words" |
| GRE Practice | https://www.ets.org/gre |

---

## 📞 Commands Reference

```bash
# Install everything
npm run install-all

# Start backend only
cd backend && npm start

# Start frontend only
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# View backend API
curl http://localhost:5000/api/health
```

---

## 🏆 Success Formula

```
Consistency + Active Recall + Review = GRE Success

5 words/day × 90 days = 450 words
Daily quiz × 90 days = Strong retention
Weekly review = Mastery

Result: Significant GRE verbal score improvement!
```

---

## 🎯 30-Day Challenge

### Week 1: Foundation
- Add 5 words/day
- Take quiz 3x
- Learn the interface

### Week 2: Momentum
- Add 10 words/day
- Take quiz daily
- Review weak words

### Week 3: Acceleration
- Add 10-15 words/day
- Take quiz daily
- Track accuracy

### Week 4: Mastery
- Add 10 words/day
- Take quiz twice daily
- 80%+ accuracy target

**After 30 days**: 300+ words, solid foundation, ready for advanced practice!

---

**Print this page and keep it handy while studying!** 📄✨

