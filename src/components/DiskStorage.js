import React from "react";

const DiskStorage = ({ diskStorageSize }) => {
  return (
    <div className="memory-level">
      <h2>Disk Storage</h2>
      <div>Size: {diskStorageSize} GB</div>
      <div>Access Time: 10000 ns</div> {/* Example access time */}
    </div>
  );
};

export default DiskStorage;