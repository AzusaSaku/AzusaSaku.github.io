const siteConfig = {
  owner: {
    name: "柯川",
    handle: "@AzusaSaku",
    avatar: "assets/avatar.jpg",
    avatarAlt: "柯川的头像",
    bio: "这不够高难度，我还不满足。",
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

renderDocumentTitle();
renderHeader();
renderProfileCard();
