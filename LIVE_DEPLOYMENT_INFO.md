# 🎉 GRE Verbal Prep - LIVE DEPLOYMENT

## 🌐 **Your App is LIVE!**

### **Frontend (Main App):**
**https://gre-verbal-app-41bed.web.app**

### **Backend API:**
**https://gre-verbal.onrender.com**

---

## 📱 **Access from Anywhere**

### **On Desktop:**
Simply open: **https://gre-verbal-app-41bed.web.app**

### **On Mobile:**
1. Open the link in your mobile browser
2. Add to Home Screen for app-like experience:
   - **iOS Safari**: Share → "Add to Home Screen"
   - **Android Chrome**: Menu (⋮) → "Add to Home Screen"

---

## 🔄 **Auto-Deployment (GitHub Actions)**

Any code you push to `main` branch will automatically:
1. Deploy frontend to Firebase Hosting
2. Deploy backend to Render.com

**No manual steps needed!** Just `git push` and wait ~2-3 minutes.

---

## ⚡ **Performance Notes**

### **Frontend (Firebase):**
- ✅ Always fast (global CDN)
- ✅ No cold starts
- ✅ 10GB storage, 360MB/day transfer (free tier)

### **Backend (Render.com - Free Tier):**
- ✅ 750 hours/month free
- ⚠️ **Sleeps after 15 min inactivity**
- ⚠️ **First request after sleep: ~30 seconds wake-up time**
- ✅ Subsequent requests: instant

**Tip:** If the first word addition takes ~30 seconds, that's normal - the backend is waking up!

---

## 🔑 **Your OpenRouter API Key**

The API key is securely stored in Render.com's environment variables.

**To update it:**
1. Go to: https://dashboard.render.com
2. Select your service: `gre-verbal-backend`
3. Go to "Environment" tab
4. Update `OPENROUTER_API_KEY`
5. Save (auto-redeploys)

**Current key ends in:** `...1dc7`

---

## 📊 **Monitor Your Deployments**

### **Render Dashboard:**
https://dashboard.render.com
- View logs
- Monitor uptime
- Update environment variables

### **Firebase Console:**
https://console.firebase.google.com/project/gre-verbal-app-41bed
- View hosting analytics
- Monitor bandwidth
- Manage domains

---

## 🆘 **Troubleshooting**

### **"Backend not responding" error:**
- **Cause:** Backend is sleeping (free tier limitation)
- **Solution:** Wait 30 seconds and try again

### **Words not saving:**
- Check Render logs: https://dashboard.render.com
- Verify API key is set correctly
- Check `words.json` in Render dashboard

### **Frontend not updating after code push:**
- Wait 2-3 minutes for GitHub Actions to complete
- Check Actions tab: https://github.com/SahilShrivastava-Dev/GRE_Verbal/actions
- Clear browser cache if needed

---

## 🚀 **Next Steps (Optional)**

### **To Keep Backend Always Awake (Free):**
Use a service like **UptimeRobot** or **cron-job.org** to ping your backend every 10 minutes:
- **URL to ping:** `https://gre-verbal.onrender.com/api/health`

### **To Add Custom Domain:**
1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In Firebase Console: Hosting → Add Custom Domain
3. Follow DNS setup instructions

### **To Upgrade Backend (Paid - $7/month):**
- No sleep/wake delays
- Always instant responses
- Upgrade in Render dashboard

---

## 📝 **Current Features**

✅ Add words with AI-powered enrichment (meanings, synonyms, antonyms, examples)  
✅ Smart search & filtering  
✅ 5 quiz types (Meaning, Synonym, Antonym, Text Completion, Mixed)  
✅ Word relationship graph visualization  
✅ Progress tracking & statistics  
✅ Beautiful, modern UI with Tailwind CSS  
✅ Mobile-responsive design  
✅ GRE-focused vocabulary building  

---

## 🎓 **Daily Workflow**

1. **Morning:** Add 10-15 new words from GRE practice tests
2. **Afternoon:** Review "Word Network" to see connections
3. **Evening:** Take a Daily Quiz (Mixed mode for comprehensive review)
4. **Before Bed:** Search & review words you struggled with

---

## 📧 **Support**

If you encounter any issues:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify API key is valid (test at openrouter.ai)

---

**Deployed on:** January 5, 2026  
**Last Updated:** January 5, 2026  
**Version:** 1.0.0  

**Enjoy learning! 🎓📚**

