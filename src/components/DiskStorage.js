import React from 'react';

const DiskStorage = ({ memoryHierarchy }) => {
  if (!memoryHierarchy || !memoryHierarchy.diskStorage) {
    return null;
  }

  return (
    <div className="disk-storage">
      <h2>Disk Storage</h2>
      <p>Size: {memoryHierarchy.diskStorage.size}</p>
      <p>Access Time: {memoryHierarchy.diskStorage.accessTime}</p>
    </div>
  );
};

export default DiskStorage;
