import React, { useState } from "react";
import UserInput from "./components/UserInput";
import Cache from "./components/Cache";
import MainMemory from "./components/MainMemory";
import DiskStorage from "./components/DiskStorage";
import PerformanceAnalysis from "./components/PerformanceAnalysis";
import { LRU, FIFO, RandomPolicy, LFU } from "./utils/policies";
import "./styles.css";
import AddressSize from "./components/AddressSize";
import BlockSize from "./components/BlockSize";

const App = () => {
  const [memoryHierarchy, setMemoryHierarchy] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("");
  const [performance, setPerformance] = useState(null);
  const [addressResults, setAddressResults] = useState([]);
  const [blockSize, setBlockSize] = useState(8); // Default block size
  const [addressSize, setAddressSize] = useState(1024); // Default address size
  const [levelHitRates, setLevelHitRates] = useState([]); // State to store hit rates of each level

  const handleSimulate = (hierarchy) => {
    setMemoryHierarchy(hierarchy);
    setAddresses([]);
    setPerformance(null);
    setAddressResults([]);
    setLevelHitRates([]);
  };

  const handleAddressInput = (e) => {
    setCurrentAddress(e.target.value);
  };

  const handleAddAddress = () => {
    const addressArray = currentAddress
      .split(",")
      .map((addr) => parseInt(addr.trim(), 10))
      .filter((addr) => !isNaN(addr) && addr >= 0 && addr < addressSize);

    if (addressArray.length === 0) {
      alert("Please enter valid addresses between 0 and address size.");
    } else {
      setAddresses([...addresses, ...addressArray]);
      setCurrentAddress("");
    }
  };

  const handleFinish = () => {
    if (!memoryHierarchy || !memoryHierarchy.cacheLevels) return;

    const { cacheLevels, replacementPolicy } = memoryHierarchy;
    let cacheInstances = [];

    for (let i = 0; i < cacheLevels.length; i++) {
      switch (replacementPolicy) {
        case "LRU":
          cacheInstances.push(new LRU(cacheLevels[i].size));
          break;
        case "FIFO":
          cacheInstances.push(new FIFO(cacheLevels[i].size));
          break;
        case "Random":
          cacheInstances.push(new RandomPolicy(cacheLevels[i].size));
          break;
        case "LFU":
          cacheInstances.push(new LFU(cacheLevels[i].size));
          break;
        default:
          return;
      }
    }

    let hits = 0;
    let results = [];
    let levelHits = Array(cacheLevels.length).fill(0); // Array to store hits per level
    let levelAccesses = Array(cacheLevels.length).fill(0); // Array to store accesses per level

    addresses.forEach((address) => {
      let hit = false;
      let hitLevel = -1;

      for (let i = 0; i < cacheInstances.length; i++) {
        const cacheInstance = cacheInstances[i];
        const blockStart = Math.floor(address / blockSize) * blockSize;
        const blockEnd = blockStart + blockSize - 1;

        for (let addr = blockStart; addr <= blockEnd; addr++) {
          if (cacheInstance.access(addr)) {
            hit = true;
            hitLevel = i;
            break;
          }
        }

        if (hit) break;
      }

      if (hit) {
        hits++;
        results.push({ address, status: "hit", level: hitLevel });
        levelHits[hitLevel]++;
      } else {
        results.push({ address, status: "miss", level: -1 });

        for (let i = 0; i < cacheInstances.length; i++) {
          const cacheInstance = cacheInstances[i];
          const blockStart = Math.floor(address / blockSize) * blockSize;
          const blockEnd = blockStart + blockSize - 1;

          cacheInstance.addBlock(blockStart, blockEnd);
        }
      }

      // Increment accesses for all levels up to the one accessed
      for (let i = 0; i <= (hit ? hitLevel : cacheInstances.length - 1); i++) {
        levelAccesses[i]++;
      }
    });

    const totalAccesses = addresses.length;
    const misses = totalAccesses - hits;
    const hitRate = (hits / totalAccesses) * 100;
    const missRate = (misses / totalAccesses) * 100;

    let amat = 0;
    let formerAmat = 0;

    for (let i = cacheLevels.length - 1; i >= 0; i--) {
      const levelHitCount = levelHits[i];
      const hitTime = cacheLevels[i].hitTime;
      const levelMisses = levelAccesses[i] - levelHitCount;
      const missPenalty =
        i === cacheLevels.length - 1
          ? cacheLevels[i].missPenalty
          :formerAmat;

      const missRate = levelMisses / levelAccesses[i];

      // Update AMAT
      amat = hitTime + missRate * missPenalty;
      formerAmat = amat;
    }

    // Calculate hit rates for each level
    const hitRates = levelHits.map((hits, i) => ({
      level: i + 1,
      hitRate: (hits / levelAccesses[i]) * 100,
    }));

    setPerformance({
      hitRate,
      missRate,
      amat,
    });
    setAddressResults(results);
    setLevelHitRates(hitRates); // Update state with hit rates
  };

  return (
    <div className="app">
      <div>
        <UserInput
          onSimulate={handleSimulate}
          setBlockSize={setBlockSize}
          setAddressSize={setAddressSize}
          blockSize={blockSize}
          addressSize={addressSize}
        />
        {performance && <PerformanceAnalysis performance={performance} />}
      </div>
      {memoryHierarchy && (
        <>
          <div>
            <Cache memoryHierarchy={memoryHierarchy} />

            <AddressSize addressSize={addressSize} />
            <BlockSize blockSize={blockSize} />
            {levelHitRates.length > 0 && (
              <div>
                <h4>Cache Level Hit Rates:</h4>
                {levelHitRates.map((rate, index) => (
                  <div key={index}>
                    Level {rate.level}: {rate.hitRate.toFixed(2)}%
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <MainMemory memoryHierarchy={memoryHierarchy} />
            <DiskStorage memoryHierarchy={memoryHierarchy} />
            <div>
              <h4>Enter Memory Addresses (comma-separated):</h4>
              <input
                className="m"
                type="text"
                value={currentAddress}
                onChange={handleAddressInput}
              />
              <button onClick={handleAddAddress}>Add Addresses</button>
            </div>
            <div>
              <button className="f" onClick={handleFinish}>
                Calculate Performance
              </button>
            </div>
            <div className="address-list">
              {addressResults.map((result, index) => (
                <div key={index} className={`address-item ${result.status}`}>
                  Address {result.address}: {result.status}
                  {result.level !== -1 &&
                    memoryHierarchy.cacheLevels.length > 1 &&
                    ` (Level ${result.level + 1})`}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
