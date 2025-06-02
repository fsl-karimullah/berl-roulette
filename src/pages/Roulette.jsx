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
  const [canSpin, setCanSpin] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());
  const location = useLocation();
  const { id, polling_id, voted_option_id } = location.state || {};
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [name, setName] = useState("");
  const [isFirstSpin, setisFirstSpin] = useState();
  const [refreshRoulette, setrefreshRoulette] = useState(false);
  const [isRoulette, setisRoulette] = useState(0);
  const [saveBackgroundImage, setSaveBackgroundImage] = useState("")
  const API_BASE_URL = "https://dev.panelis.net";
  const handleSubmit = () => {
    submitVote();
    // setIsWhatsAppModalOpen(false); 
  };

  useEffect(() => {
    console.log("canSpin changed:", canSpin);
  }, [canSpin]);


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

      const url = endpoint.savePostVote(id);
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const participant = response.data?.participant;

      if (response.data?.status === "success" && participant) {
        localStorage.setItem("is_roulette", participant.is_roulette);
        localStorage.setItem("participant_id", participant.id);

        setCanSpin(participant.is_roulette === 0);
        console.log("participant.is_roulette:", participant.is_roulette);


        toast.success("Vote berhasil dikirim.");
        setIsWhatsAppModalOpen(false);
      } else {
        toast.error("Gagal mengirim vote.");
      }
    } catch (error) {
      if (error.response?.status === 422) {
        toast.error(error.response.data.message);
        return;
      }
      toast.error(error.message || "Terjadi kesalahan.");
    }
  };


  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));

    const isRoulette = localStorage.getItem("is_roulette");
    if (isRoulette !== null) {
      setCanSpin(isRoulette === 0);
    }

    const fetchRouletteData = async () => {
      try {
        const res = await axios.get(endpoint.getPollingRoulette(id), {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        setSaveBackgroundImage(`${API_BASE_URL}/storage/${res.data.data.background_image}`);

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

    if (id || refreshRoulette) {
      fetchRouletteData();
    }
  }, [id, refreshRoulette]);


  const handleSpinClick = () => {
    if (!canSpin) return;

    const isRoulette = Number(localStorage.getItem("is_roulette"));
    if (isRoulette === 1) {
      toast.error("Kamu sudah pernah spin sebelumnya.");
      return;
    }


    const weightedOptions = data.map((item, index) => ({
      index,
      weight: item.weight || 1,
    }));

    const prize = calculatePrize(weightedOptions);

    setPrizeNumber(prize);
    setMustSpin(true);
    setCanSpin(false);

    localStorage.setItem("is_roulette", "1");
  };


  const handleTestSpin = () => {
    // localStorage.removeItem("hasSpun");
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

      const prizeId = data[prizeNumber]?.id;
      const url = endpoint.saveClaimPrize(prizeId);

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      // console.log("Vote submission response:", response.data);
      closeModal();
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

  const calculateDynamicFontSize = (data, baseFontSize = 18, maxLength = 20) => {
    const longestTextLength = Math.max(...data.map(item => item.option.length));
    const scaleFactor = longestTextLength > maxLength ? maxLength / longestTextLength : 1;
    return Math.floor(baseFontSize * scaleFactor);
  };

  const dynamicFontSize = calculateDynamicFontSize(safeData);


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
        position: "relative",
        backgroundImage: `url(${saveBackgroundImage})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
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
            Silahkan masukkan nama & nomor WhatsApp untuk melanjutkan.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ping-600 transition"
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
              className="w-full px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ping-600 transition"
              style={{
                backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
                border: "1px solid",
                borderColor: isDarkMode ? "#555" : "#ccc",
                color: isDarkMode ? "#fff" : "#333",
              }}
            />
          </div>

          <button
            className="mt-6 w-full bg-pink-600 py-3 rounded-md font-semibold text-white disabled:opacity-50"
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
        onStopSpinning={handleStopSpinning}
        outerBorderColor="#ccc"
        innerRadius={20}
        radiusLineColor="#eee"
        fontSize={dynamicFontSize}
        spinDuration={0.5}
      />


      {/* Spin Buttons */}
      <div className="flex space-x-4 mt-6 z-10">
        <button
          className="bg-pink-600 px-6 py-3 rounded-md font-semibold text-white "
          disabled={!canSpin}
          onClick={handleSpinClick}
        >
          {canSpin ? "Putar Roda" : "Sudah Diputar"}
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
              <span className="text-pink-600 font-bold">
                {data[prizeNumber].option}
              </span>
              !
            </h2>
            <img
              src={`${API_BASE_URL}/storage/${data[prizeNumber].img}`}
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
            <p className="text-center text-white bg-pink-600 p-2 rounded-lg my-4">
              Anda memenangkan {data[prizeNumber].option}.
            </p>
            <p className="text-center text-white bg-black p-2 rounded-lg my-4">
              <span className="text-pink-700 font-bold">
                Screenshot Informasi Ini
              </span>{" "}
              Untuk Mengambil Hadiah Anda dan Simpan{" "}
              <span className="text-pink-700 font-bold">
                Sebagai Bukti
              </span>
            </p>
            <button
              onClick={() => handleClaimPrize(data[prizeNumber]?.id)}
              className="mt-6 w-full py-3 bg-pink-600 rounded-lg transition duration-300"
              style={{
                color: isDarkMode ? "#fff" : "#000",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#db2777")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#db2776")}
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