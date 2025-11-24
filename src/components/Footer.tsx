export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ComicHub. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Built with Next.js, Firebase, and <span className="text-red-500">❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
