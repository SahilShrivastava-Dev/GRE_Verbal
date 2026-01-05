# 🐛 Deployment Debug Guide

## 📊 **Current Status**

### **Local Database:**
- ✅ **25 words** in `backend/database/data/words.json`
- ✅ File is now tracked by Git (not ignored anymore)
- ✅ Pushed to GitHub in latest commit

### **Render Deployment:**
- Backend URL: https://gre-verbal.onrender.com
- Frontend URL: https://gre-verbal-app-41bed.web.app

---

## 🔍 **Why Frontend Shows 0 Words**

### **Possible Reasons:**

1. **Render hasn't pulled latest commit yet**
   - Render auto-deploys on push, but takes 2-3 minutes
   - Check Render dashboard to see if it's still deploying

2. **API not responding correctly**
   - Test backend directly: https://gre-verbal.onrender.com/api/word/all
   - Should return JSON array with 25 words

3. **CORS or network issue**
   - Check browser console (F12) for errors
   - Look for "CORS" or "Failed to fetch" errors

---

## ✅ **How to Debug**

### **Step 1: Test Backend Directly**

Open in your browser:
```
https://gre-verbal.onrender.com/api/word/all
```

**Expected:** JSON array with 25 words  
**If you see:** Empty array `[]` → Database not loaded  
**If error:** Backend issue

### **Step 2: Check Render Logs**

1. Go to: https://dashboard.render.com
2. Click your service: `gre-verbal-backend`
3. Click "Logs" tab
4. Look for errors or check if it says "25 words loaded"

### **Step 3: Check Frontend Console**

1. Open: https://gre-verbal-app-41bed.web.app
2. Press **F12** (Developer Tools)
3. Go to "Console" tab
4. Look for red errors
5. Try navigating to "Vocabulary" page and see what errors show

### **Step 4: Test Adding a Word**

1. Go to: https://gre-verbal-app-41bed.web.app/add-word
2. Try adding word: "test"
3. Check console for errors
4. Check Render logs for API calls

---

## 🔧 **Common Fixes**

### **Fix 1: OpenRouter API Key**

**Verify it's set in Render:**
1. Render Dashboard → `gre-verbal-backend` → Environment tab
2. Check if `OPENROUTER_API_KEY` exists
3. Value should start with: `sk-or-v1-`

**If missing or wrong:**
- Add/update it with: `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`
- Render will auto-redeploy

### **Fix 2: Force Render to Redeploy**

If Render is still on old commit:
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for: "Your service is live 🎉"

### **Fix 3: Check Render Region**

- Free tier sometimes has network issues
- If nothing works, try redeploying to a different region

---

## 📝 **Expected Backend Logs**

When working correctly, Render logs should show:
```
🚀 GRE Vocab Builder API running on port 10000
📊 Loaded 25 words from database
GET /api/word/all - 200 OK
GET /api/word/stats - 200 OK
POST /api/word/add - 201 Created
```

---

## 🆘 **Still Not Working?**

Share these details:

1. **Backend test result:** Visit `https://gre-verbal.onrender.com/api/word/all` and copy what you see
2. **Frontend console errors:** F12 → Console tab, copy any red errors
3. **Render logs:** Last 20 lines from Render dashboard
4. **Browser network tab:** F12 → Network tab, filter "api", show failed requests

---

**Next Step:** Try visiting `https://gre-verbal.onrender.com/api/word/all` in your browser right now and tell me what you see!

