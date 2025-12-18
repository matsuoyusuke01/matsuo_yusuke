// list-page.js
// products.js（window.PRODUCTS）から Janat一覧を自動生成し、検索＆タグで絞り込む
// さらに「タグ優先の固定順」で並べる

(function () {
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalize(s) {
    return String(s || "").toLowerCase();
  }

  // ★ここで優先順を定義（必要に応じて調整）
  // 例：初見向けに「まず定番」→「次にフルーツ」→「甘い」→「季節」
  const TAG_PRIORITY = ["定番", "フルーツ", "甘い", "季節"];

  function tagRank(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return 9999;
    // 複数タグがある場合、最も優先度の高いタグを採用
    let best = 9999;
    for (const t of tags) {
      const r = TAG_PRIORITY.indexOf(t);
      if (r !== -1) best = Math.min(best, r);
    }
    return best;
  }

  function init() {
    const ul = document.getElementById("janat-list");
    const qEl = document.getElementById("q");
    const tagEl = document.getElementById("tag");
    const countEl = document.getElementById("count");
    const resetBtn = document.getElementById("reset");

    if (!ul) return;

    const db = window.PRODUCTS;
    if (!db) {
      console.warn("[list-page.js] window.PRODUCTS が未定義です。products.js を先に読み込んでください。");
      return;
    }

    // Janat商品だけ抽出
    const keys = Object.keys(db).filter(k => k.startsWith("janat-"));

    // まずデータ化
    const allItemsRaw = keys.map(k => {
      const p = db[k];
      const tags = Array.isArray(p.tags) ? p.tags : [];
      return {
        key: k,
        href: `${k}.html`,
        name: p.name || k,
        desc: p.desc || "",
        tags,
        _rank: tagRank(tags)
      };
    });

    // ★並び順：タグ優先 → 商品名 → キー
    const allItems = allItemsRaw.sort((a, b) => {
      if (a._rank !== b._rank) return a._rank - b._rank;
      const byName = a.name.localeCompare(b.name, "ja");
      if (byName !== 0) return byName;
      return a.key.localeCompare(b.key, "ja");
    });

    // タグ一覧を生成（重複排除）
    if (tagEl) {
      const tagSet = new Set();
      allItems.forEach(it => it.tags.forEach(t => tagSet.add(t)));

      // プルダウンの順は TAG_PRIORITY を先に出し、残りを五十音
      const rest = Array.from(tagSet).filter(t => !TAG_PRIORITY.includes(t))
        .sort((a, b) => a.localeCompare(b, "ja"));

      const orderedTags = TAG_PRIORITY.filter(t => tagSet.has(t)).concat(rest);

      orderedTags.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        tagEl.appendChild(opt);
      });
    }

    function render(list) {
      ul.innerHTML = list.map(it => {
        // タグ表示は“最小”として非表示（必要なら後で追加）
        return `
          <li>
            <h2>${escapeHtml(it.name)}</h2>
            <p>${escapeHtml(it.desc)}</p>
            <p><a class="btn" href="${escapeHtml(it.href)}">詳細を見る</a></p>
          </li>
        `.trim();
      }).join("\n");

      if (countEl) countEl.textContent = `表示：${list.length}件`;
    }

    function applyFilter() {
      const q = normalize(qEl ? qEl.value : "");
      const tag = tagEl ? tagEl.value : "";

      const filtered = allItems.filter(it => {
        if (tag && !it.tags.includes(tag)) return false;
        if (!q) return true;

        const hay = normalize(`${it.name} ${it.desc} ${it.tags.join(" ")}`);
        return hay.includes(q);
      });

      render(filtered);
    }

    // 初期表示
    applyFilter();

    // イベント
    if (qEl) qEl.addEventListener("input", applyFilter);
    if (tagEl) tagEl.addEventListener("change", applyFilter);

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (qEl) qEl.value = "";
        if (tagEl) tagEl.value = "";
        applyFilter();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
