import React from "react";

const MainMemory = ({ ramAccestime }) => {
  return (
    <div className="memory-level">
      <h2>Main Memory</h2>
      <div>Size: {8192} </div>
      <div>Access Time: {ramAccestime} ns</div> {/* Example access time */}
    </div>
  );
};

export default MainMemory;
