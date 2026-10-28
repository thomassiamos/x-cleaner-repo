(() => {
  // already injected (e.g. the toolbar icon was clicked after closing): just bring the panel back
  if (window.__xCleanerShow) {
    window.__xCleanerShow();
    return;
  }

  // ---------- X's own icon shapes (24x24 grid) ----------
  const ICONS = {
    heart:
      "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z",
    bookmark:
      "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
    repost:
      "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
    trash:
      "M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.27c1.58 0 2.88-1.22 3-2.79L19.94 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.27 0 .5.22.5.5V6h-4V4.5zm7.13 14.57c-.04.52-.47.93-1 .93H7.86c-.53 0-.96-.41-1-.93L6.07 8h11.85l-.79 11.07zM9 17v-6h2v6H9zm4 0v-6h2v6h-2z",
    unfollow:
      "M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM16 8h7v2h-7z",
    close:
      "M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z",
    minimize: "M4 11h16v2H4z",
  };
  const icon = (name, size = 18) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

  // ---------- helpers ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  const myHandle = () => {
    const a = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]');
    const h = a && a.getAttribute("href");
    return h ? h.replace(/^\//, "").toLowerCase() : null;
  };
  const path = () => location.pathname.toLowerCase();
  const authorIsMe = (article) => {
    const a = article.querySelector('[data-testid="User-Name"] a[href^="/"]');
    const me = myHandle();
    return !!(a && me && a.getAttribute("href").split("/")[1].toLowerCase() === me);
  };
  const closeMenus = () => {
    const t = document.activeElement || document.body;
    t.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, bubbles: true }));
  };
  async function waitForEl(sel, timeout) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const el = document.querySelector(sel);
      if (el) return el;
      await sleep(100);
    }
    return document.querySelector(sel);
  }
  async function waitFor(fn, timeout) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (fn()) return true;
      await sleep(100);
    }
    return fn();
  }

  // ---------- what each mode does ----------
  const skipped = new WeakSet();
  const onMyProfile = () => {
    const h = myHandle();
    return !!h && new RegExp(`^/${h}(/with_replies)?/?$`).test(path());
  };

  // posts that should be kept (never deleted) in Posts mode
  const opts = { repost: true, bookmark: true, words: "" };
  try {
    Object.assign(opts, JSON.parse(localStorage.getItem("xCleanerKeep") || "{}"));
  } catch (e) {}
  const saveOpts = () => {
    try { localStorage.setItem("xCleanerKeep", JSON.stringify(opts)); } catch (e) {}
  };
  function keepReason(article) {
    if (opts.repost) {
      // reposted by you, or reposted by anyone (the repost button shows a count)
      if (article.querySelector('[data-testid="unretweet"]')) return true;
      const rt = article.querySelector('[data-testid="retweet"]');
      if (rt && /\d/.test(rt.textContent || "")) return true;
    }
    if (opts.bookmark && article.querySelector('[data-testid="removeBookmark"]')) return true;
    const words = opts.words.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
    if (words.length) {
      const t = ((article.querySelector('[data-testid="tweetText"]') || {}).textContent || "").toLowerCase();
      if (words.some((w) => t.includes(w))) return true;
    }
    return false;
  }
  const keptCount = () =>
    [...document.querySelectorAll("article")].filter((a) => authorIsMe(a) && keepReason(a)).length;

  const MODES = {
    likes: {
      label: "Likes",
      title: "Unlike tweets",
      icon: "heart",
      unit: "unliked",
      noun: "likes",
      verb: "Unliking",
      batch: 40,
      destructive: false,
      goLabel: "Open my likes",
      goPath: (h) => (h ? `/${h}/likes` : null),
      wrong: "Open your Likes page to begin.",
      found: (d) => `Found ${d} liked tweets on this page. Press start when you're ready.`,
      none: "Scroll a little so your likes load, then press start.",
      onPage: () => /\/likes\/?$/.test(path()) || MODES.likes.targets().length > 0,
      targets: () => [...document.querySelectorAll('[data-testid="unlike"]')],
      perform: async (el) => {
        const art = el.closest("article") || el.parentElement;
        el.click();
        return waitFor(
          () => !art.isConnected || !art.querySelector('[data-testid="unlike"]'),
          3000
        );
      },
    },

    bookmarks: {
      label: "Bookmarks",
      title: "Remove bookmarks",
      icon: "bookmark",
      unit: "removed",
      noun: "bookmarks",
      verb: "Removing bookmarks",
      batch: 40,
      destructive: false,
      goLabel: "Open my bookmarks",
      goPath: () => "/i/bookmarks",
      wrong: "Open your Bookmarks page to begin.",
      found: (d) => `Found ${d} bookmarks on this page. Press start when you're ready.`,
      none: "Scroll a little so your bookmarks load, then press start.",
      onPage: () => /^\/i\/bookmarks\/?$/.test(path()) || MODES.bookmarks.targets().length > 0,
      targets: () => [...document.querySelectorAll('[data-testid="removeBookmark"]')],
      perform: async (el) => {
        const art = el.closest("article") || el.parentElement;
        el.click();
        return waitFor(
          () => !art.isConnected || !art.querySelector('[data-testid="removeBookmark"]'),
          3000
        );
      },
    },

    reposts: {
      label: "Reposts",
      title: "Undo reposts",
      icon: "repost",
      unit: "removed",
      noun: "reposts",
      verb: "Removing reposts",
      batch: 40,
      destructive: false,
      goLabel: "Open my profile",
      goPath: (h) => (h ? `/${h}` : null),
      wrong: "Open your profile to begin.",
      found: (d) => `Found ${d} reposts on this page. Press start when you're ready.`,
      none: "No reposts on screen yet. Scroll a little, then press start.",
      onPage: onMyProfile,
      targets: () => [...document.querySelectorAll('[data-testid="unretweet"]')],
      perform: async (el) => {
        el.click();
        const c = await waitForEl('[data-testid="unretweetConfirm"]', 2500);
        if (!c) { closeMenus(); return false; }
        c.click();
        return waitFor(
          () => !el.isConnected || el.getAttribute("data-testid") !== "unretweet",
          3000
        );
      },
    },

    posts: {
      label: "Posts",
      title: "Delete posts",
      icon: "trash",
      unit: "deleted",
      noun: "posts",
      verb: "Deleting",
      batch: 25,
      destructive: true,
      armLabel: "Yes, delete my posts",
      warn: "This permanently deletes your own posts as they load. Press again within 8 seconds to confirm.",
      goLabel: "Open my profile",
      goPath: (h) => (h ? `/${h}` : null),
      wrong: "Open your profile to begin.",
      found: (d) => `Found ${d} of your own posts on this page. Press start when you're ready.`,
      none: "No posts of yours on screen yet. Scroll a little, then press start.",
      onPage: onMyProfile,
      // only posts written by you, and never the ones your keep-rules protect
      targets: () =>
        [...document.querySelectorAll("article")]
          .filter((a) => authorIsMe(a) && !skipped.has(a) && !keepReason(a))
          .map((a) => a.querySelector('[data-testid="caret"]'))
          .filter(Boolean),
      perform: async (caret) => {
        const art = caret.closest("article");
        caret.click();
        const item = await waitForEl('[data-testid="Dropdown"] [role="menuitem"]', 2500);
        if (!item) { closeMenus(); skipped.add(art); return false; }
        item.click(); // for your own posts, "Delete" is the first entry
        const confirm = await waitForEl('[data-testid="confirmationSheetConfirm"]', 2500);
        if (!confirm) { closeMenus(); skipped.add(art); return false; }
        confirm.click();
        const ok = await waitFor(() => !art.isConnected, 4000);
        if (!ok) skipped.add(art);
        return ok;
      },
    },

    follows: {
      label: "Follows",
      title: "Unfollow accounts",
      icon: "unfollow",
      unit: "unfollowed",
      noun: "accounts",
      verb: "Unfollowing",
      batch: 25,
      destructive: true,
      armLabel: "Yes, unfollow everyone",
      warn: "This unfollows every account in this list as it loads. Press again within 8 seconds to confirm.",
      goLabel: "Open my following list",
      goPath: (h) => (h ? `/${h}/following` : null),
      wrong: "Open your Following list to begin.",
      found: (d) => `Found ${d} accounts you follow on this page. Press start when you're ready.`,
      none: "Scroll a little so your list loads, then press start.",
      onPage: () => {
        const h = myHandle();
        return h ? new RegExp(`^/${h}/following/?$`).test(path()) : /\/following\/?$/.test(path());
      },
      targets: () => [
        ...document.querySelectorAll(
          '[data-testid="primaryColumn"] [data-testid="UserCell"] [data-testid$="-unfollow"]'
        ),
      ],
      perform: async (el) => {
        el.click();
        const c = await waitForEl('[data-testid="confirmationSheetConfirm"]', 2500);
        if (!c) { closeMenus(); return false; }
        c.click();
        return waitFor(
          () => !el.isConnected || !(el.getAttribute("data-testid") || "").endsWith("-unfollow"),
          3500
        );
      },
    },
  };
  const ORDER = ["likes", "bookmarks", "reposts", "posts", "follows"];
  const SPEEDS = { slow: [1800, 3000], normal: [900, 1800], fast: [500, 900] };

  // ---------- state ----------
  const S = {
    mode: "likes",
    running: false,
    state: "idle", // idle | running | stopped | done
    count: 0,
    elapsedMs: 0,
    lastTick: 0,
    speed: "normal",
    msg: "",
    kind: "",
    armed: false,
  };
  const store = {};
  const cfg = () => MODES[S.mode];
  const found = () => cfg().targets().length;

  async function wait(ms) {
    const end = Date.now() + ms;
    while (S.running && Date.now() < end) await sleep(150);
  }
  function setStatus(msg, kind) {
    S.msg = msg;
    S.kind = kind || "";
  }

  // ---------- interface ----------
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;top:84px;right:20px;z-index:2147483647";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
  <style>
    :host{
      all:initial;
      --blue:#1D9BF0;--red:#F4212E;--yellow:#FFD400;--green:#00BA7C;
      --bg:#FFFFFF;--surface:#F7F9F9;--track:#EFF3F4;--text:#0F1419;--muted:#536471;--line:#EFF3F4;
      --btn:#0F1419;--btn-text:#FFFFFF;--btn-hover:#272C30;--seg:#EFF3F4;--seg-on:#FFFFFF;
      --shadow:0 0 15px rgba(101,119,134,.25),0 0 3px 1px rgba(101,119,134,.2);
      --font:TwitterChirp,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    }
    :host([data-theme="dim"]){
      --bg:#15202B;--surface:#1E2732;--track:#38444D;--text:#F7F9F9;--muted:#8B98A5;--line:#38444D;
      --btn:#F7F9F9;--btn-text:#0F1419;--btn-hover:#D7DBDC;--seg:#273340;--seg-on:#38444D;
      --shadow:0 0 15px rgba(255,255,255,.2),0 0 3px 1px rgba(255,255,255,.15);
    }
    :host([data-theme="dark"]){
      --bg:#000000;--surface:#080808;--track:#2F3336;--text:#E7E9EA;--muted:#71767B;--line:#2F3336;
      --btn:#EFF3F4;--btn-text:#0F1419;--btn-hover:#D7DBDC;--seg:#16181C;--seg-on:#2F3336;
      --shadow:0 0 15px rgba(255,255,255,.2),0 0 3px 1px rgba(255,255,255,.15);
    }
    *{box-sizing:border-box;margin:0;padding:0}
    button,input{font:inherit;color:inherit}
    button:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
    svg{display:block}
    .panel{
      width:288px;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:16px;
      box-shadow:var(--shadow);font:400 13px/1.4 var(--font);
    }
    .top{display:flex;justify-content:space-between;align-items:center;padding:10px 8px 0 16px;cursor:grab;user-select:none}
    .top:active{cursor:grabbing}
    .name{display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px}
    .hbtns{display:flex;gap:2px}
    .ib{border:0;background:none;width:32px;height:32px;border-radius:9999px;cursor:pointer;color:var(--muted);
      display:flex;align-items:center;justify-content:center}
    .ib:hover{background:var(--surface);color:var(--text)}
    .ib.x:hover{background:color-mix(in srgb,var(--red) 14%,transparent);color:var(--red)}
    .seg{display:flex;background:var(--seg);border-radius:10px;padding:2px}
    .seg button{border:0;background:none;padding:3px 9px;border-radius:8px;font-size:12px;font-weight:500;color:var(--muted);cursor:pointer}
    .seg button[aria-pressed="true"]{background:var(--seg-on);color:var(--text);font-weight:700;
      box-shadow:0 0 0 1px var(--line),0 1px 2px rgba(0,0,0,.12)}
    .seg button:disabled{cursor:not-allowed;opacity:.5}
    .modes{margin:10px 16px 0}
    .modes button{flex:1;height:32px;padding:0;display:flex;align-items:center;justify-content:center}
    .hero{display:flex;align-items:baseline;gap:10px;padding:12px 16px 0}
    .num{font:800 56px/1 var(--font);letter-spacing:-.02em;font-variant-numeric:tabular-nums}
    .num.bump{animation:bump .22s ease-out}
    @keyframes bump{from{transform:translateY(7px);opacity:.35}to{transform:none;opacity:1}}
    .unit{color:var(--muted);font-size:15px}

    /* the whole track takes the state colour, the fill shows progress */
    .bar{margin:14px 16px 6px;height:8px;border-radius:9999px;background:var(--track);overflow:hidden;
      transition:background-color .35s ease}
    .fill{height:100%;width:0;background:var(--blue);border-radius:9999px;transition:width .4s ease,background-color .35s ease}
    .bar.running{background:color-mix(in srgb,var(--blue) 28%,var(--track));animation:barpulse 1.2s ease-in-out infinite}
    .bar.stopped{background:color-mix(in srgb,var(--red) 28%,var(--track))}
    .bar.stopped .fill{background:var(--red)}
    .bar.paused{background:color-mix(in srgb,var(--yellow) 30%,var(--track));animation:barblink 1.6s ease-in-out infinite}
    .bar.paused .fill{background:var(--yellow)}
    .bar.done{background:color-mix(in srgb,var(--green) 28%,var(--track))}
    .bar.done .fill{background:var(--green)}
    @keyframes barpulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes barblink{0%,100%{opacity:1}50%{opacity:.22}}

    .cap{margin:0 16px;color:var(--muted);font-size:13px}
    dl{margin:14px 16px 0;border-top:1px solid var(--line)}
    .r{display:flex;justify-content:space-between;align-items:center;min-height:36px;border-bottom:1px solid var(--line)}
    dt{color:var(--muted)}
    dd{font-weight:700;font-variant-numeric:tabular-nums}

    .opts{margin:14px 16px 0;display:none}
    .opts h4{font-size:15px;font-weight:700;margin-bottom:6px}
    .chk{display:flex;align-items:center;gap:10px;padding:5px 0;cursor:pointer}
    .chk input{accent-color:var(--blue);width:16px;height:16px;flex:none}
    .kw{width:100%;margin-top:6px;height:36px;border-radius:8px;border:1px solid var(--line);background:transparent;
      padding:0 10px;color:var(--text)}
    .kw::placeholder{color:var(--muted)}
    .kw:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 1px var(--blue)}

    .ctl{padding:14px 16px 0}
    .go{width:100%;height:36px;border:0;border-radius:9999px;background:var(--btn);color:var(--btn-text);
      font-weight:700;font-size:15px;cursor:pointer}
    .go:hover{background:var(--btn-hover)}
    .go.stop{background:transparent;color:var(--text);box-shadow:inset 0 0 0 1px var(--muted)}
    .go.stop:hover{background:var(--surface)}
    .go.danger{background:var(--red);color:#fff}
    .go.danger:hover{background:#DC1F2B}
    .status{display:flex;gap:9px;align-items:flex-start;padding:12px 16px 15px;color:var(--muted);font-size:13px;min-height:48px}
    .dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex:none;background:var(--muted)}
    .dot.run{background:var(--blue);animation:pulse 1.4s ease-in-out infinite}
    .dot.wait{background:var(--yellow);animation:pulse 1.6s ease-in-out infinite}
    .dot.stop{background:var(--red)}
    .dot.done{background:var(--green)}
    @keyframes pulse{50%{opacity:.3}}

    /* minimized: draggable, expands on click, has its own close button */
    .pill{
      display:none;align-items:center;background:var(--bg);color:var(--text);border:1px solid var(--line);
      border-radius:9999px;box-shadow:var(--shadow);cursor:grab;user-select:none;overflow:hidden;font:400 13px/1.4 var(--font)
    }
    .pill:active{cursor:grabbing}
    .pexp{display:flex;align-items:center;gap:9px;border:0;background:none;padding:6px 6px 6px 14px;cursor:inherit}
    .pexp b{font:800 22px/1 var(--font);font-variant-numeric:tabular-nums}
    .pexp span{color:var(--muted);font-size:13px}
    .pclose{margin:0 6px 0 2px}
    @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
  </style>

  <section class="panel" id="panel" aria-label="X cleaner">
    <div class="top" id="drag">
      <div class="name"><span id="hicon"></span><span id="name">Unlike tweets</span></div>
      <div class="hbtns">
        <button class="ib" id="min" aria-label="Minimize">${icon("minimize", 18)}</button>
        <button class="ib x" id="close" aria-label="Close">${icon("close", 18)}</button>
      </div>
    </div>

    <div class="seg modes" id="modes" role="group" aria-label="What to clean up">
      ${ORDER.map(
        (m) =>
          `<button data-m="${m}" title="${MODES[m].title}" aria-label="${MODES[m].title}" aria-pressed="${m === "likes"}">${icon(
            MODES[m].icon,
            18
          )}</button>`
      ).join("")}
    </div>

    <div class="hero">
      <div class="num" id="num">0</div>
      <div class="unit" id="unit">unliked</div>
    </div>
    <div class="bar" id="bar"><div class="fill" id="fill"></div></div>
    <div class="cap" id="cap">Nothing loaded yet</div>

    <dl>
      <div class="r"><dt>Left on this page</dt><dd id="left">0</dd></div>
      <div class="r" id="keptRow" style="display:none"><dt>Kept on this page</dt><dd id="kept">0</dd></div>
      <div class="r"><dt>Elapsed</dt><dd id="time">00:00</dd></div>
      <div class="r"><dt>Pace</dt><dd id="pace">&ndash;</dd></div>
      <div class="r"><dt>Speed</dt>
        <dd><div class="seg" id="seg">
          <button data-s="slow" aria-pressed="false">Careful</button>
          <button data-s="normal" aria-pressed="true">Steady</button>
          <button data-s="fast" aria-pressed="false">Quick</button>
        </div></dd>
      </div>
    </dl>

    <div class="opts" id="opts">
      <h4>Keep these posts</h4>
      <label class="chk"><input type="checkbox" id="kRepost"> Posts that were reposted</label>
      <label class="chk"><input type="checkbox" id="kBook"> Posts I bookmarked</label>
      <input class="kw" id="kWords" type="text" placeholder="Posts containing: word, another word" autocomplete="off" spellcheck="false">
    </div>

    <div class="ctl"><button class="go" id="go">Start</button></div>
    <div class="status" role="status" aria-live="polite"><span class="dot" id="dot"></span><span id="msg"></span></div>
  </section>

  <div class="pill" id="pill">
    <button class="pexp" id="pexp" aria-label="Expand X cleaner">
      <span id="picon" style="color:inherit;display:flex"></span>
      <b id="pnum">0</b><span id="punit">unliked</span>
    </button>
    <button class="ib x pclose" id="pclose" aria-label="Close">${icon("close", 18)}</button>
  </div>`;
  document.documentElement.appendChild(host);
  const $ = (id) => root.getElementById(id);

  // keep-rules inputs
  $("kRepost").checked = !!opts.repost;
  $("kBook").checked = !!opts.bookmark;
  $("kWords").value = opts.words || "";
  $("kRepost").onchange = (e) => { opts.repost = e.target.checked; saveOpts(); };
  $("kBook").onchange = (e) => { opts.bookmark = e.target.checked; saveOpts(); };
  $("kWords").oninput = (e) => { opts.words = e.target.value; saveOpts(); };

  // follow X's own theme (Light, Dim or Lights out)
  function applyTheme() {
    const m = (getComputedStyle(document.body).backgroundColor || "").match(/\d+/g) || [];
    const sum = m.slice(0, 3).reduce((a, b) => a + Number(b), 0);
    const t = sum > 600 ? "light" : sum < 30 ? "dark" : "dim";
    if (host.getAttribute("data-theme") !== t) host.setAttribute("data-theme", t);
  }
  applyTheme();

  // ---------- dragging (works on the panel header and the minimized pill) ----------
  let drag = null;
  let dragMoved = false;
  function startDrag(e) {
    if (e.target.closest(".ib")) return;
    const r = host.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY };
    dragMoved = false;
  }
  $("drag").addEventListener("mousedown", startDrag);
  $("pill").addEventListener("mousedown", startDrag);
  addEventListener("mousemove", (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x0) + Math.abs(e.clientY - drag.y0) > 4) dragMoved = true;
    if (!dragMoved) return;
    host.style.left = Math.min(Math.max(0, e.clientX - drag.dx), innerWidth - host.offsetWidth) + "px";
    host.style.top = Math.min(Math.max(0, e.clientY - drag.dy), innerHeight - host.offsetHeight) + "px";
    host.style.right = "auto";
  });
  addEventListener("mouseup", () => (drag = null));

  function keepOnScreen() {
    const r = host.getBoundingClientRect();
    if (r.right > innerWidth || r.bottom > innerHeight || r.left < 0 || r.top < 0) {
      host.style.left = Math.max(0, Math.min(r.left, innerWidth - r.width)) + "px";
      host.style.top = Math.max(0, Math.min(r.top, innerHeight - r.height)) + "px";
      host.style.right = "auto";
    }
  }
  const setMin = (v) => {
    $("panel").style.display = v ? "none" : "block";
    $("pill").style.display = v ? "flex" : "none";
    keepOnScreen();
  };
  $("min").onclick = () => setMin(true);
  $("pexp").onclick = () => {
    if (dragMoved) return; // it was a drag, not a click
    setMin(false);
  };

  // close: stop any work, free resources, hide the panel (toolbar icon brings it back)
  function closeAll() {
    if (S.running) stop("stopped");
    releaseKeepAlive();
    clearInterval(renderTimer);
    clearTimeout(armTimer);
    S.armed = false;
    host.style.display = "none";
  }
  window.__xCleanerShow = () => {
    host.style.display = "";
    setMin(false);
    clearInterval(renderTimer);
    renderTimer = setInterval(render, 300);
    render();
  };
  try {
    chrome.runtime.onMessage.addListener((m) => {
      if (m && m.type === "x-cleaner-open") window.__xCleanerShow();
    });
  } catch (e) {}
  $("close").onclick = closeAll;
  $("pclose").onclick = closeAll;

  $("seg").onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    S.speed = b.dataset.s;
    root.querySelectorAll("#seg button").forEach((x) =>
      x.setAttribute("aria-pressed", String(x === b))
    );
  };

  // switching what to clean keeps each mode's own numbers
  function switchMode(m) {
    if (S.running || m === S.mode) return;
    disarm();
    store[S.mode] = { count: S.count, elapsedMs: S.elapsedMs, state: S.state, msg: S.msg, kind: S.kind };
    S.mode = m;
    const s = store[m] || { count: 0, elapsedMs: 0, state: "idle", msg: "", kind: "" };
    S.count = s.count;
    S.elapsedMs = s.elapsedMs;
    S.state = s.state;
    S.msg = s.msg;
    S.kind = s.kind;
    root.querySelectorAll("#modes button").forEach((x) =>
      x.setAttribute("aria-pressed", String(x.dataset.m === m))
    );
  }
  $("modes").onclick = (e) => {
    const b = e.target.closest("button");
    if (b) switchMode(b.dataset.m);
  };

  // destructive modes need a second press
  let armTimer = null;
  function arm() {
    S.armed = true;
    clearTimeout(armTimer);
    armTimer = setTimeout(disarm, 8000);
  }
  function disarm() {
    if (!S.armed) return;
    S.armed = false;
    clearTimeout(armTimer);
    if (S.state === "stopped") setStatus(`Stopped. ${S.count} ${cfg().unit} so far.`, "stop");
    else if (S.state === "done") setStatus(`All done. ${S.count} ${cfg().unit} in ${fmt(S.elapsedMs)}.`, "done");
  }

  $("go").onclick = () => {
    const c = cfg();
    if (S.running) return stop("stopped");
    if (!c.onPage()) {
      const p = c.goPath(myHandle());
      if (p) location.href = p;
      else setStatus("Click Profile in the left menu, then come back to this panel.", "wait");
      return;
    }
    if (c.destructive && !S.armed) return arm();
    disarm();
    start();
  };

  // ---------- keep working in a background tab ----------
  let audioCtx = null, releaseLock = null;
  function keepAlive() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = 30;
      gain.gain.value = 0.001;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
    } catch (e) {}
    try {
      navigator.locks.request("x-cleaner", () => new Promise((res) => (releaseLock = res)));
    } catch (e) {}
  }
  function releaseKeepAlive() {
    try { audioCtx && audioCtx.close(); } catch (e) {}
    audioCtx = null;
    if (releaseLock) releaseLock();
    releaseLock = null;
  }

  // ---------- render ----------
  let shownCount = -1, shownMode = "";
  function render() {
    if (S.running) {
      const now = Date.now();
      S.elapsedMs += now - S.lastTick;
      S.lastTick = now;
    }
    const c = cfg();
    const d = found();
    const total = S.count + d;
    const pct = total ? Math.round((S.count / total) * 100) : 0;
    const mins = S.elapsedMs / 60000;
    const ok = c.onPage();

    if (S.mode !== shownMode) {
      $("hicon").innerHTML = icon(c.icon, 18);
      $("picon").innerHTML = icon(c.icon, 18);
    }
    if (S.count !== shownCount || S.mode !== shownMode) {
      $("num").textContent = S.count;
      $("pnum").textContent = S.count;
      if (shownCount !== -1 && S.mode === shownMode) {
        const n = $("num");
        n.classList.remove("bump");
        void n.offsetWidth;
        n.classList.add("bump");
      }
      shownCount = S.count;
      shownMode = S.mode;
    }
    applyTheme();
    const isPosts = S.mode === "posts";
    $("opts").style.display = isPosts ? "block" : "none";
    $("keptRow").style.display = isPosts ? "flex" : "none";
    if (isPosts) $("kept").textContent = keptCount();
    $("name").textContent = c.title;
    $("unit").textContent = c.unit;
    $("punit").textContent = c.unit;
    $("fill").style.width = pct + "%";
    $("cap").textContent = total
      ? `${S.count} of ${total} loaded ${c.noun} done`
      : "Nothing loaded yet";
    $("left").textContent = d;
    $("time").textContent = fmt(S.elapsedMs);
    $("pace").textContent = mins > 0.05 ? `${(S.count / mins).toFixed(1)} a minute` : "\u2013";

    root.querySelectorAll("#modes button").forEach((b) => (b.disabled = S.running));

    // bar: pulsing while working, still red when stopped, softly blinking yellow when paused
    let bar = "";
    if (S.running) bar = S.kind === "wait" ? "paused" : "running";
    else if (S.state === "stopped") bar = "stopped";
    else if (S.state === "done") bar = "done";
    $("bar").className = "bar " + bar;

    const go = $("go");
    go.className = "go" + (S.running ? " stop" : S.armed ? " danger" : "");
    go.textContent = S.running
      ? "Stop"
      : !ok
      ? c.goLabel
      : S.armed
      ? c.armLabel
      : S.state === "stopped" && d
      ? "Resume"
      : "Start";

    if (S.armed && !S.running) setStatus(c.warn, "wait");
    else if (S.state === "idle") {
      if (!ok) setStatus(c.wrong, "");
      else if (d) setStatus(c.found(d), "");
      else setStatus(c.none, "");
    }
    $("msg").textContent =
      S.msg + (S.running && document.hidden ? " This tab is in the background and keeps going." : "");
    $("dot").className = "dot " + S.kind;

    if (!ok && S.running) stop("stopped");
    if (!ok && S.armed) disarm();
  }
  let renderTimer = setInterval(render, 300);

  function stop(how) {
    S.running = false;
    releaseKeepAlive();
    if (how === "done") {
      S.state = "done";
      setStatus(`All done. ${S.count} ${cfg().unit} in ${fmt(S.elapsedMs)}.`, "done");
    } else {
      S.state = "stopped";
      setStatus(`Stopped. ${S.count} ${cfg().unit} so far.`, "stop");
    }
  }

  // ---------- main loop ----------
  async function start() {
    const c = cfg();
    S.running = true;
    S.state = "running";
    keepAlive();
    S.lastTick = Date.now();
    setStatus(`${c.verb}\u2026`, "run");
    let idle = 0, fails = 0;

    while (S.running) {
      const target = c.targets()[0];
      if (target) {
        idle = 0;
        setStatus(`${c.verb}\u2026`, "run");
        target.scrollIntoView({ block: "center" });
        await wait(rand(250, 500));
        if (!S.running) break;
        const ok = await c.perform(target);
        if (ok) {
          S.count++;
          fails = 0;
        } else {
          fails++;
          if (fails >= 3) {
            for (let i = 60; i > 0 && S.running; i--) {
              setStatus(`X isn't accepting actions right now. Trying again in ${i}s.`, "wait");
              await wait(1000);
            }
            fails = 0;
            continue;
          }
        }
        if (ok && S.count % c.batch === 0) {
          setStatus("Taking a short break so X doesn't block you.", "wait");
          await wait(rand(8000, 12000));
        } else {
          const [a, b] = SPEEDS[S.speed];
          await wait(rand(a, b));
        }
      } else {
        setStatus("Loading more\u2026", "run");
        window.scrollBy(0, window.innerHeight * 0.8);
        await wait(rand(1500, 2500));
        if (idle >= 2) window.scrollTo(0, document.documentElement.scrollHeight);
        idle++;
        if (idle >= 6) return stop("done");
      }
    }
  }
})();
