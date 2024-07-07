// policies.js

export class LRU {
  constructor(size) {
    this.size = size;
    this.cache = new Map();
  }

  access(address) {
    if (this.cache.has(address)) {
      this.cache.delete(address);
      this.cache.set(address, true);
      return true;
    }
    return false;
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(addr, true);
    }
  }
}

export class FIFO {
  constructor(size) {
    this.size = size;
    this.queue = [];
  }

  access(address) {
    if (this.queue.includes(address)) {
      return true;
    }
    return false;
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.queue.length >= this.size) {
        this.queue.shift();
      }
      this.queue.push(addr);
    }
  }
}

export class RandomPolicy {
  constructor(size) {
    this.size = size;
    this.cache = new Set();
  }

  access(address) {
    return this.cache.has(address);
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        const randomAddress = Array.from(this.cache)[
          Math.floor(Math.random() * this.cache.size)
        ];
        this.cache.delete(randomAddress);
      }
      this.cache.add(addr);
    }
  }
}

export class LFU {
  constructor(size) {
    this.size = size;
    this.cache = new Map();
    this.usageCount = new Map();
  }

  access(address) {
    if (this.cache.has(address)) {
      this.usageCount.set(address, this.usageCount.get(address) + 1);
      return true;
    }
    return false;
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        let lfuKey = null;
        let minCount = Infinity;
        for (let [key, count] of this.usageCount.entries()) {
          if (count < minCount) {
            minCount = count;
            lfuKey = key;
          }
        }
        if (lfuKey !== null) {
          this.cache.delete(lfuKey);
          this.usageCount.delete(lfuKey);
        }
      }
      this.cache.set(addr, true);
      this.usageCount.set(addr, 1);
    }
  }
}

export class RAM {
  constructor(size) {
    this.size = size;
    this.cache = new Set();
  }

  access(address) {
    return this.cache.has(address);
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        this.cache.delete(this.cache.keys().next().value);
      }
      this.cache.add(addr);
    }
  }
}

export class RR {
  constructor(size) {
    this.size = size;
    this.cache = new Set();
    this.keys = [];
    this.index = 0;
  }

  access(address) {
    return this.cache.has(address);
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        const replaceIndex = this.index % this.size;
        this.cache.delete(this.keys[replaceIndex]);
        this.keys[replaceIndex] = addr;
        this.index++;
      } else {
        this.keys.push(addr);
      }
      this.cache.add(addr);
    }
  }
}

export class MFU {
  constructor(size) {
    this.size = size;
    this.cache = new Map();
    this.usageCount = new Map();
  }

  access(address) {
    if (this.cache.has(address)) {
      this.usageCount.set(address, this.usageCount.get(address) + 1);
      return true;
    }
    return false;
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        let mfuKey = null;
        let maxCount = -Infinity;
        for (let [key, count] of this.usageCount.entries()) {
          if (count > maxCount) {
            maxCount = count;
            mfuKey = key;
          }
        }
        if (mfuKey !== null) {
          this.cache.delete(mfuKey);
          this.usageCount.delete(mfuKey);
        }
      }
      this.cache.set(addr, true);
      this.usageCount.set(addr, 1);
    }
  }
}

export class LFRU {
  constructor(size) {
    this.size = size;
    this.cache = new Map();
    this.usageCount = new Map();
  }

  access(address) {
    if (this.cache.has(address)) {
      this.usageCount.set(address, this.usageCount.get(address) + 1);
      return true;
    }
    return false;
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      if (this.cache.size >= this.size) {
        let lfruKey = null;
        let minCount = Infinity;
        let minTimestamp = Infinity;
        for (let [key, count] of this.usageCount.entries()) {
          const timestamp = this.cache.get(key);
          if (count < minCount || (count === minCount && timestamp < minTimestamp)) {
            minCount = count;
            minTimestamp = timestamp;
            lfruKey = key;
          }
        }
        if (lfruKey !== null) {
          this.cache.delete(lfruKey);
          this.usageCount.delete(lfruKey);
        }
      }
      this.cache.set(addr, Date.now());
      this.usageCount.set(addr, 1);
    }
  }
}

export class SecondChance {
  constructor(size) {
    this.size = size;
    this.cache = new Map();
    this.queue = [];
  }

  access(address) {
    if (this.cache.has(address)) {
      this.cache.set(address, true);
      return true;
    }
    return false;
  }

  addBlock(start, end) {
    for (let addr = start; addr <= end; addr++) {
      while (this.cache.size >= this.size) {
        const first = this.queue.shift();
        if (this.cache.get(first)) {
          this.cache.set(first, false);
          this.queue.push(first);
        } else {
          this.cache.delete(first);
        }
      }
      this.cache.set(addr, false);
      this.queue.push(addr);
    }
  }
}
