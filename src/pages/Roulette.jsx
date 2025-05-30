import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";
import axios from "axios";
import { toast } from 'react-toastify';
import { endpoint } from "../api/endpoint";

const fallbackData = [
  {
    option: "Acne Toner",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://raw.githubusercontent.com/fsl-karimullah/my-img-source/refs/heads/main/ATN.webp",
  },
  {
    option: "Eye Fella (Mascara)",
    style: { fontSize: 10, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/mascara%201.png",
  },
  {
    option: "Eye Fella (Eyebrow Grey)",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/eyebrow%201.png?raw=true",
  },
  {
    option: "Eye Fella (Eyeliner)",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Eyeliner%201.png?raw=true",
  },
  {
    option: "B Erl WOW Lightening Facial Serum",
    style: { fontSize: 8, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://berlcosmetics.com/wp-content/uploads/2024/01/NEW-FS-1-300x300.jpg",
  },
  {
    option: "B Erl Fine & Fairness Cream Travel Size",
    style: { fontSize: 8, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://berlcosmetics.com/wp-content/uploads/2024/03/WDP-1.jpg",
  },
  {
    option: "B Erl Intense Lightening Series",
    style: { fontSize: 8, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://berlcosmetics.com/wp-content/uploads/2024/01/LSP.jpg",
  },
  {
    option: "B Erl La Belle Colorstay Lip Velvet",
    style: { fontSize: 8, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://raw.githubusercontent.com/fsl-karimullah/my-img-source/refs/heads/main/LV03.webp",
  },
  {
    option: "Logam Mulia",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/LM%201.png?raw=true",
  },
  {
    option: "Voucher 20%",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Voucher%2020.png?raw=true",
  },
];

const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString();
};

const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const formatPhoneNumber = (value) => {
  let cleaned = value.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '8' + cleaned.substring(1);
  } else if (cleaned.startsWith('628')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('62')) {
    cleaned = '8' + cleaned.substring(2);
  } else if (!cleaned.startsWith('8') && cleaned.length > 0) {
    cleaned = '8' + cleaned;
  }

  return cleaned;
};

const Roulette = () => {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());
  const [spinCount, setSpinCount] = useState(0);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [tiktokId, setTiktokId] = useState("");
  const [userName, setUserName] = useState("");
  const [apiOptions, setApiOptions] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [showTestButton, setShowTestButton] = useState(false);
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const [wheelStoppedSpinning, setWheelStoppedSpinning] = useState(true);

  const transformApiData = (apiResponse) => {
    const options = apiResponse.data.options;
    const colors = ["#F4E3C5", "#E8ACAC"];

    return options.map((option, index) => ({
      option: option.option_text,
      style: {
        fontSize: option.option_text.length > 15 ? 8 : 12,
        backgroundColor: colors[index % 2],
        textColor: "#000"
      },
      img: option.image || `https://via.placeholder.com/150?text=${encodeURIComponent(option.option_text)}`,
      weight: option.weight,
      qty: option.qty,
      id: option.id
    }));
  };

  const calculatePrizeFromAPI = (options) => {
    const availableOptions = options.filter(option => option.qty > 0);

    if (availableOptions.length === 0) {
      return Math.floor(Math.random() * options.length);
    }

    const totalWeight = availableOptions.reduce((sum, option) => sum + option.weight, 0);
    const randomWeight = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (let i = 0; i < availableOptions.length; i++) {
      cumulativeWeight += availableOptions[i].weight;
      if (randomWeight <= cumulativeWeight) {
        return data.findIndex(item => item.id === availableOptions[i].id);
      }
    }

    return 0;
  };
  //fetch
  const fetchRouletteData = async (isRefresh = false) => {
    if (dataFetched && !isRefresh) {
      return;
    }

    try {
      setLoading(!isRefresh);
      console.log(isRefresh ? 'Refreshing roulette data...' : 'Fetching roulette data...');

      const response = await axios.get(endpoint.getPrizeData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      if (response.data && response.data.data && response.data.data.options) {
        const transformedData = transformApiData(response.data);
        setData(transformedData);
        setApiOptions(response.data.data.options);
        setDataFetched(true);
        console.log(isRefresh ? 'Roulette data refreshed successfully:' : 'Roulette data loaded successfully:', transformedData);
        if (isRefresh) {
          console.log('Prize Updated');

        } else {
          console.log('sukses');

        }
      } else {
        console.warn('Invalid API response structure, using fallback data');
        setData(fallbackData);
        setDataFetched(true);
        toast.warning('Invalid data format, using default options');
      }
    } catch (error) {
      console.error('Error fetching roulette data:', error);

      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - server took too long to respond');
        toast.error('Connection timeout. Using default options.');
      } else if (error.response) {
        console.error('Response status:', error.response.status);
        toast.error(`Server error: ${error.response.status}. Using default options.`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Using default options.');
      } else {
        console.error('Request setup error:', error.message);
        toast.error('Network error. Using default options.');
      }

      if (!isRefresh) {
        setData(fallbackData);
        setDataFetched(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouletteData();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true') {
      setShowTestButton(true);
    }
  }, []);

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));

    const hasSpun = localStorage.getItem("hasSpun");
    if (hasSpun) {
      setCanSpin(false);
    }

    const timer = setTimeout(() => {
      if (!loading) {
        setIsWhatsAppModalOpen(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem("spinCount")) || 0;
    setSpinCount(savedCount);
    if (savedCount < 2) {
      setCanSpin(true);
    } else {
      setCanSpin(false);
    }
  }, []);

  const handleSpinClick = () => {
    const spinCount = parseInt(localStorage.getItem("spinCount")) || 0;

    if (!canSpin || spinCount >= 2) return;

    const prize = apiOptions.length > 0
      ? calculatePrizeFromAPI(apiOptions)
      : Math.floor(Math.random() * data.length);

    setPrizeNumber(prize);
    setMustSpin(true);

    setWheelStoppedSpinning(false);

    const newSpinCount = spinCount + 1;
    localStorage.setItem("spinCount", newSpinCount.toString());
    localStorage.setItem("lastSpin", getCurrentDateTime());
    setSpinCount(newSpinCount);

    if (newSpinCount >= 2) {
      setCanSpin(false);
    }
  };

  const handleTestReset = () => {
    localStorage.removeItem("hasSpun");
    localStorage.removeItem("spinCount");
    localStorage.removeItem("lastSpin");
    setSpinCount(0);
    setCanSpin(true);
    toast.success("Test mode: LocalStorage reset! You can spin again.");
  };

  const handleTestSpin = () => {
    localStorage.removeItem("hasSpun");
    setCanSpin(true);
    handleSpinClick();
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWheelStoppedSpinning(true);

    setCurrentDateTime(getCurrentDateTime());
    setRandomId(generateRandomId());

    if (apiOptions.length > 0 && data[prizeNumber] && data[prizeNumber].id) {
      updatePrizeQuantity(data[prizeNumber].id);
    }


    setTimeout(() => {
      setIsModalOpen(true);
    }, 500);
  };

  const updatePrizeQuantity = async (optionId) => {
    try {
      // await axios.post(`http://192.168.68.244:8000/api/roulettes/options/${optionId}/claim`);
      console.log('Prize claimed for option:', optionId);
    } catch (error) {
      console.error('Error updating prize quantity:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchRouletteData(true);
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsAppNumber(formatted);
  };

  const handleWhatsAppSubmit = async () => {
    setIsSubmittingData(true);

    try {
      let phoneForAPI = whatsAppNumber;
      if (phoneForAPI.startsWith('8')) {
        phoneForAPI = '62' + phoneForAPI;
      }

      const selectedPrizeId = apiOptions.length > 0 && data[prizeNumber] && data[prizeNumber].id
        ? data[prizeNumber].id
        : "default-option-id";

      const requestBody = {
        roulette_option_id: selectedPrizeId,
        name: userName,
        nohp: phoneForAPI,
        id_tiktok: tiktokId,
        title: "Event Affiliate x Tiktok 30 Mei 2025"
      };

      const response = await axios.post(endpoint.insertDataRoulette, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      toast.success("Data berhasil disimpan!");
      setIsWhatsAppModalOpen(false);
    } catch (error) {
      console.error("Error saving lead", error);
      toast.error("Data gagal disimpan!");
    } finally {
      setIsSubmittingData(false);
    }
  };

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

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#121212" : "#fff",
          color: isDarkMode ? "#fff" : "#000",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Roulette...</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url('https://github.com/fsl-karimullah/my-img-source/blob/main/background%20rolate%20(1).jpg?raw=true')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        filter: isDarkMode ? "brightness(0.8)" : "none",
        position: "relative",
      }}
    >
      {!showTestButton && (
        <button
          onClick={handleTestReset}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 15px",
            fontSize: "14px",
            backgroundColor: "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            zIndex: 10,
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#cc3333")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff4444")}
        >
          🧪 Reset Test
        </button>
      )}

      <Modal
        isOpen={isWhatsAppModalOpen}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        ariaHideApp={false}
        style={whatsAppModalStyle}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Masukkan Informasi Kontak Anda</h2>
          <p className="mb-4" style={{ color: isDarkMode ? "#ccc" : "#555" }}>
            Silakan masukkan nomor WhatsApp, ID TikTok, dan Username TikTok Anda.
          </p>

          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nama Anda"
            disabled={isSubmittingData}
            className="w-full px-4 py-2 rounded-md mb-3 focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              backgroundColor: isDarkMode ? "#444" : "#fff",
              border: "1px solid",
              borderColor: isDarkMode ? "#666" : "#ccc",
              color: isDarkMode ? "#fff" : "#333",
            }}
          />

          <input
            type="text"
            value={whatsAppNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Nomor WhatsApp (contoh: 87826533645)"
            disabled={isSubmittingData}
            className="w-full px-4 py-2 rounded-md mb-3 focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              backgroundColor: isDarkMode ? "#444" : "#fff",
              border: "1px solid",
              borderColor: isDarkMode ? "#666" : "#ccc",
              color: isDarkMode ? "#fff" : "#333",
            }}
          />

          <input
            type="text"
            value={tiktokId}
            onChange={(e) => setTiktokId(e.target.value)}
            placeholder="ID TikTok"
            disabled={isSubmittingData}
            className="w-full px-4 py-2 rounded-md mb-3 focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              backgroundColor: isDarkMode ? "#444" : "#fff",
              border: "1px solid",
              borderColor: isDarkMode ? "#666" : "#ccc",
              color: isDarkMode ? "#fff" : "#333",
            }}
          />

          <button
            className="w-full py-2 rounded-md mt-4 hover:transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={
              !whatsAppNumber.trim() || !tiktokId.trim() || !userName.trim() || isSubmittingData
            }
            onClick={handleWhatsAppSubmit}
            style={{
              backgroundColor: isDarkMode ? "#d2ad67" : "#d2ad67",
              color: "#fff",
              cursor: isSubmittingData ? "not-allowed" : "pointer"
            }}
          >
            {isSubmittingData ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              "Putar"
            )}
          </button>
        </div>
      </Modal>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "25px",
            color: isDarkMode ? "#ddd" : "#333",
            fontWeight: "bold",
          }}
        >
          Pin Hadiahmu Sekarang!
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data.map((item) => ({
            ...item,
            style: {
              ...item.style,
              textColor: isDarkMode ? "#000" : "#000",
            },
          }))}
          backgroundColors={["#3e3e3e", "#df3428"]}
          textColors={["#ffffff"]}
          onStopSpinning={handleStopSpinning}
        />
        <img
          src="logo.png"
          alt="Center Logo"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50px",
            height: "50px",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      </div>

      <button
        onClick={handleSpinClick}
        disabled={!canSpin || mustSpin} 
        style={{
          marginTop: 20,
          padding: "18px 20px",
          fontSize: 20,
          cursor: "pointer",
          backgroundColor: canSpin && !mustSpin ? (isDarkMode ? "#444" : "#E9D29C") : "#ccc",
          color: isDarkMode ? "#fff" : "#333",
          fontWeight: "bold",
        }}
      >
        {mustSpin
          ? "Spinning..."
          : canSpin
            ? "Putar Sekarang!"
            : "Anda sudah menggunakan semua kesempatan spin hari ini."}
      </button>

      <p className="mt-2 text-white flex items-center gap-2">
        Kesempatan tersisa:
        <span className="inline-block bg-yellow-400 text-black text-sm font-semibold px-2 py-1 rounded-full">
          {2 - spinCount} / 2
        </span>
      </p>

      <Modal
        isOpen={isModalOpen && wheelStoppedSpinning} 
        onRequestClose={closeModal}
        contentLabel="Prize Modal"
        ariaHideApp={false}
        style={modalStyle}
        overlayClassName="fixed inset-0 flex justify-center items-center"
      >
        {prizeNumber !== null && wheelStoppedSpinning && ( 
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
              Tanggal & Waktu: <span className="font-medium">{currentDateTime}</span>
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
              Untuk Mengambil Hadiah Anda dan Berikan Ke{" "}
              <span className="text-yellow-300 font-bold">Booth Berl Cosmetics</span>
            </p>
            <button
              onClick={closeModal}
              className="mt-6 w-full py-3 rounded-lg transition duration-300"
              style={{
                backgroundColor: "#E9D29C",
                color: isDarkMode ? "#fff" : "#000",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#D4B882")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#E9D29C")}
            >
              Saya Sudah Memberikan Bukti ini Ke Booth.
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Roulette;