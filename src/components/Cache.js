import React from 'react';

const Cache = ({ memoryHierarchy }) => {
  if (!memoryHierarchy || !memoryHierarchy.cacheLevels) {
    return null;
  }

  return (
    <div className="cache">
      <h2>Cache Levels</h2>
      {memoryHierarchy.cacheLevels.map((level, index) => (
        <div key={index}>
          <h3>Cache Level {index + 1}</h3>
          <p>Size: {level.size}</p>
          <p>Hit Time: {level.hitTime}</p>
          <p>Miss Penalty: {level.missPenalty}</p>
        </div>
      ))}
    </div>
  );
};

export default Cache;
