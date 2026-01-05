# 🚀 Deployment Guide - GRE Vocab Builder

## Overview

Deploy your app to **Google Cloud Platform (GCP)** with **automatic deployment** from GitHub!

**Architecture:**
- **Frontend**: Firebase Hosting (fast, free tier available)
- **Backend**: Google Cloud Run (serverless, auto-scaling)
- **CI/CD**: GitHub Actions (auto-deploy on push to main)
- **Database**: JSON files (can upgrade to Firestore later)

---

## 📋 Prerequisites

1. **Google Cloud Account**: https://cloud.google.com/
2. **Firebase Account**: https://firebase.google.com/
3. **GitHub Repository**: Already done! ✅
4. **Node.js & npm**: Already installed ✅

---

## 🔥 Part 1: Firebase Setup (Frontend)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in Your Project
```bash
cd "C:\Users\sahil_shrivastava\Desktop\Personal\Codespace\GRE Verbal Prep"
firebase init
```

**Select:**
- ✅ Hosting (use arrow keys, space to select, enter to confirm)
- Create new project or use existing one
- **Public directory**: `frontend/dist`
- **Single-page app**: Yes
- **GitHub automatic deploys**: Yes (we'll set this up)

### Step 4: Configure Frontend Build
The `firebase.json` file will be created. We'll configure it properly.

---

## ☁️ Part 2: Google Cloud Run Setup (Backend)

### Step 1: Install Google Cloud SDK
Download from: https://cloud.google.com/sdk/docs/install

### Step 2: Initialize GCloud
```bash
gcloud init
gcloud auth login
```

### Step 3: Create Project (if needed)
```bash
gcloud projects create gre-vocab-builder --name="GRE Vocab Builder"
gcloud config set project gre-vocab-builder
```

### Step 4: Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## 🔐 Part 3: Environment Variables & Secrets

### For Backend (Cloud Run):

**Store your API key securely:**
```bash
echo -n "your-openrouter-api-key" | gcloud secrets create OPENROUTER_API_KEY --data-file=-
```

**Grant access to Cloud Run:**
```bash
gcloud secrets add-iam-policy-binding OPENROUTER_API_KEY \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🤖 Part 4: GitHub Actions (Auto-Deploy)

### Step 1: Create GitHub Secrets

Go to your GitHub repo: https://github.com/SahilShrivastava-Dev/GRE_Verbal

**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:
1. **GCP_PROJECT_ID**: Your GCP project ID (e.g., `gre-vocab-builder`)
2. **GCP_SA_KEY**: Service account JSON key (see below)
3. **FIREBASE_TOKEN**: Firebase CI token (get with `firebase login:ci`)
4. **OPENROUTER_API_KEY**: Your OpenRouter API key

### Step 2: Get GCP Service Account Key

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

gcloud projects add-iam-policy-binding gre-vocab-builder \
  --member="serviceAccount:github-actions@gre-vocab-builder.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding gre-vocab-builder \
  --member="serviceAccount:github-actions@gre-vocab-builder.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@gre-vocab-builder.iam.gserviceaccount.com
```

**Copy the contents of `key.json` and paste as `GCP_SA_KEY` secret in GitHub**

---

## 📝 Part 5: Configuration Files

These files will be created in the next steps.

---

## 🎯 Benefits of This Setup

### ✅ Automatic Deployment:
- Push to `main` branch → Automatic deployment
- No manual deployment needed
- Preview deployments for pull requests

### ✅ Scalability:
- Cloud Run auto-scales with traffic
- Firebase Hosting has global CDN
- Handle thousands of users

### ✅ Cost:
- **Firebase Hosting**: Free tier (10GB/month)
- **Cloud Run**: Free tier (2M requests/month)
- **Very cheap** for your use case

### ✅ Performance:
- Fast global CDN
- Serverless backend
- No server management

### ✅ Security:
- API keys in secrets (not in code)
- HTTPS by default
- Environment isolation

---

## 🔄 Deployment Workflow

```
1. You push code to GitHub main branch
   ↓
2. GitHub Actions triggers
   ↓
3. Frontend builds (npm run build)
   ↓
4. Frontend deploys to Firebase Hosting
   ↓
5. Backend builds Docker image
   ↓
6. Backend deploys to Cloud Run
   ↓
7. You get deployment URL
   ↓
8. Website is live! 🎉
```

---

## 🌐 URLs After Deployment

**Frontend**: `https://gre-vocab-builder.web.app`
**Backend**: `https://gre-vocab-backend-xyz.run.app`
**Custom Domain** (optional): `yourdomain.com`

---

## 📊 Monitoring & Logs

### Firebase Console:
- https://console.firebase.google.com/
- View hosting analytics
- See deployment history

### Google Cloud Console:
- https://console.cloud.google.com/
- View Cloud Run logs
- Monitor performance
- Check costs

---

## 🔧 Local to Production Differences

### Development (Local):
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
Database: Local JSON files
```

### Production (Cloud):
```
Frontend: https://gre-vocab-builder.web.app
Backend: https://gre-vocab-backend-xyz.run.app
Database: JSON files (or upgrade to Firestore)
```

---

## 💰 Cost Estimate

For your use case (personal/small scale):

**Monthly Costs:**
- Firebase Hosting: **$0** (free tier)
- Cloud Run: **$0-5** (free tier covers most)
- Cloud Build: **$0** (120 builds/day free)
- **Total: FREE or < $5/month**

---

## 🎓 Next Steps

1. **Run the setup scripts** (I'll create them)
2. **Configure GitHub Actions** (automated)
3. **Push to main branch**
4. **Watch it deploy automatically!**

---

## 🆘 Troubleshooting

### Build Fails?
- Check GitHub Actions logs
- Verify all secrets are set
- Check build commands

### Backend Not Working?
- Check Cloud Run logs
- Verify environment variables
- Check CORS settings

### Frontend Not Loading?
- Check Firebase Hosting settings
- Verify build output directory
- Check browser console

---

## 🚀 Ready?

Let's create all the configuration files and scripts to make this work!

See the following files:
- `firebase.json` - Firebase configuration
- `.github/workflows/deploy.yml` - GitHub Actions CI/CD
- `backend/Dockerfile` - Backend container
- `backend/cloudbuild.yaml` - Cloud Build config
- `DEPLOY.sh` - Quick deployment script

