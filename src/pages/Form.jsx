import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";

const Form = () => {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });
  const navigate = useNavigate();

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
            Lengkapi Data Dibawah ini Untuk Join Affiliate Member
          </p>
        </div>
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
            className="w-full flex justify-center py-3 px-6 rounded-lg shadow-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition duration-300 transform hover:scale-105 focus:outline-none"
          >
            Submit
          </button>
        </form>
        <div className="text-center py-4 bg-gray-100 text-sm text-gray-600">
          <p>Data Anda Aman dan Tidak Akan Dibagikan</p>
        </div>
      </div>
    </div>
  );
};

export default Form;
