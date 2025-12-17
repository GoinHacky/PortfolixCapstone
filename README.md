# PortfolioX: A Digital Approach to Student Portfolio Monitoring


## 📌 Overview
PortfolioX is a web-based student portfolio management system developed for the **College of Computer Studies (CCS) at Cebu Institute of Technology – University**. The platform centralizes the creation, management, validation, and sharing of student academic portfolios, enabling students to showcase verified projects and micro-credentials while allowing faculty to efficiently monitor and validate academic progress.

The system addresses the limitations of fragmented tools such as cloud storage and social media by providing a **structured, secure, and role-based digital portfolio environment** that supports academic assessment and career readiness.

---

## 🚀 Key Features

### Student Features
- GitHub OAuth-based authentication
- Create, view, update, and delete portfolio entries
- Manage projects and micro-credentials
- AI-assisted portfolio descriptions
- AI-generated resume (PDF)
- Personal dashboard with portfolio analytics
- Generate shareable portfolio links for recruiters

### Faculty Features
- Faculty account approval workflow
- View and monitor student portfolios
- Validate projects and micro-credentials
- Course-based portfolio monitoring
- Faculty dashboard with analytics and insights

### Admin Features
- User and faculty account management
- Faculty approval and role control
- System-wide dashboard and statistics
- Portfolio and user monitoring

### Recruiter Access
- Read-only access to student portfolios via secure shareable links
- No system login required

---

## 🏗️ System Architecture
PortfolioX follows a **three-tier architecture**:

1. **Frontend Layer**
   - React.js with Tailwind CSS / Material UI
   - Handles UI rendering and user interaction
   - Deployed on **Vercel / Netlify**

2. **Backend Layer**
   - Spring Boot (Java)
   - RESTful API services
   - GitHub OAuth 2.0 authentication
   - JWT-based session management
   - Deployed on **Render**

3. **Data Layer**
   - PostgreSQL database
   - Stores users, portfolios, projects, micro-credentials, courses, and validations
   - Hosted on **Render / Railway**

---

## 🧰 Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | React.js, Tailwind CSS, Material UI |
| Backend | Spring Boot, Spring Security |
| Authentication | GitHub OAuth 2.0, JWT |
| Database | PostgreSQL |
| API Communication | REST (JSON) |
| Data Visualization | Chart.js |
| Deployment | Vercel, Render |
| Project Management | ClickUp |

---

## 🧩 Functional Modules
1. User Account and Profile Management  
2. Student Portfolio Management  
3. Dashboard Module (Student, Faculty, Admin)  
4. Faculty Validation and Monitoring  
5. Shareable Portfolio Links  
6. Automated AI Resume Generation  

---

## 🔐 Security & Non-Functional Requirements
- Role-Based Access Control (Student, Faculty, Admin)
- GitHub OAuth 2.0 authentication
- JWT-secured API endpoints
- Encrypted data transmission (TLS)
- 99% system availability target
- Optimized database queries
- Scalable cloud-based deployment

---

## 📊 Usability Evaluation
PortfolioX was evaluated using the **System Usability Scale (SUS)**:
- **36 respondents** (34 students, 2 faculty)
- **SUS Score: 70.24** (Above Average usability)

Users highlighted GitHub integration, AI-powered features, and centralized portfolio management. Identified improvement areas include onboarding support, UI consistency, and dark mode optimization.

---

## ⚙️ Installation & Setup (Development)

### Prerequisites
- Node.js (v18 or higher)
- Java 17+
- PostgreSQL
- GitHub OAuth credentials

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
