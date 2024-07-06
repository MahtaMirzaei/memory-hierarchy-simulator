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
