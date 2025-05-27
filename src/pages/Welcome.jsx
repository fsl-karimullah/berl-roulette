import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
  const [votes, setVotes] = useState({ image1: 0, image2: 0 });
  const [votedImage, setVotedImage] = useState(null);

  const handleVote = (image) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [image]: prevVotes[image] + 1,
    }));
    setVotedImage(image);
  };

  const totalVotes = votes.image1 + votes.image2;
  const percent1 = totalVotes > 0 ? (votes.image1 / totalVotes) * 100 : 0;
  const percent2 = totalVotes > 0 ? (votes.image2 / totalVotes) * 100 : 0; 

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
    <div className="w-screen h-screen relative">
      <div className="w-full h-full bg-cover bg-center bg-no-repeat">
        
        <div className="w-full h-full flex flex-col justify-center items-center px-4 pt-16">
          {/* Image Voting */}
          <div className="flex gap-6 mb-10">
            {/* Image 1 */}
            <div className="text-center relative"> 
              <div
                className="relative cursor-pointer rounded-lg overflow-hidden"
                onClick={() => handleVote("image1")}
              >
                <img
                  src="https://images.pexels.com/photos/32250193/pexels-photo-32250193/free-photo-of-ripe-cacao-pod-hanging-in-yogyakarta-garden.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Image 1"
                  className="rounded-lg"
                />
                {votedImage === "image1" && (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-white text-2xl font-bold">Apple</p>
                    </div>
                  </>
                )}
              </div>
              <p className="text-black mt-2 font-semibold">Fitozlim Apple</p>
            </div>

            {/* Image 2 */}
            <div className="text-center relative">
              <div
                className="relative cursor-pointer rounded-lg overflow-hidden"
                onClick={() => handleVote("image2")}
              >
                <img
                  src="https://images.pexels.com/photos/32245649/pexels-photo-32245649/free-photo-of-fresh-lemon-slice-with-leaf-on-light-background.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Image 2"
                  className="rounded-lg"
                />
                {votedImage === "image2" && (
                  <>
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-white text-2xl font-bold">Delima</p>
                    </div>
                  </>
                )}
              </div>
              <p className="text-black mt-2 font-semibold">Fitozlim Delima</p>
            </div>

          </div>

          {/* Progress Bars with Titles */}
          <div className="flex flex-col gap-4 mb-8 w-72">
            {/* Image 1 Progress */}
            <div>
              <h3 className="text-black text-lg font-semibold mb-1">Hasil Vote Fitozlim Apple</h3>
              <p className="text-black text-sm mb-1">Image 1: {percent1.toFixed(0)}%</p>
              <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${percent1}%` }}
                ></div>
              </div> 
            </div> 

            {/* Image 2 Progress */}
            <div>
              <h3 className="text-black text-lg font-semibold mb-1">Hasil Vote Fitozlim Delima</h3>
              <p className="text-black text-sm mb-1">Image 2: {percent2.toFixed(0)}%</p>
              <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 transition-all duration-300"
                  style={{ width: `${percent2}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center w-full">
            <Link
              to="/roulette"
              className="inline-flex text-center items-center justify-center px-6 py-3 text-lg font-medium text-white bg-[#e81155] rounded-lg hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 transition-all"
            >
              Vote & Putar Roda
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;
