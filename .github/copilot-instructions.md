# Copilot Instructions for Comic Website

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js 15 comic publishing and reading platform with the following tech stack:
- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Image Storage**: Cloudinary API
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation

## Architecture
- **Public Routes**: Comic browsing, reading, and search functionality
- **Admin Routes**: Protected dashboard for comic and chapter management
- **API Routes**: Backend endpoints for CRUD operations and image uploads

## Firebase Collections Structure
- `comics`: Main comic documents with metadata
  - `chapters` (subcollection): Chapter documents with page image URLs
- `users`: User documents with role-based access control

## Key Features
- Responsive comic reader with navigation controls
- Admin dashboard with CRUD operations
- Image upload to Cloudinary with URL storage
- Role-based authentication system
- Search and filter functionality

## Coding Guidelines
- Use TypeScript for type safety
- Implement proper error handling and loading states
- Follow Next.js App Router conventions
- Use Tailwind CSS for consistent styling
- Implement responsive design for all devices
