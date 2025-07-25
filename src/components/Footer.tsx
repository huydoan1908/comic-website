export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} ComicHub. All rights reserved.</p>
          <p className="mt-2">
            Built with Next.js, Firebase, and ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
