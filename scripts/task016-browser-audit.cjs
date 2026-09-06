const { mkdir, writeFile } = require("node:fs/promises");
const { join } = require("node:path");
const { chromium } = require("playwright");

const mode = process.argv[2] || "final";
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const browserExecutable = process.env.BROWSER_EXECUTABLE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const rootOutput = join(__dirname, "..", "screenshots", "task016");
const outputDir = mode === "baseline" ? join(rootOutput, "baseline") : rootOutput;
const requiredRoutes = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/news", "/inquiry", "/support/videos"];
const viewports = [
  { width: 1728, height: 1000 },
  { width: 1440, height: 1000 },
  { width: 1280, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
const screenshotPlan = [
  { path: "/", width: 1440, height: 1000, name: "01-home-1440.png" },
  { path: "/", width: 390, height: 844, name: "02-home-390.png" },
  { path: "/products/mantis-standard", width: 1440, height: 1000, name: "03-standard-1440.png" },
  { path: "/products/mantis-standard", width: 390, height: 844, name: "04-standard-390.png" },
  { path: "/technology", width: 1440, height: 1000, name: "05-technology-1440.png" },
  { path: "/applications", width: 1440, height: 1000, name: "06-applications-1440.png" },
  { path: "/inquiry", width: 390, height: 844, name: "07-inquiry-390.png" },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function installPerformanceObservers(page) {
  await page.addInitScript(() => {
    window.__task016 = { lcp: [], shifts: [], longTasks: [], events: [] };
    const observe = (type, key) => {
      try {
        const observer = new PerformanceObserver((list) => {
          window.__task016[key].push(...list.getEntries().map((entry) => ({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            size: entry.size,
            element: entry.element?.tagName || null,
            url: entry.url || null,
          })));
        });
        observer.observe({ type, buffered: true, durationThreshold: type === "event" ? 16 : undefined });
      } catch {}
    };
    observe("largest-contentful-paint", "lcp");
    observe("layout-shift", "shifts");
    observe("longtask", "longTasks");
    observe("event", "events");
  });
}

function watchPage(page) {
  const state = { consoleErrors: [], consoleWarnings: [], pageErrors: [], failedRequests: [], abortedRequests: [], badResponses: [], responses: [] };
  page.on("console", (message) => {
    if (message.type() === "error") state.consoleErrors.push(message.text());
    if (message.type() === "warning") state.consoleWarnings.push(message.text());
  });
  page.on("pageerror", (error) => state.pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const record = { url: request.url(), resourceType: request.resourceType(), error: request.failure()?.errorText || "failed" };
    if (record.error.includes("ERR_ABORTED")) state.abortedRequests.push(record);
    else state.failedRequests.push(record);
  });
  page.on("response", async (response) => {
    const headers = response.headers();
    const record = {
      url: response.url(),
      status: response.status(),
      contentType: headers["content-type"] || "",
      contentLength: Number(headers["content-length"] || 0),
      cacheControl: headers["cache-control"] || "",
      acceptRanges: headers["accept-ranges"] || "",
      requestRange: response.request().headers()["range"] || "",
      fromServiceWorker: response.fromServiceWorker(),
    };
    state.responses.push(record);
    if (response.status() >= 400) state.badResponses.push(record);
  });
  return state;
}

async function collectMetrics(page, cdp) {
  const browserMetrics = await cdp.send("Performance.getMetrics");
  const metricMap = Object.fromEntries(browserMetrics.metrics.map(({ name, value }) => [name, value]));
  return page.evaluate((cdpMetrics) => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = Object.fromEntries(performance.getEntriesByType("paint").map((entry) => [entry.name, entry.startTime]));
    const resources = performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      startTime: entry.startTime,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    }));
    const shifts = (window.__task016?.shifts || []).filter((entry) => !entry.hadRecentInput);
    const lcpEntries = window.__task016?.lcp || [];
    const lcp = lcpEntries.at(-1) || null;
    const longTasks = window.__task016?.longTasks || [];
    const eventDurations = (window.__task016?.events || []).map((entry) => entry.duration).filter(Number.isFinite);
    const videos = [...document.querySelectorAll("video")].map((video) => ({
      src: video.currentSrc || video.getAttribute("src") || "",
      preload: video.preload,
      paused: video.paused,
      readyState: video.readyState,
      networkState: video.networkState,
      currentTime: video.currentTime,
    }));
    return {
      url: location.href,
      title: document.title,
      fcp: paints["first-contentful-paint"] ?? null,
      lcp: lcp ? { startTime: lcp.startTime, size: lcp.size, element: lcp.element, url: lcp.url } : null,
      cls: shifts.reduce((sum, entry) => sum + (entry.value || 0), 0),
      layoutShiftCount: shifts.length,
      longTaskCount: longTasks.length,
      longTaskTotalDuration: longTasks.reduce((sum, entry) => sum + entry.duration, 0),
      maxLongTaskDuration: Math.max(0, ...longTasks.map((entry) => entry.duration)),
      maxInteractionDuration: Math.max(0, ...eventDurations),
      ttfb: nav?.responseStart ?? null,
      domContentLoaded: nav?.domContentLoadedEventEnd ?? null,
      load: nav?.loadEventEnd ?? null,
      transferSize: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
      encodedBodySize: resources.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      resourceCount: resources.length,
      resources,
      domNodes: document.getElementsByTagName("*").length,
      scrollHeight: document.documentElement.scrollHeight,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      images: [...document.images].map((image) => {
        const rect = image.getBoundingClientRect();
        return {
          src: image.currentSrc || image.src,
          loading: image.loading,
          fetchPriority: image.fetchPriority,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
          pageTop: rect.top + scrollY,
        };
      }),
      videos,
      hero: (() => {
        const image = document.querySelector(".product-hero__media img");
        if (!image) return null;
        const rect = image.getBoundingClientRect();
        return {
          currentSrc: image.currentSrc,
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
          fetchPriority: image.fetchPriority,
          loading: image.loading,
        };
      })(),
      cdp: {
        TaskDuration: cdpMetrics.TaskDuration,
        ScriptDuration: cdpMetrics.ScriptDuration,
        LayoutDuration: cdpMetrics.LayoutDuration,
        RecalcStyleDuration: cdpMetrics.RecalcStyleDuration,
        JSHeapUsedSize: cdpMetrics.JSHeapUsedSize,
        Nodes: cdpMetrics.Nodes,
      },
    };
  }, metricMap);
}

async function auditPage(browser, route, viewport, { scroll = false, slow = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await installPerformanceObservers(page);
  const state = watchPage(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  if (slow) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200 * 1024,
      uploadThroughput: 75 * 1024,
      connectionType: "cellular4g",
    });
  }
  const started = Date.now();
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load", timeout: slow ? 60000 : 30000 });
  const loadWallMs = Date.now() - started;
  await page.waitForTimeout(slow ? 2200 : 900);
  const preScroll = await collectMetrics(page, cdp);
  let scrollResult = null;
  if (scroll) {
    const scrollStarted = Date.now();
    await page.evaluate(async () => {
      const step = Math.max(260, Math.floor(window.innerHeight * 0.7));
      for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
        window.scrollTo(0, top);
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(500);
    scrollResult = { wallMs: Date.now() - scrollStarted, metrics: await collectMetrics(page, cdp) };
  }
  const result = {
    route,
    viewport,
    slowNetwork: slow,
    httpStatus: response?.status() || null,
    loadWallMs,
    preScroll,
    scrollResult,
    ...state,
  };
  await context.close();
  return result;
}

async function captureScreenshots(browser) {
  for (const capture of screenshotPlan) {
    const context = await browser.newContext({ viewport: { width: capture.width, height: capture.height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${capture.path}`, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      const step = Math.max(320, Math.floor(innerHeight * 0.82));
      for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
        scrollTo(0, top);
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(rootOutput, capture.name), fullPage: true });
    await context.close();
  }
}

async function routeStress(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const originalAdd = EventTarget.prototype.addEventListener;
    const originalRemove = EventTarget.prototype.removeEventListener;
    const counts = new Map();
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      counts.set(type, (counts.get(type) || 0) + 1);
      return originalAdd.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      counts.set(type, Math.max(0, (counts.get(type) || 0) - 1));
      return originalRemove.call(this, type, listener, options);
    };
    window.__listenerCounts = counts;
  });
  const state = watchPage(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("HeapProfiler.enable");
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const sequence = ["/", "/products/mantis-standard", "/technology", "/applications", "/about", "/news", "/inquiry", "/"];
  const snapshots = [];
  async function snapshot(label) {
    await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
    const metrics = await cdp.send("Performance.getMetrics");
    const values = Object.fromEntries(metrics.metrics.map(({ name, value }) => [name, value]));
    const windowObject = await cdp.send("Runtime.evaluate", { expression: "window" });
    const documentObject = await cdp.send("Runtime.evaluate", { expression: "document" });
    const windowListeners = await cdp.send("DOMDebugger.getEventListeners", { objectId: windowObject.result.objectId });
    const documentListeners = await cdp.send("DOMDebugger.getEventListeners", { objectId: documentObject.result.objectId });
    const actualListeners = [...windowListeners.listeners, ...documentListeners.listeners].reduce((counts, listener) => {
      counts[listener.type] = (counts[listener.type] || 0) + 1;
      return counts;
    }, {});
    snapshots.push(await page.evaluate(({ label, heap, actualListeners }) => ({
      label,
      path: location.pathname,
      heap,
      domNodes: document.getElementsByTagName("*").length,
      listeners: Object.fromEntries(window.__listenerCounts || []),
      actualWindowDocumentListeners: actualListeners,
      videos: [...document.querySelectorAll("video")].map((video) => ({ src: video.currentSrc, paused: video.paused, currentTime: video.currentTime })),
    }), { label, heap: values.JSHeapUsedSize, actualListeners }));
  }
  await snapshot("start");
  for (let cycle = 1; cycle <= 3; cycle += 1) {
    for (const path of sequence.slice(1)) {
      await page.evaluate((nextPath) => {
        history.pushState({}, "", nextPath);
        dispatchEvent(new PopStateEvent("popstate"));
      }, path);
      await page.waitForFunction((nextPath) => location.pathname === nextPath, path);
      await page.waitForTimeout(140);
    }
    await snapshot(`cycle-${cycle}`);
  }
  await context.close();
  return { snapshots, ...state };
}

async function interactionAudit(browser) {
  const results = {};
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
    const page = await context.newPage();
    const state = watchPage(page);
    await page.goto(`${baseUrl}/`, { waitUntil: "load" });
    const product = page.getByRole("button", { name: /产品/ }).first();
    await product.focus();
    await page.keyboard.press("Enter");
    const productExpanded = await product.getAttribute("aria-expanded");
    await page.keyboard.press("Escape");
    const productClosed = await product.getAttribute("aria-expanded");
    results.navbar = { productExpanded, productClosed, errors: state };
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "load" });
    const menu = page.locator(".navbar__menu-button").first();
    await menu.click();
    const videoCenter = page.getByRole("link", { name: /视频中心/ }).first();
    results.mobileAccordion = {
      menuExpanded: await menu.getAttribute("aria-expanded"),
      videoCenterVisible: await videoCenter.isVisible(),
      supportAccordion: "N/A — current locked IA exposes Video Center as a direct destination",
    };
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/products/mantis-standard`, { waitUntil: "load" });
    const qaButton = page.locator(".standard-qa button").first();
    if (await qaButton.count()) {
      await qaButton.focus();
      const before = await qaButton.getAttribute("aria-expanded");
      await page.keyboard.press("Enter");
      results.qa = { before, after: await qaButton.getAttribute("aria-expanded") };
    }
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/support/videos`, { waitUntil: "load" });
    const play = page.locator(".video-featured .standard-media-player--poster").first();
    if (await play.count()) {
      await play.click();
      const video = page.locator(".video-featured video").first();
      await page.waitForTimeout(350);
      results.video = { activated: await video.count(), paused: await video.evaluate((el) => el.paused), controls: await video.evaluate((el) => el.controls) };
    }
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/inquiry`, { waitUntil: "load" });
    const submit = page.locator('.inquiry-form button[type="submit"]').first();
    const disabled = await submit.isDisabled();
    if (!disabled) await submit.click();
    results.inquiry = disabled
      ? { disabled, status: await page.locator(".inquiry-form__status").innerText() }
      : {
          disabled,
          invalidCount: await page.locator(":invalid").count(),
          focusedTag: await page.evaluate(() => document.activeElement?.tagName || null),
        };
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "load" });
    await page.waitForTimeout(400);
    results.reducedMotion = await page.evaluate(() => ({
      matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      homeMotionClass: document.documentElement.classList.contains("has-home-motion"),
      videos: [...document.querySelectorAll("video")].map((video) => ({ autoplay: video.autoplay, paused: video.paused, controls: video.controls })),
    }));
    await context.close();
  }
  return results;
}

function classifyNetwork(pages) {
  const responses = pages.flatMap((page) => page.responses.map((response) => ({ route: page.route, viewportWidth: page.viewport.width, ...response })));
  const byUrl = new Map();
  for (const response of responses) {
    const key = `${response.route}@${response.viewportWidth}|${response.url}`;
    byUrl.set(key, (byUrl.get(key) || 0) + 1);
  }
  return {
    responses,
    badResponses: responses.filter((item) => item.status >= 400),
    failedRequests: pages.flatMap((page) => page.failedRequests.map((item) => ({ route: page.route, ...item }))),
    abortedRequests: pages.flatMap((page) => page.abortedRequests.map((item) => ({ route: page.route, ...item }))),
    duplicatesWithinRoute: [...byUrl].filter(([, count]) => count > 1).map(([key, count]) => ({ key, count })),
    externalRequests: responses.filter((item) => !item.url.startsWith(baseUrl)),
    videoResponses: responses.filter((item) => item.contentType.startsWith("video/") || /\.mp4(?:\?|$)/.test(item.url)),
  };
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: browserExecutable, args: ["--disable-background-networking"] });
  if (mode === "interactions") {
    const interactions = await interactionAudit(browser);
    await browser.close();
    console.log(JSON.stringify(interactions, null, 2));
    return;
  }
  if (mode === "stress") {
    const stress = await routeStress(browser);
    await browser.close();
    await writeFile(join(rootOutput, "route-stress.json"), `${JSON.stringify(stress, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(stress, null, 2));
    return;
  }
  if (mode === "reel") {
    const run = await auditPage(browser, "/", { width: 1440, height: 1000 }, { scroll: true });
    await browser.close();
    const result = run.responses.filter((response) => /\.mp4(?:\?|$)/.test(response.url));
    await writeFile(join(rootOutput, "reel-range-check.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const pageRuns = [];
  for (const viewport of viewports) pageRuns.push(await auditPage(browser, "/", viewport, { scroll: true }));
  for (const route of requiredRoutes.slice(1)) {
    pageRuns.push(await auditPage(browser, route, { width: 1440, height: 1000 }));
    pageRuns.push(await auditPage(browser, route, { width: 390, height: 844 }));
  }
  const slowMobile = await auditPage(browser, "/", { width: 390, height: 844 }, { slow: true });
  const stress = await routeStress(browser);
  const interactions = mode === "final" ? await interactionAudit(browser) : null;
  if (mode === "final") await captureScreenshots(browser);
  await browser.close();

  const network = classifyNetwork(pageRuns);
  const performanceSummary = {
    mode,
    generatedAt: new Date().toISOString(),
    environment: "LOCAL APPROXIMATION — Microsoft Edge via Playwright against Vite production preview",
    baseUrl,
    pageRuns,
    slowMobile,
  };
  const browserQa = {
    mode,
    generatedAt: new Date().toISOString(),
    pageCount: pageRuns.length,
    allRoutes200: pageRuns.every((item) => item.httpStatus === 200),
    overflow: pageRuns.filter((item) => item.preScroll.scrollWidth > item.preScroll.clientWidth).map((item) => `${item.route}@${item.viewport.width}`),
    brokenImages: pageRuns.flatMap((item) => item.preScroll.brokenImages.map((url) => ({ route: item.route, width: item.viewport.width, url }))),
    consoleErrors: pageRuns.flatMap((item) => item.consoleErrors.map((message) => ({ route: item.route, width: item.viewport.width, message }))),
    pageErrors: pageRuns.flatMap((item) => item.pageErrors.map((message) => ({ route: item.route, width: item.viewport.width, message }))),
    failedRequests: network.failedRequests,
    abortedMediaRequests: network.abortedRequests,
    badResponses: network.badResponses,
    routeStress: stress,
    interactions,
  };
  browserQa.allPassed = browserQa.allRoutes200 && !browserQa.overflow.length && !browserQa.brokenImages.length && !browserQa.consoleErrors.length && !browserQa.pageErrors.length && !browserQa.failedRequests.length && !browserQa.badResponses.length;
  await writeFile(join(outputDir, "performance-summary.json"), `${JSON.stringify(performanceSummary, null, 2)}\n`, "utf8");
  await writeFile(join(outputDir, "network-summary.json"), `${JSON.stringify(network, null, 2)}\n`, "utf8");
  await writeFile(join(outputDir, "browser-qa.json"), `${JSON.stringify(browserQa, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    mode,
    outputDir,
    pageRuns: pageRuns.length,
    allPassed: browserQa.allPassed,
    home: pageRuns.filter((item) => item.route === "/").map((item) => ({ width: item.viewport.width, lcp: item.preScroll.lcp?.startTime, cls: item.preScroll.cls, fcp: item.preScroll.fcp, requests: item.preScroll.resourceCount, transferSize: item.preScroll.transferSize, videoResponses: item.responses.filter((response) => /video|\.mp4/.test(`${response.contentType} ${response.url}`)).length })),
    slowMobile: { lcp: slowMobile.preScroll.lcp?.startTime, fcp: slowMobile.preScroll.fcp, loadWallMs: slowMobile.loadWallMs, requests: slowMobile.preScroll.resourceCount, transferSize: slowMobile.preScroll.transferSize },
    errors: { console: browserQa.consoleErrors.length, page: browserQa.pageErrors.length, failed: browserQa.failedRequests.length, bad: browserQa.badResponses.length, overflow: browserQa.overflow.length },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
