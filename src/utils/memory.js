import { LRU, FIFO, RandomPolicy, LFU } from "./policies";

export class MemoryHierarchy {
  constructor({
    cacheSizes,
    replacementPolicy,
    levels,
    blockSize,
    addressSize,
    ramAccessTime, 
    diskAccessTime
  }) {
    this.cacheSizes = cacheSizes;
    this.replacementPolicy = replacementPolicy;
    this.levels = levels;
    this.blockSize = blockSize;
    this.addressSize = addressSize;
    this.caches = this.createCaches(levels, cacheSizes, replacementPolicy);
    this.mainMemory = { size: 65536}; // Example size in KB
    this.diskStorage = { size: 1024}; // Example size in GB
    this.hits = 0;
    this.misses = 0;
    this.ramAccessTime = 300;
    this.diskStorage = 15000;
  }

  createCaches(levels, sizes, policy) {
    const caches = [];
    for (let i = 0; i < levels; i++) {
      let cache;
      switch (policy) {
        case "LRU":
          cache = new LRU(sizes[i]);
          break;
        case "FIFO":
          cache = new FIFO(sizes[i]);
          break;
        case "Random":
          cache = new RandomPolicy(sizes[i]);
          break;
        case "LFU":
          cache = new LFU(sizes[i]);
          break;
        default:
          throw new Error("Unknown replacement policy");
      }
      caches.push(cache);
    }
    return caches;
  }

  accessMemory(address) {
    let hit = false;
    for (let i = 0; i < this.caches.length; i++) {
      const cache = this.caches[i];
      if (cache.access(address)) {
        hit = true;
        this.hits++;
        break;
      }
    }
    if (!hit) {
      this.misses++;
    }
  }

}