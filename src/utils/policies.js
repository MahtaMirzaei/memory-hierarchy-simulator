class LRU {
  constructor(size) {
    this.size = size;
    this.cache = new Map();
  }

  access(address) {
    if (this.cache.has(address)) {
      const value = this.cache.get(address);
      this.cache.delete(address);
      this.cache.set(address, value);
      return true;
    }

    if (this.cache.size >= this.size) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(address, address);
    return false;
  }

  addBlock(start, end) {
    for (let address = start; address <= end; address++) {
      this.access(address);
    }
  }
}

class FIFO {
  constructor(size) {
    this.size = size;
    this.cache = [];
  }

  access(address) {
    const index = this.cache.indexOf(address);
    if (index !== -1) {
      return true;
    }

    if (this.cache.length >= this.size) {
      this.cache.shift();
    }

    this.cache.push(address);
    return false;
  }

  addBlock(start, end) {
    for (let address = start; address <= end; address++) {
      this.access(address);
    }
  }
}

class RandomPolicy {
  constructor(size) {
    this.size = size;
    this.cache = new Set();
  }

  access(address) {
    if (this.cache.has(address)) {
      return true;
    }

    if (this.cache.size >= this.size) {
      const keys = Array.from(this.cache);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      this.cache.delete(randomKey);
    }

    this.cache.add(address);
    return false;
  }

  addBlock(start, end) {
    for (let address = start; address <= end; address++) {
      this.access(address);
    }
  }
}
class LFU {
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

    if (this.cache.size >= this.size) {
      let leastUsed = null;
      let minCount = Infinity;
      for (const [key, count] of this.usageCount.entries()) {
        if (count < minCount) {
          minCount = count;
          leastUsed = key;
        }
      }
      this.cache.delete(leastUsed);
      this.usageCount.delete(leastUsed);
    }

    this.cache.set(address, true);
    this.usageCount.set(address, 1);
    return false;
  }

  addBlock(blockStart, blockEnd) {
    for (let addr = blockStart; addr <= blockEnd; addr++) {
      this.access(addr);
    }
  }
}

export { LRU, FIFO, RandomPolicy, LFU };
