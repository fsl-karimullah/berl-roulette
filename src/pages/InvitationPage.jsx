import React from "react";

const InvitationPage = () => {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center relative flex items-center justify-center"
      style={{
        backgroundImage: `url('https://github.com/fsl-karimullah/my-img-source/blob/main/final%20roulate.jpg?raw=true')`,
      }}
    >
      <a
        href="http://berlcosmetics.com"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-[65%] left-1/2 transform -translate-x-1/2 inline-flex items-center text-center justify-center px-8 py-4 text-md font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition hover:scale-110"
      >
        Buka Link Affiliasi
      </a>
    </div>
  );
};

export default InvitationPage;
