function arcLength(x) {
  return x * Math.sqrt(1 + 1 / (x * x)) - Math.log(Math.sqrt(1 + 1 / (x * x)) + 1 / x);
}
 
function totalArcLength(a, b) {
  return arcLength(b) - arcLength(a);
}
 
function findXForArcLength(targetLength, a, b) {
  const tolerance = 1e-6;
  let low = a;
  let high = b;
  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    const length = arcLength(mid) - arcLength(a);
    if (length < targetLength) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}
 
export function divideCurve(a, b, n) {
  const totalLength = totalArcLength(a, b);
  const segmentLength = totalLength / n;
  const points = [];
  for (let i = 1; i <= n; i++) {
    const targetLength = i * segmentLength;
    const x = findXForArcLength(targetLength, a, b);
    const y = Math.log(x);
    points.push({ x, y });
  }
  return points;
}