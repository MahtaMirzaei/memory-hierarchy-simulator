import React from 'react';

const MainMemory = ({ memoryHierarchy }) => {
  if (!memoryHierarchy || !memoryHierarchy.mainMemory) {
    return null;
  }

  return (
    <div className="main-memory">
      <h2>Main Memory</h2>
      <p>Size: {memoryHierarchy.mainMemory.size}</p>
      <p>Access Time: {memoryHierarchy.mainMemory.accessTime}</p>
    </div>
  );
};

export default MainMemory;
