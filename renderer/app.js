const canvas = document.getElementById('treemap');
const ctx = canvas.getContext('2d');
const loadingEl = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const pathDisplay = document.getElementById('pathDisplay');
const detailsEl = document.getElementById('details');
const tooltip = document.getElementById('tooltip');

let items = [];
let hoveredItem = null;
let selectedItem = null;
let zoomStack = [];

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);
  draw();
}

function formatSize(bytes) {
  if (bytes === 0) return '0 o';
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getColor(name, size, totalSize) {
  const h = hashStr(name) % 360;
  const ratio = totalSize > 0 ? size / totalSize : 0;
  const s = 55 + ratio * 25;
  const l = 30 + (1 - ratio) * 25;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function parseHsl(str) {
  const m = str.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%/);
  if (m) return { h: +m[1], s: +m[2], l: +m[3] };
  return { h: 0, s: 0, l: 50 };
}

function getTextColor(l) {
  return l > 55 ? '#1a1a2e' : '#e0e0e0';
}

function flattenTree(node) {
  if (!node || !node.children) return [];
  return node.children.filter(c => c.size > 0).sort((a, b) => b.size - a.size);
}

function getNodeName(node) {
  return node.name || (node.path ? node.path.split('\\').pop() : '?');
}

function squarify(items, x, y, w, h) {
  if (items.length === 0 || w <= 0 || h <= 0) return [];

  const total = items.reduce((s, it) => s + it.size, 0);
  if (total === 0) return [];

  const data = items.map(it => ({ item: it, val: it.size }));
  const rects = [];

  function worst(row, side) {
    if (row.length === 0) return Infinity;
    const sum = row.reduce((s, r) => s + r.val, 0);
    let maxAsp = 0;
    for (const r of row) {
      const a = (r.val / sum) * side;
      const asp = Math.max(a, side / a);
      if (asp > maxAsp) maxAsp = asp;
    }
    return maxAsp;
  }

  function layoutRow(row, cx, cy, cw, ch) {
    const sumVal = row.reduce((s, r) => s + r.val, 0);
    const totalArea = cw * ch;
    const rowArea = (sumVal / total) * totalArea;

    if (cw >= ch) {
      const rowH = rowArea / cw;
      let xOff = 0;
      for (const r of row) {
        const itemW = (r.val / sumVal) * cw;
        rects.push({ item: r.item, x: cx + xOff, y: cy, w: itemW, h: rowH });
        xOff += itemW;
      }
      return { x: cx, y: cy + rowH, w: cw, h: ch - rowH };
    } else {
      const colW = rowArea / ch;
      let yOff = 0;
      for (const r of row) {
        const itemH = (r.val / sumVal) * ch;
        rects.push({ item: r.item, x: cx, y: cy + yOff, w: colW, h: itemH });
        yOff += itemH;
      }
      return { x: cx + colW, y: cy, w: cw - colW, h: ch };
    }
  }

  let remaining = { x, y, w, h };
  let row = [];
  let idx = 0;

  while (idx < data.length) {
    if (remaining.w <= 0 || remaining.h <= 0) break;
    const side = Math.min(remaining.w, remaining.h);
    const candidate = [...row, data[idx]];

    if (row.length === 0 || worst(candidate, side) <= worst(row, side)) {
      row = candidate;
      idx++;
    } else {
      remaining = layoutRow(row, remaining.x, remaining.y, remaining.w, remaining.h);
      row = [data[idx]];
      idx++;
    }
  }

  if (row.length > 0 && remaining.w > 0 && remaining.h > 0) {
    layoutRow(row, remaining.x, remaining.y, remaining.w, remaining.h);
  }

  return rects;
}

function drawTreemap(items, x, y, w, h) {
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  if (!items || items.length === 0) return;

  const total = items.reduce((s, it) => s + it.size, 0);
  const padding = 3;
  const rects = squarify(items, x, y, w, h);

  for (const r of rects) {
    const px = r.x + padding;
    const py = r.y + padding;
    const pw = Math.max(0, r.w - padding * 2);
    const ph = Math.max(0, r.h - padding * 2);

    if (pw < 2 || ph < 2) continue;

    const node = r.item;
    const color = getColor(node.name, node.size, total);
    const hsl = parseHsl(color);
    const isHovered = hoveredItem === node;
    const isSelected = selectedItem === node;

    ctx.fillStyle = color;
    ctx.fillRect(px, py, pw, ph);

    if (isHovered || isSelected) {
      ctx.strokeStyle = isSelected ? '#e94560' : '#ffffff';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(px, py, pw, ph);
    }

    if (pw > 60 && ph > 30) {
      const name = getNodeName(node);
      const sizeStr = formatSize(node.size);
      ctx.fillStyle = getTextColor(hsl.l);
      ctx.font = 'bold 12px -apple-system, sans-serif';
      ctx.textBaseline = 'middle';

      const nameW = ctx.measureText(name).width;
      const maxW = pw - 8;

      if (nameW < maxW && ph > 40) {
        ctx.fillText(name, px + 6, py + ph / 2 - 8);
        ctx.font = '11px -apple-system, sans-serif';
        ctx.fillStyle = getTextColor(Math.max(0, hsl.l - 10));
        ctx.fillText(sizeStr, px + 6, py + ph / 2 + 10);
      } else {
        const truncated = name.length > Math.floor(maxW / 7) ? name.slice(0, Math.floor(maxW / 7) - 1) + '\u2026' : name;
        ctx.fillText(truncated, px + 6, py + ph / 2 - 8);
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillStyle = getTextColor(Math.max(0, hsl.l - 10));
        ctx.fillText(sizeStr, px + 6, py + ph / 2 + 10);
      }
    }
    node._rect = { x: px, y: py, w: pw, h: ph };
  }
}

function draw() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, w, h);

  if (!items || items.length === 0) return;

  drawTreemap(items, 0, 0, w, h);
}

function findItemAt(mx, my) {
  for (const item of items) {
    if (item._rect) {
      const r = item._rect;
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        return item;
      }
    }
  }
  return null;
}

function updateDetails(node) {
  if (!node) {
    detailsEl.innerHTML = '<p>S\u00e9lectionnez un bloc pour voir les d\u00e9tails.</p>';
    return;
  }

  const name = getNodeName(node);
  const size = formatSize(node.size);
  const path = node.path || '?';
  const type = node.isDir ? 'Dossier' : 'Fichier';

  detailsEl.innerHTML =
    `<p><span class="detail-label">Nom :</span> ${name}</p>` +
    `<p><span class="detail-label">Taille :</span> ${size}</p>` +
    `<p><span class="detail-label">Type :</span> ${type}</p>` +
    `<p style="font-size:11px;color:#667788;word-break:break-all;margin-top:8px">${path}</p>`;
}

async function startScan(dirPath) {
  loadingEl.classList.remove('hidden');
  emptyState.classList.add('hidden');
  pathDisplay.textContent = `Analyse de : ${dirPath}`;

  try {
    const data = await window.electronAPI.scanDirectory(dirPath);
    zoomStack = [];
    selectedItem = null;
    hoveredItem = null;

    items = flattenTree(data);
    pathDisplay.textContent = dirPath;
    draw();
    updateDetails(null);
  } catch (err) {
    pathDisplay.textContent = 'Erreur lors de l\'analyse';
  } finally {
    loadingEl.classList.add('hidden');
  }
}

function zoomToItem(item) {
  if (!item || !item.children || item.children.length === 0) return;

  zoomStack.push({ items: [...items], path: pathDisplay.textContent, selected: selectedItem });

  items = item.children.filter(c => c.size > 0).sort((a, b) => b.size - a.size);
  selectedItem = null;
  hoveredItem = null;
  pathDisplay.textContent = item.path || item.name;
  draw();
  updateDetails(null);
}

function zoomOut() {
  if (zoomStack.length === 0) return;
  const prev = zoomStack.pop();
  items = prev.items;
  selectedItem = null;
  hoveredItem = null;
  pathDisplay.textContent = prev.path;
  draw();
  updateDetails(null);
}

document.getElementById('scanBtn').addEventListener('click', async () => {
  const dir = await window.electronAPI.selectDirectory();
  if (dir) startScan(dir);
});

document.getElementById('quickPaths').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li && li.dataset.path) startScan(li.dataset.path);
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const found = findItemAt(mx, my);

  if (found !== hoveredItem) {
    hoveredItem = found;
    draw();
  }

  if (found) {
    const name = getNodeName(found);
    const size = formatSize(found.size);
    tooltip.textContent = `${name} \u2014 ${size}`;
    tooltip.classList.remove('hidden');
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
  } else {
    tooltip.classList.add('hidden');
  }
});

canvas.addEventListener('mouseleave', () => {
  hoveredItem = null;
  tooltip.classList.add('hidden');
  draw();
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const found = findItemAt(mx, my);

  if (!found) return;

  if (found.isDir && found.children && found.children.length > 0) {
    zoomToItem(found);
  } else {
    selectedItem = found;
    updateDetails(found);
    draw();
  }
});

canvas.addEventListener('dblclick', () => zoomOut());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Backspace') zoomOut();
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
