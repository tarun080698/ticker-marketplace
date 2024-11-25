import React from "react";

function Spinner() {
  return (
    <div className="relative flex justify-center items-center min-h-96">
      <div className="w-10 h-10 border-4 border-l-blue-300 border-r-yellow-300 border-b-pink-300 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute w-5 h-5 border-4 border-l-blue-300 border-r-yellow-300 border-b-pink-300 border-t-transparent rounded-full animate-spin duration-700"></div>
      {/* <div className="absolute flex justify-center items-center">
        <div className="w-2 h-2 rounded-full animate-pulseCycle"></div>
      </div> */}
    </div>
  );
}

export default Spinner;
