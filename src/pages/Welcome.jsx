// Welcome.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { endpoint } from "../api/endpoint";

const API_BASE_URL = "http://192.168.68.239:8000";

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
      .get(endpoint.getPollingById(slug), {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
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
    console.log("Voted for option ID:", optionId);
    setVotedOptionId(optionId);
  };


  useEffect(() => {
    const savedVote = localStorage.getItem("voted_option_id");
    if (savedVote) {
      setVotedOptionId(savedVote);
    }
  }, []);


  const handleButtonClickAndNavigate = () => {
    if (polling && votedOptionId) {
      navigate("/roulette", {
        state: {
          slug: polling.slug,
          polling_id: polling.id,
          voted_option_id: votedOptionId,
        },
      });
    } else {
      alert("Please vote before continuing.");
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
      className="w-screen h-full min-h-screen relative"
      style={{
        backgroundImage: polling.background_image
          ? `url(${API_BASE_URL}/storage/${polling.background_image})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
      <div className="w-full min-h-screen flex flex-col justify-start items-center px-4 pt-16 pb-10 relative z-10 text-white">
        <h1 className="text-4xl font-bold mb-4 text-center">{polling.title}</h1>
        <p className="mb-8 max-w-xl text-center">{polling.description}</p>

        {/* First foreach: Horizontal scrollable image row */}
        <div className="flex flex-wrap gap-4 justify-center mb-10 w-full px-4">
          {polling.options.map((option) => {
            const voted = votedOptionId === option.id;

            return (
              <div
                key={option.id}
                className="text-center relative flex-shrink-0 w-28"
              >
                <div
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition duration-300 ${voted
                    ? "border-pink-600"
                    : "border-transparent hover:border-pink-400"
                    }`}
                  onClick={() => handleVote(option.id)}
                >
                  <img
                    src={`${API_BASE_URL}/storage/${option.image}`}
                    alt={option.option_text}
                    className="rounded-lg w-full h-28 object-cover"
                  />
                  {voted && (
                    <>
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-white text-sm font-bold px-1 text-center">
                          {option.option_text}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-1 font-semibold text-xs truncate">{option.option_text}</p>
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-3xl space-y-4 mb-10 px-4">
          {polling.options.map((option) => {
            const optionVotes = option.votes || 0;
            const percent = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;

            return (
              <div key={option.id} className="w-full">
                <p className="mb-1 font-semibold text-sm text-pink-300">
                  {option.option_text}
                </p>
                <div className="w-full h-6 bg-gray-300 rounded-full overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-pink-600 transition-all duration-500 rounded-full"
                    style={{
                      width: percent > 0 ? `${percent}%` : "0%",
                      minWidth: percent > 0 ? "2rem" : "0",
                    }}
                  />
                  <div className="absolute left-3 top-0 h-full flex items-center text-white text-sm font-bold">
                    {optionVotes} vote{optionVotes !== 1 ? "s" : ""}
                  </div>
                  <div className="absolute right-3 top-0 h-full flex items-center text-white text-sm font-bold">
                    {percent.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
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
