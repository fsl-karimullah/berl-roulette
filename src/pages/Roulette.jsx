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
  const totalWeight = weightedOptions.reduce(
    (sum, option) => sum + option.weight,
    0
  );
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
  const { slug, polling_id, voted_option_id } = location.state || {};
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [name, setName] = useState("");
  const [isFirstSpin, setisFirstSpin] = useState();
  const [refreshRoulette, setrefreshRoulette] = useState(false);

  const handleSubmit = () => {
    submitVote();
  };

  const submitVote = async () => {
    if (!name.trim() || !whatsAppNumber.trim()) {
      toast.error("Nama dan nomor WhatsApp wajib diisi.");
      return;
    }

    try {
      const payload = {
        full_name: name,
        phone_number: whatsAppNumber,
        polling_id,
        polling_option_id: voted_option_id,
      };

      const url = endpoint.savePostVote(slug);
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // console.log("Vote submission response:", response.data);

      if (response.data?.status === "success") {
        setIsWhatsAppModalOpen(false);
        toast.success("Vote berhasil dikirim.");
        console.log("ASDASDASD", response.data?.participant?.is_roulette);
        setCanSpin(
          response.data?.participant?.is_roulette === 0 ? true : false
        );
      } else {
        toast.error("Gagal mengirim vote.");
      }
    } catch (error) {
      // console.log("Vote submission error:", error);
      if (error.status == 422) {
        toast.error(error.response.data.message);
        return;
      }
      console.error("Vote submission error:", error.response.data.message);
      toast.error(error.message);
    }
  };

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
        const res = await axios.get(endpoint.getPollingRoulette(slug), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
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
            id: opt.id,
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

    if (slug || refreshRoulette) {
      fetchRouletteData();
    }
  }, [slug, refreshRoulette]);

  const handleSpinClick = () => {
    if (!canSpin) return;

    const weightedOptions = data.map((item, index) => ({
      index,
      weight: item.weight || 1,
    }));

    const prize = calculatePrize(weightedOptions);

    setPrizeNumber(prize);
    // console.log("Prize number selected:", prize);
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

  const handleClaimPrize = async (id) => {
    console.log("Claiming prize for ID:", id);

    try {
      const payload = {
        roulette_option_id: id,
        full_name: name,
        phone_number: whatsAppNumber,
        polling_id,
      };
      console.log("Payload for claim prize:", payload);

      const url = endpoint.saveClaimPrize(slug);
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // console.log("Vote submission response:", response.data);
      toast.success("Hadiah berhasil diklaim.");
    } catch (error) {
      // console.log("Vote submission error:", error);
      if (error.status == 400) {
        toast.error(error.response.data.message);
        setrefreshRoulette(true);
        closeModal();
      }
      console.error("Vote submission error:", error.response.data.message);
      toast.error(error.message);
    }
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
    safeData[1]?.style.backgroundColor ||
      safeData[0]?.style.backgroundColor ||
      "#000000",
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
          <h2 className="text-2xl font-bold mb-3 text-center">
            Masukkan Nama & Nomor WhatsApp Anda
          </h2>
          <p
            className="mb-6 text-sm text-center"
            style={{ color: isDarkMode ? "#aaa" : "#666" }}
          >
            Silakan masukkan nama & nomor WhatsApp untuk melanjutkan.
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
            onClick={() => handleSubmit()}
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
        radiusLineColor="#00d084"
        innerBorderColor="#7bcc4c"
        outerBorderColor="#7bdcb5"
      />

      {/* Spin Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          className="bg-[#d2ad67] px-6 py-3 rounded-md font-semibold text-white disabled:opacity-50"
          disabled={!canSpin}
          onClick={handleSpinClick}
        >
          {!canSpin ? "Putar Roda" : "Sudah Diputar"}
        </button>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Prize Modal"
        ariaHideApp={false}
        style={modalStyle}
        overlayClassName="fixed inset-0 flex justify-center items-center"
      >
        {prizeNumber !== null && data && data[prizeNumber] && (
          <div>
            <h2 className="text-2xl font-semibold text-center mb-4">
              🎉 Selamat! Anda memenangkan{" "}
              <span style={{ color: "#E9D29C" }}>
                {data[prizeNumber].option}
              </span>
              !
            </h2>
            <img
              src={data[prizeNumber].img}
              alt={data[prizeNumber].option}
              className="w-40 h-24 mx-auto mb-4"
            />
            <p className="text-center mb-2">
              Tanggal & Waktu:{" "}
              <span className="font-medium">{currentDateTime}</span>
            </p>
            <p className="text-center">
              ID Hadiah: <strong className="text-indigo-600">{randomId}</strong>
            </p>
            <p className="text-center text-white bg-red-700 p-2 rounded-lg my-4">
              Anda memenangkan {data[prizeNumber].option}.
            </p>
            <p className="text-center text-white bg-black p-2 rounded-lg my-4">
              <span className="text-yellow-400 font-bold">
                Screenshot Informasi Ini
              </span>{" "}
              Untuk Mengambil Hadiah Anda dan Kirim Ke{" "}
              <span className="text-yellow-300 font-bold">
                WhatsApp Dibawah
              </span>
            </p>
            <button
              onClick={() => handleClaimPrize(data[prizeNumber].id)}
              className="mt-6 w-full py-3 rounded-lg transition duration-300"
              style={{
                backgroundColor: "#E9D29C",
                color: isDarkMode ? "#fff" : "#000",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#D4B882")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#E9D29C")}
            >
              Claim Hadiah
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Roulette;
