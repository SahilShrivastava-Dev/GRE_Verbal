# 🚀 Deploy to Vercel (FREE - No Billing Required!)

## ✨ **Why Vercel is Better**

✅ **No Cold Starts** - Always fast, instant response  
✅ **No Billing Required** - Truly free, no credit card needed  
✅ **Persistent Storage** - Your database stays intact  
✅ **Auto-Deploy** - Every GitHub push updates your app  
✅ **Global CDN** - Super fast worldwide  
✅ **One Platform** - Frontend + Backend together  

---

## 📦 **Quick Deploy (3 Steps)**

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

- Choose **"Continue with GitHub"** (easiest)
- Authorize Vercel in your browser

### **Step 3: Deploy**

```bash
vercel
```

**Answer the prompts:**
1. "Set up and deploy?" → **Y** (Yes)
2. "Which scope?" → **Your account**
3. "Link to existing project?" → **N** (No, it's new)
4. "Project name?" → **gre-verbal-app** (or press Enter)
5. "In which directory is your code?" → **.** (press Enter)
6. "Want to modify settings?" → **N** (No)

**Wait ~2 minutes...**

You'll get a URL like: `https://gre-verbal-app-xyz.vercel.app`

---

## 🔑 **Step 4: Add Environment Variable**

After first deploy:

```bash
vercel env add OPENROUTER_API_KEY
```

**When prompted:**
1. "Value?" → Paste: `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`
2. "Add to which environments?" → Select **all** (Production, Preview, Development)

### **Step 5: Redeploy with API Key**

```bash
vercel --prod
```

---

## ✅ **Done!**

Your app is now **LIVE** and will:
- ✅ Auto-deploy on every `git push`
- ✅ Work instantly (no 30-second cold starts!)
- ✅ Keep your 25 words intact
- ✅ Be accessible from anywhere

---

## 🌐 **Alternative: Deploy via Vercel Dashboard**

If you prefer clicking instead of CLI:

### **1. Go to Vercel**
Visit: **https://vercel.com/new**

### **2. Import from GitHub**
1. Click **"Import Git Repository"**
2. Select: **SahilShrivastava-Dev/GRE_Verbal**
3. Click **"Import"**

### **3. Configure**
- **Framework Preset:** Other
- **Root Directory:** ./ (leave as is)
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/dist`
- **Install Command:** `cd backend && npm install && cd ../frontend && npm install`

### **4. Add Environment Variable**
Click **"Environment Variables"** → Add:
- **Key:** `OPENROUTER_API_KEY`
- **Value:** `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`

### **5. Deploy**
Click **"Deploy"** → Wait ~2 minutes → LIVE! 🎉

---

## 🔧 **After Deployment**

### **Update Frontend API URL** (one-time)

After you get your Vercel URL (e.g., `https://gre-verbal-app.vercel.app`):

1. Open `frontend/src/services/api.js`
2. Change:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gre-verbal.onrender.com/api';
   ```
   To:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
   ```
   
   (Vercel will automatically route `/api` to your backend!)

3. Push to GitHub:
   ```bash
   git add frontend/src/services/api.js
   git commit -m "Update API URL for Vercel"
   git push origin main
   ```

Vercel will auto-redeploy! ✅

---

## 📊 **Vercel vs Render**

| Feature | Vercel | Render (Current) |
|---------|--------|------------------|
| Cold Starts | ❌ None | ✅ 30-60 seconds |
| Billing Required | ❌ No | ❌ No |
| Persistent Storage | ✅ Yes | ❌ No (resets) |
| Speed | ⚡ Instant | 🐌 Slow on first load |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Setup Difficulty | ✅ Easy | ⚠️ Medium |
| Auto-Deploy | ✅ Yes | ✅ Yes |

---

## 🆘 **Need Help?**

If you get any errors during deployment:
1. Share the error message
2. Check Vercel deployment logs in dashboard
3. Run `vercel logs` to see what went wrong

---

**Ready to deploy? Just run:**

```bash
npm install -g vercel
vercel login
vercel
```

**Let me know when you're ready and I'll guide you through each step!** 🚀

