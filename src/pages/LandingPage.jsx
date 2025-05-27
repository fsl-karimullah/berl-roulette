import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { endpoint } from "../api/endpoint";

const IMAGE_BASE_URL = "http://192.168.68.194:8000/storage/";

const LandingPage = () => {
  const [polling, setPolling] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(endpoint.getPollingData)
      .then((response) => {
        if (response.data.status === "success" && response.data.data.length > 0) {
          setPolling(response.data.data[0]);
        } else {
          setPolling(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching polling data:", error);
        setPolling(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleButtonClick = () => {
    if (polling) {
      // pass slug instead of id here
      navigate("/welcome", { state: { slug: polling.slug } });
    }
  };

  return (
    <div className="w-screen h-screen relative">
      {polling ? (
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: polling.background_image
              ? `url('${IMAGE_BASE_URL}${polling.background_image}')`
              : "none",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
          <div className="w-full h-full flex flex-col justify-center items-center px-4 text-center relative z-10">
            <h1 className="text-white text-4xl font-bold mb-4">{polling.title}</h1>
            <p className="text-white text-lg max-w-xl mb-6">{polling.description}</p>
            <button
              onClick={handleButtonClick}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Mulai Vote!
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex justify-center items-center bg-black">
          <p className="text-white text-lg">
            {loading ? "Loading polling data..." : "Belum ada event roulette"}
          </p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
