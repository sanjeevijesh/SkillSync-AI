# SkillSync AI - Frontend

## 🚀 Setup Instructions

### 1. Copy all files to your `client` folder

Your folder structure should look like:
```
client/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── EmployerDashboard.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

### 2. Install Dependencies

```bash
cd client
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:3000**

---

## 🎯 Features Implemented

### For Students:
✅ Resume upload (PDF)
✅ AI-powered match prediction BEFORE applying
✅ Browse all internships
✅ View match score, matched skills, missing skills
✅ Get AI recommendations
✅ Track application status
✅ View rejection feedback

### For Employers:
✅ Post new internships
✅ View all posted internships
✅ See applicants ranked by AI match score (highest first)
✅ View detailed AI analysis for each applicant
✅ Shortlist or reject candidates
✅ Dashboard with stats

---

## 📱 How to Test

### Test as Student:

1. **Register** → Choose "Student" role
2. **Upload Resume** → Upload a PDF resume (create a simple one if needed)
3. **Browse Internships** → Click on any internship
4. **Check Match** → See AI-powered compatibility score
5. **Apply** → Submit application
6. **View Applications** → Track status

### Test as Employer:

1. **Register** → Choose "Employer" role + enter company name
2. **Post Internship** → Fill in job details and required skills
3. **Wait for Applications** → Students will apply
4. **View Applications** → See ranked list (by match score)
5. **Shortlist/Reject** → Update applicant status

---

## 🔧 Configuration

The frontend connects to the backend at: **http://localhost:5000**

If your backend runs on a different port, update `src/utils/api.js`:
```javascript
const API_URL = 'http://localhost:YOUR_PORT/api';
```

---

## 🎨 Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Lucide React** - Icons

---

## 🐛 Troubleshooting

### Issue: "CORS Error"
**Solution:** Make sure your backend (server) is running on port 5000

### Issue: "Network Error"
**Solution:** Check if backend is running: `npm run dev` in the `server` folder

### Issue: Tailwind styles not working
**Solution:** 
1. Make sure `index.css` has the Tailwind directives
2. Restart the dev server: `Ctrl+C` then `npm run dev`

---

## ✅ Next Steps

1. Test the complete flow (student + employer)
2. Upload a real PDF resume
3. Create multiple internships
4. Test AI matching
5. Deploy to production!

---

**Ready to launch? Both frontend and backend are complete!** 🚀
