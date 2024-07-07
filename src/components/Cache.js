import React from 'react';

const Cache = ({ memoryHierarchy }) => {
  if (!memoryHierarchy || !memoryHierarchy.cacheLevels) {
    return null;
  }

  return (
    <div className="cache">
      {memoryHierarchy.cacheLevels.map((level, index) => (
        <div key={index}>
          <h2>Cache Level {index + 1}</h2>
          <div>Size: {level.size}</div>
          <div>Hit Time: {level.hitTime}</div>
        </div>
      ))}
    </div>
  );
};

export default Cache;
