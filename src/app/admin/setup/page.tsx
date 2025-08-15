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
    bannerImageUrl: "https://placehold.co/1200x900/FF6B6B/FFFFFF/JPG?text=Adventure+Begins",
  },
  {
    title: "Space Warriors",
    description: "Galactic battles and cosmic adventures await as humanity explores the far reaches of space.",
    author: "Mike Johnson", 
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/4ECDC4/FFFFFF/JPG?text=Space+Warriors",
    bannerImageUrl: "https://placehold.co/1200x900/4ECDC4/FFFFFF/JPG?text=Space+Warriors",
  },
  {
    title: "High School Heroes",
    description: "Teenage superheroes dealing with both villains and homework in this coming-of-age story.",
    author: "Sarah Chen",
    genre: "Superhero", 
    coverImageUrl: "https://placehold.co/300x400/45B7D1/FFFFFF/JPG?text=High+School+Heroes",
    bannerImageUrl: "https://placehold.co/1200x900/45B7D1/FFFFFF/JPG?text=High+School+Heroes",
  },
  {
    title: "Midnight Detective",
    description: "A noir mystery following Detective Morgan through the dark underbelly of the city, solving supernatural crimes.",
    author: "Alex Rivera",
    genre: "Mystery",
    coverImageUrl: "https://placehold.co/300x400/2C3E50/FFFFFF/JPG?text=Midnight+Detective",
    bannerImageUrl: "https://placehold.co/1200x900/2C3E50/FFFFFF/JPG?text=Midnight+Detective",
  },
  {
    title: "Dragon's Legacy",
    description: "In a world where dragons once ruled, a young mage discovers their hidden heritage and ancient powers.",
    author: "Emma Wong",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/8E44AD/FFFFFF/JPG?text=Dragons+Legacy",
    bannerImageUrl: "https://placehold.co/1200x900/8E44AD/FFFFFF/JPG?text=Dragons+Legacy",
  },
  {
    title: "Cyber Punk 2090",
    description: "In the neon-lit streets of Neo Tokyo, a hacker uncovers a conspiracy that threatens all of humanity.",
    author: "Kenji Nakamura",
    genre: "Cyberpunk",
    coverImageUrl: "https://placehold.co/300x400/E67E22/FFFFFF/JPG?text=Cyber+Punk+2090",
    bannerImageUrl: "https://placehold.co/1200x900/E67E22/FFFFFF/JPG?text=Cyber+Punk+2090",
  },
  {
    title: "Love in the Library",
    description: "A heartwarming romance between two bookworms who meet in the most unexpected way at the university library.",
    author: "Sofia Martinez",
    genre: "Romance",
    coverImageUrl: "https://placehold.co/300x400/E91E63/FFFFFF/JPG?text=Love+Library",
    bannerImageUrl: "https://placehold.co/1200x900/E91E63/FFFFFF/JPG?text=Love+Library",
  },
  {
    title: "Undead Rising",
    description: "When the zombie apocalypse hits, a group of survivors must navigate both the undead and human threats.",
    author: "Marcus Black",
    genre: "Horror",
    coverImageUrl: "https://placehold.co/300x400/8B0000/FFFFFF/JPG?text=Undead+Rising",
    bannerImageUrl: "https://placehold.co/1200x900/8B0000/FFFFFF/JPG?text=Undead+Rising",
  },
  {
    title: "Martial Arts Master",
    description: "Follow Jin's journey from street fighter to legendary martial artist in this action-packed adventure.",
    author: "Liu Wei",
    genre: "Action",
    coverImageUrl: "https://placehold.co/300x400/FF8C00/FFFFFF/JPG?text=Martial+Master",
    bannerImageUrl: "https://placehold.co/1200x900/FF8C00/FFFFFF/JPG?text=Martial+Master",
  },
  {
    title: "Time Traveler's Diary",
    description: "A scientist's experiments with time travel lead to unexpected consequences across multiple timelines.",
    author: "Dr. Rebecca Foster",
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/9B59B6/FFFFFF/JPG?text=Time+Traveler",
    bannerImageUrl: "https://placehold.co/1200x900/9B59B6/FFFFFF/JPG?text=Time+Traveler",
  },
  {
    title: "Ocean's Guardians",
    description: "Underwater adventures with mermaids and sea creatures as they protect their realm from surface dwellers.",
    author: "Marina Blue",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/16A085/FFFFFF/JPG?text=Oceans+Guardians",
    bannerImageUrl: "https://placehold.co/1200x900/16A085/FFFFFF/JPG?text=Oceans+Guardians",
  },
  {
    title: "Campus Chronicles",
    description: "The daily adventures and misadventures of college students navigating friendships, studies, and life.",
    author: "Taylor Swift",
    genre: "Slice of Life",
    coverImageUrl: "https://placehold.co/300x400/F39C12/FFFFFF/JPG?text=Campus+Chronicles",
    bannerImageUrl: "https://placehold.co/1200x900/F39C12/FFFFFF/JPG?text=Campus+Chronicles",
  },
  // Additional comics for better search testing
  {
    title: "Shadow Hunter Chronicles",
    description: "In a world plagued by darkness, a lone hunter seeks to eliminate supernatural threats lurking in the shadows.",
    author: "Viktor Shadowmane",
    genre: "Action",
    coverImageUrl: "https://placehold.co/300x400/1A1A1A/FFFFFF/JPG?text=Shadow+Hunter",
    bannerImageUrl: "https://placehold.co/1200x900/1A1A1A/FFFFFF/JPG?text=Shadow+Hunter",
  },
  {
    title: "Galactic Empire Wars",
    description: "Epic space battles across multiple star systems as rebels fight against the tyrannical Galactic Empire.",
    author: "Commander Zara",
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/483D8B/FFFFFF/JPG?text=Galactic+Wars",
    bannerImageUrl: "https://placehold.co/1200x900/483D8B/FFFFFF/JPG?text=Galactic+Wars",
  },
  {
    title: "The Enchanted Forest",
    description: "A magical journey through an ancient forest where mythical creatures and hidden secrets await discovery.",
    author: "Luna Starweaver",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/228B22/FFFFFF/JPG?text=Enchanted+Forest",
    bannerImageUrl: "https://placehold.co/1200x900/228B22/FFFFFF/JPG?text=Enchanted+Forest",
  },
  {
    title: "Detective Storm",
    description: "Private investigator Amanda Storm solves the most complex criminal cases in the bustling metropolis.",
    author: "Michael Storm",
    genre: "Mystery",
    coverImageUrl: "https://placehold.co/300x400/4682B4/FFFFFF/JPG?text=Detective+Storm",
    bannerImageUrl: "https://placehold.co/1200x900/4682B4/FFFFFF/JPG?text=Detective+Storm",
  },
  {
    title: "Vampire Academy",
    description: "Students at a secret academy learn to control their supernatural abilities while facing ancient enemies.",
    author: "Bella Nightshade",
    genre: "Horror",
    coverImageUrl: "https://placehold.co/300x400/8B0000/FFFFFF/JPG?text=Vampire+Academy",
    bannerImageUrl: "https://placehold.co/1200x900/8B0000/FFFFFF/JPG?text=Vampire+Academy",
  },
  {
    title: "Mech Warrior Alpha",
    description: "Giant robot battles in a post-apocalyptic world where humanity's survival depends on skilled mech pilots.",
    author: "Steel Commander",
    genre: "Mecha",
    coverImageUrl: "https://placehold.co/300x400/696969/FFFFFF/JPG?text=Mech+Warrior",
    bannerImageUrl: "https://placehold.co/1200x900/696969/FFFFFF/JPG?text=Mech+Warrior",
  },
  {
    title: "Tokyo Romance",
    description: "A beautiful love story set in modern Tokyo, following two young professionals finding love amidst busy city life.",
    author: "Sakura Tanaka",
    genre: "Romance",
    coverImageUrl: "https://placehold.co/300x400/FF69B4/FFFFFF/JPG?text=Tokyo+Romance",
    bannerImageUrl: "https://placehold.co/1200x900/FF69B4/FFFFFF/JPG?text=Tokyo+Romance",
  },
  {
    title: "The Last Samurai",
    description: "In feudal Japan, a young warrior must restore honor to his clan while mastering the ancient ways of the samurai.",
    author: "Takeshi Yamamoto",
    genre: "Historical",
    coverImageUrl: "https://placehold.co/300x400/B22222/FFFFFF/JPG?text=Last+Samurai",
    bannerImageUrl: "https://placehold.co/1200x900/B22222/FFFFFF/JPG?text=Last+Samurai",
  },
  {
    title: "Street Fighter Chronicles",
    description: "Underground fighting tournaments where martial artists from around the world compete for ultimate glory.",
    author: "Bruce Lightning",
    genre: "Action",
    coverImageUrl: "https://placehold.co/300x400/FF4500/FFFFFF/JPG?text=Street+Fighter",
    bannerImageUrl: "https://placehold.co/1200x900/FF4500/FFFFFF/JPG?text=Street+Fighter",
  },
  {
    title: "Magic School Days",
    description: "Young wizards and witches learn to master their magical abilities while forming lifelong friendships.",
    author: "Professor Merlin",
    genre: "Fantasy",
    coverImageUrl: "https://placehold.co/300x400/9370DB/FFFFFF/JPG?text=Magic+School",
    bannerImageUrl: "https://placehold.co/1200x900/9370DB/FFFFFF/JPG?text=Magic+School",
  },
  {
    title: "Neon Nights",
    description: "In a dystopian cyberpunk future, a street-smart hacker fights against corporate oppression in neon-lit streets.",
    author: "Neo Matrix",
    genre: "Cyberpunk",
    coverImageUrl: "https://placehold.co/300x400/00CED1/FFFFFF/JPG?text=Neon+Nights",
    bannerImageUrl: "https://placehold.co/1200x900/00CED1/FFFFFF/JPG?text=Neon+Nights",
  },
  {
    title: "Pirate's Treasure",
    description: "High seas adventure following Captain Blackbeard's crew as they search for the legendary lost treasure.",
    author: "Captain Redbeard",
    genre: "Adventure",
    coverImageUrl: "https://placehold.co/300x400/8B4513/FFFFFF/JPG?text=Pirates+Treasure",
    bannerImageUrl: "https://placehold.co/1200x900/8B4513/FFFFFF/JPG?text=Pirates+Treasure",
  },
  {
    title: "Superhero Academy",
    description: "Young heroes train at a prestigious academy to master their powers and protect the world from evil.",
    author: "Hero Master",
    genre: "Superhero",
    coverImageUrl: "https://placehold.co/300x400/FFD700/FFFFFF/JPG?text=Hero+Academy",
    bannerImageUrl: "https://placehold.co/1200x900/FFD700/FFFFFF/JPG?text=Hero+Academy",
  },
  {
    title: "Zombie Apocalypse",
    description: "Survivors band together in a world overrun by zombies, fighting for humanity's last hope.",
    author: "Survival Expert",
    genre: "Horror",
    coverImageUrl: "https://placehold.co/300x400/556B2F/FFFFFF/JPG?text=Zombie+Apocalypse",
    bannerImageUrl: "https://placehold.co/1200x900/556B2F/FFFFFF/JPG?text=Zombie+Apocalypse",
  },
  {
    title: "Kitchen Wars",
    description: "Culinary students compete in intense cooking battles at the world's most prestigious culinary academy.",
    author: "Chef Supreme",
    genre: "Slice of Life",
    coverImageUrl: "https://placehold.co/300x400/FF6347/FFFFFF/JPG?text=Kitchen+Wars",
    bannerImageUrl: "https://placehold.co/1200x900/FF6347/FFFFFF/JPG?text=Kitchen+Wars",
  },
  {
    title: "Ancient Mysteries",
    description: "Archaeologist Dr. Jones uncovers ancient secrets that could change our understanding of human history.",
    author: "Dr. Indiana Jones",
    genre: "Adventure",
    coverImageUrl: "https://placehold.co/300x400/CD853F/FFFFFF/JPG?text=Ancient+Mysteries",
    bannerImageUrl: "https://placehold.co/1200x900/CD853F/FFFFFF/JPG?text=Ancient+Mysteries",
  },
  {
    title: "Digital Dreams",
    description: "In a virtual reality world, players must complete dangerous quests that blur the line between game and reality.",
    author: "VR Developer",
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/00BFFF/FFFFFF/JPG?text=Digital+Dreams",
    bannerImageUrl: "https://placehold.co/1200x900/00BFFF/FFFFFF/JPG?text=Digital+Dreams",
  },
  {
    title: "Musical Hearts",
    description: "Two talented musicians from different backgrounds find love through their shared passion for music.",
    author: "Melody Composer",
    genre: "Romance",
    coverImageUrl: "https://placehold.co/300x400/DDA0DD/FFFFFF/JPG?text=Musical+Hearts",
    bannerImageUrl: "https://placehold.co/1200x900/DDA0DD/FFFFFF/JPG?text=Musical+Hearts",
  },
  {
    title: "Sports Champions",
    description: "Follow the journey of a high school basketball team as they work together to win the national championship.",
    author: "Coach Victory",
    genre: "Sports",
    coverImageUrl: "https://placehold.co/300x400/228B22/FFFFFF/JPG?text=Sports+Champions",
    bannerImageUrl: "https://placehold.co/1200x900/228B22/FFFFFF/JPG?text=Sports+Champions",
  },
  {
    title: "Demon Slayer Chronicles",
    description: "A young warrior inherits a cursed sword and must use it to protect humanity from demonic forces.",
    author: "Blade Master",
    genre: "Action",
    coverImageUrl: "https://placehold.co/300x400/DC143C/FFFFFF/JPG?text=Demon+Slayer",
    bannerImageUrl: "https://placehold.co/1200x900/DC143C/FFFFFF/JPG?text=Demon+Slayer",
  },
  {
    title: "Space Colony Alpha",
    description: "Colonists on a distant planet face alien threats and internal conflicts while building humanity's future.",
    author: "Space Explorer",
    genre: "Sci-Fi",
    coverImageUrl: "https://placehold.co/300x400/4B0082/FFFFFF/JPG?text=Space+Colony",
    bannerImageUrl: "https://placehold.co/1200x900/4B0082/FFFFFF/JPG?text=Space+Colony",
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

      // Create at least 1 chapter for all remaining comics (indices 4 and above)
      for (let i = 4; i < comicIds.length; i++) {
        const defaultChapter = {
          chapterNumber: 1,
          title: "Chapter 1",
          pageImageUrls: [
            `https://placehold.co/800x1200/999999/FFFFFF/JPG?text=${encodeURIComponent(sampleComics[i].title)}+Ch1+P1`,
            `https://placehold.co/800x1200/999999/FFFFFF/JPG?text=${encodeURIComponent(sampleComics[i].title)}+Ch1+P2`,
            `https://placehold.co/800x1200/999999/FFFFFF/JPG?text=${encodeURIComponent(sampleComics[i].title)}+Ch1+P3`,
            `https://placehold.co/800x1200/999999/FFFFFF/JPG?text=${encodeURIComponent(sampleComics[i].title)}+Ch1+P4`
          ]
        };
        const chapterId = await chaptersService.create(comicIds[i], defaultChapter);
        addStatus(`✅ Created chapter for "${sampleComics[i].title}": ${defaultChapter.title} (ID: ${chapterId})`);
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
              <li>32 sample comics across various genres (Fantasy, Sci-Fi, Superhero, Mystery, Action, Romance, Horror, Cyberpunk, Adventure, Sports, Historical, Mecha, and more)</li>
              <li>3 chapters for &quot;The Adventure Begins&quot;</li>
              <li>2 chapters for &quot;Space Warriors&quot;</li>
              <li>3 chapters for &quot;High School Heroes&quot;</li>
              <li>2 chapters for &quot;Midnight Detective&quot;</li>
              <li>1 chapter for each of the remaining 28 comics</li>
              <li>Sample pages with placeholder images for all chapters</li>
              <li>Diverse titles, authors, and descriptions for comprehensive search testing</li>
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

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-semibold mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-1">
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
