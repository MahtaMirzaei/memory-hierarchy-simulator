import React, { useState } from "react";

const UserInput = ({
  onSimulate,
  setBlockSize,
  setAddressSize,
  blockSize,
  addressSize,
}) => {
  const [cacheLevels, setCacheLevels] = useState([
    { size: 32, hitTime: 5, missPenalty: 40 },
  ]);
  const [replacementPolicy, setReplacementPolicy] = useState("LRU");
  const handleCacheLevelChange = (index, key, value) => {
    const updatedLevels = [...cacheLevels];
    updatedLevels[index][key] = parseInt(value, 10);
    setCacheLevels(updatedLevels);
  };

  const handleAddCacheLevel = () => {
    if (cacheLevels.length < 3) {
      setCacheLevels([
        ...cacheLevels,
        { size: 64, hitTime: 12, missPenalty: 170 },
      ]);
    } else {
      alert("Maximum of 3 cache levels allowed.");
    }
  };

  const handleRemoveCacheLevel = (index) => {
    const updatedLevels = cacheLevels.filter((_, i) => i !== index);
    setCacheLevels(updatedLevels);
  };

  const handleSimulate = () => {
    const hierarchy = {
      cacheLevels,
      replacementPolicy,
      mainMemory: { size: 16384, accessTime: 100 },
      diskStorage: { size: 1048576, accessTime: 10000 },
    };
    onSimulate(hierarchy);
  };

  return (
    <div className="user-input">
      <h2>Configure Memory Hierarchy</h2>
      {cacheLevels.map((level, index) => (
        <div key={index}>
          <label>
            Cache Level {index + 1} Size:
            <select
              value={level.size}
              onChange={(e) =>
                handleCacheLevelChange(index, "size", e.target.value)
              }
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
              <option value={64}>64</option>
              <option value={128}>128</option>
              <option value={256}>256</option>
              <option value={512}>512</option>
            </select>
          </label>
          <label>
            Hit Time (ns):
            <input
              type="number"
              value={level.hitTime}
              onChange={(e) =>
                handleCacheLevelChange(index, "hitTime", e.target.value)
              }
            />
          </label>
          <label>
            Miss Penalty (ns):
            <input
              type="number"
              value={level.missPenalty}
              onChange={(e) =>
                handleCacheLevelChange(index, "missPenalty", e.target.value)
              }
            />
          </label>
          {cacheLevels.length > 1 && (
            <button onClick={() => handleRemoveCacheLevel(index)}>
              Remove Cache Level
            </button>
          )}
        </div>
      ))}
      {cacheLevels.length < 3 && (
        <button onClick={handleAddCacheLevel}>Add Cache Level</button>
      )}
      <label>
        Replacement Policy:
        <select
          value={replacementPolicy}
          onChange={(e) => setReplacementPolicy(e.target.value)}
        >
          <option value="LRU">LRU</option>
          <option value="LFU">LFU</option>
          <option value="FIFO">FIFO</option>
          <option value="Random">Random</option>
        </select>
      </label>
      <label>
        Block Size:
        <select
          type="number"
          value={blockSize}
          onChange={(e) => setBlockSize(parseInt(e.target.value, 10))}
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
        </select>
      </label>
      <label>
        Address Size:
        <select
          type="number"
          value={addressSize}
          onChange={(e) => setAddressSize(parseInt(e.target.value, 10))}
        >
          <option value={512}>512</option>
          <option value={1024}>1024</option>
          <option value={2048}>2048</option>
          <option value={4096}>4096</option>
          <option value={8192}>8192</option>
          <option value={16384}>16834</option>
          <option value={32768}>32768</option>
        </select>
      </label>
      <button onClick={handleSimulate}>Simulate</button>
    </div>
  );
};

export default UserInput;
