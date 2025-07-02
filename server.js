const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve logo from root directory
app.get('/logo.png', (req, res) => {
  res.sendFile(__dirname + '/logo.png');
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://khanapcalculus:Thazhath12@cluster0.ipy6r.mongodb.net/tutoring_db';

console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('Connection string being used:', MONGODB_URI);
});

// Student Schema
const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10,15}$/.test(v.replace(/[-()\s]/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  },
  grade: {
    type: String,
    required: true,
    enum: ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Graduate']
  },
  subjects: [{
    type: String,
    enum: [
      'Algebra', 'Geometry', 'Pre-Calculus', 'Calculus', 
      'AP Calculus AB', 'AP Calculus BC', 'AP Statistics',
      'Linear Algebra', 'Multivariable Calculus', 'Differential Equations',
      'IB Math HL', 'IB Math SL', 
      'Biology', 'AP Biology',
      'Chemistry', 'AP Chemistry',
      'Physics', 'AP Physics 1', 'AP Physics 2', 'AP Physics C (Mechanics)', 'AP Physics C (E&M)',
      'English', 'AP English Language', 'AP English Literature'
    ]
  }],
  preferredTimes: [{
    day: String,
    time: String
  }],
  parentName: String,
  parentEmail: String,
  parentPhone: String,
  goals: String,
  experience: String,
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

// Email configuration
console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('Email Pass:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('EMAIL_PASS value preview:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '****' : 'undefined');

// Force Gmail configuration (for debugging)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'khan.apcalculus@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server ready to send messages');
  }
});

// AI Configuration
console.log('Google Gemini API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

let gemini = null;
let openai = null;
let genAI = null;

// Initialize Google Gemini (FREE)
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try different model names (Google updates these periodically)
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-1.5-pro", 
    "gemini-pro",
    "gemini-1.0-pro"
  ];
  
  let modelFound = false;
  for (const modelName of modelNames) {
    try {
      gemini = genAI.getGenerativeModel({ model: modelName });
      console.log(`✅ Google Gemini client initialized (FREE) - using ${modelName}`);
      modelFound = true;
      break;
    } catch (error) {
      console.log(`⚠️ Model ${modelName} not available, trying next...`);
      continue;
    }
  }
  
  if (!modelFound) {
    console.log('❌ No Gemini model found, will try at runtime');
    gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Default fallback
  }
} else {
  console.log('⚠️ Google Gemini disabled (API key not provided)');
}

// Initialize OpenAI (PAID BACKUP)
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI client initialized (PAID BACKUP)');
} else {
  console.log('⚠️ OpenAI disabled (API key not provided)');
}

// Function to generate personalized AI content
async function generatePersonalizedMessage(firstName, subjects, goals, experience, grade) {
  if ((!genAI && !openai) || (!goals && !experience)) {
    return null; // Return null to use default template
  }

  const prompt = `Create a personalized, warm, and encouraging paragraph for a welcome email to a ${grade} student named ${firstName} who registered for tutoring in: ${subjects.join(', ')}. 

Student's goals: ${goals || 'Not specified'}
Student's experience/challenges: ${experience || 'Not specified'}

The paragraph should:
- Be encouraging and supportive
- Address their specific goals and challenges
- Show understanding of their subjects
- Be professional but warm
- Be 2-3 sentences long
- Start with something like "Based on your goals..."

Write only the paragraph, no additional formatting.`;

  // Try Google Gemini first (FREE)
  if (genAI) {
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const modelName of modelNames) {
      try {
        console.log(`🤖 Generating personalized message with Google Gemini (${modelName})...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(`✅ Gemini generated personalized message using ${modelName}`);
        return text.trim();
      } catch (error) {
        console.log(`❌ Google Gemini error with ${modelName}:`, error.message);
        if (modelName === modelNames[modelNames.length - 1]) {
          console.log('🔄 All Gemini models failed, falling back to OpenAI...');
        }
        continue;
      }
    }
  }

  // Fallback to OpenAI if Gemini fails
  if (openai) {
    try {
      console.log('🤖 Generating personalized message with OpenAI (PAID)...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: prompt
        }],
        max_tokens: 150,
        temperature: 0.7
      });
      console.log('✅ OpenAI generated personalized message');
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.log('❌ OpenAI error:', error.message);
    }
  }

  console.log('⚠️ Both AI services failed, using default template');
  return null; // Fall back to default template
}

// WhatsApp configuration
console.log('Twilio SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set');
console.log('Twilio Token:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set');

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ WhatsApp client initialized');
} else {
  console.log('⚠️ WhatsApp disabled (Twilio credentials not provided)');
}

// Function to send WhatsApp notification
async function sendWhatsAppNotification(message) {
  if (!twilioClient) {
    console.log('📱 WhatsApp would be sent:', message);
    return;
  }
  
  try {
    const result = await twilioClient.messages.create({
      from: 'whatsapp:+14155238886', // Twilio Sandbox number
      to: 'whatsapp:+17144008283',   // Your number
      body: message
    });
    console.log('✅ WhatsApp sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.log('❌ WhatsApp error:', error.message);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.get('/flyer', (req, res) => {
  res.sendFile(__dirname + '/flyer.html');
});

// Student registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, grade, subjects,
      preferredTimes, parentName, parentEmail, parentPhone,
      goals, experience
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !grade || !subjects) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      });
    }

    // Create new student
    const newStudent = new Student({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      grade,
      subjects,
      preferredTimes,
      parentName,
      parentEmail,
      parentPhone,
      goals,
      experience
    });

    await newStudent.save();

    // Generate AI-powered personalized content
    const aiPersonalizedMessage = await generatePersonalizedMessage(firstName, subjects, goals, experience, grade);
    
    // Determine recipient name (parent if provided, otherwise student)
    const recipientName = parentName || `${firstName}'s Parent/Guardian`;
    const isParentEmail = parentName && parentEmail;
    const emailRecipient = isParentEmail ? parentEmail : email;
    const subjectLine = isParentEmail ? 
      `🎓 Welcome to LCC360 - ${firstName}'s Tutoring Registration Confirmed` : 
      '🎓 Welcome to LCC360 - Your Tutoring Registration Confirmed';

    // Send confirmation email
    const studentMailOptions = {
      from: process.env.EMAIL_USER || 'khan.apcalculus@gmail.com',
      to: emailRecipient,
      subject: subjectLine,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); border-radius: 10px;">
            <img src="https://flyer-e3c2.onrender.com/logo.png" alt="LCC360 Tutoring" style="max-width: 120px; height: auto; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <h1 style="color: white; margin: 0; font-size: 1.5rem; font-family: 'Gill Sans MT', 'Gill Sans', 'Calibri', sans-serif; font-weight: 400; text-shadow: 1px 1px 3px rgba(0,0,0,0.3);">LEARNING COACH CENTER TUTORING</h1>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${recipientName},</p>
          
          <p style="font-size: 16px;">Thank you for registering with <strong>LCC360</strong> — where world-class math instruction meets personal attention and care. We're thrilled to welcome ${isParentEmail ? 'your child' : 'you'} to our growing community of motivated learners.</p>
          
          <p style="font-size: 16px;">You've enrolled ${isParentEmail ? 'your child' : ''} for support in the following subject(s):</p>
          
          <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>📚 ${subjects.join(', ')}</strong></p>
          </div>
          
                     ${aiPersonalizedMessage ? `
           <div style="background: #fff4e6; border: 1px solid #ffd700; border-radius: 8px; padding: 15px; margin: 20px 0;">
             <p style="margin: 0; font-size: 16px;">${aiPersonalizedMessage}</p>
           </div>
           ` : ''}
          
          <p style="font-size: 16px;">Whether ${isParentEmail ? 'your child' : 'you'} need help mastering the fundamentals or preparing for advanced university-level concepts, we're here to guide ${isParentEmail ? 'them' : 'you'} every step of the way.</p>
          
          <h3 style="color: #1e3c72; margin-top: 30px;">🧑‍🏫 What You Can Expect</h3>
          <ul style="font-size: 16px;">
            <li><strong>Expert Tutors:</strong> Our instructors are highly qualified in subjects like Calculus, Linear Algebra, Differential Equations, and more.</li>
            <li><strong>Customized Lessons:</strong> Tailored to ${isParentEmail ? 'your child\'s' : 'your'} current level, goals, and school curriculum.</li>
            <li><strong>Online Convenience:</strong> All sessions are conducted live via Zoom/Google Meet at times that work for U.S. and international students.</li>
            <li><strong>Progress Updates:</strong> You'll receive regular feedback on performance and improvement.</li>
          </ul>
          
                     <h3 style="color: #1e3c72; margin-top: 30px;">📅 What Happens Next?</h3>
           <p style="font-size: 16px;">We'll contact you shortly to schedule the first session.</p>
           
           <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
             <h3 style="color: #2e7d32; margin: 0 0 10px 0;">🎁 First Session Is Always Free!</h3>
             <p style="margin: 0; font-size: 16px;">We believe in letting our teaching speak for itself — ${isParentEmail ? 'your child\'s' : 'your'} first session is complimentary, with no obligations.</p>
           </div>
          
          <p style="font-size: 16px; margin-top: 30px;">💬 <strong>Stay Connected:</strong> We're committed to transparency and partnership with ${isParentEmail ? 'parents' : 'students'}. Please don't hesitate to contact us at any time with questions or feedback.</p>
          
          <p style="font-size: 16px; margin-top: 20px;">Welcome again to <strong>LCC360 Tutoring</strong> — we're honored to be part of ${isParentEmail ? 'your child\'s' : 'your'} academic journey.</p>
          
                     <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
             <p style="margin: 0; font-size: 16px;"><strong>Warm regards,</strong></p>
             <p style="margin: 5px 0;"><strong>Amjad Khan</strong><br>
             Founder & Lead Instructor<br>
             📧 khan.apcalculus@gmail.com<br>
             🌐 www.lcc360.com<br>
             📱 714-400-8283<br>
             📍 117 Bernal Road Suite 227, Silicon Valley, CA 95119 USA</p>
           </div>
        </div>
      `
    };

    // Send notification email to tutor
    const tutorMailOptions = {
      from: process.env.EMAIL_USER || 'khan.apcalculus@gmail.com',
      to: 'khan.apcalculus@gmail.com',
      subject: '🔔 New Student Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); border-radius: 10px;">
            <img src="https://flyer-e3c2.onrender.com/logo.png" alt="Learning Coach Center Tutoring" style="max-width: 120px; height: auto; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <h1 style="color: white; margin: 0; font-size: 1.5rem; text-shadow: 1px 1px 3px rgba(0,0,0,0.3);">Learning Coach Center Tutoring</h1>
          </div>
          <h2 style="color: #1e3c72;">New Student Registration</h2>
          <h3>Student Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${firstName} ${lastName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Grade:</strong> ${grade}</li>
            <li><strong>Subjects:</strong> ${subjects.join(', ')}</li>
            <li><strong>Goals:</strong> ${goals || 'Not specified'}</li>
            <li><strong>Experience:</strong> ${experience || 'Not specified'}</li>
          </ul>
          ${parentName ? `
            <h3>Parent/Guardian Information:</h3>
            <ul>
              <li><strong>Name:</strong> ${parentName}</li>
              <li><strong>Email:</strong> ${parentEmail || 'Not provided'}</li>
              <li><strong>Phone:</strong> ${parentPhone || 'Not provided'}</li>
            </ul>
          ` : ''}
          <p>Please contact the student to schedule their first session.</p>
        </div>
      `
    };

    // Send emails (don't wait for completion to avoid blocking)
    transporter.sendMail(studentMailOptions)
      .then(() => console.log('✅ Student email sent successfully'))
      .catch(err => console.log('❌ Student email error:', err.message));
    
    transporter.sendMail(tutorMailOptions)
      .then(() => console.log('✅ Tutor email sent successfully'))
      .catch(err => console.log('❌ Tutor email error:', err.message));

    res.json({
      success: true,
      message: 'Registration successful! We\'ll contact you within 24 hours.',
      studentId: newStudent._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.'
    });
  }
});

// Get all students (for admin panel - add authentication in production)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ registrationDate: -1 });
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Update student status
app.patch('/api/students/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, student });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ success: false, message: 'Error updating student status' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Registration form: http://localhost:${PORT}/register`);
  console.log(`🎨 Flyer: http://localhost:${PORT}/flyer`);
}); 