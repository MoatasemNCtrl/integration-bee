"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Background from "./components/background"
import { UserNav } from "@/components/user-nav"
import Image from "next/image"

export default function StartPage() {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleClick = () => {
    setShowMenu(true)
  }

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      {/* Background Animation */}
      <Background />

      {/* User Navigation - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <UserNav />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!showMenu ? (
          <button
            onClick={handleClick}
            className="text-xl hover:scale-110 transition-transform duration-300 bg-white/80 px-8 py-4 rounded-lg shadow-lg"
          >
            Click to Start
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Main Game Modes */}
            <div className="grid grid-cols-2 gap-6 p-6">
              <button
                onClick={() => router.push("/tournament")}
                className="w-48 h-48 bg-white/90 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 relative group overflow-hidden"
              >
                <span className="absolute inset-0 flex items-center justify-center text-lg z-10 bg-white/90 transition-opacity duration-300 group-hover:opacity-0">
                  Tournament
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-07%2010.13.42%20-%20A%20cartoonish%20illustration%20of%20a%20champion's%20cup%20made%20from%20the%20integral%20symbol%20(%E2%88%AB).%20The%20trophy%20is%20golden%20and%20shiny,%20with%20the%20integral%20symbol%20elegantly%20fo-OBxZrDgFTq2jGJ0QeenNdUCY8abknk.webp"
                    alt="Tournament Trophy"
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
              </button>

            {/* Integral Rush Button with hover effect */}
            <button
              onClick={() => router.push("/rush")}
              className="w-48 h-48 bg-white/90 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 relative group overflow-hidden"
            >
              <span className="absolute inset-0 flex items-center justify-center text-lg z-10 bg-white/90 transition-opacity duration-300 group-hover:opacity-0">
                Integral Rush
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-07%2010.11.05%20-%20A%20cartoonish%20illustration%20of%20an%20integral%20symbol%20(%E2%88%AB)%20racing%20on%20a%20track,%20with%20fire%20trailing%20behind%20it%20as%20if%20moving%20at%20high%20speed.%20The%20scene%20is%20dynamic,%20-ktGftlMf9Bktgsd1uC5pOrvf7fFFLY.webp"
                  alt="Integral Rush"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            </button>

            {/* 1v1 Button with hover effect */}
            <button
              onClick={() => router.push("/1v1")}
              className="w-48 h-48 bg-white/90 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 relative group overflow-hidden"
            >
              <span className="absolute inset-0 flex items-center justify-center text-lg z-10 bg-white/90 transition-opacity duration-300 group-hover:opacity-0">
                1v1 Duel
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-07%2010.21.06%20-%20A%20cartoonish%20illustration%20of%20two%20people%20sparring%20using%20chalk%20as%20their%20weapons%20in%20front%20of%20a%20giant%20blackboard%20filled%20with%20math%20and%20physics%20equations.%20T-5HoWZI4E9yoYrZeT106c5WDub1j0NH.webp"
                  alt="1v1 Duel"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            </button>            {/* League Button with hover effect */}
            <button
              onClick={() => router.push("/league")}
              className="w-48 h-48 bg-white/90 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 relative group overflow-hidden"
            >
              <span className="absolute inset-0 flex items-center justify-center text-lg z-10 bg-white/90 transition-opacity duration-300 group-hover:opacity-0">
                League
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-02-07%2010.21.06%20-%20A%20cartoonish%20illustration%20of%20two%20people%20sparring%20using%20chalk%20as%20their%20weapons%20in%20front%20of%20a%20giant%20blackboard%20filled%20with%20math%20and%20physics%20equations.%20T-5HoWZI4E9yoYrZeT106c5WDub1j0NH.webp"
                  alt="League Battle"
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              </div>
            </button>
            </div>

            {/* Additional Options */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => router.push("/stats")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow transition-colors duration-300"
              >
                📊 Statistics
              </button>
              <button
                onClick={() => router.push("/practice")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow transition-colors duration-300"
              >
                📚 Practice Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

