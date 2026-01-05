# 🔧 Fix: Add OpenRouter API Key to Render

## ❗ **Problem**
The frontend can reach the backend, but word addition fails because the API key is missing.

## ✅ **Solution: Add Environment Variable to Render**

### **Step 1: Go to Render Dashboard**
1. Open: **https://dashboard.render.com**
2. Click on your service: **`gre-verbal-backend`**

### **Step 2: Add Environment Variable**
1. Click on **"Environment"** tab (left sidebar)
2. Click **"Add Environment Variable"**
3. Add this:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-`
4. Click **"Save Changes"**

### **Step 3: Wait for Auto-Redeploy**
- Render will automatically redeploy your backend (~2-3 minutes)
- Watch the logs at the bottom of the page
- Wait for: **"Your service is live 🎉"**

### **Step 4: Test Again**
- Go back to: **https://gre-verbal-app-41bed.web.app/add-word**
- Try adding a word (e.g., "ameliorated")
- Should work now! ✅

---

## 🔍 **How to Verify It's Working**

### **Check Backend Logs:**
In Render dashboard, you should see logs like:
```
POST /api/word/add
✅ Word enriched successfully
```

### **Check Frontend:**
Open browser console (F12) and you should see:
```
Word added successfully!
```

---

## 🆘 **Still Not Working?**

### **Option 1: Check Browser Console**
1. Open your app: https://gre-verbal-app-41bed.web.app/add-word
2. Press **F12** to open Developer Tools
3. Go to **"Console"** tab
4. Try adding a word
5. Share any error messages you see

### **Option 2: Check Render Logs**
1. Go to Render dashboard
2. Click on **"Logs"** tab
3. Try adding a word from frontend
4. Look for any errors in the logs

---

## 📝 **Current Configuration**

**Frontend URL:** https://gre-verbal-app-41bed.web.app  
**Backend URL:** https://gre-verbal.onrender.com  
**API Key ends in:** `...1dc7`

---

**After adding the API key, everything should work perfectly!** 🎉

