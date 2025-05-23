const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let startX = 0, startY = 0;
let tool = 'brush';
let color = '#00f0ff';
let brushSize = 4;
let imageDataBackup = null;

// UI controls
const toolbar = document.querySelector('.toolbar');
const colorPicker = document.getElementById('color-picker');
const brushSizeInput = document.getElementById('brush-size');
const clearBtn = document.getElementById('clear-btn');
const downloadBtn = document.getElementById('download-btn');

toolbar.addEventListener('click', e => {
  if (e.target.closest('button[data-tool]')) {
    tool = e.target.closest('button[data-tool]').dataset.tool;
    document.querySelectorAll('button[data-tool]').forEach(btn => btn.classList.remove('active'));
    e.target.closest('button[data-tool]').classList.add('active');
  }
});
colorPicker.addEventListener('input', e => color = e.target.value);
brushSizeInput.addEventListener('input', e => brushSize = +e.target.value);
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#181824';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});
downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'bbf-paint.png';
  a.click();
});

// Ensure blank bg on clear
ctx.fillStyle = '#181824';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Drawing events
canvas.addEventListener('mousedown', e => onPointerDown(e.offsetX, e.offsetY));
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  onPointerDown(t.clientX - rect.left, t.clientY - rect.top);
}, { passive: false });

function onPointerDown(x, y) {
  drawing = true;
  startX = x; startY = y;
  if (tool === 'brush' || tool === 'eraser') drawDot(x, y);
  if (tool === 'fill') floodFill(x, y, color);
  if (tool === 'brush' || tool === 'eraser') imageDataBackup = ctx.getImageData(0,0,canvas.width,canvas.height);
  else imageDataBackup = ctx.getImageData(0,0,canvas.width,canvas.height);
}

canvas.addEventListener('mousemove', e => onPointerMove(e.offsetX, e.offsetY));
canvas.addEventListener('touchmove', e => {
  if (!drawing) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  onPointerMove(t.clientX - rect.left, t.clientY - rect.top);
}, { passive: false });

function onPointerMove(x, y) {
  if (!drawing) return;
  if (tool === 'brush' || tool === 'eraser') {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = (tool === 'eraser') ? '#181824' : color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    startX = x; startY = y;
  } else {
    // For shapes: show preview
    ctx.putImageData(imageDataBackup, 0, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    if (tool === 'rect') {
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    }
    if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startX,2) + Math.pow(y - startY,2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}

canvas.addEventListener('mouseup', e => onPointerUp(e.offsetX, e.offsetY));
canvas.addEventListener('mouseleave', () => drawing = false);
canvas.addEventListener('touchend', () => drawing = false);

function onPointerUp(x, y) {
  if (!drawing) return;
  drawing = false;
  if (tool === 'line') {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  if (tool === 'rect') {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
  if (tool === 'circle') {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    const radius = Math.sqrt(Math.pow(x - startX,2) + Math.pow(y - startY,2));
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function drawDot(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, brushSize/2, 0, 2*Math.PI);
  ctx.fillStyle = (tool === 'eraser') ? '#181824' : color;
  ctx.fill();
}

// Flood fill (bucket tool)
function floodFill(x, y, fillColor) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const width = canvas.width;
  const height = canvas.height;

  const target = getPixel(data, x, y, width);
  const fill = hexToRgba(fillColor);

  if (sameColor(target, fill)) return;

  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    let idx = (cy * width + cx) * 4;
    let cur = getPixel(data, cx, cy, width);

    if (!sameColor(cur, target)) continue;

    setPixel(data, cx, cy, fill);
    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < width - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < height - 1) stack.push([cx, cy + 1]);
  }
  ctx.putImageData(imgData, 0, 0);
}
function getPixel(data, x, y, w) {
  let idx = (y * w + x) * 4;
  return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
}
function setPixel(data, x, y, rgba) {
  let idx = (y * canvas.width + x) * 4;
  [data[idx], data[idx+1], data[idx+2], data[idx+3]] = rgba;
}
function sameColor(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
function hexToRgba(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(h=>h+h).join('');
  let n = parseInt(hex,16);
  return [n>>16&255, n>>8&255, n&255, 255];
}

// Mobile: prevent scrolling on touch
document.body.addEventListener('touchmove', function(e) {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });

// Tool default
document.querySelector('button[data-tool="brush"]').classList.add('active');
