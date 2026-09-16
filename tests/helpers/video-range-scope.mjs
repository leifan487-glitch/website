// Keep historical Worker hashes intact; only the explicitly authorized adapter is removed.
export function withoutVideoRange(source) {
  return source.replace(/\/\/ BEGIN VIDEO RANGE ADAPTER[^]*?\/\/ END VIDEO RANGE ADAPTER\r?\n/, '')
    .replace('const response = /\\.(?:mp4)$/i.test(url.pathname) && ["GET", "HEAD"].includes(request.method)\n      ? await fetchVideoAsset(request, env)\n      : await env.ASSETS.fetch(request);', 'const response = await env.ASSETS.fetch(request);');
}
