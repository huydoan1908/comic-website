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
    bannerImageUrl: "https://placehold.co/400x300/FF6B6B/FFFFFF/JPG?text=Adventure+Begins",
  },
  {
    title: "Space Warriors",
    description: "Galactic battles and cosmic adventures await as humanity explores the far reaches of space.",
    author: "Mike Johnson", 
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/4ECDC4/FFFFFF/JPG?text=Space+Warriors",
    bannerImageUrl: "https://placehold.co/400x300/4ECDC4/FFFFFF/JPG?text=Space+Warriors",
  },
  {
    title: "High School Heroes",
    description: "Teenage superheroes dealing with both villains and homework in this coming-of-age story.",
    author: "Sarah Chen",
    genre: "Superhero", 
    coverImageUrl: "https://placehold.co/300x400/45B7D1/FFFFFF/JPG?text=High+School+Heroes",
    bannerImageUrl: "https://placehold.co/400x300/45B7D1/FFFFFF/JPG?text=High+School+Heroes",
  },
  {
    title: "Midnight Detective",
    description: "A noir mystery following Detective Morgan through the dark underbelly of the city, solving supernatural crimes.",
    author: "Alex Rivera",
    genre: "Mystery",
    coverImageUrl: "https://placehold.co/300x400/2C3E50/FFFFFF/JPG?text=Midnight+Detective",
    bannerImageUrl: "https://placehold.co/400x300/2C3E50/FFFFFF/JPG?text=Midnight+Detective",
  },
  {
    title: "Dragon's Legacy",
    description: "In a world where dragons once ruled, a young mage discovers their hidden heritage and ancient powers.",
    author: "Emma Wong",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/8E44AD/FFFFFF/JPG?text=Dragons+Legacy",
    bannerImageUrl: "https://placehold.co/400x300/8E44AD/FFFFFF/JPG?text=Dragons+Legacy",
  },
  {
    title: "Cyber Punk 2090",
    description: "In the neon-lit streets of Neo Tokyo, a hacker uncovers a conspiracy that threatens all of humanity.",
    author: "Kenji Nakamura",
    genre: "Cyberpunk",
    coverImageUrl: "https://placehold.co/300x400/E67E22/FFFFFF/JPG?text=Cyber+Punk+2090",
    bannerImageUrl: "https://placehold.co/400x300/E67E22/FFFFFF/JPG?text=Cyber+Punk+2090",
  },
  {
    title: "Love in the Library",
    description: "A heartwarming romance between two bookworms who meet in the most unexpected way at the university library.",
    author: "Sofia Martinez",
    genre: "Romance",
    coverImageUrl: "https://placehold.co/300x400/E91E63/FFFFFF/JPG?text=Love+Library",
    bannerImageUrl: "https://placehold.co/400x300/E91E63/FFFFFF/JPG?text=Love+Library",
  },
  {
    title: "Undead Rising",
    description: "When the zombie apocalypse hits, a group of survivors must navigate both the undead and human threats.",
    author: "Marcus Black",
    genre: "Horror",
    coverImageUrl: "https://placehold.co/300x400/8B0000/FFFFFF/JPG?text=Undead+Rising",
    bannerImageUrl: "https://placehold.co/400x300/8B0000/FFFFFF/JPG?text=Undead+Rising",
  },
  {
    title: "Martial Arts Master",
    description: "Follow Jin's journey from street fighter to legendary martial artist in this action-packed adventure.",
    author: "Liu Wei",
    genre: "Action",
    coverImageUrl: "https://placehold.co/300x400/FF8C00/FFFFFF/JPG?text=Martial+Master",
    bannerImageUrl: "https://placehold.co/400x300/FF8C00/FFFFFF/JPG?text=Martial+Master",
  },
  {
    title: "Time Traveler's Diary",
    description: "A scientist's experiments with time travel lead to unexpected consequences across multiple timelines.",
    author: "Dr. Rebecca Foster",
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/9B59B6/FFFFFF/JPG?text=Time+Traveler",
    bannerImageUrl: "https://placehold.co/400x300/9B59B6/FFFFFF/JPG?text=Time+Traveler",
  },
  {
    title: "Ocean's Guardians",
    description: "Underwater adventures with mermaids and sea creatures as they protect their realm from surface dwellers.",
    author: "Marina Blue",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/16A085/FFFFFF/JPG?text=Oceans+Guardians",
    bannerImageUrl: "https://placehold.co/400x300/16A085/FFFFFF/JPG?text=Oceans+Guardians",
  },
  {
    title: "Campus Chronicles",
    description: "The daily adventures and misadventures of college students navigating friendships, studies, and life.",
    author: "Taylor Swift",
    genre: "Slice of Life",
    coverImageUrl: "https://placehold.co/300x400/F39C12/FFFFFF/JPG?text=Campus+Chronicles",
    bannerImageUrl: "https://placehold.co/400x300/F39C12/FFFFFF/JPG?text=Campus+Chronicles",
  }
];

const sampleChapters = [
  // Chapters for "The Adventure Begins" (Comic 0)
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
  },
  {
    chapterNumber: 3,
    title: "The Dark Forest",
    pageImageUrls: [
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch3+Page+1",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch3+Page+2",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch3+Page+3",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch3+Page+4",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch3+Page+5",
      "https://placehold.co/800x1200/FF6B6B/FFFFFF/JPG?text=Ch3+Page+6"
    ]
  }
];

const sampleChaptersForOtherComics = [
  // Chapters for "Space Warriors" (Comic 1)
  {
    chapterNumber: 1,
    title: "Launch Sequence",
    pageImageUrls: [
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch1+P1",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch1+P2",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch1+P3",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch1+P4"
    ]
  },
  {
    chapterNumber: 2,
    title: "Alien Encounter",
    pageImageUrls: [
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch2+P1",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch2+P2",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch2+P3",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch2+P4",
      "https://placehold.co/800x1200/4ECDC4/FFFFFF/JPG?text=SW+Ch2+P5"
    ]
  }
];

const sampleChaptersForSuperheroes = [
  // Chapters for "High School Heroes" (Comic 2)
  {
    chapterNumber: 1,
    title: "Powers Awakened",
    pageImageUrls: [
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch1+P1",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch1+P2",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch1+P3"
    ]
  },
  {
    chapterNumber: 2,
    title: "First Day Chaos",
    pageImageUrls: [
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch2+P1",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch2+P2",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch2+P3",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch2+P4"
    ]
  },
  {
    chapterNumber: 3,
    title: "Team Formation",
    pageImageUrls: [
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch3+P1",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch3+P2",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch3+P3",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch3+P4",
      "https://placehold.co/800x1200/45B7D1/FFFFFF/JPG?text=HSH+Ch3+P5"
    ]
  }
];

const sampleChaptersForDetective = [
  // Chapters for "Midnight Detective" (Comic 3)
  {
    chapterNumber: 1,
    title: "The First Case",
    pageImageUrls: [
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch1+P1",
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch1+P2",
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch1+P3",
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch1+P4"
    ]
  },
  {
    chapterNumber: 2,
    title: "Shadows and Clues",
    pageImageUrls: [
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch2+P1",
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch2+P2",
      "https://placehold.co/800x1200/2C3E50/FFFFFF/JPG?text=MD+Ch2+P3"
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

      // Create chapters for different comics
      if (comicIds.length > 0) {
        // Chapters for "The Adventure Begins" (first comic)
        for (const chapter of sampleChapters) {
          const chapterId = await chaptersService.create(comicIds[0], chapter);
          addStatus(`✅ Created chapter for "${sampleComics[0].title}": ${chapter.title} (ID: ${chapterId})`);
        }
      }

      if (comicIds.length > 1) {
        // Chapters for "Space Warriors" (second comic)
        for (const chapter of sampleChaptersForOtherComics) {
          const chapterId = await chaptersService.create(comicIds[1], chapter);
          addStatus(`✅ Created chapter for "${sampleComics[1].title}": ${chapter.title} (ID: ${chapterId})`);
        }
      }

      if (comicIds.length > 2) {
        // Chapters for "High School Heroes" (third comic)
        for (const chapter of sampleChaptersForSuperheroes) {
          const chapterId = await chaptersService.create(comicIds[2], chapter);
          addStatus(`✅ Created chapter for "${sampleComics[2].title}": ${chapter.title} (ID: ${chapterId})`);
        }
      }

      if (comicIds.length > 3) {
        // Chapters for "Midnight Detective" (fourth comic)
        for (const chapter of sampleChaptersForDetective) {
          const chapterId = await chaptersService.create(comicIds[3], chapter);
          addStatus(`✅ Created chapter for "${sampleComics[3].title}": ${chapter.title} (ID: ${chapterId})`);
        }
      }

      addStatus('🎉 Firestore setup complete!');
      addStatus(`📊 Created ${comicIds.length} comics with multiple chapters`);
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
              <li>12 sample comics across various genres (Fantasy, Sci-Fi, Superhero, Mystery, etc.)</li>
              <li>3 chapters for &quot;The Adventure Begins&quot;</li>
              <li>2 chapters for &quot;Space Warriors&quot;</li>
              <li>3 chapters for &quot;High School Heroes&quot;</li>
              <li>2 chapters for &quot;Midnight Detective&quot;</li>
              <li>Sample pages with placeholder images for all chapters</li>
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
