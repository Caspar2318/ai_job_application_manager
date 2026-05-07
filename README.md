# AI Job Application Tracker

AI Job Application Tracker is a full-stack job application management app built with Next.js. It helps users track job applications, organize them in a Kanban board, extract job information from job URLs, and generate AI-powered application advice and cover letters.

Link at: https://ai-job-application-manager-b7yilwjwg-caspar2318s-projects.vercel.app

## Features

### Authentication

- User registration and login
- Email format validation
- Password rule validation
- JWT-based authentication
- HTTP-only cookie session
- Protected dashboard route
- Logout functionality

### Job Application Management

- Add job applications from a job URL
- Preview parsed job information before saving
- Confirm application before adding it to the dashboard
- Edit job details
- Delete job applications
- Search jobs by company or role
- Track application status:
  - Applied
  - Interviewing
  - Rejected
  - Offer

### Job URL Parsing

- Uses Cheerio to fetch and parse job posting pages
- Extracts key job information where available:
  - Job title
  - Company
  - Location
  - Work mode
  - Company size
  - Industry/category
- Allows users to edit parsed information if needed

### Kanban Board

- Displays applications grouped by status
- Drag and drop cards between status columns
- Updates job status automatically after moving a card
- Column counts show the number of applications in each stage

### AI Features

- AI Analyze:
  - Generates application strategy
  - Provides resume optimization advice
  - Suggests interview preparation points
  - Creates a short follow-up message
- AI Cover Letter:
  - Generates a tailored cover letter based on the job posting
- AI results are saved to the database
- AI output remains available after refreshing the page
- Copy button for AI analysis and cover letter
- Close/reopen generated AI results without regenerating them

### UI / UX

- Dark SaaS-style dashboard
- Compact Kanban cards
- Status-based color system
- Loading spinner for AI actions
- Error messages auto-dismiss
- Responsive layout

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- Neon Database

### Authentication

- JWT
- HTTP-only cookies
- Next.js proxy route protection

### AI

- OpenAI API
- AI-generated job analysis
- AI-generated cover letters

### Web Scraping / Parsing

- Cheerio
- Server-side job URL parsing

### Deployment Target

- Vercel
- Neon PostgreSQL

## Project Structure

```txt
app/
  api/
    auth/
      route.ts
    logout/
      route.ts
    jobs/
      route.ts
      [id]/
        route.ts
      preview/
        route.ts
    ai/
      job-advice/
        route.ts
      cover-letter/
        route.ts

  home/
    page.tsx
    HomeClient.tsx
    components/
      PreviewJob.tsx
      MyApplications.tsx
      JobCard.tsx

  login/
    page.tsx

lib/
  auth.ts
  db.ts
  fetchJobDescription.ts
  parseJobUrl.ts

prisma/
  schema.prisma

proxy.ts
```
