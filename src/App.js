import React, { useState } from "react";
import UserInput from "./components/UserInput";
import Cache from "./components/Cache";
import MainMemory from "./components/MainMemory";
import DiskStorage from "./components/DiskStorage";
import PerformanceAnalysis from "./components/PerformanceAnalysis";
import {
  LRU,
  FIFO,
  RandomPolicy,
  LFU,
  RAM,
  RR,
  MFU,
  LFRU,
  SecondChance,
} from "./utils/policies";
import "./styles.css";
import AddressSize from "./components/AddressSize";
import BlockSize from "./components/BlockSize";
import ReplacementPolicy from "./components/ReplacementPolicy";

const App = () => {
  const [memoryHierarchy, setMemoryHierarchy] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("");
  const [performance, setPerformance] = useState(null);
  const [addressResults, setAddressResults] = useState([]);
  const [blockSize, setBlockSize] = useState(8); // Default block size
  const [addressSize, setAddressSize] = useState(8192); // Default address size
  const [levelHitRates, setLevelHitRates] = useState([]); // State to store hit rates of each level
  const [mainMemorySize, setMainMemorySize] = useState(8192); // Default main memory size
  const [diskStorageSize, setDiskStorageSize] = useState(16384); // Default disk storage size
  const [replacementPolicy, setReplacementPolicy] = useState("LRU");
  const [ramAccessTime, setRamAccessTime] = useState(300);
  const [diskAccessTime, setDiskAccessTime] = useState(15000);

  const handleSimulate = (hierarchy) => {
    setMemoryHierarchy(hierarchy);
    setAddresses([]);
    setPerformance(null);
    setAddressResults([]);
    setLevelHitRates([]);
    setReplacementPolicy(hierarchy.replacementPolicy);
    setRamAccessTime(hierarchy.ramAccessTime);
    setDiskAccessTime(hierarchy.diskAccessTime);
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
        case "RAM":
          cacheInstances.push(new RAM(cacheLevels[i].size));
          break;
        case "RR":
          cacheInstances.push(new RR(cacheLevels[i].size));
          break;
        case "MFU":
          cacheInstances.push(new MFU(cacheLevels[i].size));
          break;
        case "LFRU":
          cacheInstances.push(new LFRU(cacheLevels[i].size));
          break;
        case "Second Chance":
          cacheInstances.push(new SecondChance(cacheLevels[i].size));
          break;
        default:
          alert("Invalid replacement policy selected");
          return;
      }
    }

    const ram = new RAM(mainMemorySize);
    let hits = 0;
    let results = [];
    let levelHits = Array(cacheLevels.length + 2).fill(0); // Array to store hits per level
    let levelAccesses = Array(cacheLevels.length + 2).fill(0); // Array to store accesses per level

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
        let hitInRam = ram.access(address);
        if (hitInRam) {
          hits++;
          results.push({ address, status: "hit(RAM)", level: "RAM" });
          levelHits[cacheLevels.length]++; // RAM is the next level after cache
          hitLevel = cacheLevels.length;
        } else {
          results.push({ address, status: "miss", level: "Disk" });
          levelHits[cacheLevels.length + 1]++; // Disk is the next level after RAM
        }
        for (let i = 0; i < cacheInstances.length; i++) {
          const cacheInstance = cacheInstances[i];
          const blockStart = Math.floor(address / blockSize) * blockSize;
          const blockEnd = blockStart + blockSize - 1;

          cacheInstance.addBlock(blockStart, blockEnd);
        }
        ram.addBlock(address, address); // Add to RAM
      }

      // Increment accesses for all levels up to the one accessed
      for (let i = 0; i <= (hit ? hitLevel : cacheInstances.length + 1); i++) {
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
        i === cacheLevels.length - 1 ? ramAccessTime : formerAmat;

      const missRate = levelMisses / levelAccesses[i];

      // Update AMAT
      amat = hitTime + missRate * missPenalty;
      formerAmat = amat;
    }
    const lastLevelMissRate =
      1 -
      levelHits[cacheLevels.length - 1] / levelAccesses[cacheLevels.length - 1];
    const ramHitRate =
      levelHits[cacheLevels.length] / levelAccesses[cacheLevels.length];
    amat =
      amat +
      lastLevelMissRate *
        (ramHitRate * ramAccessTime + (1 - ramHitRate) * diskAccessTime);
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
          ramAccessTime={ramAccessTime}
          setRamAccessTime={setRamAccessTime}
          diskAccessTime={diskAccessTime}
          setDiskAccessTime={setDiskAccessTime}
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
                <h3>Each level access</h3>
                {levelHitRates.map((rate, index) => (
                  <div key={index}>
                    <p className="b">
                      Level {rate.level}: {rate.hitRate.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <ReplacementPolicy replacementPolicy={replacementPolicy} />
            <MainMemory ramAccestime={ramAccessTime} />
            <DiskStorage diskAccessTime={diskAccessTime} />
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
