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
  cursorEffect: {
    enabled: true,
    mascotImage: "assets/neko.png",
  },
  github: {
    owner: "AzusaSaku",
    repo: "AzusaSaku.github.io",
    branch: "main",
  },
  sections: {
    archive: {
      title: "归档",
      headline: "琴心剑魄今何在",
      background: "assets/cover_archive.png",
      tabs: ["编程技术", "Rev & Pwn", "IoT安全", "AI相关"],
      posts: [
        {
          tab: "Rev & Pwn",
          title: "XR 软件逆向分析流程记录",
          source: "posts/XR_reverse.md",
          href: "artical.html?post=posts/XR_reverse.md",
          image: "assets/cover.jpg",
          variant: "minimal",
          date: "2026-05-19",
          updated: "2026-05-19",
          style: "tech",
        },
      ],
    },
    lists: {
      title: "清单",
      headline: "琴心剑魄今何在",
      background: "assets/cover_lists.png",
      tabs: ["设备", "推荐", "随想"],
      posts: [
        {
          tab: "设备",
          title: "「神子 Miko」Sugi Stargazer",
          source: "posts/Sugi_Miko.md",
          href: "artical.html?post=posts/Sugi_Miko.md",
          image: "assets/cover.jpg",
          variant: "minimal",
          date: "2026-05-18",
          updated: "2026-05-18",
          style: "tech",
        },
        {
          tab: "随想",
          title: "我的一个朋友",
          source: "posts/My_Friends_0.md",
          href: "artical.html?post=posts/My_Friends_0.md",
          image: "assets/cover.jpg",
          variant: "minimal",
          date: "2026-05-18",
          updated: "2026-05-18",
          style: "wenkai",
        },
      ],
    },
    friends: {
      title: "友链",
      headline: "是我欲陪你流浪",
      background: "assets/cover_friends.png",
      tabs: ["友链"],
    },
    about: {
      title: "关于我",
      headline: "莲花去国一千年",
      background: "assets/cover_about.png",
      tabs: ["生涯", "时间轴"],
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

const postDateCache = new Map();

function getAllPosts() {
  return Object.values(siteConfig.sections || {}).flatMap((section) => section.posts || []);
}

function getPostBySource(source) {
  return getAllPosts().find((post) => post.source === source || encodeURI(post.source) === source);
}

function getPostClassName(source) {
  return `article-post-${source
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function formatDate(value) {
  if (!value) {
    return "待发布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatArchiveDate(value) {
  if (!value) {
    return "读取中";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLastCommitPage(linkHeader) {
  if (!linkHeader) {
    return null;
  }

  const match = linkHeader.match(/[?&]page=(\d+)>;\s*rel="last"/);

  return match ? Number(match[1]) : null;
}

async function fetchPostDates(source) {
  if (!source) {
    return { published: null, updated: null };
  }

  if (postDateCache.has(source)) {
    return postDateCache.get(source);
  }

  const repo = siteConfig.github;
  const params = new URLSearchParams({
    path: source,
    per_page: "1",
    sha: repo.branch,
  });
  const latestResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?${params}`);

  if (!latestResponse.ok) {
    throw new Error("Unable to load GitHub commit dates");
  }

  const latestCommits = await latestResponse.json();
  const latest = latestCommits[0]?.commit?.committer?.date || null;
  const lastPage = getLastCommitPage(latestResponse.headers.get("Link"));
  let oldest = latest;

  if (lastPage && lastPage > 1) {
    params.set("page", String(lastPage));
    const oldestResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?${params}`);

    if (oldestResponse.ok) {
      const oldestCommits = await oldestResponse.json();
      oldest = oldestCommits[0]?.commit?.committer?.date || latest;
    }
  }

  const dates = {
    published: oldest,
    updated: latest,
  };
  postDateCache.set(source, dates);

  return dates;
}

function hydratePostDates(post, card) {
  const published = card.querySelector("[data-post-published]");
  const updated = card.querySelector("[data-post-updated]");

  if (!published || !updated) {
    return;
  }

  fetchPostDates(post.source)
    .then((dates) => {
      published.textContent = formatDate(dates.published || post.date);
      updated.textContent = formatDate(dates.updated || post.updated || post.date);
    })
    .catch(() => {
      published.textContent = post.date || "待发布";
      updated.textContent = post.updated || "待发布";
    });
}

async function renderHomePostLinks() {
  const list = document.querySelector("[data-home-posts]");

  if (!list) {
    return;
  }

  const posts = getAllPosts();

  if (!posts.length) {
    list.remove();
    return;
  }

  list.replaceChildren(createElement("p", "home-post-loading", "文章读取中"));

  const datedPosts = await Promise.all(
    posts.map((post, index) =>
      fetchPostDates(post.source)
        .then((dates) => ({ post, index, updated: dates.updated || post.updated || post.date || null }))
        .catch(() => ({ post, index, updated: post.updated || post.date || null })),
    ),
  );

  datedPosts.sort((a, b) => {
    const bTime = b.updated ? new Date(b.updated).getTime() : -Infinity;
    const aTime = a.updated ? new Date(a.updated).getTime() : -Infinity;

    if (bTime !== aTime) {
      return bTime - aTime;
    }

    return a.index - b.index;
  });

  const rows = datedPosts.map(({ post, updated }) => {
    const link = createElement("a", "home-post-link");
    link.href = post.href;

    const date = createElement("time", "home-post-date", formatArchiveDate(updated));

    if (updated) {
      date.dateTime = new Date(updated).toISOString();
    }

    link.append(date, createElement("span", "home-post-title", post.title));

    return link;
  });

  list.replaceChildren(...rows);
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
  const meta = createElement("p", "post-meta");

  if (post.variant === "minimal") {
    meta.append(
      document.createTextNode("发表于 "),
      createElement("span", "", post.date || "读取中"),
      document.createTextNode(" | 更新于 "),
      createElement("span", "", post.updated || "读取中"),
    );
    meta.querySelectorAll("span")[0].dataset.postPublished = "";
    meta.querySelectorAll("span")[1].dataset.postUpdated = "";
    content.append(createElement("h3", "", post.title), meta);
  } else {
    meta.textContent = `发表于 ${post.date || "待发布"} | 更新于 ${post.updated || "待发布"} | ${post.kind || "文章"} | ${post.comments || 0} 条评论`;
    content.append(createElement("h3", "", post.title), meta, createElement("p", "post-excerpt", post.excerpt || ""));
  }

  if (index % 2 === 1) {
    card.classList.add("post-card-reverse");
    card.classList.add("post-card-right-image");
  } else {
    card.classList.add("post-card-left-image");
  }

  card.append(imageWrap, content);
  hydratePostDates(post, card);

  return card;
}

function renderPosts(posts, activeTab, list) {
  const allPosts = posts || [];
  const visiblePosts = allPosts.filter((post) => post.tab === activeTab);

  list.replaceChildren(...visiblePosts.map((post, index) => createPostCard(post, index)));
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
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const ownerMode = queryParams.get("owner") || hashParams.get("owner");

  if (ownerMode === "1") {
    localStorage.setItem(siteConfig.stats.ownerStorageKey, "1");
  }

  if (ownerMode === "0") {
    localStorage.removeItem(siteConfig.stats.ownerStorageKey);
  }

  if (ownerMode && window.history.replaceState) {
    window.history.replaceState(null, document.title, window.location.pathname);
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
  const postSources = getAllPosts().map((post) => post.source).filter(Boolean);
  const pages = [...new Set([...siteConfig.nav.map((item) => item.href), ...postSources])];
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

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdownFallback(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    html.push(`<p>${paragraph.join("<br>")}</p>`);
    paragraph = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      return;
    }

    if (/^\*\*\*$/.test(trimmed)) {
      flushParagraph();
      html.push("<hr>");
      return;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      html.push(`<h${heading[1].length}>${escapeHtml(heading[2])}</h${heading[1].length}>`);
      return;
    }

    paragraph.push(escapeHtml(trimmed));
  });

  flushParagraph();

  return html.join("");
}

function getMarkdownTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);

  return match ? match[1].trim() : fallback;
}

function slugifyHeading(text, index) {
  return `heading-${index}-${text
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`"'“”‘’]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]+/g, "")
    .replace(/^-|-$/g, "")}`;
}

function highlightArticleCode(body) {
  if (!window.hljs) {
    return;
  }

  body.querySelectorAll("pre code").forEach((block) => {
    window.hljs.highlightElement(block);
  });
}

function createArticleToc(body) {
  const headings = [...body.querySelectorAll("h2, h3")];

  if (!headings.length) {
    return null;
  }

  const toc = createElement("nav", "article-toc");
  toc.setAttribute("aria-label", "文章目录");

  const list = createElement("div", "article-toc-list");

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = slugifyHeading(heading.textContent || "section", index);
    }

    const link = createElement("a", `article-toc-link article-toc-${heading.tagName.toLowerCase()}`);
    link.href = `#${heading.id}`;
    link.append(createElement("span", "article-toc-text", heading.textContent || ""));
    list.append(link);
  });

  toc.append(list);

  return toc;
}

async function fetchArticleMarkdown(source) {
  const repo = siteConfig.github;
  const candidates = [
    source,
    encodeURI(source),
    `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${repo.branch}/${encodeURI(source)}`,
  ];

  for (const candidate of candidates) {
    const markdown = await fetch(candidate, { cache: "no-store" })
      .then((response) => (response.ok ? response.text() : ""))
      .catch(() => "");

    if (markdown) {
      return markdown;
    }
  }

  return "";
}

async function renderArticlePage() {
  const page = document.querySelector("[data-article-page]");

  if (!page) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const source = params.get("post");
  const post = getPostBySource(source);

  if (!source || !post) {
    page.replaceChildren(createElement("p", "article-error", "没有找到这篇文章。"));
    return;
  }

  const markdown = await fetchArticleMarkdown(source);

  if (!markdown) {
    page.replaceChildren(createElement("p", "article-error", "文章内容读取失败，请确认 md 文件已经上传到 posts 文件夹。"));
    return;
  }

  const title = getMarkdownTitle(markdown, post.title);
  const bodyMarkdown = markdown.replace(/^#\s+.+(?:\r?\n)+/, "");
  const dates = await fetchPostDates(source).catch(() => ({ published: post.date, updated: post.updated }));
  const article = createElement("article", "article-shell");
  article.classList.add(getPostClassName(source));
  if (post.style) {
    article.classList.add(`article-style-${post.style}`);
  }
  const header = createElement("header", "article-header");
  const meta = createElement(
    "p",
    "post-meta",
    `发表于 ${formatDate(dates.published || post.date)} | 更新于 ${formatDate(dates.updated || post.updated || post.date)}`,
  );
  const body = createElement("div", "article-content");

  document.title = `${title} | ${siteConfig.owner.name}`;
  header.append(createElement("h1", "", title), meta);

  if (window.marked) {
    body.innerHTML = window.marked.parse(bodyMarkdown);
  } else {
    body.innerHTML = renderMarkdownFallback(bodyMarkdown);
  }

  highlightArticleCode(body);
  const toc = createArticleToc(body);

  article.append(header, body);
  const layout = createElement("div", "article-layout");
  layout.append(article);

  if (toc) {
    layout.append(toc);
  }

  page.replaceChildren(layout);
}

function renderCursorEffect() {
  if (!siteConfig.cursorEffect?.enabled) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (reduceMotion || coarsePointer) {
    return;
  }

  const mascot = createElement("div", "cursor-mascot");
  mascot.setAttribute("aria-hidden", "true");

  if (siteConfig.cursorEffect.mascotImage) {
    const image = document.createElement("img");
    image.src = siteConfig.cursorEffect.mascotImage;
    image.alt = "";
    mascot.append(image);
  } else {
    mascot.classList.add("cursor-mascot-placeholder");
  }

  document.body.append(mascot);

  let lastSparkleTime = 0;
  let mascotX = window.innerWidth / 2;
  let mascotY = window.innerHeight / 2;
  let targetX = mascotX;
  let targetY = mascotY;

  const moveMascot = () => {
    mascotX += (targetX - mascotX) * 0.42;
    mascotY += (targetY - mascotY) * 0.42;
    mascot.style.transform = `translate3d(${mascotX}px, ${mascotY}px, 0)`;
    requestAnimationFrame(moveMascot);
  };

  moveMascot();

  document.addEventListener("mousemove", (event) => {
    targetX = event.clientX + 8;
    targetY = event.clientY + 8;

    const now = performance.now();

    if (now - lastSparkleTime < 34) {
      return;
    }

    lastSparkleTime = now;

    const sparkle = createElement("span", "cursor-sparkle");
    const offsetX = (Math.random() - 0.5) * 18;
    const offsetY = (Math.random() - 0.5) * 18;
    const size = 5 + Math.random() * 8;

    sparkle.style.left = `${event.clientX + offsetX}px`;
    sparkle.style.top = `${event.clientY + offsetY}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.animationDuration = `${560 + Math.random() * 320}ms`;
    document.body.append(sparkle);

    sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
  });
}

setOwnerModeFromUrl();
renderDocumentTitle();
renderHeader();
renderProfileCard();
renderHomePostLinks();
renderSectionPage();
renderSiteFooter();
renderArticlePage();
renderCursorEffect();
