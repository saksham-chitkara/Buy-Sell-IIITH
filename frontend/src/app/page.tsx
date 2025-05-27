"use client";

import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { FlipWords } from "@/components/ui/flip-words";
import { useRouter } from "next/navigation";

function Home() {
  const router = useRouter();

  React.useEffect(() => {
    setTimeout(() => {
      router.push("/explore");
    }, 1500);
  }, []);

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      <h1 className="text-[15vw] lg:text-9xl font-bold text-center text-white relative z-20 whitespace-nowrap">
        <FlipWords words={["Buy", "Sell"]} className="text-white" duration={1000} />@ IIITH
      </h1>
      <div className="w-[40vw] h-10 lg:h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-4 lg:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-4 lg:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-10 lg:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-10 lg:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}

export default Home;
