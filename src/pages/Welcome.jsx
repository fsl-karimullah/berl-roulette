import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Auto-play simulation: Load Instagram Reel after 3 seconds
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 3000); // Change 3000 to adjust the delay (3 seconds)

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isPlaying]);

  return (
    <>
      <div className="w-screen flex justify-center py-4 relative">
        {/* Auto-load Instagram Reel after delay */}
        {isPlaying ? (
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/reel/DGu1yUsvaEW/"
            data-instgrm-version="14"
            style={{ maxWidth: "605px", minWidth: "325px" }}
          ></blockquote>
        ) : (
          /* Show thumbnail before Instagram Reel loads */
          <div className="relative w-[605px] h-[720px] bg-gray-200 flex items-center justify-center">
            <img
              src="https://via.placeholder.com/605x720.png?text=Instagram+Reel+Thumbnail"
              alt="Instagram Reel"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="w-screen h-screen relative">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://github.com/fsl-karimullah/my-img-source/blob/main/home%20rolt%20(1).jpg?raw=true')`,
          }}
        >
          <div className="w-full h-full">
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
              <Link
                to="/roulette"
                className="inline-flex text-center items-center justify-center px-6 py-3 text-lg font-medium text-white bg-[#e81155] rounded-lg hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 transition-all"
              >
                Ambil Hadiahnya!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;
