import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "./assets/dark-skyblock-background.png";
import { getUsernameData } from "./fetch/getuuid";

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await getUsernameData(username.trim());
    setLoading(false);
    if (!result.valid) {
      setError("No profile found for that username. (Placeholder)");
      return;
    }
    navigate(`/pv?username=${result.username}&uuid=${result.uuid}`);
  };

  return (
        <div
        className="relative min-h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-black/55"></div>
            <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div
            className="
                relative flex flex-col items-center justify-center gap-6
                min-h-100 w-[50%] min-w-75 px-8 py-12
                rounded-2xl text-white
                bg-black/55
                backdrop-blur-xl backdrop-saturate-150
                border border-white/10
                shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)]
            "
            >
            <h1 className="text-3xl font-bold text-center tracking-tight">
            View Skyblock stats for:
            </h1>
            <form onSubmit={handleSubmit} spellcheck="false" className="w-full flex flex-col items-center gap-4">
            <input
                type="text"
                id="InputUsername"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter username..."
                className="
                w-[60%] min-w-50 min-h-25
                bg-transparent border-2 border-[#A9A9A9] rounded-xl
                text-white text-2xl font-bold text-center
                outline-none resize-none transition-colors duration-150
                placeholder:text-white/40
                hover:border-white focus:border-white
                "
            />
            {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
            )}
            <button
                type="submit"
                disabled={!username.trim() || loading}
                className="
                mt-2 px-8 py-2 rounded-xl font-semibold text-lg
                bg-[#7B2FBE] hover:bg-[#9b3fde] disabled:opacity-40
                transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed
                "
            >
                {loading ? "Checking..." : "View Stats"}
            </button>
            </form>
        </div>
        </div>
    </div>
  );
}
