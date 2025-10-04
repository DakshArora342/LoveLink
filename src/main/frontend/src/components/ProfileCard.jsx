

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileCardContent({ profile }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = profile.images?.length || 0;

  const handleImageClick = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - bounds.left;

    if (clickX < bounds.width / 2) {
      setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }
  };

  const currentImage = profile.images?.[currentImageIndex];

  const extraInfo = [
    { label: "Branch", value: profile.branch },
    { label: "Zodiac", value: profile.zodiacSign },
    { label: "Relationship Goal", value: profile.relationshipGoal },
    {
      label: "Pets",
      value: profile.petPreference
        ? `🐾 ${profile.petPreference}`
        : null,
    },
    { label: "Party Style", value: profile.partyStyle },
    { label: "Communication", value: profile.communicationStyle },
    { label: "Love Language", value: profile.loveLanguage },
    { label: "Intellectual Turn-On", value: profile.intellectualTurnOn },
    { label: "Weekend Vibe", value: profile.weekendVibe },
  ].filter((item) => item.value);

 const getExtraInfoForImage = (index) => {
  const chunkSize = 6;
  const start = (index * chunkSize) % extraInfo.length;
  return extraInfo.slice(start, start + chunkSize);
};


  const extraInfoToShow = getExtraInfoForImage(currentImageIndex);

  // 🔧 Normalize interests (array OR comma/pipe separated string)
  const interests = Array.isArray(profile.interests)
    ? profile.interests
    : typeof profile.interests === "string"
    ? profile.interests
        .split(/[,\|]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
      onClick={handleImageClick}
    >
      {/* Image with fade animation */}
      <AnimatePresence mode="wait">
        {currentImage && (
          <motion.img
  key={currentImageIndex}
  src={currentImage.base64 || currentImage.url || currentImage}
  alt={`${profile.name} ${currentImageIndex + 1}`}
  initial={{ opacity: 0.6 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
  className="w-full h-auto max-h-[70vh] object-contain z-0 rounded-3xl"
/>

        )}
      </AnimatePresence>

      {/* Gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

      {/* Dot Indicators */}
<div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
  {profile.images?.map((_, idx) => (
    <motion.div
      key={idx}
      initial={false}
      animate={{
        width: currentImageIndex === idx ? 18 : 8,
        backgroundColor:
          currentImageIndex === idx ? "#8b5cf6" : "#ffffff", // premium purple active / solid white inactive
        boxShadow:
          currentImageIndex === idx
            ? "0 0 8px rgba(139, 92, 246, 0.8)" // glow for active
            : "0 0 4px rgba(0,0,0,0.3)", // soft shadow to keep white visible
      }}
      transition={{ duration: 0.3 }}
      className="h-2 rounded-full"
    />
  ))}
</div>




      {/* Compact Info Panel */}
  <div className="absolute bottom-0 left-0 w-full z-20 p-2 backdrop-blur-md bg-grey/40 border-t border-white/20 rounded-t-2xl flex flex-col gap-1">
    <h2 className="text-base font-bold text-white drop-shadow-md">
      {profile.name}, {profile.age}
    </h2>

    {profile.bio && (
      <p className="text-xs text-white/80 line-clamp-2">{profile.bio}</p>
    )}

    {profile.about && (currentImageIndex === 1 || totalImages === 1) && (
      <div className="mt-1 p-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white text-xs shadow-sm">
        <h3 className="font-semibold">✨ About Me:</h3>
        <p className="line-clamp-3">{profile.about}</p>
      </div>
    )}

    {extraInfoToShow.length > 0 && (
      <div className="mt-1 grid grid-cols-2 gap-1">
        {extraInfoToShow.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="px-2 py-1 rounded-lg border border-white/20 bg-white/10 text-white text-xs flex justify-center items-center shadow-sm"
          >
            {item.value}
          </motion.div>
        ))}
      </div>
    )}

    {interests.length > 0 && (
      <div className="mt-1 flex flex-wrap gap-1">
        {interests.map((tag, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full bg-pink-500/30 text-white text-[10px] backdrop-blur-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</div>
  );
}
