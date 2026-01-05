# ✅ Deployment Checklist

Follow these steps to deploy your GRE Vocab Builder to production!

---

## 🔥 Step 1: Firebase Setup

### 1.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 1.2 Login
```bash
firebase login
```

### 1.3 Initialize (Already configured!)
```bash
firebase init hosting
```
- Select: Use existing project or create new
- Public directory: `frontend/dist`
- Single-page app: Yes
- Don't overwrite index.html: No

### 1.4 Get Firebase Token for GitHub
```bash
firebase login:ci
```
**Copy the token** - you'll add it as a GitHub secret

---

## ☁️ Step 2: Google Cloud Setup

### 2.1 Install gcloud CLI
Download: https://cloud.google.com/sdk/docs/install

### 2.2 Login and Set Project
```bash
gcloud auth login
gcloud projects create gre-vocab-builder --name="GRE Vocab Builder"
gcloud config set project gre-vocab-builder
```

### 2.3 Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2.4 Create Service Account
```bash
gcloud iam service-accounts create github-actions --display-name="GitHub Actions"

gcloud projects add-iam-policy-binding gre-vocab-builder \
  --member="serviceAccount:github-actions@gre-vocab-builder.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding gre-vocab-builder \
  --member="serviceAccount:github-actions@gre-vocab-builder.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding gre-vocab-builder \
  --member="serviceAccount:github-actions@gre-vocab-builder.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@gre-vocab-builder.iam.gserviceaccount.com
```

**Keep `key.json` safe** - you'll add it to GitHub secrets

### 2.5 Create Secrets
```bash
echo -n "your-openrouter-api-key" | gcloud secrets create OPENROUTER_API_KEY --data-file=-
echo -n "xiaomi/mimo-v2-flash:free" | gcloud secrets create OPENROUTER_MODEL --data-file=-
```

---

## 🔐 Step 3: GitHub Secrets

Go to: https://github.com/SahilShrivastava-Dev/GRE_Verbal/settings/secrets/actions

Click: **New repository secret**

Add these secrets:

| Name | Value | Where to Get |
|------|-------|--------------|
| `GCP_PROJECT_ID` | `gre-vocab-builder` | Your GCP project ID |
| `GCP_SA_KEY` | Contents of `key.json` | From step 2.4 |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | Firebase Console |
| `BACKEND_URL` | Will be set after first deployment | Cloud Run URL |
| `OPENROUTER_API_KEY` | Your API key | Keep in GCP Secrets only |

---

## 📝 Step 4: Update Frontend API URL

After backend is deployed, update `frontend/.env.production`:

```bash
VITE_API_URL=https://your-backend-url.run.app/api
```

---

## 🚀 Step 5: Deploy!

### Option 1: Automatic (Recommended)
```bash
git add .
git commit -m "Configure deployment"
git push origin main
```

**GitHub Actions will automatically deploy!**

### Option 2: Manual
```bash
# Frontend
cd frontend
npm run build
firebase deploy --only hosting

# Backend
cd backend
gcloud builds submit --tag gcr.io/gre-vocab-builder/gre-vocab-backend
gcloud run deploy gre-vocab-backend \
  --image gcr.io/gre-vocab-builder/gre-vocab-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## ✅ Step 6: Verify Deployment

### Check Frontend
```bash
firebase hosting:sites:list
```
Visit: `https://your-project.web.app`

### Check Backend
```bash
gcloud run services list
```
Visit: `https://your-backend.run.app/api/health`

---

## 🔄 Step 7: Update Backend URL in Frontend

1. Get your Cloud Run backend URL
2. Add to GitHub secret: `BACKEND_URL`
3. Update `frontend/.env.production`
4. Redeploy frontend

---

## 📊 Step 8: Monitor

### Firebase Console
https://console.firebase.google.com/

### Cloud Console  
https://console.cloud.google.com/

### GitHub Actions
https://github.com/SahilShrivastava-Dev/GRE_Verbal/actions

---

## ✅ Success Criteria

- [ ] Firebase CLI installed
- [ ] Google Cloud SDK installed
- [ ] Firebase project created
- [ ] GCP project created
- [ ] All APIs enabled
- [ ] Service account created
- [ ] Secrets created in GCP
- [ ] GitHub secrets configured
- [ ] GitHub Actions workflow file added
- [ ] Dockerfile created
- [ ] firebase.json configured
- [ ] First deployment successful
- [ ] Frontend accessible
- [ ] Backend health check passes
- [ ] Quiz works on production
- [ ] Add word works on production

---

## 🆘 Troubleshooting

### Deployment Fails?
- Check GitHub Actions logs
- Verify all secrets are correct
- Check service account permissions

### Backend 403 Error?
- Check Cloud Run permissions
- Enable unauthenticated access
- Check CORS configuration

### Frontend Can't Connect?
- Verify BACKEND_URL is correct
- Check CORS on backend
- Check browser console

---

## 💰 Cost Optimization

Free tier limits:
- **Firebase Hosting**: 10GB storage, 360MB/day bandwidth
- **Cloud Run**: 2M requests/month, 360,000 GB-seconds
- **Cloud Build**: 120 build-minutes/day

**For your use case: Should be FREE!** 🎉

---

## 🎉 You're Done!

Every push to `main` branch will now automatically deploy to production!

**Frontend**: https://gre-vocab-builder.web.app
**Backend**: https://gre-vocab-backend-xyz.run.app

Happy deploying! 🚀

