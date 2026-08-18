import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles, ArrowRight } from "lucide-react";

const WelcomeIntro = ({ onFinish }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay prevented or video missing:", err);
      });
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-black overflow-hidden flex flex-col justify-between animate-fadeIn">
      
      {/* Background Fullscreen Video */}
      <video
        ref={videoRef}
        src="/welcome-intro.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      {/* Subtle Overlay Gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-10" />

      {/* Top Header Bar */}
      <div className="relative z-20 w-full p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm tracking-tight px-4 py-2 rounded-full bg-blue-600/40 border border-blue-500/40 backdrop-blur-md shadow-lg">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Welcome to JOBNIQUE</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md transition-all focus:outline-none shadow-lg active:scale-95"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Bottom CTA Bar: Click Here to Continue */}
      <div className="relative z-20 w-full pb-10 flex justify-center items-center">
        <button
          onClick={onFinish}
          className="flex items-center gap-3 px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 active:scale-95 transition-all duration-200 backdrop-blur-sm"
        >
          <span>Click Here to Continue</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

export default WelcomeIntro;