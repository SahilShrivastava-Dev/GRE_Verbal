# 🚀 Deploy Backend to Render.com (100% FREE)

## ✅ **Frontend Already Deployed!**
Your frontend is LIVE at: **https://gre-verbal-app-41bed.web.app**

---

## 📦 **Step 1: Push to GitHub**

First, let's push the latest code:

```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

---

## 🌐 **Step 2: Deploy Backend on Render.com**

### **A. Sign Up / Log In**
1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign in with **GitHub**

### **B. Create New Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **SahilShrivastava-Dev/GRE_Verbal**
3. Click **"Connect"**

### **C. Configure Service**
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `gre-verbal-backend` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | **Free** |

### **D. Add Environment Variable**
1. Scroll to **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Add:
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** `sk-or-v1-......`

### **E. Deploy!**
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://gre-verbal-backend.onrender.com`

---

## 🔗 **Step 3: Update Frontend to Use Backend URL**

Once you get the Render backend URL (e.g., `https://gre-verbal-backend.onrender.com`), I'll update the frontend to connect to it and redeploy.

---

## 🎉 **Benefits of Render.com**

✅ **100% Free** (750 hours/month)
✅ **Auto-deploys** from GitHub (like Azure!)
✅ **No billing required**
✅ **HTTPS included**
✅ **Persistent storage** (for your JSON database)

---

## ⚠️ **Important Notes**

1. **Free tier sleeps after 15 mins of inactivity**
   - First request after sleep takes ~30 seconds to wake up
   - Subsequent requests are instant

2. **Auto-deployment enabled**
   - Every push to `main` branch auto-deploys
   - Just like Azure DevOps!

3. **Database persists**
   - Your `words.json` and `quiz_attempts.json` are saved
   - Data survives across deployments

---

## 📱 **Final Result**

After Step 3, you'll have:
- **Frontend:** https://gre-verbal-app-41bed.web.app
- **Backend:** https://your-backend.onrender.com
- **Accessible from:** Any device, anywhere! 🌍

---

Let me know once you've created the Render service and I'll update the frontend!

