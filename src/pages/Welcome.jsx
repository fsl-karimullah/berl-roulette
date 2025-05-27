// Welcome.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { endpoint } from "../api/endpoint";

const API_BASE_URL = "http://192.168.68.194:8000";

const Welcome = () => {
  const location = useLocation();
  const { slug } = location.state || {};
  const navigate = useNavigate();

  const [polling, setPolling] = useState(null);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    axios
      .get(endpoint.getPollingById(slug))
      .then((res) => {
        if (res.data.status === "success") {
          setPolling(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching polling by slug:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleVote = (optionId) => {
    if (votedOptionId) return;
    setVotedOptionId(optionId);
  };

  const handleButtonClickAndNavigate = () => {
    if (polling) {
      navigate("/roulette", { state: { slug: polling.slug } });
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!polling) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black text-white">
        Polling data not found.
      </div>
    );
  }

  const totalVotes = polling.options.reduce(
    (acc, opt) => acc + (opt.votes || 0),
    0
  );

  return (
    <div
      className="w-screen h-screen relative"
      style={{
        backgroundImage: polling.background_image
          ? `url(${API_BASE_URL}/storage/${polling.background_image})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
      <div className="w-full h-full flex flex-col justify-center items-center px-4 pt-16 relative z-10 text-white">
        <h1 className="text-4xl font-bold mb-6">{polling.title}</h1>
        <p className="mb-10 max-w-xl text-center">{polling.description}</p>

        <div className="flex gap-6 mb-10 flex-wrap justify-center max-w-4xl">
          {polling.options.map((option) => {
            const optionVotes = option.votes || 0;
            const percent = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
            const voted = votedOptionId === option.id;

            return (
              <div key={option.id} className="text-center relative max-w-xs w-40">
                <div
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-4 ${
                    voted ? "border-pink-600" : "border-transparent"
                  }`}
                  onClick={() => handleVote(option.id)}
                >
                  <img
                    src={`${API_BASE_URL}/storage/${option.image}`}
                    alt={option.option_text}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  {voted && (
                    <>
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-white text-2xl font-bold">
                          {option.option_text}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-2 font-semibold">{option.option_text}</p>

                <div className="mt-2 w-full h-10 bg-gray-300 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-pink-600 transition-all duration-500"
                    style={{
                      width: percent > 0 ? `${percent}%` : "0%",
                      minWidth: percent > 0 ? "3rem" : "0",
                    }}
                  />
                  {percent > 7 ? (
                    <div className="absolute left-0 top-0 h-10 flex items-center pl-3 text-white font-bold select-none">
                      {optionVotes} vote{optionVotes !== 1 ? "s" : ""}
                    </div>
                  ) : (
                    <div className="ml-2 mt-1 text-pink-600 font-bold select-none">
                      {optionVotes} vote{optionVotes !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center w-full">
          <button
            onClick={handleButtonClickAndNavigate}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Vote & Putar Roda
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
