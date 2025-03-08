import Bank from '../models/Bank.js';
import Link from '../models/Link.js';

// A generic PriorityQueue implementation using a binary heap
class PriorityQueue {
    constructor(comparator = (a, b) => a - b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    peek() {
        return this._heap[0];
    }
    push(value) {
        this._heap.push(value);
        this._siftUp();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this._heap.pop();
        if (!this.isEmpty()) {
            this._heap[0] = bottom;
            this._siftDown();
        }
        return poppedValue;
    }
    _parent(idx) {
        return Math.floor((idx - 1) / 2);
    }
    _leftChild(idx) {
        return idx * 2 + 1;
    }
    _rightChild(idx) {
        return idx * 2 + 2;
    }
    _siftUp() {
        let idx = this.size() - 1;
        while (
            idx > 0 &&
            this._comparator(this._heap[idx], this._heap[this._parent(idx)]) < 0
        ) {
            this._swap(idx, this._parent(idx));
            idx = this._parent(idx);
        }
    }
    _siftDown() {
        let idx = 0;
        while (this._leftChild(idx) < this.size()) {
            let smallestChildIdx = this._leftChild(idx);
            const rightChildIdx = this._rightChild(idx);
            if (
                rightChildIdx < this.size() &&
                this._comparator(this._heap[rightChildIdx], this._heap[smallestChildIdx]) < 0
            ) {
                smallestChildIdx = rightChildIdx;
            }
            if (this._comparator(this._heap[smallestChildIdx], this._heap[idx]) >= 0) break;
            this._swap(idx, smallestChildIdx);
            idx = smallestChildIdx;
        }
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
}

// Optimized fastest path using Dijkstra's algorithm with a priority queue
export const dijkstra = async (start, end) => {
    // Build graph from Link collection: each edge contains travel time in minutes
    const links = await Link.find();
    const graph = {};
    links.forEach(({ FromBIC, ToBIC, TimeTakenInMinutes }) => {
        if (!graph[FromBIC]) graph[FromBIC] = [];
        graph[FromBIC].push({ to: ToBIC, time: TimeTakenInMinutes });
    });

    // Priority queue ordered by total time so far
    const pq = new PriorityQueue((a, b) => a.time - b.time);
    pq.push({ node: start, time: 0, path: [start] });
    const bestTime = { [start]: 0 };

    while (!pq.isEmpty()) {
        const { node, time, path } = pq.pop();
        if (node === end) return { path, time };
        if (!graph[node]) continue;
        for (const edge of graph[node]) {
            const newTime = time + edge.time;
            if (newTime < (bestTime[edge.to] || Infinity)) {
                bestTime[edge.to] = newTime;
                pq.push({ node: edge.to, time: newTime, path: [...path, edge.to] });
            }
        }
    }
    return { path: [], time: Infinity };
};

// Optimized cheapest path using a Dijkstra-like algorithm with a priority queue
// In this context, each move from one bank to another incurs a cost equal to the destination bank’s transfer rate.
export const findCheapestPath = async (start, end) => {
    // Preload bank charges into a cache for fast lookup
    const banks = await Bank.find();
    const bankCharges = {};
    banks.forEach(({ BIC, Charge }) => {
        bankCharges[BIC] = Charge;
    });

    // Build a graph from Link collection where each edge connects banks
    const links = await Link.find();
    const graph = {};
    links.forEach(({ FromBIC, ToBIC }) => {
        if (!graph[FromBIC]) graph[FromBIC] = [];
        graph[FromBIC].push(ToBIC);
    });

    // Use a priority queue ordered by accumulated cost
    const pq = new PriorityQueue((a, b) => a.cost - b.cost);
    pq.push({ node: start, cost: 0, path: [start] });
    const bestCost = { [start]: 0 };

    while (!pq.isEmpty()) {
        const { node, cost, path } = pq.pop();
        if (node === end) return { path, cost };
        if (!graph[node]) continue;
        for (const neighbor of graph[node]) {
            const charge = bankCharges[neighbor] !== undefined ? bankCharges[neighbor] : Infinity;
            const newCost = cost + charge;
            if (newCost < (bestCost[neighbor] || Infinity)) {
                bestCost[neighbor] = newCost;
                pq.push({ node: neighbor, cost: newCost, path: [...path, neighbor] });
            }
        }
    }
    return { path: [], cost: Infinity };
};
