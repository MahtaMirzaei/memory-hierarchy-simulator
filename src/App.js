import React, { useState } from 'react';
import UserInput from './components/UserInput';
import Cache from './components/Cache';
import MainMemory from './components/MainMemory';
import DiskStorage from './components/DiskStorage';
import PerformanceAnalysis from './components/PerformanceAnalysis';
import { LRU, FIFO, RandomPolicy, LFU } from './utils/policies';
import './styles.css';

const App = () => {
  const [memoryHierarchy, setMemoryHierarchy] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState('');
  const [performance, setPerformance] = useState(null);
  const [addressResults, setAddressResults] = useState([]);
  const [blockSize, setBlockSize] = useState(8); // Default block size
  const [addressSize, setAddressSize] = useState(1024); // Default address size

  const handleSimulate = (hierarchy) => {
    setMemoryHierarchy(hierarchy);
    setAddresses([]);
    setPerformance(null);
    setAddressResults([]);
  };

  const handleAddressInput = (e) => {
    setCurrentAddress(e.target.value);
  };

  const handleAddAddress = () => {
    const addressValue = parseInt(currentAddress, 10);
    if (!isNaN(addressValue) && addressValue >= 0 && addressValue < addressSize) {
      setAddresses([...addresses, addressValue]);
      setCurrentAddress('');
    } else {
      alert('Address must be between 0 and address size.');
    }
  };

  const handleFinish = () => {
    if (!memoryHierarchy || !memoryHierarchy.cacheLevels) return;

    const { cacheLevels, replacementPolicy } = memoryHierarchy;
    let cacheInstances = [];

    for (let i = 0; i < cacheLevels.length; i++) {
      switch (replacementPolicy) {
        case 'LRU':
          cacheInstances.push(new LRU(cacheLevels[i].size));
          break;
        case 'FIFO':
          cacheInstances.push(new FIFO(cacheLevels[i].size));
          break;
        case 'Random':
          cacheInstances.push(new RandomPolicy(cacheLevels[i].size));
          break;
        case 'LFU':
          cacheInstances.push(new LFU(cacheLevels[i].size));
          break;
        default:
          return;
      }
    }

    let hits = 0;
    let results = [];

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
        results.push({ address, status: 'hit', level: hitLevel });
      } else {
        results.push({ address, status: 'miss', level: -1 });

        for (let i = 0; i < cacheInstances.length; i++) {
          const cacheInstance = cacheInstances[i];
          const blockStart = Math.floor(address / blockSize) * blockSize;
          const blockEnd = blockStart + blockSize - 1;

          cacheInstance.addBlock(blockStart, blockEnd);
        }
      }
    });

    const totalAccesses = addresses.length;
    const misses = totalAccesses - hits;
    const hitRate = (hits / totalAccesses) * 100;
    const missRate = (misses / totalAccesses) * 100;

    // Correct AMAT calculation
    let amat = 0;
    for (let i = 0; i < cacheLevels.length; i++) {
      const levelHits = results.filter(result => result.level === i).length;
      const levelMisses = results.filter(result => result.level < i).length;
      const hitTime = cacheLevels[i].hitTime;
      const missPenalty = i === cacheLevels.length - 1 
        ? cacheLevels[i].missPenalty 
        : cacheLevels[i].missPenalty + cacheLevels[i + 1].hitTime;

      amat += (levelHits / totalAccesses) * hitTime + (levelMisses / totalAccesses) * missPenalty;
    }

    setPerformance({
      hitRate,
      missRate,
      amat,
    });
    setAddressResults(results);
  };

  return (
    <div className="app">
      <UserInput 
        onSimulate={handleSimulate} 
        setBlockSize={setBlockSize} 
        setAddressSize={setAddressSize} 
        blockSize={blockSize} 
        addressSize={addressSize} 
      />
      {memoryHierarchy && (
        <>
          <div className="m">
            <Cache memoryHierarchy={memoryHierarchy} />
          </div>
          <div>
            <MainMemory memoryHierarchy={memoryHierarchy} />
            <DiskStorage memoryHierarchy={memoryHierarchy} />
            <div>
              <label>Enter Memory Address:</label>
              <input type="number" value={currentAddress} onChange={handleAddressInput} />
              <button onClick={handleAddAddress}>Add Address</button>
            </div>
            <div>
              <button onClick={handleFinish}>Calculate Performance</button>
            </div>
            <div className="address-list">
              {addressResults.map((result, index) => (
                <div key={index} className={`address-item ${result.status}`}>
                  Address {result.address}: {result.status}
                  {result.level !== -1 && memoryHierarchy.cacheLevels.length > 1 && ` (Level ${result.level + 1})`}
                </div>
              ))}
            </div>
          </div>
          {performance && <PerformanceAnalysis performance={performance} />}
        </>
      )}
    </div>
  );
};

export default App;
