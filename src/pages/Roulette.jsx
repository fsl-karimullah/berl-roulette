import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import Modal from "react-modal";
import { useNavigate } from "react-router";
import axios from "axios";

const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString();
};

const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000);
}; 

/**
 * Weighted selection for affiliate products (excluding Gold)
 * based on available stock (qtysisa).
 * @param {Array} products - Array of eligible product objects.
 * @returns {number|null} - The index (in the eligible array) of the selected product, or null if none.
 */
const calculatePrizeFromAffiliate = (products) => {
  if (products.length === 0) return null;
  const totalWeight = products.reduce((sum, prod) => sum + prod.qtysisa, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulative = 0;
  for (let i = 0; i < products.length; i++) {
    cumulative += products[i].qtysisa;
    if (randomValue <= cumulative) {
      return i;
    }
  }
  return products.length - 1;
};

const Roulette = () => {
  const [affiliateProducts, setAffiliateProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());
  const [randomId, setRandomId] = useState(generateRandomId());

  const [isInputModalOpen, setIsInputModalOpen] = useState(true);
  const [noWa, setNoWa] = useState("");
  const [idTiktok, setIdTiktok] = useState("");
  const [savedTiktok, setSavedTiktok] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://ecommerce.berlmember.com/gettiktokaffiliate")
      .then((response) => {
        const apiProducts = response.data.data || [];
        const goldItem = {
          produk: "Logam Mulia 1gr",
          qty: 10,
          qtylimit: 10,
          qtysisa: 10, 
          image:
            "https://via.placeholder.com/150/FFD700/000000?text=Gold",
        };
        setAffiliateProducts([...apiProducts, goldItem]);
      })
      .catch((error) => {
        console.error("Error fetching affiliate products:", error);
      });
  }, []);

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    darkModeQuery.addEventListener("change", (e) => setIsDarkMode(e.matches));
  }, []);

  useEffect(() => {
    const hasSpun = localStorage.getItem("hasSpun");
    if (hasSpun) {
      setCanSpin(false);
    }
    const storedTiktok = localStorage.getItem("idTiktok");
    if (storedTiktok) {
      setSavedTiktok(storedTiktok);
    }
  }, []);

  const visibleProducts = affiliateProducts;

  const eligibleProducts = affiliateProducts.filter(
    (prod) => prod.produk !== "Logam Mulia 1gr" && prod.qtysisa > 0
  );


  const rouletteData =
  visibleProducts.length > 0
    ? visibleProducts.map((prod) => ({
        option:
          prod.qtysisa <= 0
            ? `${prod.produk} (Stok Habis)`
            : prod.produk,
        style: {
          fontSize: 12,
          backgroundColor: prod.qtysisa <= 0
            ? "#888888"
            : prod.produk === "Logam Mulia 1gr"
            ? "#FFD700"
            : "#ff0050",
          textColor:
            prod.qtysisa <= 0 ? "#eee" : prod.produk === "Logam Mulia 1gr" ? "#000" : "#fff",
        },
        img: prod.image || "https://via.placeholder.com/150",
      }))
    : [
        {
          option: "Stok Habis",
          style: { fontSize: 12, backgroundColor: "#ccc", textColor: "#333" },
          img: "https://via.placeholder.com/150",
        }, 
      ];

  const handleSpinClick = () => {
    if (!canSpin) return;
    if (eligibleProducts.length === 0) {
      setToastMessage("Maaf, stok habis untuk semua produk yang dapat dimenangkan.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    const selectedIndexEligible = calculatePrizeFromAffiliate(eligibleProducts);
    if (selectedIndexEligible === null) {
      setToastMessage("Maaf, tidak ada produk yang tersedia.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    const chosenProduct = eligibleProducts[selectedIndexEligible];
    const indexInVisible = visibleProducts.findIndex(
      (prod) => prod.produk === chosenProduct.produk
    );
    setPrizeIndex(indexInVisible);
    setSelectedProduct(chosenProduct);
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

    if (selectedProduct) {
      axios
        .get(
          `https://ecommerce.berlmember.com/gettiktokaffiliatecount?code=${selectedProduct.produk}`
        )
        .then(() => {
          setAffiliateProducts((prevProducts) =>
            prevProducts.map((prod) =>
              prod.produk === selectedProduct.produk
                ? { ...prod, qtysisa: prod.qtysisa - 1 }
                : prod
            )
          );
        })
        .catch((error) => {
          console.error("Error updating product count:", error);
        });
    }
  };

  const closeModalAndNavigate = () => {
    setIsModalOpen(false);
    window.location.href = "https://wa.me/628782656459"; 
  };
  
  const handleInputSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `https://ecommerce.berlmember.com/tiktokaffiliate?tiktokid=${encodeURIComponent(
        idTiktok 
      )}&phone=${encodeURIComponent(noWa)}`;
      await axios.get(url);
      setToastMessage("Berhasil Memasukkan data");
      setShowToast(true);
      localStorage.setItem("idTiktok", idTiktok);
      setSavedTiktok(idTiktok);
      setTimeout(() => {
        setShowToast(false);
        setIsInputModalOpen(false);
      }, 1000);
      setNoWa("");
      setIdTiktok("");
    } catch (error) { 
      setToastMessage("Terjadi kesalahan. Silakan coba lagi.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  };

  // const handleInputSubmit = (e) => {
  //   e.preventDefault();
  //   // Save TikTok ID to localStorage and update savedTiktok.
  //   localStorage.setItem("idTiktok", idTiktok);
  //   setSavedTiktok(idTiktok);
  //   setToastMessage("Berhasil Memasukkan data");
  //   setShowToast(true);
  //   setTimeout(() => {
  //     setShowToast(false);
  //     setIsInputModalOpen(false);
  //     // Clear input fields after submission.
  //     setNoWa("");
  //     setIdTiktok("");
  //   }, 1000);
  // };

  const handleResetSpin = () => {
    localStorage.removeItem("hasSpun");
    setCanSpin(true);
    console.log("Spin limit reset for testing.");
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

  const toastStyle = {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: isDarkMode ? "#555" : "#333",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    zIndex: 1200,
    opacity: showToast ? 1 : 0,
    transition: "opacity 0.5s ease-in-out",
    textAlign: "center",
  };

  const containerStyle = {
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
  };

  return (
    <div style={containerStyle}>
      {showToast && <div style={toastStyle}>{toastMessage}</div>}

      {/* Input Modal */}
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
            style={{ color: "black" }}
            value={noWa}
            onChange={(e) => setNoWa(e.target.value)}
            placeholder="Masukkan No WA"
            className="border p-2 w-full mb-4 rounded"
            required
            inputMode="numeric"
          />
          {/* <input
            type="text"
            value={idTiktok}
            onChange={(e) => setIdTiktok(e.target.value)}
            placeholder="Masukkan ID Tiktok"
            style={{ color: "black" }}
            className="border p-2 w-full mb-4 rounded"
            required
          /> */}
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
          prizeNumber={prizeIndex}
          data={rouletteData}
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

      {/* Reset Spin Button for Testing */}
      {/* <button
        onClick={handleResetSpin}
        style={{
          marginTop: 10,
          padding: "6px 12px",
          fontSize: 16,
          cursor: "pointer",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Reset Spin (Testing)
      </button> */}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModalAndNavigate}
        contentLabel="Prize Modal"
        ariaHideApp={false}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto z-50 relative"
        overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-40"
      >
        {selectedProduct && (
          <>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
              🎉 Selamat! Anda memenangkan{" "}
              <span style={{ color: "#E9D29C" }}>
                {selectedProduct.produk}
              </span>
              !
            </h2>
            <img
              src={selectedProduct.image || "https://via.placeholder.com/150"}
              alt={selectedProduct.produk}
              className="w-40 h-24 mx-auto mb-4 object-contain"
            />
            <p className="text-center text-gray-600 mb-2">
              Tanggal & Waktu:{" "}
              <span className="font-medium">{currentDateTime}</span>
            </p>
            <p className="text-center text-gray-600">
              ID Hadiah: <strong className="text-indigo-600">{randomId}</strong>
            </p>
            {/* <p className="text-center text-gray-600">
              Sisa Stok:{" "}
              <strong className="text-indigo-600">
                {selectedProduct.qtysisa > 0 ? selectedProduct.qtysisa : 0}
              </strong>
            </p> */}
            <p className="text-center text-white bg-red-700 p-2 rounded-lg my-4">
              Segera ambil hadiahmu di tempat yang telah ditentukan (Booth B erl Cosmetics) Jangan Sampai Kehabisan!
            </p>
            <p className="text-center text-white bg-black p-2 rounded-lg my-4">
              <span className="text-yellow-400 font-bold"> 
                Screenshot Informasi Ini
              </span>{" "}
              Dan Tunjukkan Kepada Petugas Booth B erl Cosmetics Pada{" "}
              <span className="text-yellow-300 font-bold">Event Ini</span>
            </p>
            <button
              onClick={closeModalAndNavigate}
              className="mt-6 w-full text-white py-3 rounded-lg transition duration-300"
              style={{
                backgroundColor: "#E9D29C",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#D4B882")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#E9D29C")}
            >
              Kirim Bukti Ke Whatsapp
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Roulette;
