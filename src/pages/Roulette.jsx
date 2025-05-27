import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { endpoint } from "../api/endpoint";
import { useLocation, useNavigate } from "react-router";

const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString();
};

const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const calculatePrize = (weightedOptions) => {
  const totalWeight = weightedOptions.reduce((sum, option) => sum + option.weight, 0);
  const randomWeight = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const option of weightedOptions) {
    cumulativeWeight += option.weight;
    if (randomWeight <= cumulativeWeight) {
      return option.index;
    }
  }
  return 0;
};

const Roulette = () => {
  const [data, setData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());
const location = useLocation();
  const { slug } = location.state || {};
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));

    const hasSpun = localStorage.getItem("hasSpun");
    if (hasSpun) {
      setCanSpin(false);
    }

    const fetchRouletteData = async () => {
      try {
        const res = await axios.get(endpoint.getPollingRoulette(slug));
        console.log("Fetched roulette data:", res.data);
        
        if (res.data.status === "success") {
          const options = res.data.data.options.map((opt, index) => ({
            option: opt.option_text,
            weight: opt.weight || 1,
            style: {
              backgroundColor:
                index % 2 === 0
                  ? res.data.data.bg_color_1 || "#ffffff"
                  : res.data.data.bg_color_2 || "#000000",
              textColor:
                index % 2 === 0
                  ? res.data.data.text_color_1 || "#000000"
                  : res.data.data.text_color_2 || "#ffffff",
            },
            img: opt.image || undefined,
          }));
          setData(options);
        } else {
          toast.error("Failed to load roulette data");
        }
      } catch (error) {
        console.error("Error fetching roulette data:", error);
        toast.error("Error fetching roulette data");
      }
    };

    if (slug) {
      fetchRouletteData();
    }
  }, [slug]);

  const handleSpinClick = () => {
    if (!canSpin || data.length === 0) return;

    const weightedOptions = data.map((item, index) => ({
      index,
      weight: item.weight || 1,
    }));

    const prize = calculatePrize(weightedOptions);

    setPrizeNumber(prize);
    setMustSpin(true);
    setCanSpin(false);
    localStorage.setItem("hasSpun", "true");
    localStorage.setItem("lastSpin", getCurrentDateTime());
  };

  const handleTestSpin = () => {
    localStorage.removeItem("hasSpun");
    setCanSpin(true);
    handleSpinClick();
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsModalOpen(true);
    setCurrentDateTime(getCurrentDateTime());
    setRandomId(generateRandomId());
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    setIsWhatsAppModalOpen(false);
  };

  const safeData =
    data.length > 0
      ? data
      : [
        {
          option: "Loading...",
          style: { backgroundColor: "#ccc", textColor: "#000" },
        },
      ];

  const backgroundColors = [
    safeData[0]?.style.backgroundColor || "#ffffff",
    safeData[1]?.style.backgroundColor || safeData[0]?.style.backgroundColor || "#000000",
  ];

  const textColors = [
    safeData[0]?.style.textColor || "#000000",
    safeData[1]?.style.textColor || safeData[0]?.style.textColor || "#ffffff",
  ];

  const modalStyle = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      padding: "20px",
      borderRadius: "15px",
      maxWidth: "90%",
      width: "400px",
      backgroundColor: isDarkMode ? "#121212" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
      border: "none",
      boxShadow: isDarkMode
        ? "0 0 10px rgba(255, 255, 255, 0.1)"
        : "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: 1000,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 999,
    },
  };

  const whatsAppModalStyle = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      padding: "20px",
      borderRadius: "15px",
      maxWidth: "90%",
      width: "400px",
      backgroundColor: isDarkMode ? "#121212" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
      border: "none",
      boxShadow: isDarkMode
        ? "0 0 10px rgba(255, 255, 255, 0.1)"
        : "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: 1100,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1099,
    },
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        filter: isDarkMode ? "brightness(0.8)" : "none",
      }}
    >
      {/* WhatsApp Modal */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        ariaHideApp={false}
        style={whatsAppModalStyle}
      >
        <div
          className="p-6 rounded-lg shadow-lg max-w-md mx-auto"
          style={{
            backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
            color: isDarkMode ? "#f5f5f5" : "#222",
          }}
        >
          <h2 className="text-2xl font-bold mb-3 text-center">Masukkan Nomor WhatsApp Anda</h2>
          <p className="mb-6 text-sm text-center" style={{ color: isDarkMode ? "#aaa" : "#666" }}>
            Silakan masukkan nomor WhatsApp untuk melanjutkan.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#d2ad67] transition"
              style={{
                backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
                border: "1px solid",
                borderColor: isDarkMode ? "#555" : "#ccc",
                color: isDarkMode ? "#fff" : "#333",
              }}
            />

            <input
              type="text"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="Nomor WhatsApp"
              className="w-full px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#d2ad67] transition"
              style={{
                backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
                border: "1px solid",
                borderColor: isDarkMode ? "#555" : "#ccc",
                color: isDarkMode ? "#fff" : "#333",
              }}
            />
          </div>

          <button
            className="mt-6 w-full bg-[#d2ad67] py-3 rounded-md font-semibold text-white disabled:opacity-50"
            disabled={!whatsAppNumber.trim() || !name.trim()}
            onClick={handleSubmit}
          >
            Lanjutkan
          </button>
        </div>
      </Modal>

      {/* Roulette Wheel */}
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={safeData}
        backgroundColors={backgroundColors}
        textColors={textColors}
        spinDuration={0.8}
        onStopSpinning={handleStopSpinning}
        radiusLineColor="#d2ad67"
      />

      {/* Spin Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          className="bg-[#d2ad67] px-6 py-3 rounded-md font-semibold text-white disabled:opacity-50"
          disabled={!canSpin || data.length === 0}
          onClick={handleSpinClick}
        >
          Putar
        </button>
        <button
          className="bg-[#d2ad67] px-6 py-3 rounded-md font-semibold text-white"
          onClick={handleTestSpin}
        >
          Test Putar
        </button>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={modalStyle}
      >
        <h3 className="text-lg font-bold mb-2" style={{ color: isDarkMode ? "#fff" : "#000" }}>
          Selamat!
        </h3>
        <p style={{ color: isDarkMode ? "#eee" : "#333" }}>
          Anda mendapatkan: <strong>{safeData[prizeNumber]?.option || "..."}</strong>
        </p>
        <p className="text-sm mt-2" style={{ color: isDarkMode ? "#ccc" : "#666" }}>
          Waktu putaran: {currentDateTime}
        </p>
        <p className="text-sm mb-4" style={{ color: isDarkMode ? "#ccc" : "#666" }}>
          ID Acak: {randomId}
        </p>

        <button
          onClick={() => {
            closeModal();
          }}
          className="bg-[#d2ad67] px-6 py-2 rounded-md font-semibold text-white mt-4"
        >
          Tutup
        </button>
      </Modal>
    </div>
  );
};

export default Roulette;
