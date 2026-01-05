# 🚀 Quick Deployment Guide for "GRE Verbal App"

## ✅ Prerequisites Done:
- Firebase App created: "GRE Verbal App" ✅
- GitHub Repository ready ✅

---

## 📝 Step 1: Login to Firebase

```bash
firebase login
```

**Follow the browser authentication** - you'll do this part.

---

## 📝 Step 2: Link Your Firebase Project

```bash
cd "C:\Users\sahil_shrivastava\Desktop\Personal\Codespace\GRE Verbal Prep"
firebase use --add
```

**Select:** "GRE Verbal App" from the list
**Alias:** production (or just press Enter)

This creates `.firebaserc` file linking to your project.

---

## 📝 Step 3: Get Firebase Token for GitHub

```bash
firebase login:ci
```

**Copy the token** that appears - you'll add it as a GitHub secret.

---

## 📝 Step 4: Add GitHub Secrets

Go to: https://github.com/SahilShrivastava-Dev/GRE_Verbal/settings/secrets/actions

Click "New repository secret" and add:

### Required Secrets:

1. **FIREBASE_TOKEN**
   - Value: The token from step 3
   - Used for: Automatic deployment

2. **FIREBASE_PROJECT_ID**
   - Value: Your Firebase project ID (find in Firebase Console)
   - Used for: Identifying your project

---

## 📝 Step 5: Deploy Frontend to Firebase (Manual First Time)

```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

**Your frontend will be live at:** `https://gre-verbal-app.web.app`

---

## 📝 Step 6: Setup Google Cloud for Backend (Optional for Now)

You can start with just the frontend, or set up backend too:

### If you want backend on Cloud:

```bash
# Login to Google Cloud
gcloud auth login

# Set project (use same as Firebase)
gcloud config set project YOUR_FIREBASE_PROJECT_ID

# Enable Cloud Run
gcloud services enable run.googleapis.com

# Deploy backend
cd backend
gcloud run deploy gre-vocab-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "OPENROUTER_API_KEY=YOUR_API_KEY_HERE" \
  --set-env-vars "OPENROUTER_MODEL=xiaomi/mimo-v2-flash:free"
```

---

## 📝 Step 7: Update Frontend API URL

After backend is deployed, update `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.run.app/api
```

Then redeploy frontend:
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 🎉 Step 8: Enable Auto-Deployment

Once manual deployment works, set up GitHub Actions:

### Get Firebase Service Account:

1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save the JSON file
4. Copy its contents

### Add to GitHub:

Go to: https://github.com/SahilShrivastava-Dev/GRE_Verbal/settings/secrets/actions

Add secret:
- Name: **FIREBASE_SERVICE_ACCOUNT**
- Value: Contents of the JSON file

---

## ✅ Done!

Now every push to `main` will automatically deploy! 🚀

**Your live app:** https://gre-verbal-app.web.app

---

## 🆘 Quick Commands

### Deploy frontend only:
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Check deployment status:
```bash
firebase hosting:sites:list
```

### View logs:
```bash
firebase hosting:channel:list
```

---

## 📊 What You Get:

✅ **Live Website** at Firebase Hosting
✅ **Free Tier** (10GB storage, 360MB/day bandwidth)
✅ **HTTPS** enabled automatically
✅ **Global CDN** for fast loading
✅ **Auto-deployment** from GitHub (after setup)

---

**Start with Step 1 and let me know when you're authenticated!**

