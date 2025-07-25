# ComicHub - Comic Publishing Platform

A modern, full-stack web application for publishing and reading comics online, built with Next.js, Firebase Firestore, and imgbb for image storage.

## Features

### Public Features
- **Comic Discovery**: Browse and search comics by title, author, or genre
- **Responsive Comic Reader**: Read comics with intuitive navigation controls
- **Chapter Navigation**: Easy navigation between chapters and pages
- **Mobile-Friendly**: Optimized for reading on desktop, tablet, and mobile devices

### Admin Features
- **Comic Management**: Create, read, update, and delete comics
- **Chapter Management**: Add chapters with multiple pages to comics
- **Image Upload**: Upload cover images and comic pages via imgbb
- **Role-Based Access**: Secure admin dashboard with Firebase Authentication

## Tech Stack

- **Frontend & Backend**: Next.js 15 with App Router and TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Image Storage**: imgbb API
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- imgbb API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd comic-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   Update the following environment variables:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # imgbb Configuration (Client-side upload)
   NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up Firebase**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication with Email/Password
   - Add your domain to authorized domains
   - Create an admin user and add them to the `users` collection with role: 'admin'

5. **Get imgbb API Key**
   
   - Sign up at [imgbb.com](https://imgbb.com/)
   - Get your API key from the API section

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Structure

### Firestore Collections

```
comics/
├── {comicId}/
│   ├── title: string
│   ├── description: string
│   ├── author: string
│   ├── genre: string
│   ├── coverImageUrl: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── chapters/ (subcollection)
│       └── {chapterId}/
│           ├── comicId: string
│           ├── chapterNumber: number
│           ├── title?: string
│           ├── pageImageUrls: string[]
│           ├── createdAt: timestamp
│           └── updatedAt: timestamp

users/
└── {userId}/
    ├── email: string
    └── role: 'admin' | 'user'
```

## Architecture

This application uses a **client-side Firebase architecture** with direct service calls instead of API routes for comic and chapter operations. This approach provides:

- **Simplified Authentication**: Direct Firebase Auth integration without server-side session management
- **Real-time Updates**: Automatic data synchronization through Firestore
- **Better Performance**: Reduced API overhead and faster data access
- **Firestore Security Rules**: Database-level permissions instead of API-level authentication

### Firebase Services
- **Comics Service**: Direct Firestore operations for comic CRUD
- **Chapters Service**: Direct Firestore operations for chapter CRUD  
- **Authentication**: Firebase Auth with role-based access control

## Page Routes

### Public Routes
- `/` - Home page with comic grid and search
- `/comics/[id]` - Comic detail page
- `/read/[comicId]/[chapterId]` - Comic reader

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/login` - Admin login
- `/admin/comics/new` - Create new comic
- `/admin/comics/[id]` - Edit comic and manage chapters

## Development

### Adding New Features

1. **New API Routes**: Add to `src/app/api/`
2. **New Pages**: Add to `src/app/`
3. **New Components**: Add to `src/components/`
4. **Firebase Services**: Add to `src/services/firebase.ts`
5. **Types**: Add to `src/types/index.ts`

### Code Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── comics/            # Public comic pages
│   └── read/              # Comic reader pages
├── components/            # React components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # External service integrations
└── types/                 # TypeScript type definitions
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js, such as:
- Netlify
- Railway
- Heroku
- AWS
- Google Cloud Platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@comichub.com or create an issue in the GitHub repository.
