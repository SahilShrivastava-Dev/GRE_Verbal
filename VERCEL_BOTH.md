# 🚀 Deploy BOTH Frontend + Backend on Vercel

## ✨ **Best Setup: 2 Vercel Projects**

We'll create two separate Vercel projects from your one GitHub repo:
1. **Backend API** → Get URL like: `https://gre-verbal-api.vercel.app`
2. **Frontend** → Get URL like: `https://gre-verbal.vercel.app`

Both are **100% free, no cold starts, super fast!**

---

## 📦 **STEP 1: Deploy Backend**

### **1.1: Go to Vercel**
Open: **https://vercel.com/new**

### **1.2: Import Repository**
1. Click **"Import Git Repository"**
2. Find and select: **`SahilShrivastava-Dev/GRE_Verbal`**
3. Click **"Import"**

### **1.3: Configure Backend**

Fill in these **exact** settings:

| Setting | Value |
|---------|-------|
| **Project Name** | `gre-verbal-api` |
| **Framework Preset** | **Other** |
| **Root Directory** | `backend` ← **Click "Edit" and select this!** |
| **Build Command** | Leave empty |
| **Output Directory** | Leave empty |
| **Install Command** | `npm install` |

### **1.4: Add Environment Variable**

**IMPORTANT!** Before clicking Deploy:

1. Expand **"Environment Variables"** section
2. Add:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-`
   - **Environments:** Select **All** (Production, Preview, Development)
3. Click **"Add"**

### **1.5: Deploy Backend**

1. Click **"Deploy"**
2. Wait ~2 minutes
3. You'll get a URL like: **`https://gre-verbal-api.vercel.app`**

### **1.6: Test Backend**

Open in browser: `https://gre-verbal-api.vercel.app/api/health`

**Should see:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

✅ **Backend is LIVE!** Copy this URL, you'll need it for the frontend.

---

## 📦 **STEP 2: Deploy Frontend**

### **2.1: Go to Vercel Again**
Open: **https://vercel.com/new**

### **2.2: Import Same Repository**
1. Click **"Import Git Repository"**
2. Find and select: **`SahilShrivastava-Dev/GRE_Verbal`** (same repo!)
3. Click **"Import"**

### **2.3: Configure Frontend**

Fill in these **exact** settings:

| Setting | Value |
|---------|-------|
| **Project Name** | `gre-verbal-app` |
| **Framework Preset** | **Vite** |
| **Root Directory** | `frontend` ← **Click "Edit" and select this!** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### **2.4: Add Environment Variable**

**IMPORTANT!** Before clicking Deploy:

1. Expand **"Environment Variables"** section
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://gre-verbal-api.vercel.app/api` ← Use YOUR backend URL from Step 1
   - **Environments:** Select **All**
3. Click **"Add"**

### **2.5: Deploy Frontend**

1. Click **"Deploy"**
2. Wait ~2 minutes
3. You'll get a URL like: **`https://gre-verbal-app.vercel.app`**

---

## 🎉 **You're LIVE!**

### **Your URLs:**
- **Main App (Frontend):** `https://gre-verbal-app.vercel.app`
- **API (Backend):** `https://gre-verbal-api.vercel.app`

### **Test Your App:**
1. Open your frontend URL
2. Dashboard should show **25 words**
3. Try adding a word - **instant, no delays!**
4. Take a quiz - **super fast!**

---

## ✅ **Advantages of This Setup**

✅ **No Cold Starts** - Always instant response  
✅ **No Billing** - 100% free forever  
✅ **Persistent Storage** - Your 25 words are safe  
✅ **Auto-Deploy** - Every `git push` updates both!  
✅ **Global CDN** - Fast worldwide  
✅ **Better than Render** - More reliable, faster  

---

## 🔄 **Auto-Deployment**

From now on, every time you:
```bash
git push origin main
```

**Both projects automatically update:**
- Changes in `backend/` → Backend redeploys
- Changes in `frontend/` → Frontend redeploys
- Changes in both → Both redeploy

**No manual steps needed!** 🎉

---

## 📱 **Access from Anywhere**

Your main app URL works on:
- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ Tablets
- ✅ Can be added to home screen (works like an app!)

---

## 🔧 **Managing Your Projects**

### **Vercel Dashboard:**
Visit: **https://vercel.com/dashboard**

You'll see both projects:
- `gre-verbal-api` (backend)
- `gre-verbal-app` (frontend)

**You can:**
- View deployment logs
- See analytics
- Manage environment variables
- Monitor performance
- Add custom domains (free!)

---

## 🆘 **Troubleshooting**

### **Issue: Frontend shows "Network Error"**

**Fix:**
1. Go to Vercel dashboard
2. Select `gre-verbal-app` (frontend)
3. Settings → Environment Variables
4. Check that `VITE_API_URL` points to your backend URL
5. Redeploy if needed

### **Issue: Backend returns 500 error**

**Fix:**
1. Go to Vercel dashboard
2. Select `gre-verbal-api` (backend)
3. Deployments → Click latest deployment → View Function Logs
4. Check if `OPENROUTER_API_KEY` is set correctly

### **Issue: "0 words" showing**

**Possible causes:**
- Backend API URL is wrong in frontend env
- Database files not deployed
- Check backend logs for errors

**Fix:**
- Test backend directly: `https://your-backend.vercel.app/api/word/all`
- Should return JSON array with 25 words

---

## 📊 **Performance Comparison**

| Feature | Vercel (Both) | Render + Vercel |
|---------|---------------|-----------------|
| Backend Speed | ⚡ Instant | 🐌 30-60s cold start |
| Frontend Speed | ⚡ Instant | ⚡ Instant |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Management | ✅ One dashboard | ⚠️ Two dashboards |
| Auto-Deploy | ✅ Both sync | ✅ Both sync |
| Cost | 💰 Free | 💰 Free |

**Vercel for both = Best option!** 🏆

---

## 🎯 **Quick Reference**

### **Your Two Projects:**

**Project 1: Backend API**
- Name: `gre-verbal-api`
- Root: `backend`
- URL: `https://gre-verbal-api.vercel.app`
- Env: `OPENROUTER_API_KEY`

**Project 2: Frontend**
- Name: `gre-verbal-app`
- Root: `frontend`
- URL: `https://gre-verbal-app.vercel.app`
- Env: `VITE_API_URL` = backend URL + `/api`

---

## 📝 **Summary**

1. ✅ Deploy backend to Vercel (root: `backend`)
2. ✅ Get backend URL
3. ✅ Deploy frontend to Vercel (root: `frontend`)
4. ✅ Add backend URL to frontend env variables
5. ✅ Both auto-deploy on every push!

---

**Ready to deploy? Start with Step 1 above!** 🚀

**Come back and share your URLs when both are deployed!** 🎉

