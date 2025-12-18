// prices.js
(function () {
  // 商品別 価格表：必要に応じてここだけ増やす
  // キーは各詳細ページの data-product と一致させる
  const PRICE_TABLE = {
	"janat-000": { 50: 1200, 100: 2400 },
    "janat-101": { 50: 1200, 100: 2400 },
    "janat-102": { 50: 1300, 100: 2600 },
    "janat-103": { 50: 1300, 100: 2600 }
  };

  function formatYen(n) {
    return `¥${Number(n).toLocaleString()}（税込）`;
  }

  function init() {
    const productKey = document.body?.dataset?.product;
    if (!productKey) return;

    const prices = PRICE_TABLE[productKey];
    if (!prices) {
      console.warn(`[prices.js] PRICE_TABLE に未定義の商品です: ${productKey}`);
      return;
    }

    const priceEl = document.getElementById("price");
    if (!priceEl) return;

    const radios = document.querySelectorAll('input[name="size"]');
    if (!radios.length) return;

    function render(value) {
      const yen = prices[value];
      if (yen == null) {
        priceEl.textContent = "価格未設定";
        console.warn(`[prices.js] 価格未設定: ${productKey} / ${value}g`);
        return;
      }
      priceEl.textContent = formatYen(yen);
    }

    radios.forEach(r => {
      r.addEventListener("change", (e) => render(e.target.value));
    });

    const checked = document.querySelector('input[name="size"]:checked');
    if (checked) render(checked.value);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
