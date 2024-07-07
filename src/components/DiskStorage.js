import React from "react";

const DiskStorage = ({ diskAccessTime }) => {
  return (
    <div className="memory-level">
      <h2>Disk Storage</h2>
      <div>Size: {16384} </div>
      <div>Access Time: {diskAccessTime} ns</div> {/* Example access time */}
    </div>
  );
};

export default DiskStorage;