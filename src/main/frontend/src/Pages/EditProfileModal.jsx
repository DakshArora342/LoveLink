import { useState } from "react";
import { motion } from "framer-motion";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import ProfileCard from "../components/ProfileCard";
import axiosInstance, { getUser } from "../utils/axios";
import logger from "../utils/logger";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const zodiacOptions = ["♑ Capricorn", "♒ Aquarius", "♓ Pisces", "♈ Aries", "♉ Taurus", "♊ Gemini", "♋ Cancer", "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Scorpio", "♐ Sagittarius"];
const branchOptions = ["BCA", "BBA", "💻 CSE", "🤖 AI/ML", "🖥 IT", "⚙️ Mechanical", "🧪 Chemical", "🔧 ECE", "🔌 EEE", "🏗 Civil", "🧬 Biotech", "✈️ Aerospace", "🔩 Metallurgy", "Other"];
const genderOptions = ["Male", "Female"];

const lifestyleOptions = {
  relationshipGoal: ["💬 Just friends", "🎯 Something casual", "🔍 Open to explore", "💞 Long-term"],
  petPreference: ["🐶 Dog person", "🐱 Cat person", "🐾 Animal lover", "🙅‍♂️ Not into pets"],
  partyStyle: ["🎉 Party animal", "🛋️ Chill at home", "🎭 Depends on mood", "🙃 Rarely go out"]
};

const communicationStyles = { label: "Communication Style", key: "communicationStyle", options: ["📱 Big time texter", "📞 Phone caller", "🎥 Video chatter", "😅 Bad texter", "🧍 Better in person"] };
const loveLanguages = { label: "Love Language", key: "loveLanguage", options: ["🎁 Presents", "🫂 Touch", "💬 Compliments", "🕰️ Time together", "💡 Thoughtful gestures"] };
const intellectualTurnOns = { label: "Intellectual Turn-On", key: "intellectualTurnOn", options: ["🧠 Deep conversations", "⚡ Quick wit", "🎨 Creative thinker", "🔍 Curiosity", "🚀 Ambition"] };
const weekendVibes = { label: "Weekend Vibe", key: "weekendVibe", options: ["📺 Chill & Netflix", "🎉 Party hard", "⛰️ Nature escape", "🍔 Foodie adventures", "🛁 Self-care & rest"] };

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState("edit");
  const [expandedSection, setExpandedSection] = useState(null);

  const [name, setName] = useState(profile.name || "");
  const [age, setAge] = useState(profile.age || "");
  const [bio, setBio] = useState(profile.about || "");
  const [branch, setBranch] = useState(profile.branch || "");
  const [zodiac, setZodiac] = useState(profile.zodiacSign || "");

  const [gender, setGender] = useState(genderOptions.includes(profile.gender) ? profile.gender : "Custom");
  const [customGender, setCustomGender] = useState(genderOptions.includes(profile.gender) ? "" : (profile.gender || ""));
  const finalGender = gender === "Custom" ? customGender.trim() : gender;

  const [communicationStyle, setCommunicationStyle] = useState(profile.communicationStyle || "");
  const [loveLanguage, setLoveLanguage] = useState(profile.loveLanguage || "");
  const [intellectualTurnOn, setIntellectualTurnOn] = useState(profile.intellectualTurnOn || "");
  const [weekendVibe, setWeekendVibe] = useState(profile.weekendVibe || "");

  const [lifestyle, setLifestyle] = useState({
    relationshipGoal: profile.relationshipGoal || "",
    petPreference: profile.petPreference || "",
    partyStyle: profile.partyStyle || ""
  });

  // ✅ Always prefer base64 for display, url only for deletion
  const [images, setImages] = useState(
    (profile.photos || []).map(photo => ({
      url: photo.base64 || photo.url,
      fileName: photo.url ? photo.url.split("/").pop() : null,
      file: null
    }))
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`File "${file.name}" is not a supported image format.`);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`File "${file.name}" exceeds max size of 5MB.`);
      return;
    }

    const newImage = {
      url: URL.createObjectURL(file),
      file
    };

    setImages(prev => [...prev, newImage]);
    e.target.value = '';
  };

  const handleDelete = async (index) => {
    const img = images[index];

    if (img.file) {
      URL.revokeObjectURL(img.url);
    }

    if (!img.file && img.fileName) {
      try {
        const relativePath = `/uploads/${img.fileName}`;
        await axiosInstance.delete("/user-profiles/image", {
          data: {
            userId: getUser(),
            imageUrl: relativePath
          }
        });
        toast.success("Image deleted successfully");
      } catch (err) {
        logger.error(err);
        return;
      }
    }

    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const profileData = {
      name,
      age,
      gender: finalGender,
      branch,
      about: bio,
      zodiacSign: zodiac,
      communicationStyle,
      loveLanguage,
      intellectualTurnOn,
      weekendVibe,
      relationshipGoal: lifestyle.relationshipGoal,
      petPreference: lifestyle.petPreference,
      partyStyle: lifestyle.partyStyle,
    };

    const formData = new FormData();
    formData.append("profile", new Blob([JSON.stringify(profileData)], { type: "application/json" }));

    images.forEach((img) => {
      if (img.file) {
        formData.append("images", img.file);
      }
    });

    const user = getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }

    formData.append("userId", user);

    try {
      await axiosInstance.post("/user-profiles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSave();
      onClose();
    } catch (err) {
      toast.error("Failed to save profile.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderChips = (options, selected, setSelected) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(option => (
        <button
          key={option}
          className={`px-3 py-1 rounded-full border text-sm transition ${selected === option ? "bg-pink-500 text-white border-pink-500" : "border-white text-white/80 hover:bg-white/10"}`}
          onClick={() => {
            setSelected(option);
            setExpandedSection(null);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderLifestyleChips = key =>
    renderChips(lifestyleOptions[key], lifestyle[key], val =>
      setLifestyle(prev => ({ ...prev, [key]: val }))
    );

  const SectionRow = ({ label, value, onClick }) => (
    <div className="flex justify-between items-center px-3 py-2 border-b border-white/20 cursor-pointer" onClick={onClick}>
      <span className="text-white font-medium">{label}</span>
      <span className="text-white/70 text-sm">{value || "Select"}</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={{ duration: 0.2 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl w-[90%] max-w-md shadow-2xl text-white relative max-h-[90vh] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-white hover:text-red-400">✕</button>

        {/* Tabs */}
        <div className="flex justify-center my-4">
          {"edit" && (
            <button onClick={() => setTab("edit")}
              className={`px-4 py-1 mx-1 rounded-full text-sm font-medium transition ${tab === "edit" ? "bg-pink-500 text-white" : "bg-white/20 text-white/70 hover:bg-white/30"}`}
            >
              Edit
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-3rem)] px-6 pb-32">
          {tab === "edit" ? (
            <div className="space-y-4">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full px-4 py-2 rounded-lg bg-white/10 text-white no-border" />
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} placeholder="Age" className="w-full px-4 py-2 rounded-lg bg-white/10 text-white no-spin no-border" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="About Me" rows={3} className="w-full px-4 py-2 rounded-lg bg-white/10 text-white no-resize no-border" />

              <SectionRow label="Branch" value={branch} onClick={() => setExpandedSection(expandedSection === "branch" ? null : "branch")} />
              {expandedSection === "branch" && renderChips(branchOptions, branch, setBranch)}

              <SectionRow label="Zodiac Sign" value={zodiac} onClick={() => setExpandedSection(expandedSection === "zodiac" ? null : "zodiac")} />
              {expandedSection === "zodiac" && renderChips(zodiacOptions, zodiac, setZodiac)}

              <SectionRow label="Gender" value={finalGender || "Select"} onClick={() => setExpandedSection(expandedSection === "gender" ? null : "gender")} />
              {expandedSection === "gender" && (
                <div className="mt-2 space-y-2">
                  {genderOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="gender" value={option} checked={gender === option} onChange={() => setGender(option)} className="accent-pink-500" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              <SectionRow label={communicationStyles.label} value={communicationStyle} onClick={() => setExpandedSection(expandedSection === communicationStyles.key ? null : communicationStyles.key)} />
              {expandedSection === communicationStyles.key && renderChips(communicationStyles.options, communicationStyle, setCommunicationStyle)}

              <SectionRow label={loveLanguages.label} value={loveLanguage} onClick={() => setExpandedSection(expandedSection === loveLanguages.key ? null : loveLanguages.key)} />
              {expandedSection === loveLanguages.key && renderChips(loveLanguages.options, loveLanguage, setLoveLanguage)}

              <SectionRow label={intellectualTurnOns.label} value={intellectualTurnOn} onClick={() => setExpandedSection(expandedSection === intellectualTurnOns.key ? null : intellectualTurnOns.key)} />
              {expandedSection === intellectualTurnOns.key && renderChips(intellectualTurnOns.options, intellectualTurnOn, setIntellectualTurnOn)}

              <SectionRow label={weekendVibes.label} value={weekendVibe} onClick={() => setExpandedSection(expandedSection === weekendVibes.key ? null : weekendVibes.key)} />
              {expandedSection === weekendVibes.key && renderChips(weekendVibes.options, weekendVibe, setWeekendVibe)}

              <SectionRow label="Relationship Goal" value={lifestyle.relationshipGoal} onClick={() => setExpandedSection(expandedSection === "relationshipGoal" ? null : "relationshipGoal")} />
              {expandedSection === "relationshipGoal" && renderLifestyleChips("relationshipGoal")}

              <SectionRow label="Pet Preference" value={lifestyle.petPreference} onClick={() => setExpandedSection(expandedSection === "petPreference" ? null : "petPreference")} />
              {expandedSection === "petPreference" && renderLifestyleChips("petPreference")}

              <SectionRow label="Party Style" value={lifestyle.partyStyle} onClick={() => setExpandedSection(expandedSection === "partyStyle" ? null : "partyStyle")} />
              {expandedSection === "partyStyle" && renderLifestyleChips("partyStyle")}

              {/* Images Upload */}
              <div className="mt-6">
                <p className="text-white font-medium mb-2">Photos (max 6)</p>
                <div className="text-xs text-white/70 mb-2">
                  ⚠️ Deleting is instant, but adding a photo requires clicking <strong>“Save Profile”</strong>.<br />
                  You can’t delete your only photo unless a new one is added first.
                </div>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/30">
                      <img src={img.url} alt={`User photo ${idx + 1}`} className="object-cover object-center w-full h-full" />
                      <button className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:text-red-400" onClick={() => handleDelete(idx)}>
                        <MdDelete size={18} />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <label className="w-24 h-24 flex items-center justify-center border border-white/30 rounded-lg cursor-pointer text-white/60 hover:text-white transition">
                      +
                      <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleImageChange} className="hidden" disabled={images.length >= 6} />
                    </label>
                  )}
                </div>
              </div>

              <button onClick={handleSave} disabled={isSaving} className={`w-full mt-8 py-3 rounded-full font-semibold transition ${isSaving ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700 text-white"}`}>
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          ) : (
            <ProfileCard profile={{
              ...profile,
              name, about: bio, branch, zodiacSign: zodiac,
              gender: finalGender,
              communicationStyle, loveLanguage, intellectualTurnOn, weekendVibe,
              relationshipGoal: lifestyle.relationshipGoal,
              petPreference: lifestyle.petPreference,
              partyStyle: lifestyle.partyStyle,
              // ✅ always prefer base64
              photoUrls: images.map(img => img.url)
            }} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
