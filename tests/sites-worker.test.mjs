import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("serves the app shell with a 404 status for an unknown route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 404);
  assert.equal(await response.text(), "app");
  assert.deepEqual(calls, ["/index.html"]);
});

test("serves known browser routes directly even when the asset binding redirects missing paths", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/support/documents", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const pathname = new URL(request.url).pathname;
          calls.push(pathname);
          if (pathname === "/index.html") {
            return new Response("app", {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
          return Response.redirect("https://example.test/", 308);
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "app");
  assert.deepEqual(calls, ["/index.html"]);
});

test("redirects legacy public routes before asset lookup", async () => {
  let calls = 0;
  const response = await worker.fetch(new Request("https://example.test/support"), {
    ASSETS: { fetch: async () => { calls += 1; return new Response("missing", { status: 404 }); } },
  });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("Location"), "https://example.test/support/videos");
  assert.equal(calls, 0);
});

test("returns JSON for missing APIs and does not turn write requests into the app shell", async () => {
  let calls = 0;
  const env = {
    ASSETS: {
      fetch: async () => {
        calls += 1;
        return new Response("missing", { status: 404 });
      },
    },
  };

  const apiResponse = await worker.fetch(
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    env,
  );
  assert.equal(apiResponse.status, 404);
  assert.deepEqual(await apiResponse.json(), { ok: false, message: "接口不存在。" });
  assert.equal(calls, 0);

  const writeResponse = await worker.fetch(
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
    env,
  );
  assert.equal(writeResponse.status, 404);
  assert.equal(calls, 1);
});

const validInquiry = {
  name: "测试联系人",
  company: "测试机构",
  role: "项目负责人",
  email: "hello@example.com",
  city: "西安",
  phone: "15282582922",
  product: "Mantis Standard",
  application: "科研测试",
  message: "希望沟通室内任务验证。",
  website: "",
};

function inquiryRequest(body) {
  return new Request("https://example.test/api/inquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://example.test",
    },
    body: JSON.stringify(body),
  });
}

test("validates inquiry fields before contacting the email provider", async () => {
  const response = await worker.fetch(inquiryRequest({ ...validInquiry, company: "" }), {});
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.match(body.errors.company, /公司/);
});

test("reports missing email configuration instead of claiming success", async () => {
  const response = await worker.fetch(inquiryRequest(validInquiry), {});
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    message: "在线咨询功能尚未开放。",
  });
});

test("rejects unsupported inquiry methods and formats", async () => {
  const getResponse = await worker.fetch(new Request("https://example.test/api/inquiry"), {});
  assert.equal(getResponse.status, 405);
  assert.equal(getResponse.headers.get("Allow"), "POST");

  const formatResponse = await worker.fetch(new Request("https://example.test/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "not-json",
  }), {});
  assert.equal(formatResponse.status, 415);
});

test("requires a Turnstile token when the server secret is configured", async () => {
  const response = await worker.fetch(inquiryRequest(validInquiry), {
    TURNSTILE_SECRET_KEY: "test-secret",
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    message: "安全验证未通过，请刷新页面后重试。",
  });
});

test("accepts honeypot submissions without contacting the email provider", async () => {
  const originalFetch = globalThis.fetch;
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls += 1;
    return new Response(null, { status: 500 });
  };

  try {
    const response = await worker.fetch(inquiryRequest({ ...validInquiry, website: "spam.example" }), {
      RESEND_API_KEY: "test-key",
      INQUIRY_FROM_EMAIL: "Website <inquiry@example.test>",
    });
    assert.equal(response.status, 200);
    assert.equal(providerCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("sends a valid inquiry to the configured recipient", async () => {
  const originalFetch = globalThis.fetch;
  let providerRequest;
  globalThis.fetch = async (url, options) => {
    providerRequest = { url, options };
    return new Response(JSON.stringify({ id: "email-test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const response = await worker.fetch(inquiryRequest(validInquiry), {
      MAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-key",
      INQUIRY_FROM_EMAIL: "Website <inquiry@example.test>",
      INQUIRY_TO_EMAIL: "sales@example.test",
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.ok(body.requestId);
    assert.equal(providerRequest.url, "https://api.resend.com/emails");
    const payload = JSON.parse(providerRequest.options.body);
    assert.deepEqual(payload.to, ["sales@example.test"]);
    assert.equal(payload.reply_to, "hello@example.com");
    assert.match(payload.text, /测试机构/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

test("emits the files required by Cloudflare Pages advanced mode", async () => {
  await access(new URL("../dist/client/_worker.js", import.meta.url));
  await access(new URL("../dist/client/_headers", import.meta.url));
});

test("adds security headers and immutable caching to fingerprinted assets", async () => {
  const response = await worker.fetch(new Request("https://example.test/assets/index-ABC123.js"), {
    ASSETS: {
      fetch: async () => new Response("app", {
        status: 200,
        headers: { "Content-Type": "text/javascript" },
      }),
    },
  });
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("X-Frame-Options"), "DENY");
  assert.match(response.headers.get("Content-Security-Policy"), /default-src 'self'/);
});
