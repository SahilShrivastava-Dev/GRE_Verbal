# ⚡ Quick Setup - Your API Key is Ready!

Your OpenRouter API key has been saved. Follow these simple steps:

## Option 1: Automatic Setup (Recommended)

### For Windows:
1. Open Command Prompt in the project folder
2. Run this command:
```cmd
cd backend
echo PORT=5000 > .env
echo OPENROUTER_API_KEY=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 >> .env
echo OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free >> .env
```

### For Mac/Linux:
1. Open Terminal in the project folder
2. Run this command:
```bash
cd backend
cat > .env << 'EOF'
PORT=5000
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
EOF
```

## Option 2: Manual Setup (Easy)

1. Go to the `backend` folder
2. Create a new file named `.env` (with the dot at the start)
3. Copy and paste this content:

```
PORT=5000
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

4. Save the file

**Alternatively**, rename `backend/YOUR_ENV_CONFIG.txt` to `backend/.env`

---

## ✅ Verify Setup

After creating the `.env` file, start the backend:

```bash
cd backend
npm install
npm start
```

You should see:
```
🚀 GRE Vocab Builder API running on port 5000
```

---

## 🎯 About the Free Model

I've configured **Mistral 7B Instruct** (free tier) which is:
- ✅ Completely free on OpenRouter
- ✅ Fast response times
- ✅ Good at GRE vocabulary tasks
- ✅ Reliable for definitions and examples

### Alternative Free Models (if needed):

If Mistral doesn't work, you can try these in your `.env`:

```
# Google's Gemma (free)
OPENROUTER_MODEL=google/gemma-7b-it:free

# Meta's LLaMA 3 (free)
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct:free

# Nous Capybara (free)
OPENROUTER_MODEL=nousresearch/nous-capybara-7b:free
```

---

## 🚀 Next Steps

Once `.env` is created:

1. **Start Backend**: 
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open Browser**: http://localhost:3000

4. **Test**: Add your first word like "ameliorate" or "pernicious"

---

## ⚠️ Important Security Note

Your API key is now in this file. Remember:
- ✅ `.env` is already in `.gitignore` (won't be committed to git)
- ✅ Keep your API key private
- ✅ Don't share screenshots of your `.env` file
- ✅ Delete `YOUR_ENV_CONFIG.txt` after setup for security

---

**Your app is ready to use! Just create the .env file and start! 🎉**

