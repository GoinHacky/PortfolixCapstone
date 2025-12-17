# PortfolioX: Student Portfolio Tracker
**A Digital Approach to Student Portfolio Monitoring**

## Overview
PortfolioX is a web-based student portfolio management system developed for the **College of Computer Studies (CCS) at Cebu Institute of Technology – University**. The platform centralizes the creation, management, validation, and sharing of student academic portfolios, enabling students to showcase verified projects and micro-credentials while allowing faculty to efficiently monitor and validate academic progress.

The system replaces fragmented tools such as cloud storage, offline documents, and social media with a **secure, structured, and role-based digital portfolio platform** that supports academic assessment and career readiness.

---

## Key Features

### Student
- GitHub OAuth authentication
- Create, view, update, and delete portfolio entries
- Manage projects and micro-credentials
- AI-assisted portfolio descriptions
- AI-generated resume (PDF)
- Personal dashboard with portfolio analytics
- Generate shareable portfolio links

### Faculty
- Faculty account approval workflow
- View and monitor student portfolios
- Validate projects and micro-credentials
- Course-based portfolio tracking
- Faculty dashboard with analytics and insights

### Admin
- User and faculty management
- Faculty approval workflow
- System-wide monitoring and statistics

### Recruiter
- Read-only access to student portfolios via secure shareable links
- No system login required

---

## System Architecture
PortfolioX follows a **three-tier architecture**:

1. **Frontend Layer**
   - React.js with Tailwind CSS / Material UI
   - Handles UI rendering and user interaction
   - Deployed on **Vercel**
   - Branch: `deploy/frontend`

2. **Backend Layer**
   - Spring Boot (Java)
   - RESTful APIs with JWT security
   - GitHub OAuth 2.0 authentication
   - Deployed on **Render**
   - Branch: `deploy/backend`

3. **Data Layer**
   - PostgreSQL database
   - Stores users, portfolios, projects, micro-credentials, courses, and validations
   - Hosted on **Render / Railway**

---

## Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | React.js, Tailwind CSS, Material UI |
| Backend | Spring Boot, Spring Security |
| Authentication | GitHub OAuth 2.0, JWT |
| Database | PostgreSQL |
| API | REST (JSON) |
| Visualization | Chart.js |
| Deployment | Vercel, Render |
| Project Management | ClickUp |

---

## Functional Modules
1. User Account and Profile Management  
2. Student Portfolio Management  
3. Dashboard Module (Student, Faculty, Admin)  
4. Faculty Validation and Monitoring  
5. Shareable Portfolio Links  
6. Automated AI Resume Generation  

---

## Security and Non-Functional Requirements
- Role-Based Access Control (RBAC)
- GitHub OAuth 2.0 authentication
- JWT-secured API endpoints
- Encrypted data transmission (TLS)
- Target system availability of 99%
- Optimized database queries
- Scalable cloud-based deployment

---

## Usability Evaluation
PortfolioX was evaluated using the **System Usability Scale (SUS)**:
- 36 respondents (34 students, 2 faculty)
- SUS Score: **70.24**
- Interpretation: **Above Average usability**

---

## Installation and Setup (HTTPS)

### Prerequisites
- Node.js v18+
- Java 17+
- PostgreSQL
- GitHub OAuth credentials

---

## Clone Repository (HTTPS)
```bash
git clone https://github.com/<your-username-or-organization>/PortfolioX.git
cd PortfolioX
