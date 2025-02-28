import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-32 flex">
        <div className="flex-1 relative">
          {/* Background Circles */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#F5F9FF] rounded-full transform scale-[1.8] translate-y-1/4" />
            <div className="absolute inset-0 bg-[#E6F3FF] rounded-full transform scale-[1.6] translate-y-1/4" />
            <div className="absolute inset-0 bg-[#CCE7FF] rounded-full transform scale-[1.4] translate-y-1/4" />
            <div className="absolute inset-0 bg-[#001B42] rounded-full transform scale-[1.2] translate-y-1/4" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Astronaut */}
            <div className="w-[400px] h-[400px] relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img
                  src="/astronaut.svg"
                  alt="Astronaut"
                  className="w-64 h-64"
                />
              </div>

              {/* Stars */}
              <div className="absolute inset-0">
                <div className="absolute w-1 h-1 bg-white rounded-full top-1/4 left-1/4" />
                <div className="absolute w-1 h-1 bg-white rounded-full top-1/3 right-1/3" />
                <div className="absolute w-2 h-2 bg-[#FFB800] rounded-full top-1/4 right-1/4" />
                <div className="absolute w-1.5 h-1.5 bg-white rounded-full bottom-1/3 left-1/3" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 pt-20">
          <h1 className="text-7xl font-bold mb-6">
            <span className="text-[#0066FF]">Error</span>{" "}
            <span className="text-[#00E6CA]">404</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md">
            It seems you've wandered off to the edges of our website. Head back
            before you run out of oxygen or call for help!
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-[#0066FF] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
