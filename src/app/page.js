import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="w-full sticky top-0 bg-background border-b border-border z-50">
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
          <h1 className="text-2xl font-bold">BackpackingAtlas</h1>
          <div className="hidden md:flex space-x-4">
            <Link href="/map">Map</Link>
            <Link href="/routes">Routes</Link>
            <Link href="/gear">Gear</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/store">Store</Link>
            <Link href="/events">Events</Link>
            <Link href="/community">Community</Link>
          </div>
          <Button variant="outline">Sign In</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-[60vh]">
        <Image
          src="/hero.jpg"
          alt="Hero image"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Explore the World on Foot</h2>
          <p className="text-lg max-w-xl">Discover curated backpacking routes, share your own, and connect with the hiking community.</p>
        </div>
      </section>

      {/* Featured Routes Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-semibold mb-6">Featured Routes</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-muted rounded-lg overflow-hidden shadow">
            <div className="h-48 bg-gray-300" />
            <div className="p-4">
              <h4 className="font-bold">John Muir Trail</h4>
              <p className="text-sm text-muted-foreground">California, USA</p>
              <p className="mt-2 text-sm">A breathtaking 211-mile trail through the Sierra Nevada.</p>
            </div>
          </div>
          <div className="bg-muted rounded-lg overflow-hidden shadow">
            <div className="h-48 bg-gray-300" />
            <div className="p-4">
              <h4 className="font-bold">Torres del Paine Circuit</h4>
              <p className="text-sm text-muted-foreground">Patagonia, Chile</p>
              <p className="mt-2 text-sm">One of the most scenic treks in South America.</p>
            </div>
          </div>
          <div className="bg-muted rounded-lg overflow-hidden shadow">
            <div className="h-48 bg-gray-300" />
            <div className="p-4">
              <h4 className="font-bold">West Highland Way</h4>
              <p className="text-sm text-muted-foreground">Scotland</p>
              <p className="mt-2 text-sm">A stunning 96-mile route through the Scottish Highlands.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/submit">Submit Your Route</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground text-sm text-center p-6 mt-12">
        © {new Date().getFullYear()} BackpackingAtlas. All rights reserved.
      </footer>
    </div>
  );
}


