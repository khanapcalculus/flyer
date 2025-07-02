# Expert Math Tutoring - Business Website & Flyer

A complete digital solution for an online math tutoring business with 13+ years of experience. This package includes a beautiful marketing flyer and a full-featured registration website with MongoDB database support.

## 🎯 Features

### Marketing Flyer (`flyer.html`)
- **Beautiful, Modern Design**: Eye-catching gradient backgrounds and professional styling
- **Comprehensive Subject Listing**: All math subjects from Algebra to AP Calculus, IB Math, and advanced topics
- **Contact Information**: Phone, WhatsApp, email, and website details prominently displayed
- **Mobile Responsive**: Optimized for sharing across all social media platforms
- **Print-Ready**: Can be easily converted to PDF or image formats

### Registration Website
- **Professional Homepage**: Modern landing page with features and contact information
- **Student Registration Form**: Comprehensive form with all necessary fields
- **MongoDB Integration**: Secure database storage for student information
- **Email Notifications**: Automatic confirmation emails to students and tutor
- **Subject Selection**: Multiple math and other subjects available
- **Parent/Guardian Info**: Optional parent contact details
- **Responsive Design**: Works perfectly on all devices

## 📋 Subjects Offered

### Mathematics (Primary Focus)
- Algebra
- Geometry  
- Pre-Calculus
- Calculus
- AP Calculus AB & BC
- AP Statistics
- Linear Algebra
- Multivariable Calculus
- Differential Equations
- IB Math (HL & SL)

### Additional Subjects (Through Network)
- Biology
- Chemistry
- Physics
- English

## 🚀 Deployment on Render.com

### Quick Deploy to Render (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `khanapcalculus/flyer`
   - Render will automatically detect it's a Node.js app
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Set Environment Variables**
   In Render's dashboard, add these environment variables:
   ```
   MONGODB_URI=mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/tutoring_db
   EMAIL_USER=khan.apcalculus@gmail.com
   EMAIL_PASS=your_gmail_app_password
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - You'll get a live URL like: `https://your-app-name.onrender.com`

### Your Live Website URLs Will Be:
- **Homepage**: `https://your-app-name.onrender.com`
- **Registration**: `https://your-app-name.onrender.com/register`
- **Marketing Flyer**: `https://your-app-name.onrender.com/flyer`

### 🎯 Flyer Registration Integration:
Your flyer now includes **two prominent register buttons** that automatically link to your deployed registration website:
- **"Register Online Now"** button (main content area)
- **"Start Your Journey"** button (call-to-action section)
- Both buttons open the registration form in new tabs
- Perfect for sharing the flyer while driving registrations to your website

## 🚀 Local Development (Optional)

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (already set up)

### Installation
```bash
# Install dependencies
npm install

# Create .env file with your environment variables
# See config-example.txt for the exact format

# Start the server
npm start

# For development with auto-restart
npm run dev
```

### Local Access
- **Homepage**: http://localhost:3000
- **Registration**: http://localhost:3000/register
- **Flyer**: http://localhost:3000/flyer

## 📧 Contact Information

- **Phone & WhatsApp**: 714-400-8283
- **Email**: khan.apcalculus@gmail.com
- **Website**: www.lcc360.com

## 💼 Business Features

### For Students & Parents
- Easy online registration
- Multiple subject options
- Flexible scheduling preferences
- Parent/guardian information capture
- Goal setting and experience tracking

### For the Tutor
- Automatic email notifications for new registrations
- Student information management
- Contact details collection
- Subject preference tracking
- Professional online presence

## 🎨 Customization

### Design Features
- **Unique Font**: Uses elegant "Caviar Dreams" font throughout for a distinctive, professional look
- **Bold Oxford Blue Design**: Solid dark blue elements for strong academic credibility and professional appearance
- **Appealing Color Palette**: Beautiful blue-to-purple-to-pink gradient scheme that's modern and engaging
- **Consistent Solid Colors**: All tiles, cards, and buttons use solid Oxford blue (#002147) for maximum impact
- **Strong Academic Branding**: Bold dark blue conveys educational authority and trustworthiness
- **Multiple Registration Pathways**: Flyer register buttons, homepage hero button, bottom CTA, and floating registration button for maximum accessibility
- **Responsive Design**: Optimized for all devices and screen sizes with proper spacing for all content visibility
- **Professional Shadows**: Elegant drop shadows and depth effects without transparency
- **Full Content Visibility**: Proper bottom spacing ensures all content is visible and accessible

### Flyer Customization
- Edit `flyer.html` to modify contact information, subjects, or styling
- Colors, fonts, and layout can be easily adjusted in the CSS section
- Add or remove subjects in the subjects grid
- Font family is set to 'Caviar Dreams' with 'Quicksand' fallback

### Website Customization
- Modify `public/index.html` for homepage changes
- Update `public/register.html` for registration form modifications
- Adjust `server.js` for backend functionality changes
- Customize email templates in the server file
- All pages use consistent "Caviar Dreams" typography

## 📱 Social Media Sharing

The flyer is optimized for sharing on:
- Facebook
- Instagram
- WhatsApp
- LinkedIn
- Twitter
- Parent Facebook groups
- Educational forums

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting to prevent spam
- Secure MongoDB connections
- CORS protection
- Helmet.js security headers
- Email validation

## 📊 Database Schema

The system stores student information including:
- Personal details (name, email, phone)
- Academic information (grade level, subjects)
- Scheduling preferences
- Parent/guardian contacts
- Learning goals and experience
- Registration timestamps

## 🌐 Production Deployment

### Environment Variables for Production:
```
MONGODB_URI=mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/tutoring_db
EMAIL_USER=khan.apcalculus@gmail.com
EMAIL_PASS=your_production_app_password
NODE_ENV=production
```

### Gmail App Password Setup:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" → "2-Step Verification" (enable if not already)
3. Go to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password in EMAIL_PASS

## 📈 Marketing Strategy

### Use the Flyer for:
1. **Social Media Posts**: Share on Facebook, Instagram stories
2. **WhatsApp Groups**: Send to parent groups and educational communities
3. **Email Marketing**: Attach to newsletters and email campaigns
4. **Print Materials**: Convert to PDF for physical flyers
5. **Website Integration**: Embed on existing websites

### Website Benefits:
1. **Professional Credibility**: Modern, trustworthy online presence
2. **Lead Generation**: Capture detailed student information
3. **Automation**: Automatic email notifications and follow-ups
4. **Data Management**: Organized student database
5. **Scalability**: Handle multiple registrations efficiently

## 🎯 Success Tips

1. **Share the flyer widely** in parent Facebook groups and educational communities
2. **Use existing student networks** - ask current students' parents to share
3. **Leverage WhatsApp** - send the flyer to your contact list
4. **Professional presentation** - the modern design builds trust
5. **Follow up quickly** - respond to registrations within 24 hours as promised

## 📞 Support

For any questions about setup or customization, contact:
- Email: khan.apcalculus@gmail.com
- Phone: 714-400-8283

---

**Ready to grow your tutoring business? Deploy to Render.com and start collecting registrations today!** 🚀📚 