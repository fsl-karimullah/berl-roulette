import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { endpoint } from "../api/endpoint";
import { Navigate, useLocation, useNavigate } from "react-router";
import Confetti from 'react-confetti';

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

  const navigate = useNavigate();

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

      closeModal();
      toast.success("Selamat hadiah berhasil di klaim! tunggu ya admin akan segera menghubungimu dalam waktu dekat.");
      navigate("/thanks");
    } catch (error) {
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

  const getMaxTextLength = () => {
    if (!safeData || safeData.length === 0) return 0;
    return Math.max(...safeData.map(item => item.option.length));
  };

  const maxTextLength = getMaxTextLength();

  const dynamicFontSize =
    maxTextLength <= 6
      ? 26
      : maxTextLength <= 10
        ? 22
        : maxTextLength <= 14
          ? 18 
          : maxTextLength <= 20 
            ? 14
            : 12;




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
      color: isDarkMode ? "#ffffff" : "#000000",
      border: "none",
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
          className="p-6 rounded-lg  max-w-md mx-auto"
          style={{
            backgroundColor: "#7BCC4C",
            border: "2px solid #8D568C",
            color: isDarkMode ? "#fff" : "#222",
          }}
        >
          <h2 className="text-xl font-bold mb-3 text-center">
            Lengkapi Data Untuk Ukutan Spinwheelnya
          </h2>
          <p
            className="mb-6 text-sm text-center"
            style={{ color: isDarkMode ? "#eee" : "#444" }}
          >
            Silahkan masukkan nama & nomor WhatsApp untuk melanjutkan.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              className="w-full px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 transition"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #8D568C",
                color: "#333",
              }}
            />

            <input
              type="text"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="Nomor WhatsApp"
              className="w-full px-4 py-3 rounded-md text-sm focus:outline-none focus:ring-2 transition"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #8D568C",
                color: "#333",
              }}
            />
          </div>

          <button
            className="mt-6 w-full py-3 rounded-md font-semibold text-white transition"
            style={{
              backgroundColor:
                !whatsAppNumber.trim() || !name.trim() ? "#ccc" : "#8D568C",
            }}
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
          className="px-6 py-3 rounded-md font-semibold"
          disabled={!canSpin}
          style={{
            backgroundColor: "#fff",
            color: "#8D568C",
            border: `2px solid #8D568C`,
            cursor: canSpin ? "pointer" : "not-allowed",
          }}
          onClick={handleSpinClick}
        >
          {canSpin ? "Mainkan Spinwheel" : "Spinwheel Sudah Diputar"}
        </button>
      </div>


      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
            gravity={0.3}
            recycle={false}
          />
        </div>
      )}



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
            <h2
              className="text-2xl font-semibold text-center mb-4"
              style={{ color: isDarkMode ? "#7BCC4C" : "#6B8E23" /* darker green for light mode */ }}
            >
              🎉 Selamat! Kamu memenangkan{" "}
              <span className="font-bold" style={{ color: "#8D568C" }}>
                {data[prizeNumber].option}
              </span>
              !
            </h2>

            <img
              src={`${API_BASE_URL}/storage/${data[prizeNumber].img}`}
              alt={data[prizeNumber].option}
              className="w-40 h-24 mx-auto mb-4"
              style={{ borderRadius: 8, border: `2px solid ${isDarkMode ? "#8D568C" : "#7BCC4C"}` }}
            />

            <p
              className="text-center mb-2"
              style={{ color: isDarkMode ? "#B4D99E" : "#355E3B" }} // lighter/darker green shade
            >
              Tanggal & Waktu:{" "}
              <span className="font-medium" style={{ color: isDarkMode ? "#C1E1A6" : "#4F7942" }}>
                {currentDateTime}
              </span>
            </p>

            <p className="text-center" style={{ color: isDarkMode ? "#CBB0D7" : "#6B4C88" }}>
              ID Hadiah:{" "}
              <strong style={{ color: "#8D568C" }}>
                {randomId}
              </strong>
            </p>

            <p
              className="text-center p-2 rounded-lg my-4"
              style={{
                backgroundColor: "#7BCC4C",
                color: "#fff",
                fontWeight: "600",
              }}
            >
              Kamu memenangkan {data[prizeNumber].option}.
            </p>

            <p
              className="text-center p-2 rounded-lg my-4"
              style={{
                backgroundColor: isDarkMode ? "#8D568C" : "#E5D4EB",
                color: isDarkMode ? "#E9D5FF" : "#6B4C88",
                fontWeight: "700",
              }}
            >
              <span>
                Screenshot Informasi Ini
              </span>{" "}
              Untuk Mengambil Hadiah Kamu dan Simpan{" "}
              <span>
                Sebagai Bukti
              </span>
            </p>

            <button
              onClick={() => handleClaimPrize(data[prizeNumber]?.id)}
              className="mt-6 w-full py-3 rounded-lg transition duration-300"
              style={{
                backgroundColor: "#7BCC4C",
                color: isDarkMode ? "#121212" : "#000",
                border: `2px solid #8D568C`,
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#8D568C";
                e.target.style.color = "#fff";
                e.target.style.borderColor = "#7BCC4C";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#7BCC4C";
                e.target.style.color = isDarkMode ? "#121212" : "#000";
                e.target.style.borderColor = "#8D568C";
              }}
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