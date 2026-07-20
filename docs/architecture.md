# Architecture

## Frontend Responsibility

The React + Vite frontend will provide the recruiter-facing interface, authentication screens, resume upload flow, analysis results, user dashboard, and admin dashboard views.

## Backend Responsibility

The Node.js + Express backend will expose API routes for authentication, resume uploads, report access, admin operations, and AI analysis coordination.

## Supabase Responsibility

Supabase PostgreSQL will store users, roles, uploaded resume metadata, analysis reports, and report history.

## JWT Authentication Flow

Users will sign in through the backend, receive a JWT, and send it with protected API requests. The backend will verify the token before allowing access to user or admin resources.

## PDF Upload and Analysis Flow

Users will upload a PDF resume from the frontend. The backend will receive the file, extract resume text in a later phase, send relevant content for AI analysis, and save the generated report.

## Gemini AI Responsibility

Gemini AI will analyze extracted resume text and return practical recruiter-focused feedback, scoring, strengths, weaknesses, and improvement suggestions.

## User Dashboard

The user dashboard will show uploaded resumes, generated analysis reports, and report history for the signed-in user.

## Admin Dashboard

The admin dashboard will provide high-level oversight of users, uploads, reports, and platform activity for authorized admin accounts.

## Vercel and Render Deployment

The frontend will be deployed to Vercel. The backend API will be deployed to Render and connected to Supabase and Gemini through environment variables.
