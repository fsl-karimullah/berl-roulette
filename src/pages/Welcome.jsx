import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div className="w-screen flex justify-center py-4">
        <blockquote
          className="tiktok-embed"
          cite="https://www.tiktok.com/embed/7369175067697155333"
          data-video-id="7369175067697155333"
          style={{ maxWidth: "605px", minWidth: "325px" }} 
        >
          <section></section>
        </blockquote>
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
