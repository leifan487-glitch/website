import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { publicProjectRecords, potentialApplications } from "../src/data/applications.js";
import { companyIdentity, companyMission, intellectualPropertyCopy, leadership } from "../src/data/company.js";
import { publicProgressRecords, verifiedMediaCoverage } from "../src/data/news.js";
import { standardApplicationDirections } from "../src/data/standard/applications.js";
import { standardCapabilities } from "../src/data/standard/capabilities.js";
import { standardDevelopment } from "../src/data/standard/development.js";
import { standardQa } from "../src/data/standard/qa.js";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Task 014 confirmed product content is explicit and public-safe", () => {
  assert.equal(standardCapabilities.length, 6);
  assert.equal(standardApplicationDirections.length, 6);
  assert.equal(standardQa.length, 6);
  assert.ok([...standardCapabilities, ...standardApplicationDirections, ...standardDevelopment, ...standardQa]
    .every((record) => record.contentStatus === "VERIFIED" && record.publicApproved === true));
  assert.ok(standardQa.every((record) => !/0\.98|行业第一|性能全面领先|SOTA|价格|7kg|±1mm|1\.5m\/s/i.test(`${record.question}${record.answer}`)));
});

test("company public records preserve anonymous and text-only boundaries", () => {
  assert.equal(potentialApplications.length, 6);
  assert.equal(publicProjectRecords.length, 5);
  assert.ok(publicProjectRecords.every((record) => !record.customerName && !record.schoolName && !record.media));
  assert.ok(publicProjectRecords.every((record) => record.summary && record.taskScope && record.applicationDirection));
  assert.equal(companyIdentity.legalNameZh, "西安蓝虫具身智能科技有限公司");
  assert.equal(companyIdentity.legalNameEn, "Xi'an Blue Worm EAI Technology Co., Ltd.");
  assert.equal(companyMission.text, "创造一个人机共融新世界");
  assert.equal(leadership[0].portraitApproved, false);
  assert.equal(intellectualPropertyCopy.text, "围绕机器人相关技术持续开展知识产权布局");
  assert.equal(publicProgressRecords.length, 4);
  assert.equal(verifiedMediaCoverage.length, 1);
});

test("Inquiry keeps the confirmed fields and submits through the website API", async () => {
  const [inquiry, form, worker] = await Promise.all([
    source("../src/pages/InquiryPage.jsx"),
    source("../src/components/InquiryForm.jsx"),
    source("../worker/index.js"),
  ]);
  for (const token of ["姓名", "公司 / 机构", "职位名称", "电子邮箱", "所在城市", "联系电话", "Mantis Standard", "应用场景", "需求说明"]) {
    assert.match(form, new RegExp(token));
  }
  for (const direction of ["科研测试", "商业服务", "家庭服务", "仓储物流", "柔性制造", "特种行业", "其他"]) {
    assert.match(form, new RegExp(direction));
  }
  assert.match(inquiry, /aligned-inquiry/);
  assert.doesNotMatch(inquiry, /inquiry-folder/);
  assert.match(form, /fetch\("\/api\/inquiry"/);
  assert.match(form, /submitting/);
  assert.match(form, /success/);
  assert.match(form, /role=\{submitState === "error" \? "alert" : "status"\}/);
  assert.match(worker, /INQUIRY_TO_EMAIL/);
  assert.match(worker, /MAIL_PROVIDER !== "resend"/);
  assert.doesNotMatch(worker, /DEFAULT_INQUIRY_RECIPIENT/);
});

test("Home and Standard page expose confirmed copy without changing the locked hero asset", async () => {
  const [hero, intro, sections] = await Promise.all([
    source("../src/components/ProductHero.jsx"),
    source("../src/components/HomeMantisIntro.jsx"),
    source("../src/components/StandardProductSections.jsx"),
  ]);
  assert.doesNotMatch(hero, /product-hero__values/); // 018.8B explicitly removes decorative English.
  assert.match(intro, /双臂移动操作机器人/);
  assert.match(intro, /一脑多形/);
  assert.match(intro, /真模块化/);
  assert.match(sections, /aria-expanded/);
  assert.match(sections, /aria-controls/);
  assert.match(sections, /id="questions"/);
});
