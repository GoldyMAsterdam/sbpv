import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/pv?username=${encodeURIComponent(username.trim())}`);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: "url(assets/dark-skyblock-background.png)" }}
    >
      <div
        className="
          relative flex flex-col items-center justify-center gap-6
          min-h-[400px] w-[70%] min-w-[300px] px-8 py-12
          rounded-2xl border border-black/30 text-white
          bg-black/50 backdrop-blur-md shadow-xl
        "
      >
        <h1 className="text-3xl font-bold text-center tracking-tight">
          View Skyblock stats for:
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <input
            type="text"
            id="InputUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Minecraft username"
            className="
              w-[60%] min-w-[200px] min-h-[100px]
              bg-transparent border-2 border-[#A9A9A9] rounded-xl
              text-white text-2xl font-bold text-center
              outline-none resize-none transition-colors duration-150
              placeholder:text-white/40
              hover:border-white focus:border-white
            "
          />

          <button
            type="submit"
            disabled={!username.trim()}
            className="
              mt-2 px-8 py-2 rounded-xl font-semibold text-lg
              bg-[#7B2FBE] hover:bg-[#9b3fde] disabled:opacity-40
              transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed
            "
          >
            View Stats
          </button>
        </form>
      </div>
    </div>
  );
}