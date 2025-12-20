export function views(postId) {
  const k = "v_" + postId;
  let v = localStorage.getItem(k);
  if (!v) {
    const ranges = [
      [25e6, 90e6],
      [2e6, 18e6],
      [200e3, 1.8e6]
    ];
    const r = ranges[Math.floor(Math.random() * ranges.length)];
    v = Math.floor(Math.random() * (r[1] - r[0])) + r[0];
    localStorage.setItem(k, v);
  }
  return v >= 1e6 ? `${Math.floor(v / 1e6)}M+` : `${Math.floor(v / 1e3)}K+`;
}
