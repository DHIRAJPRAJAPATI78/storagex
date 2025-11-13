"use client";
import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Aifeatures() {
  const router = useRouter();
  let isSubscribed = true;
  const handelClick = () => {
    isSubscribed ? router.push("/summary") : router.push("/pricing");
  };

  return (
    <section className='flex min-h-screen flex-col items-center justify-center px-4 text-center bg-gray-50'>
      <div className='max-w-2xl space-y-6'>
        <h2 className='text-lg md:text-xl font-semibold text-[#FA7275] uppercase tracking-wide flex items-center justify-center gap-2'>
          <Sparkles className='h-5 w-5 text-[#e81518] animate-pulse' />
          Powered by AI
        </h2>

        <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
          Ready to Save Hours of Reading Time?
        </h1>

        <p className='text-gray-700 text-base md:text-lg'>
          Transform lengthy documents into clear, actionable insights with our
          AI-powered summarizer.
        </p>

        <button onClick={handelClick}>
          <Link
            href='/upload'
            className='mt-4 px-6 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-all shadow-md flex items-center gap-2 justify-center '
          >
            Get Started <span className='text-lg animate-pulse'>&rarr;</span>
          </Link>
        </button>
      </div>
    </section>
  );
}
