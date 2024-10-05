import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";

const data = [
  {
    option: "B erl Perfume",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/PARFUM%20MS%205.png?raw=true", 
  },
  {
    option: "B erl Active Glow Booster Serum",
    style: { fontSize: 10, backgroundColor: "#F4E3C5", textColor: "#fff" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/png%20NEW%20AGB%203.png?raw=true", 
  },
  {
    option: "Voucher 5%",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Logo-BerlFamily.png?raw=true", 
  },
  {
    option: "Voucher 10%",
    style: { fontSize: 12, backgroundColor: "#E8ACAC", textColor: "#000" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Logo-BerlFamily.png?raw=true", 
  },
  {
    option: "Voucher 15%",
    style: { fontSize: 12, backgroundColor: "#F4E3C5", textColor: "#333" },
    img: "", 
  },
  {
    option: "Logam Mulia 1 Gram",
    style: { fontSize: 12, backgroundColor: "#E9D29C", textColor: "#333" },
    img: "https://github.com/fsl-karimullah/my-img-source/blob/main/Logo-BerlFamily.png?raw=true", 
  },
];

const prizeWeights = [1, 1, 20, 20, 15, 0];

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

const Roulette = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));

    const lastSpinDate = localStorage.getItem("lastSpinDate");
    if (lastSpinDate === getCurrentDate()) setCanSpin(false);
  }, []);

  const handleSpinClick = () => {
    if (!canSpin) return;

    const totalWeight = prizeWeights.reduce((acc, cur) => acc + cur, 0);
    const randomNum = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    let selectedPrize = 0;
    for (let i = 0; i < prizeWeights.length; i++) {
      cumulativeWeight += prizeWeights[i];
      if (randomNum <= cumulativeWeight) {
        selectedPrize = i;
        break;
      }
    }

    setPrizeNumber(selectedPrize);
    setMustSpin(true);
    localStorage.setItem("lastSpinDate", getCurrentDate());
    setCanSpin(false);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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
          src="https://github.com/fsl-karimullah/my-img-source/blob/main/Logo-BerlFamily.png?raw=true"
          alt="Logo"
          style={{ width: "80px", marginBottom: "10px" }}
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
        disabled={mustSpin || !canSpin}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 20,
          cursor: "pointer",
          backgroundColor: isDarkMode ? "#444" : "#E9D29C",
          color: isDarkMode ? "#fff" : "#333",
          fontWeight: "bold",
        }}
      >
        {mustSpin ? "Spinning..." : canSpin ? "Putar Sekarang!" : "Kembali Lagi Besok!"}
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Prize Modal"
        style={modalStyle}
      >
        {prizeNumber !== null && (
          <>
            <h2 style={{ fontSize: "1.5em", marginBottom: "10px" }}>
              🎉 Selamat! Anda memenangkan{" "}
              <span style={{ color: "#e67e22" }}>{data[prizeNumber].option}</span>!
            </h2>
            <img
              src={data[prizeNumber].img}
              alt={data[prizeNumber].option}
              style={{ width: "100px", height: "150px", marginBottom: "10px" }}
            />
            <p>Deskripsi Hadiah: Anda memenangkan {data[prizeNumber].option}.</p>
            <p><strong>Ambil screenshot</strong> dari tampilan ini untuk menukarkan hadiah Anda.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => window.open("https://wa.me/6282122870473", "_blank")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#25D366",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              >
                Kirim ke WhatsApp
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: "12px 24px",
                  backgroundColor: isDarkMode ? "#444" : "#E9D29C",
                  color: isDarkMode ? "#fff" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              >
                Tutup
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Roulette;
