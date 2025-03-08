import Bank from '../models/Bank.js';
import Link from '../models/Link.js';

// Optimized fastest path using Dijkstra's algorithm with a set-based approach
// This implementation uses a Set for better performance than a priority queue in practice
export const dijkstra = async (start, end) => {
    // Build graph from Link collection: each edge contains travel time in minutes
    const links = await Link.find();
    const graph = {};
    links.forEach(({ FromBIC, ToBIC, TimeTakenInMinutes }) => {
        if (!graph[FromBIC]) graph[FromBIC] = [];
        graph[FromBIC].push({ to: ToBIC, time: TimeTakenInMinutes });
    });

    // Initialize distances and paths
    const distances = {};
    const previous = {};
    const paths = {};
    const unvisited = new Set();

    // Set initial values
    for (const node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        paths[node] = node === start ? [start] : [];
        unvisited.add(node);
    }
    // Make sure start node is in the set even if it has no outgoing edges
    if (!distances[start]) {
        distances[start] = 0;
        paths[start] = [start];
        unvisited.add(start);
    }

    while (unvisited.size > 0) {
        // Find the node with the smallest distance
        let current = null;
        let smallestDistance = Infinity;

        for (const node of unvisited) {
            if (distances[node] < smallestDistance) {
                smallestDistance = distances[node];
                current = node;
            }
        }

        // If we can't find a node or we've reached the end, break
        if (current === null || current === end) break;

        // Remove current node from unvisited set
        unvisited.delete(current);

        // Skip if no neighbors
        if (!graph[current]) continue;

        // Check all neighbors
        for (const { to, time } of graph[current]) {
            const newDistance = distances[current] + time;

            // If this is a new node, add it to unvisited
            if (distances[to] === undefined) {
                distances[to] = Infinity;
                unvisited.add(to);
            }

            // If we found a shorter path
            if (newDistance < distances[to]) {
                distances[to] = newDistance;
                paths[to] = [...paths[current], to];
            }
        }
    }

    return { path: paths[end] || [], time: distances[end] || Infinity };
};

// Optimized cheapest path using a set-based Dijkstra approach
// This implementation avoids the overhead of a priority queue
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

    // Initialize data structures
    const costs = {};
    const paths = {};
    const unvisited = new Set();

    // Set initial values
    for (const node in graph) {
        costs[node] = node === start ? 0 : Infinity;
        paths[node] = node === start ? [start] : [];
        unvisited.add(node);
    }
    // Make sure start node is in the set even if it has no outgoing edges
    if (!costs[start]) {
        costs[start] = 0;
        paths[start] = [start];
        unvisited.add(start);
    }

    while (unvisited.size > 0) {
        // Find the node with the lowest cost
        let current = null;
        let lowestCost = Infinity;

        for (const node of unvisited) {
            if (costs[node] < lowestCost) {
                lowestCost = costs[node];
                current = node;
            }
        }

        // If we can't find a node or we've reached the end, break
        if (current === null || current === end) break;

        // Remove current node from unvisited set
        unvisited.delete(current);

        // Skip if no neighbors
        if (!graph[current]) continue;

        // Check all neighbors
        for (const neighbor of graph[current]) {
            const charge = bankCharges[neighbor] !== undefined ? bankCharges[neighbor] : Infinity;
            const newCost = costs[current] + charge;

            // If this is a new node, add it to unvisited
            if (costs[neighbor] === undefined) {
                costs[neighbor] = Infinity;
                unvisited.add(neighbor);
            }

            // If we found a cheaper path
            if (newCost < costs[neighbor]) {
                costs[neighbor] = newCost;
                paths[neighbor] = [...paths[current], neighbor];
            }
        }
    }

    return { path: paths[end] || [], cost: costs[end] || Infinity };
};
