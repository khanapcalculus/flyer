# 🚀 Quick Deployment Guide - Render.com

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Tutoring website ready for deployment"
git push origin main
```

## Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your repository: **`khanapcalculus/flyer`**
4. Configure the service:
   - **Name**: `tutoring-website` (or any name you prefer)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (perfect for getting started)

## Step 3: Set Environment Variables
In Render's dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/tutoring_db` |
| `EMAIL_USER` | `khan.apcalculus@gmail.com` |
| `EMAIL_PASS` | `your_gmail_app_password` |
| `NODE_ENV` | `production` |

## Step 4: Get Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **"Security"** → **"2-Step Verification"** (enable if needed)
3. Click **"App passwords"**
4. Generate password for **"Mail"**
5. Copy the 16-character password
6. Use this in the `EMAIL_PASS` environment variable above

## Step 5: Deploy!
- Click **"Create Web Service"**
- Render will build and deploy automatically
- You'll get a live URL like: `https://tutoring-website-abc123.onrender.com`

## 🌐 Your Live Website
Once deployed, your website will be available at:
- **Homepage**: `https://your-app-name.onrender.com`
- **Registration Form**: `https://your-app-name.onrender.com/register`
- **Marketing Flyer**: `https://your-app-name.onrender.com/flyer`

## ✅ What Happens Next
- Students can register online through your website
- You'll receive email notifications for new registrations
- All student data is securely stored in MongoDB Atlas
- Your flyer is accessible via a direct link for easy sharing

## 📱 Start Marketing
Share your live flyer link:
`https://your-app-name.onrender.com/flyer`

**Deployment time: ~5-10 minutes** 🚀 