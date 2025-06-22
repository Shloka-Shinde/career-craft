#  Career Craft - Job Portal Web Application 

Developed a full-stack job portal matching 200+ teams in a 36-hour hackathon; won the hackahton and secured Best Pitch Award as well.

---

##  Live Demo

> 

---

##  Overview

This project was built with a clear execution flow using **Eraser** (a flow mapping tool), which allowed us to:

* Plan features upfront
* Distribute tasks efficiently within our team
* Prioritize components smartly to fit within the hackathon’s time constraints

---

##  Key Features

###  Authentication Flow

*  Landing page with secure sign-up and email verification.
*  Users must confirm their email to access the platform.
*  Redirects to role-specific dashboards post-login.

---

###  Recruiter Dashboard

* **Post Job Feature:** Recruiters can create job listings by filling out job-specific fields.
* **Real-Time Job Listings:** Jobs are visible instantly to all job seekers.
* **Skill Matching & Similarity Score:**

  * Matches candidate skillsets with recruiter requirements.
  * Uses a **Similarity Score Matching Algorithm** to rank candidates.
  * Displays **Top 5 candidates** in descending order based on match score.
* **Interview Scheduling:**

  * Recruiters can schedule interviews.
  * Automatically integrates with **Google Calendar & Google Meet**.
  * Meeting invite is sent to both the recruiter’s and candidate’s email with the calendar event.

---

###  Job Seeker Dashboard

* **Smart Job Search:**

  * Keyword-based semantic search.
  * Shows jobs with similar skills (e.g., “web developer” also shows “full-stack developer”).
* **Advanced Filters:**

  * Filter by experience level (Entry/Experienced), job type (Part-time/Full-time), etc.
* **Resume Builder:**

  * Fill out details to auto-generate a resume.
  * Upload existing resumes.
  * Create & manage multiple drafts with an option to mark one as "Primary."
* **Social Profile Analysis:**

  * Users input GitHub & LinkedIn links.
  * AI (Gemini) analyzes projects, certifications, and posts to:

    * Generate a recruiter-facing skill summary.
    * Provide improvement suggestions to the candidate (e.g., add profile summary, use professional photo).
  * **Planned Enhancement:** Leetcode profile analysis for added skill verification.

---

###  Job Market Forecasting (ML Integration)

* The job market is seasonal and volatile.
* We used **SARIMA (Seasonal ARIMA)** model to forecast trends in job openings.
* SARIMA was chosen over ARIMA for its ability to account for seasonal variations in the job market.
* Forecasts were made using historical data up to July, with predictions for Oct–Dec.

---

###  Domain Brief Module

* Gives a **summary of technologies**, prerequisites, and skill paths for each job domain.
* Helps candidates understand what to expect before applying or switching fields.

---

##  Tech Stack

| Category       | Tools / Frameworks                                 |
| -------------- | -------------------------------------------------- |
| **Frontend**   | React.js, Tailwind CSS                             |
| **Backend**    | Flask                                              |
| **Database**   | Supabase                                           |
| **AI/ML**      | Python, SARIMA (Statsmodels), Gemini API           |
| **APIs**       | Google Calendar API, GitHub API, LinkedIn scraping |
| **Deployment** | Vercel                                             |

---

## 📸 Screenshots / Demo GIFs

> 

---

## 🤝 Contributing

Pull requests and feature suggestions are welcome.
Please open an issue before submitting major changes.

---
