import React from "react";
import { Link } from "react-router-dom";

const InvitationPage = () => {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://github.com/fsl-karimullah/my-img-source/blob/main/home%20rolt%20(1).jpg?raw=true')`,
        }}
      >
        <div className="w-full h-full ">
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-[#e81155] rounded-lg hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 transition-all"
            >
             Yok Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
