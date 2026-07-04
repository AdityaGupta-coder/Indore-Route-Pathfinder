export function bfs(graph, start, goal) {
  const visited = new Set();
  const queue = [[start]];

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === goal) return path;
    if (!visited.has(node)) {
      visited.add(node);
      (graph[node] || []).forEach(neighbor => {
        queue.push([...path, neighbor.to]);
      });
    }
  }

  return null;
}
