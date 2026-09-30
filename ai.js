// ==== Мини-нейросеть: марковская цепь 3-го порядка (char-level) ====
const ORDER = 3; // сколько предыдущих символов учитываем
let model = null;

const $ = (id) => document.getElementById(id);

// ---- Обучение ----
function train(text) {
  const map = new Map();
  const t = text.replace(/\s+/g, " ");

  for (let i = 0; i <= t.length - ORDER; i++) {
    const key = t.slice(i, i + ORDER);
    const next = t[i + ORDER];
    if (next === undefined) continue;
    if (!map.has(key)) map.set(key, new Map());
    const inner = map.get(key);
    inner.set(next, (inner.get(next) || 0) + 1);
  }
  return map;
}

// ---- Выбор следующего символа с учётом вероятностей ----
function pick(map) {
  let total = 0;
  for (const v of map.values()) total += v;
  let r = Math.random() * total;
  for (const [ch, v] of map.entries()) {
    r -= v;
    if (r <= 0) return ch;
  }
  return [...map.keys()][0];
}

// ---- Генерация ----
function generate(seed, length) {
  if (!model) return "⚠️ Сначала обучите модель.";

  let text = seed || "";
  if (text.length < ORDER) {
    const keys = [...model.keys()];
    text = keys[Math.floor(Math.random() * keys.length)];
  }

  for (let i = 0; i < length; i++) {
    const key = text.slice(-ORDER);
    const nextMap = model.get(key);
    if (!nextMap) break;
    text += pick(nextMap);
  }
  return text;
}

// ---- UI ----
$("trainBtn").addEventListener("click", () => {
  const text = $("trainText").value.trim();
  if (text.length < ORDER + 2) {
    $("status").textContent = "Текст слишком короткий";
    return;
  }
  const t0 = performance.now();
  model = train(text);
  const dt = (performance.now() - t0).toFixed(1);
  $("status").textContent = `✅ Обучено за ${dt} мс · состояний: ${model.size}`;
});

$("genBtn").addEventListener("click", () => {
  const seed = $("seed").value;
  const len = parseInt($("length").value, 10) || 200;
  $("output").textContent = generate(seed, len);
});