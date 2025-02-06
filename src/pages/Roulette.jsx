import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";
import { useNavigate } from "react-router";

const data = [
  {
    option: "B erl Highlighter",
    style: { fontSize: 12, backgroundColor: "#ff0050", textColor: "#fff" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/hl%201.png?raw=true",
  },
  {
    option: "B erl Eyebrow",
    style: { fontSize: 10, backgroundColor: "#F4E3C5", textColor: "#fff" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/eyebrow%201.png?raw=true",
  },
  {
    option: "B erl Mascara",
    style: { fontSize: 12, backgroundColor: "#ff0050", textColor: "#fff" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/mascara%201.png?raw=true",
  },
  {
    option: "B erl Eyeliner",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Eyeliner%201.png?raw=true",
  },
  {
    option: "Voucher 5%",
    style: { fontSize: 12, backgroundColor: "#ff0050", textColor: "#fff" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Voucher%205.png?raw=true",
  },
  {
    option: "Voucher 15%",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Voucher%2010.png?raw=true",
  },
  {
    option: "Voucher 20%",
    style: { fontSize: 12, backgroundColor: "#ff0050", textColor: "#fff" },
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
  // State for the roulette
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());
  // New state for the input form modal
  const [isInputModalOpen, setIsInputModalOpen] = useState(true);
  // Two new states for user input fields
  const [noWa, setNoWa] = useState("");
  const [idTiktok, setIdTiktok] = useState("");
  // New state for toast notification
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));
  }, []);

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
    navigate("/invitation");
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    setIsInputModalOpen(false);
    // Show a toast message after successful submission
    setToastMessage("Berhasil Memasukkan data");
    setShowToast(true);
    // Hide toast after 2 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
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

  const inputModalStyle = {
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
      zIndex: 1100,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1099,
      height: "100vh",
      width: "100vw",
    },
  };

  // Toast style
  const toastStyle = {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: 1200,
    opacity: showToast ? 1 : 0,
    transition: "opacity 0.5s ease-in-out",
    textAlign: "center",
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center overflow-hidden"
      style={{
        backgroundImage: `url('https://github.com/fsl-karimullah/my-img-source/blob/main/background%20rolate%20(1).jpg?raw=true')`,
      }}
    >
      {/* Toast Notification */}
      {showToast && <div style={toastStyle}>{toastMessage}</div>}

      {/* Input Modal - This modal is forced open before spin and cannot be closed except by submitting the form */}
      <Modal
        isOpen={isInputModalOpen}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        contentLabel="Input Modal"
        style={inputModalStyle}
        ariaHideApp={false}
      >
        <h2 className="text-2xl font-semibold mb-4">Lengkapi Data Dibawah</h2>
        <form onSubmit={handleInputSubmit}>
          <input
            type="text"
            value={noWa}
            onChange={(e) => setNoWa(e.target.value)}
            placeholder="No wa"
            className="border p-2 w-full mb-4 rounded"
            required
            inputMode="numeric"
          />
          <input
            type="text"
            value={idTiktok}
            onChange={(e) => setIdTiktok(e.target.value)}
            placeholder="ID Tiktok"
            className="border p-2 w-full mb-4 rounded"
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg transition duration-300 font-bold"
            style={{
              backgroundColor: isDarkMode ? "#444" : "#E9D29C",
              color: isDarkMode ? "#fff" : "#333",
            }}
          >
            Submit
          </button>
        </form>
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
            fontSize: "20px",
            color: isDarkMode ? "#ddd" : "#fff",
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
              🎉 Selamat! "ID TIKTOK" Anda memenangkan{" "}
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
              Dan Tunjukkan Kepada Petugas Booth B erl Cosmetics Pada{" "}
              <span className="text-yellow-300 font-bold">Event Ini</span>
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
