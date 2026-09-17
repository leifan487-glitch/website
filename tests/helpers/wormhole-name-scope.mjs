// 019.4R-Fix: preserve historical hashes by reversing only this approved label.
export function beforeWormholeName(file, bytes) {
  return file === 'src/data/home.js'
    ? Buffer.from(bytes.toString().replace('wormhole: "具身基础模型"', 'wormhole: "具身智能模型"'))
    : bytes;
}
