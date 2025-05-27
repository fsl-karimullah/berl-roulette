import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";
import axios from "axios";
import { toast } from 'react-toastify';

const data = [
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

const calculatePrize = () => {
  const weightedOptions = [
    { index: 0, weight: 1 },
    { index: 1, weight: 0.5 },
    { index: 2, weight: 1 },
    { index: 3, weight: 1 },
    { index: 4, weight: 0 },
    { index: 5, weight: 0.5 },
    { index: 6, weight: 0 },
    { index: 7, weight: 1 },
    { index: 8, weight: 0 },
    { index: 9, weight: 95 },
  ];

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
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Prize modal
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());

  // New state for WhatsApp modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(true);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [name, setName] = useState()

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));

    const hasSpun = localStorage.getItem("hasSpun");
    if (hasSpun) {
      setCanSpin(false);
    }
  }, []);

  const handleSpinClick = () => {
    if (!canSpin) return;
    const prize = calculatePrize();
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
    window.location.href = "https://wa.me/6282258569318";
  };

  const handleWhatsAppSubmit = () => {
    axios
      .post("https://crm.berlmember.com/api/saveleadscrmroulete", null, {
        params: {
          title: "Campaign KRL Batch 2 2025",
          nohp: whatsAppNumber,
          source: "Event",
          date: new Date().toLocaleString(),
          brand: "Berl",
          status_leads: "Leads",
        },
      })
      .then((response) => {
        // console.log("Lead saved:", response.data);
        toast.success("Data berhasil disimpan!");
        setIsWhatsAppModalOpen(false);
      })
      .catch((error) => {
        console.error("Error saving lead", error);
        toast.error("Data gagal disimpan!");
        setIsWhatsAppModalOpen(false);
      });
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
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Masukkan Nomor WhatsApp Anda</h2>
          <p className="mb-4" style={{ color: isDarkMode ? "#ccc" : "#555" }}>
            Silakan masukkan nomor WhatsApp untuk melanjutkan.
          </p> 
          <input
            type="text"
            value={whatsAppNumber}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Lengkap"
            className="w-full px-4 py-2 my-3 rounded-md focus:outline-none focus:ring-2"
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
            onChange={(e) => setWhatsAppNumber(e.target.value)}
            placeholder="Nomor WhatsApp"
            className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
            style={{
              backgroundColor: isDarkMode ? "#444" : "#fff",
              border: "1px solid",
              borderColor: isDarkMode ? "#666" : "#ccc",
              color: isDarkMode ? "#fff" : "#333",
            }}
          />
          <button
            className="w-full py-2 rounded-md mt-4 hover:transition-colors disabled:opacity-50"
            disabled={!whatsAppNumber.trim()}
            onClick={handleWhatsAppSubmit}
            style={{
              backgroundColor: isDarkMode ? "#d2ad67" : "#d2ad67",
              color: "#fff",
            }}
          >
            Putar
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
        disabled={!canSpin}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 20,
          cursor: "pointer",
          backgroundColor: canSpin ? (isDarkMode ? "#444" : "#E9D29C") : "#ccc",
          color: isDarkMode ? "#fff" : "#333",
          fontWeight: "bold",
        }}
      >
        {mustSpin
          ? "Spinning..."
          : canSpin
            ? "Putar Sekarang!"
            : "Sudah Diputar"}
      </button>

      {/* Tester Button */}
      {/* <button
        onClick={handleTestSpin}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          fontSize: 20,
          cursor: "pointer",
          backgroundColor: isDarkMode ? "#444" : "#6c63ff",
          color: "#fff",
          fontWeight: "bold",
        }}
      >
        Test Spin
      </button> */}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Prize Modal"
        ariaHideApp={false}
        style={modalStyle}
        overlayClassName="fixed inset-0 flex justify-center items-center"
      >
        {prizeNumber !== null && (
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
              Untuk Mengambil Hadiah Anda dan Kirim Ke{" "}
              <span className="text-yellow-300 font-bold">WhatsApp Dibawah</span>
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
              OK, Kirim ke WhatsApp
            </button>
          </div>
        )}
      </Modal>


    </div>
  );
};

export default Roulette;
