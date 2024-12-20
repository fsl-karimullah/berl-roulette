import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";

const data = [
  {
    option: "B erl Highlighter",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/hl%201.png?raw=true",
  },
  {
    option: "B erl Eyebrow",
    style: { fontSize: 10, backgroundColor: "#F4E3C5", textColor: "#fff" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/eyebrow%201.png?raw=true",
  },
  {
    option: "B erl Mascara",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/mascara%201.png?raw=true",
  },
  {
    option: "B erl Eyeliner",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Eyeliner%201.png?raw=true",
  },
  {
    option: "Voucher 5%",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Voucher%205.png?raw=true",
  },
  {
    option: "Voucher 15%",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Voucher%2010.png?raw=true",
  },
  {
    option: "Voucher 20%",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#333" },
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
    { index: 0, weight: 80 },
    { index: 1, weight: 15 },
    { index: 2, weight: 10 },
    { index: 3, weight: 5 },
    { index: 4, weight: 0 },
    { index: 5, weight: 0 },
    { index: 6, weight: 0 },
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());

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

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsModalOpen(true);
    setCurrentDateTime(getCurrentDateTime());
    setRandomId(generateRandomId());
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      backgroundColor: isDarkMode ? "#333" : "#fff",
      color: isDarkMode ? "#fff" : "#333",
      zIndex: 1000,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 999,
    },
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "20px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <img
          src="https://github.com/fsl-karimullah/my-img-source/blob/main/logo.png?raw=true"
          alt="Logo"
          style={{ width: "200px", marginBottom: "10px" }}
        />
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
              textColor: isDarkMode ? "#fff" : "#333",
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Prize Modal"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto z-50 relative"
        overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-40"
      >
        {prizeNumber !== null && (
          <>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
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
            <p className="text-center text-gray-600 mb-2">
              Tanggal & Waktu:{" "}
              <span className="font-medium">{currentDateTime}</span>
            </p>
            <p className="text-center text-gray-600">
              ID Hadiah: <strong className="text-indigo-600">{randomId}</strong>
            </p>
            <p className="text-center text-white bg-red-700 p-2 rounded-lg my-4">
              Segera ambil hadiahmu di tempat yang telah ditentukan (Booth B erl
              Cosmetics) Jangan Sampai Kehabisan!
            </p>
            <p className="text-center text-white bg-black p-2 rounded-lg my-4">
              <span className="text-yellow-400 font-bold">
                Screenshot Informasi Ini
              </span>{" "}
              Dan Tunjukkan Kepada Petugas Booth B erl Cosmetics Pada Tanggal{" "}
              <span className="text-yellow-300 font-bold">
                22 Desember 2024
              </span>
            </p>
            <button
              onClick={closeModal}
              className="mt-6 w-full text-white py-3 rounded-lg transition duration-300"
              style={{
                backgroundColor: "#E9D29C",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#D4B882")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#E9D29C")}
            >
              OK
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Roulette;
