# SkillX Project Documentation

## 1. Project Overview
**SkillX** is an AI-powered Skill Exchange and Interview Intelligence Platform designed for modern learners and mentors. It features a Resume Analyzer, Mock Interview system with Proctoring, and a Mentor/Learner dashboard.

**Project Link:** [https://ais-pre-ziiaiuhvfctmdf6tjv3aki-709390180053.asia-east1.run.app](https://ais-pre-ziiaiuhvfctmdf6tjv3aki-709390180053.asia-east1.run.app)

---

## 2. Technical Stack & Uses

### Core Languages
| Language | Role |
| :--- | :--- |
| **TypeScript** | Primary language for type safety across frontend and backend. |
| **HTML5** | Structural foundation and MediaDevices API for camera/mic access. |
| **CSS3 (Tailwind)** | Glassmorphic design and responsive layout handling. |

### Frontend Frameworks
| Tool | Use |
| :--- | :--- |
| **React 19** | UI components and site state management (Interview modes). |
| **Tailwind CSS** | Utility-first styling for the dashboard and dark aesthetic. |
| **Motion** | Fluid animations and transitions. |
| **Recharts** | Performance output via Radar Charts. |

### Backend & Infrastructure
| Tool | Use |
| :--- | :--- |
| **Express.js** | Server framework for API routes and file handling. |
| **Node.js** | Runtime for server-side JavaScript. |
| **Vite** | Build tool for performance and code bundling. |

### AI & Services
| Tool | Use |
| :--- | :--- |
| **Google Gemini AI** | Question generation, resume analysis, and interview feedback. |
| **Firebase Auth** | Secure login and Google/GitHub integration. |
| **Firebase Firestore** | Real-time database for profiles and history. |
| **PDF.js** | Server-side PDF text extraction. |

---

## 3. Viva Questions & Answers

### Frontend & UI/UX
*   **Why React?** Component-based architecture for reusability and performance.
*   **Tailwind's advantage?** Rapid custom styling without separate CSS files.

### Backend & API
*   **Why a custom server?** To handle heavy PDF processing and secure file uploads.
*   **What is Multer?** Middleware for handling multipart/form-data (file uploads).

### Database & Security
*   **Security measure?** Using Firestore Security Rules and Firebase Auth tokens.
*   **Why NoSQL?** Real-time capabilities and flexible schema for evolving data.

### AI & Advanced
*   **How does proctoring work?** Visibility listeners for tabs and camera API for focus.
*   **Which AI model?** `gemini-1.5-flash` for high-speed, low-latency processing.
