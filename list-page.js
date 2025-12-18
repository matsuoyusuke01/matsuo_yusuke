// list-page.js
// Janat一覧を products.js から自動生成
// ・タグ優先の固定順で並び替え
// ・タグは表示のみ（操作なし）

(function () {
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // 並び順の優先度（上ほど先頭）
  const TAG_PRIORITY = ["定番", "フルーツ", "甘い", "季節"];

  function tagRank(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return 9999;
    let best = 9999;
    for (const t of tags) {
      const r = TAG_PRIORITY.indexOf(t);
      if (r !== -1) best = Math.min(best, r);
    }
    return best;
  }

  function init() {
    const ul = document.getElementById("janat-list");
    if (!ul) return;

    const db = window.PRODUCTS;
    if (!db) {
      console.warn("[list-page.js] window.PRODUCTS が未定義です。");
      return;
    }

    const items = Object.keys(db)
      .filter(k => k.startsWith("janat-"))
      .map(k => {
        const p = db[k];
        const tags = Array.isArray(p.tags) ? p.tags : [];
        return {
          href: `${k}.html`,
          name: p.name || k,
          desc: p.desc || "",
          tags,
          _rank: tagRank(tags)
        };
      })
      // 並び順：タグ優先 → 商品名
      .sort((a, b) => {
        if (a._rank !== b._rank) return a._rank - b._rank;
        return a.name.localeCompare(b.name, "ja");
      });

    ul.innerHTML = items.map(it => {
      const tagsHtml = it.tags.length
        ? `<p style="margin:0 0 6px;font-size:0.9rem;">
             ${it.tags.map(t =>
               `<span style="display:inline-block;border:1px solid #ddd;padding:2px 6px;margin-right:6px;background:#fff;">${escapeHtml(t)}</span>`
             ).join("")}
           </p>`
        : "";

      return `
        <li>
          <h2>${escapeHtml(it.name)}</h2>
          ${tagsHtml}
          <p>${escapeHtml(it.desc)}</p>
          <p><a class="btn" href="${escapeHtml(it.href)}">詳細を見る</a></p>
        </li>
      `.trim();
    }).join("\n");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();