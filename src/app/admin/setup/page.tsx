'use client';

import { useState } from 'react';
import { comicsService, chaptersService } from '@/services/firebase';
import { Button } from '@/components/ui/Button';

const sampleComics = [
  {
    title: "The Adventure Begins",
    description: "An epic tale of heroes and villains in a magical world filled with magic, mystery, and ancient prophecies.",
    author: "Jane Smith",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/FF6B6B/FFFFFF/JPG?text=Adventure+Begins",
  },
  {
    title: "Space Warriors",
    description: "Galactic battles and cosmic adventures await as humanity explores the far reaches of space.",
    author: "Mike Johnson", 
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/4ECDC4/FFFFFF/JPG?text=Space+Warriors",
  },
  {
    title: "High School Heroes",
    description: "Teenage superheroes dealing with both villains and homework in this coming-of-age story.",
    author: "Sarah Chen",
    genre: "Superhero", 
    coverImageUrl: "https://placehold.co/300x400/45B7D1/FFFFFF/JPG?text=High+School+Heroes",
  }
];

const sampleChapters = [
  {
    chapterNumber: 1,
    title: "The Journey Starts",
    pageImageUrls: [
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Page+1",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Page+2", 
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Page+3",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Page+4",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Page+5"
    ]
  },
  {
    chapterNumber: 2,
    title: "First Challenge", 
    pageImageUrls: [
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch2+Page+1",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch2+Page+2",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch2+Page+3",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch2+Page+4"
    ]
  }
];

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addStatus = (message: string) => {
    setSetupStatus(prev => [...prev, message]);
  };

  const setupFirestore = async () => {
    setIsLoading(true);
    setSetupStatus([]);
    setError(null);

    try {
      addStatus('🚀 Starting Firestore setup...');

      // Create sample comics
      const comicIds: string[] = [];
      
      for (const comic of sampleComics) {
        const comicId = await comicsService.create(comic);
        comicIds.push(comicId);
        addStatus(`✅ Created comic: ${comic.title} (ID: ${comicId})`);
      }

      // Create sample chapters for the first comic
      const firstComicId = comicIds[0];
      
      for (const chapter of sampleChapters) {
        const chapterId = await chaptersService.create(firstComicId, chapter);
        addStatus(`✅ Created chapter: ${chapter.title} (ID: ${chapterId})`);
      }

      addStatus('🎉 Firestore setup complete!');
      addStatus('📝 Note: You still need to create an admin user in Firebase Authentication');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Setup</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Setup Instructions</h2>
          <div className="text-yellow-700">
            <p className="mb-2">This will create sample data in your Firestore database:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>3 sample comics with cover images</li>
              <li>2 chapters for the first comic</li>
              <li>Sample pages with placeholder images</li>
            </ul>
            <p className="mt-3 font-medium">
              After setup, you&apos;ll need to create an admin user in Firebase Authentication manually.
            </p>
          </div>
        </div>

        <Button 
          onClick={setupFirestore} 
          disabled={isLoading}
          className="w-full mb-6"
        >
          {isLoading ? 'Setting up...' : 'Setup Sample Data'}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error occurred:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {setupStatus.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Setup Progress:</h3>
            <div className="space-y-1">
              {setupStatus.map((status, index) => (
                <div key={index} className="text-sm font-mono">
                  {status}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Run the setup above to create sample data</li>
            <li>Go to Firebase Console → Authentication</li>
            <li>Create a new user account</li>
            <li>Copy the user&apos;s UID from the Authentication tab</li>
            <li>Go to Firestore → users collection</li>
            <li>Create a document with the UID as document ID</li>
            <li>Add fields: email (string) and role (string: &quot;admin&quot;)</li>
            <li>Test login with your new admin account!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
