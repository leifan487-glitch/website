const MAX_BODY_LENGTH = 16_384;
const PUBLIC_ROUTES = new Set([
  "/",
  "/products/mantis-standard",
  "/technology",
  "/applications",
  "/about",
  "/news",
  "/news/peoples-daily-whrg-2025",
  "/support",
  "/support/contact",
  "/support/documents",
  "/support/videos",
  "/support/service",
  "/support/knowledge",
  "/inquiry",
  "/policy/privacy",
  "/policy/terms",
]);
const PUBLIC_REDIRECTS = new Map([
  ["/products", "/products/mantis-standard"],
  ["/products/mantis-pro", "/products/mantis-standard"],
  ["/contact", "/inquiry"],
  ["/support/downloads", "/support/documents"],
]);
// BEGIN VIDEO RANGE ADAPTER — Pages assets currently ignore Range requests.
function sliceVideoStream(body, start, end) {
  const reader = body.getReader();
  let offset = 0;
  const sliced = new ReadableStream({
    async pull(controller) {
      try {
        while (offset <= end) {
          const { done, value } = await reader.read();
          if (done) throw new Error("Video asset ended before the requested range");
          const from = Math.max(0, start - offset);
          const to = Math.min(value.byteLength, end + 1 - offset);
          offset += value.byteLength;
          if (to > from) controller.enqueue(value.subarray(from, to));
          if (offset > end) {
            controller.close();
            await reader.cancel();
            return;
          }
          if (to > from) return;
        }
      } catch (error) {
        controller.error(error);
        await reader.cancel(error).catch(() => {});
      }
    },
    cancel(reason) { return reader.cancel(reason); },
  });
  // Cloudflare derives Content-Length from the stream, not a manually set header.
  if (typeof FixedLengthStream !== "undefined") {
    const fixed = new FixedLengthStream(end - start + 1);
    sliced.pipeTo(fixed.writable).catch(() => {}); // Errors also propagate to the response stream.
    return fixed.readable;
  }
  return sliced; // Standard Streams fallback for local Node tests.
}

async function fetchVideoAsset(request, env) {
  const response = await env.ASSETS.fetch(request);
  // Pages can omit Content-Length inside ASSETS even when its final wire response has it.
  // Only the two approved Homepage film encodings have a verified fallback length.
  const filmSizes = {
    "/media/mantis-standard/official-product-film.mp4": 25090788,
    "/media/web-v2/official-product-film-720.mp4": 17199781,
  };
  const lengthHeader = response.headers.get("Content-Length") ?? String(filmSizes[new URL(request.url).pathname] ?? "");
  const size = Number(lengthHeader);
  if (response.status !== 200 || !response.headers.get("Content-Type")?.startsWith("video/")
    || response.headers.has("Content-Encoding") || !/^\d+$/.test(lengthHeader || "")
    || !Number.isSafeInteger(size) || size <= 0) return response;

  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(size));
  const full = () => new Response(response.body, { status: 200, headers });
  const range = request.headers.get("Range");
  if (request.method !== "GET" || !range) return full();
  const ifRange = request.headers.get("If-Range");
  if (ifRange && (ifRange.startsWith('W/') || (ifRange !== headers.get("ETag")
    && !(Number.isFinite(Date.parse(ifRange)) && Date.parse(headers.get("Last-Modified")) <= Date.parse(ifRange))))) return full();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  // Unknown units, malformed and multipart ranges are ignored, as allowed by HTTP.
  if (!match || (!match[1] && !match[2])) return full();
  const first = Number(match[1]), last = Number(match[2]);
  if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last)) return full();
  const start = match[1] ? first : Math.max(0, size - last);
  const end = match[1] && match[2] ? Math.min(last, size - 1) : size - 1;
  if (start >= size || start > end) {
    await response.body?.cancel();
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, { status: 416, headers });
  }
  if (!response.body) return full();
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(sliceVideoStream(response.body, start, end), { status: 206, headers });
}
// END VIDEO RANGE ADAPTER
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; media-src 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const fieldRules = {
  name: { label: "姓名", required: true, maxLength: 80 },
  company: { label: "公司 / 机构", required: true, maxLength: 120 },
  role: { label: "职位名称", maxLength: 80 },
  email: { label: "电子邮箱", maxLength: 160 },
  city: { label: "所在城市", required: true, maxLength: 80 },
  phone: { label: "联系电话", required: true, maxLength: 30 },
  product: { label: "产品", required: true, maxLength: 80 },
  application: { label: "应用场景", required: true, maxLength: 80 },
  message: { label: "需求说明", maxLength: 2_000 },
  website: { label: "网站", maxLength: 200 },
};

function addSecurityHeaders(headers) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return headers;
}

function publicResponse(response, request) {
  const headers = addSecurityHeaders(new Headers(response.headers));
  const pathname = new URL(request.url).pathname;
  const contentType = headers.get("Content-Type") || "";

  if (contentType.includes("text/html")) {
    headers.set("Cache-Control", "no-cache, must-revalidate");
  } else if (/^\/assets\/index-[\w-]+\.(?:css|js)$/.test(pathname)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (contentType.startsWith("image/") || contentType.startsWith("video/")) {
    headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  }

  const body = [204, 205, 304].includes(response.status) ? null : response.body;
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  const headers = addSecurityHeaders(new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  }));
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function normalizeField(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateInquiry(input) {
  const inquiry = {};
  const errors = {};

  for (const [name, rule] of Object.entries(fieldRules)) {
    const value = normalizeField(input?.[name]);
    inquiry[name] = value;
    if (rule.required && !value) errors[name] = `请填写${rule.label}。`;
    if (value.length > rule.maxLength) errors[name] = `${rule.label}内容过长。`;
  }

  if (inquiry.email && !/^\S+@\S+\.\S+$/.test(inquiry.email)) {
    errors.email = "电子邮箱格式不正确。";
  }
  if (inquiry.phone && !/^[+()\d\s-]{6,30}$/.test(inquiry.phone)) {
    errors.phone = "联系电话格式不正确。";
  }

  return { inquiry, errors };
}

function buildInquiryText(inquiry, requestId) {
  const lines = [
    "蓝虫具身官网收到新的商务询盘",
    "",
    `询盘编号：${requestId}`,
    `提交时间：${new Date().toISOString()}`,
    "",
  ];

  for (const [name, rule] of Object.entries(fieldRules)) {
    if (name === "website") continue;
    lines.push(`${rule.label}：${inquiry[name] || "未填写"}`);
  }

  return lines.join("\n");
}

async function verifyTurnstile(input, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return true;

  const token = normalizeField(input?.turnstileToken);
  if (!token || token.length > 2_048) return false;

  const payload = new FormData();
  payload.set("secret", env.TURNSTILE_SECRET_KEY);
  payload.set("response", token);
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) payload.set("remoteip", remoteIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: payload,
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

async function handleInquiry(request, env) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return jsonResponse({ ok: false, message: "请求来源无效。" }, 403);
  }

  if (!request.headers.get("Content-Type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ ok: false, message: "请求格式无效。" }, 415);
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_LENGTH) {
    return jsonResponse({ ok: false, message: "提交内容过长。" }, 413);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_LENGTH) {
    return jsonResponse({ ok: false, message: "提交内容过长。" }, 413);
  }

  let input;
  try {
    input = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, message: "请求内容无法解析。" }, 400);
  }

  const { inquiry, errors } = validateInquiry(input);
  if (inquiry.website) {
    return jsonResponse({ ok: true, message: "询盘已发送。" });
  }
  if (Object.keys(errors).length) {
    return jsonResponse({ ok: false, message: "请检查提交内容。", errors }, 400);
  }

  if (!await verifyTurnstile(input, request, env)) {
    return jsonResponse({ ok: false, message: "安全验证未通过，请刷新页面后重试。" }, 400);
  }

  if (
    env.MAIL_PROVIDER !== "resend"
    || !env.RESEND_API_KEY
    || !env.INQUIRY_FROM_EMAIL
    || !env.INQUIRY_TO_EMAIL
  ) {
    return jsonResponse({
      ok: false,
      message: "在线咨询功能尚未开放。",
    }, 503);
  }

  const requestId = crypto.randomUUID();
  const safeCompany = inquiry.company.replace(/[\r\n]+/g, " ").slice(0, 60);
  const safeName = inquiry.name.replace(/[\r\n]+/g, " ").slice(0, 40);
  const emailPayload = {
    from: env.INQUIRY_FROM_EMAIL,
    to: [env.INQUIRY_TO_EMAIL],
    subject: `蓝虫官网商务询盘 | ${safeCompany} | ${safeName}`,
    text: buildInquiryText(inquiry, requestId),
  };
  if (inquiry.email) emailPayload.reply_to = inquiry.email;

  let emailResponse;
  try {
    emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
  } catch {
    console.error("Inquiry email request failed", requestId);
    return jsonResponse({ ok: false, message: "邮件服务暂时不可用，请稍后重试。" }, 502);
  }

  if (!emailResponse.ok) {
    console.error("Inquiry email provider rejected request", requestId, emailResponse.status);
    return jsonResponse({ ok: false, message: "邮件发送失败，请稍后重试。" }, 502);
  }

  return jsonResponse({
    ok: true,
    requestId,
    message: "询盘已发送，我们会通过你留下的联系方式回复。",
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const redirectTarget = PUBLIC_REDIRECTS.get(url.pathname);
    if (redirectTarget && ["GET", "HEAD"].includes(request.method)) {
      const target = new URL(redirectTarget, url.origin);
      return Response.redirect(target, 308);
    }

    if (url.pathname === "/api/inquiry") {
      if (request.method !== "POST") {
        return jsonResponse({ ok: false, message: "仅支持 POST 请求。" }, 405, { Allow: "POST" });
      }
      return handleInquiry(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return jsonResponse({ ok: false, message: "接口不存在。" }, 404);
    }

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    const isDocumentNavigation = acceptsHtml && ["GET", "HEAD"].includes(request.method);

    if (isDocumentNavigation && !url.pathname.split("/").pop()?.includes(".")) {
      const shellUrl = new URL(request.url);
      shellUrl.pathname = "/";
      shellUrl.search = "";
      const indexResponse = await env.ASSETS.fetch(new Request(shellUrl, request));

      if (PUBLIC_ROUTES.has(url.pathname)) return publicResponse(indexResponse, request);

      const notFoundResponse = new Response(request.method === "HEAD" ? null : indexResponse.body, {
        status: 404,
        headers: indexResponse.headers,
      });
      return publicResponse(notFoundResponse, request);
    }

    const response = /\.(?:mp4)$/i.test(url.pathname) && ["GET", "HEAD"].includes(request.method)
      ? await fetchVideoAsset(request, env)
      : await env.ASSETS.fetch(request);

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return publicResponse(response, request);
    }

    const shellUrl = new URL(request.url);
    shellUrl.pathname = "/";
    shellUrl.search = "";
    const indexResponse = await env.ASSETS.fetch(new Request(shellUrl, request));
    if (PUBLIC_ROUTES.has(url.pathname)) return publicResponse(indexResponse, request);

    const notFoundResponse = new Response(request.method === "HEAD" ? null : indexResponse.body, {
      status: 404,
      headers: indexResponse.headers,
    });
    return publicResponse(notFoundResponse, request);
  },
};
