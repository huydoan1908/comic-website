# Firebase Setup Guide

## Quick Setup Methods

### Method 1: Using the Admin Setup Page (Recommended)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the setup page:**
   - Go to: `http://localhost:3000/admin/setup`
   - Click "Setup Sample Data" button
   - Wait for the setup to complete

3. **Create an admin user:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to **Authentication** → **Users**
   - Click **"Add user"**
   - Enter email: `admin@example.com` and a password
   - **Find the User UID:** After creating the user, you'll see a table with user details. The **User UID** is in the first column (it looks like: `abc123def456ghi789` or `K2jH8mN9pQ1rS3tU4vW5x`)

4. **Set up admin role:**
   - Go to **Firestore Database**
   - Navigate to `users` collection (create it if it doesn't exist)
   - Click **"Add document"**
   - Document ID: Paste the User UID from step 3
   - Add fields:
     - `email` (string): `admin@example.com`
     - `role` (string): `admin`
   - Click **"Save"**

5. **Test your setup:**
   - Go to `http://localhost:3000/admin/login`
   - Login with your admin credentials
   - You should see the admin dashboard!


---

## Firestore Security Rules

Don't forget to update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Comics - Read access for all, write access for admins only
    match /comics/{comicId} {
      allow read: if true;
      allow write: if isAdmin();
      
      // Chapters subcollection
      match /chapters/{chapterId} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }
    
    // Users - Users can read their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Environment Variables

Make sure your `.env.local` file has all Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

IMGBB_API_KEY=your-imgbb-api-key
```

## How to Find Firebase Auth UID

The Firebase Auth UID is a unique identifier for each user. Here's exactly where to find it:

### Method 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Users** tab
5. You'll see a table with all users - the **User UID** is in the first column
   - Example UID: `K2jH8mN9pQ1rS3tU4vW5xYzA1bC2dE3f`
   - It's usually 28 characters long with letters and numbers

### Method 2: After User Signs Up (Programmatically)
When a user signs up through your app, you can get their UID:
```javascript
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User UID:', user.uid); // This is what you need!
  }
});
```

### Method 3: Browser Console (For Testing)
1. Login to your app as the user
2. Open browser developer tools (F12)
3. Go to Console tab
4. Type: `firebase.auth().currentUser.uid`
5. Press Enter - this will show the UID

**Note:** The UID is generated automatically by Firebase and cannot be changed. Each user gets a unique UID when their account is created.

### Visual Guide: Finding UID in Firebase Console

1. **Firebase Console Homepage:** Select your project
2. **Authentication Section:** Click "Authentication" in left sidebar
3. **Users Tab:** Click "Users" (should be selected by default)
4. **User Table:** Look for the table with columns:
   ```
   | User UID                     | Provider | Created  | Last signed in | 
   | K2jH8mN9pQ1rS3tU4vW5xYzA... | Password | [date]   | [date]        |
   ```
5. **Copy the UID:** Click the copy button next to the UID or select and copy the text

The UID will look something like:
- `K2jH8mN9pQ1rS3tU4vW5xYzA1bC2dE3f`
- `abc123def456ghi789jkl012mno345`
- `XyZ9mN8qP7rS6tU5vW4xY3zA2bC1dE0f`

---

## Troubleshooting

- **"Permission denied" errors:** Check your Firestore security rules
- **"Missing or insufficient permissions":** Make sure you're logged in as an admin user
- **Can't create collections:** Make sure Firestore is enabled and rules allow writes
- **Setup script fails:** Check your Firebase configuration in `/src/lib/firebase.ts`

## What Gets Created

After successful setup, you'll have:

- **3 sample comics** with metadata and cover images
- **2 chapters** for the first comic with placeholder pages
- **Admin user** ready for managing content
- **Proper collection structure** matching your services

You can now start adding your own comics and chapters through the admin interface!
