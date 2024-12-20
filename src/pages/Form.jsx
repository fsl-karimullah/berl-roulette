import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";

const checkLocationProximity = (latitude, longitude) => {
  const DEBUG_MODE = true;

  const realLat = -6.276769624989821;
  const realLong = 106.74050432177931;

  const fakeLat = -6.212442989550739;
  const fakeLong = 106.68184214795939;

  const eventLat = DEBUG_MODE ? fakeLat : realLat;
  const eventLong = DEBUG_MODE ? fakeLong : realLong;
  const radius = 0.5;

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;

  const deltaLat = toRadians(latitude - eventLat);
  const deltaLon = toRadians(longitude - eventLong);

  const lat1 = toRadians(eventLat);
  const lat2 = toRadians(latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance <= radius;
};

const Form = () => {
  const [isFar, setIsFar] = useState(true);
  const [canSubmit, setCanSubmit] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }

    const locationWatcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const isCloseEnough = checkLocationProximity(latitude, longitude);
        setIsFar(!isCloseEnough);
        setCanSubmit(isCloseEnough);
      },
      (error) => {
        let errorMessage = "An unknown error occurred.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Location access denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage =
            "Location unavailable. Ensure your device's GPS is enabled.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Try again.";
        }
        setModal({ isOpen: true, title: "Perhatian", message: errorMessage });
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = "ahkepolu";
    const { name, phone } = formData;
    const url = `https://ecommerce.berlmember.com/runforhumanity?token=${token}&name=${encodeURIComponent(
      name
    )}&phone=${encodeURIComponent(phone)}`;

    try {
      const response = await axios.get(url);
      const { success, status, message } = response.data;

      if (success && status === "insert") {
        setModal({ isOpen: true, title: "Success", message });
        setTimeout(() => navigate("/roulette"), 2000);
      } else if (!success && status === "phone ready") {
        setModal({ isOpen: true, title: "Error", message });
      } else if (!success && status === "validasi phone failed") {
        setModal({
          isOpen: true,
          title: "Error",
          message:
            "Nomor telepon tidak valid. Harus berupa nomor WhatsApp yang valid.",
        });
      } else {
        console.log(response.data);
        setModal({
          isOpen: true,
          title: "Perhatian",
          message: "Terjadi Kesalahan Silahkan Coba Lagi",
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Perhatian",
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  return (
    <div className="flex items-center justify-center ">
      <Modal
        isOpen={modal.isOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            backgroundColor: "#D4B882",
            color: "#FFF",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
        }}
        ariaHideApp={false}
      >
        <h2 className="text-xl font-bold">{modal.title}</h2>
        <p className="mt-2">{modal.message}</p>
        <button
          className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded"
          onClick={closeModal}
        >
          Close
        </button>
      </Modal>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col items-center bg-gray-100 px-6 py-8">
          <img
            src="https://github.com/fsl-karimullah/my-img-source/blob/main/logo.png?raw=true"
            alt="Logo"
            className="w-full h-full mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">Lengkapi Data</h2>
          <p className="text-sm text-gray-600">
            Untuk Mendapatkan Produk Gratis atau Voucher
          </p>
        </div>
        {isFar ? (
          <div className="text-center p-6 bg-gray-100 text-red-600">
            <p>Lokasi Anda terlalu jauh dari event.</p>
            <p>Mohon lebih dekat lagi 500 meter.</p>
          </div>
        ) : (
          <form className="px-6 py-6 space-y-6" onSubmit={handleSubmit}>
            <div className="form-group">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Lengkap:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition sm:text-sm"
                placeholder="Nama lengkap Anda"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                No HP (WhatsApp):
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition sm:text-sm"
                placeholder="Nomor WhatsApp Anda"
              />
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full flex justify-center py-3 px-6 rounded-lg shadow-lg text-sm font-medium text-white transition duration-300 transform hover:scale-105 focus:outline-none ${
                canSubmit ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400"
              }`}
            >
              Submit
            </button>
          </form>
        )}
        <div className="text-center py-4 bg-gray-100 text-sm text-gray-600">
          <p>Data Anda Aman dan Tidak Akan Dibagikan</p>
        </div>
      </div>
    </div>
  );
};

export default Form;
