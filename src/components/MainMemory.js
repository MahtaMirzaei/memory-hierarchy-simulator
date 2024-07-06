import React from "react";

const MainMemory = ({ mainMemorySize }) => {
  return (
    <div className="memory-level">
      <h2>Main Memory</h2>
      <div>Size: {mainMemorySize} KB</div>
      <div>Access Time: 300 ns</div> {/* Example access time */}
    </div>
  );
};

export default MainMemory;
