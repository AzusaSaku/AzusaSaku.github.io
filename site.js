const siteConfig = {
  owner: {
    name: "柯川",
    handle: "@AzusaSaku",
    avatar: "assets/avatar.jpg",
    avatarAlt: "柯川的头像",
    bio: "热爱聚合又离散的鸟群",
    location: "北京",
    focus: "软件安全",
  },
  nav: [
    { label: "首页", href: "index.html" },
    { label: "归档", href: "archive.html" },
    { label: "清单", href: "lists.html" },
    { label: "友链", href: "friends.html" },
    { label: "关于我", href: "about.html" },
  ],
  stats: {
    startTime: "2026-05-15T20:38:00+08:00",
    counterEndpoint: "https://bsz.saop.cc/api",
    ownerStorageKey: "azusasaku-site-owner",
  },
  sections: {
    archive: {
      title: "归档",
      headline: "琴心剑魄今何在",
      background: "assets/cover.jpg",
      tabs: ["编程技术", "Rev & Pwn", "IoT安全", "AI相关"],
      /*
      posts: [
        {
          tab: "技术博客",
          title: "可靠性与注意力机制阅读笔记",
          date: "2026-05-15",
          updated: "2026-05-15",
          kind: "论文",
          comments: 0,
          image: "assets/cover.jpg",
          href: "posts/reliability-aware-attention.html",
          excerpt: "把近期阅读的可靠性、注意力机制和异常检测材料整理到一起，留下公式、实验设计和后续可以继续追的问题。",
        },
      ],
      */
    },
    lists: {
      title: "清单",
      headline: "琴心剑魄今何在",
      background: "assets/cover.jpg",
      tabs: ["设备", "随想"],
    },
    friends: {
      title: "友链",
      headline: "",
      background: "assets/cover.jpg",
      tabs: [],
    },
    about: {
      title: "关于我",
      headline: "",
      background: "assets/cover.jpg",
      tabs: [],
    },
  },
};

const currentPage = window.location.pathname.split("/").pop() || "index.html";

function renderDocumentTitle() {
  const pageTitle = document.title.split("|")[0].trim();
  document.title = pageTitle ? `${pageTitle} | ${siteConfig.owner.name}` : siteConfig.owner.name;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

function createAvatar(className) {
  const avatarWrap = createElement("span", className);
  const avatarImage = document.createElement("img");

  avatarImage.className = className;
  avatarImage.src = siteConfig.owner.avatar;
  avatarImage.alt = siteConfig.owner.avatarAlt;
  avatarWrap.append(avatarImage);

  return avatarWrap;
}

function renderHeader() {
  const topbar = document.querySelector("[data-site-header]");

  if (!topbar) {
    return;
  }

  const profileLink = createElement("a", "mini-profile");
  profileLink.href = "index.html";
  profileLink.setAttribute("aria-label", "回到首页");
  profileLink.append(createAvatar("mini-avatar"), createElement("span", "mini-id", siteConfig.owner.name));

  const nav = createElement("nav", "top-links");
  nav.setAttribute("aria-label", "主导航");

  siteConfig.nav.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;

    if (item.href === currentPage) {
      link.setAttribute("aria-current", "page");
    }

    nav.append(link);
  });

  topbar.replaceChildren(profileLink, nav);
}

function renderProfileCard() {
  const card = document.querySelector("[data-profile-card]");

  if (!card) {
    return;
  }

  const avatar = createElement("div", "profile-avatar");
  const avatarImage = document.createElement("img");
  avatarImage.className = "profile-avatar";
  avatarImage.src = siteConfig.owner.avatar;
  avatarImage.alt = siteConfig.owner.avatarAlt;
  avatar.append(avatarImage);

  const meta = createElement("dl", "profile-meta");
  [
    ["Location", siteConfig.owner.location],
    ["Focus", siteConfig.owner.focus],
  ].forEach(([term, description]) => {
    const row = document.createElement("div");
    row.append(createElement("dt", "", term), createElement("dd", "", description));
    meta.append(row);
  });

  card.replaceChildren(
    avatar,
    createElement("h2", "", siteConfig.owner.name),
    createElement("p", "handle", siteConfig.owner.handle),
    createElement("p", "bio", siteConfig.owner.bio),
    meta,
  );
}

function createSectionProfile() {
  const profile = createElement("section", "section-profile");
  profile.setAttribute("aria-label", "个人信息");

  const avatar = createElement("div", "section-avatar");
  const avatarImage = document.createElement("img");
  avatarImage.src = siteConfig.owner.avatar;
  avatarImage.alt = siteConfig.owner.avatarAlt;
  avatar.append(avatarImage);

  profile.append(
    avatar,
    createElement("h2", "", siteConfig.owner.name),
    createElement("p", "handle", siteConfig.owner.handle),
  );

  return profile;
}

function createPostCard(post, index) {
  const card = createElement("a", "post-card");
  card.href = post.href;

  const imageWrap = createElement("div", "post-image");
  const image = document.createElement("img");
  image.src = post.image;
  image.alt = post.title;
  imageWrap.append(image);

  const content = createElement("article", "post-content");
  content.append(
    createElement("h3", "", post.title),
    createElement(
      "p",
      "post-meta",
      `发表于 ${post.date} | 更新于 ${post.updated} | ${post.kind} | ${post.comments} 条评论`,
    ),
    createElement("p", "post-excerpt", post.excerpt),
  );

  if (index % 2 === 1) {
    card.classList.add("post-card-reverse");
  }

  card.append(imageWrap, content);

  return card;
}

function renderPosts(posts, activeTab, list) {
  const allPosts = posts || [];
  const visiblePosts = allPosts.filter((post) => post.tab === activeTab);
  const fallbackPosts = visiblePosts.length ? visiblePosts : allPosts;

  list.replaceChildren(...fallbackPosts.map((post, index) => createPostCard(post, index)));
}

function renderSectionPage() {
  const page = document.querySelector("[data-section-page]");

  if (!page) {
    return;
  }

  const config = siteConfig.sections[page.dataset.sectionPage];

  if (!config) {
    return;
  }

  const landing = createElement("section", "section-landing");
  const hero = createElement("section", "section-hero");
  hero.style.setProperty("--section-bg", `url("${config.background}")`);
  hero.setAttribute("aria-labelledby", "section-title");

  const shade = createElement("div", "section-hero-shade");
  shade.setAttribute("aria-hidden", "true");

  const heroTitle = createElement("h1", "", config.headline);
  heroTitle.id = "section-title";
  hero.append(shade, heroTitle);

  const panel = createElement("section", "section-panel");
  panel.setAttribute("aria-label", `${config.title}分类`);

  const tabs = createElement("div", "section-tabs");
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", `${config.title}类型`);

  const postsSection = createElement("section", "posts-section");
  postsSection.id = "posts";
  postsSection.setAttribute("aria-label", `${config.title}文章`);

  const postsList = createElement("div", "post-list");
  postsSection.append(postsList);

  (config.tabs || []).forEach((tabName, index) => {
    const button = createElement("button", "section-tab", tabName);
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(index === 0));

    if (index === 0) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      tabs.querySelectorAll(".section-tab").forEach((tab) => {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
      });

      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      renderPosts(config.posts, tabName, postsList);
    });

    tabs.append(button);
  });

  panel.append(createSectionProfile(), tabs);
  landing.append(hero, panel);
  page.replaceChildren(landing, postsSection);
  renderPosts(config.posts, (config.tabs || [])[0], postsList);
}

function setOwnerModeFromUrl() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("owner") === "1") {
    localStorage.setItem(siteConfig.stats.ownerStorageKey, "1");
  }

  if (params.get("owner") === "0") {
    localStorage.removeItem(siteConfig.stats.ownerStorageKey);
  }
}

function isOwnerVisit() {
  return localStorage.getItem(siteConfig.stats.ownerStorageKey) === "1";
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("zh-CN");
}

function getRuntimeText() {
  const start = new Date(siteConfig.stats.startTime);
  const now = new Date();
  const diff = Math.max(0, now - start);
  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor(diff / dayMs);
  const years = Math.floor(totalDays / 365);
  const days = totalDays % 365;
  const hours = Math.floor((diff % dayMs) / (60 * 60 * 1000));

  if (years > 0) {
    return `${years} 年 ${days} 日 ${hours} 小时`;
  }

  return `${days} 日 ${hours} 小时`;
}

function normalizeText(text) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
}

function countWords(text) {
  const cjk = text.match(/[\u4e00-\u9fff]/g) || [];
  const words = text.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+(?:[-_'][A-Za-z0-9]+)*/g) || [];

  return cjk.length + words.length;
}

function getConfiguredSiteText() {
  const sectionText = Object.values(siteConfig.sections || {})
    .flatMap((section) => [
      section.title,
      section.headline,
      ...(section.tabs || []),
      ...(section.posts || []).flatMap((post) => [
        post.title,
        post.date,
        post.updated,
        post.kind,
        post.excerpt,
      ]),
    ])
    .join(" ");

  return [
    siteConfig.owner.name,
    siteConfig.owner.handle,
    siteConfig.owner.bio,
    siteConfig.owner.location,
    siteConfig.owner.focus,
    siteConfig.nav.map((item) => item.label).join(" "),
    sectionText,
  ].join(" ");
}

async function getPageText(href) {
  const response = await fetch(href, { cache: "no-store" });

  if (!response.ok) {
    return "";
  }

  return normalizeText(await response.text());
}

async function renderWordCount(target) {
  const pages = [...new Set(siteConfig.nav.map((item) => item.href))];
  const pageText = await Promise.all(pages.map((href) => getPageText(href).catch(() => "")));
  const visibleText = document.body ? document.body.innerText : "";
  const total = countWords([getConfiguredSiteText(), visibleText, ...pageText].join(" "));

  target.textContent = formatNumber(total);
}

async function renderVisitStats(totalVisitsTarget, totalVisitorsTarget) {
  const method = isOwnerVisit() ? "GET" : "POST";
  const response = await fetch(siteConfig.stats.counterEndpoint, {
    method,
    credentials: "include",
    headers: {
      "x-bsz-referer": window.location.origin + window.location.pathname,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Counter request failed");
  }

  const data = await response.json();
  const stats = data.data || data;
  totalVisitsTarget.textContent = formatNumber(stats.site_pv);
  totalVisitorsTarget.textContent = formatNumber(stats.site_uv);
}

function createStatCard(label, valueId) {
  const card = createElement("span", "footer-stat");
  const value = createElement("strong", "");
  value.id = valueId;
  value.textContent = "--";

  card.append(createElement("span", "", `${label}: `), value);

  return card;
}

function renderSiteFooter() {
  const footer = document.querySelector("[data-site-footer]");

  if (!footer) {
    return;
  }

  const inner = createElement("div", "site-footer-inner");
  const stats = createElement("p", "footer-stats");
  stats.append(
    createStatCard("站点总字数", "site-word-count"),
    document.createTextNode(" | "),
    createStatCard("总访问量", "site-total-visits"),
    document.createTextNode(" | "),
    createStatCard("总访问人数", "site-total-visitors"),
    document.createTextNode(" | "),
    createStatCard("本站已运行", "site-runtime"),
  );

  inner.append(stats);
  footer.replaceChildren(inner);

  const wordCount = document.getElementById("site-word-count");
  const totalVisits = document.getElementById("site-total-visits");
  const totalVisitors = document.getElementById("site-total-visitors");
  const runtime = document.getElementById("site-runtime");

  const updateRuntime = () => {
    runtime.textContent = getRuntimeText();
  };

  updateRuntime();
  setInterval(updateRuntime, 60 * 1000);

  renderWordCount(wordCount).catch(() => {
    wordCount.textContent = formatNumber(countWords([getConfiguredSiteText(), document.body.innerText].join(" ")));
  });

  renderVisitStats(totalVisits, totalVisitors).catch(() => {
    totalVisits.textContent = "--";
    totalVisitors.textContent = "--";
  });
}

setOwnerModeFromUrl();
renderDocumentTitle();
renderHeader();
renderProfileCard();
renderSectionPage();
renderSiteFooter();
