let unlocked = false;

function unlock() {
  if (unlocked) return;
  // Play a silent buffer to satisfy the browser's gesture requirement
  const ctx = new AudioContext();
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
  ctx.resume().then(() => { unlocked = true; });
}

export function initSounds() {
  if (typeof window === "undefined") return;
  ["click", "touchstart", "keydown"].forEach((e) =>
    document.addEventListener(e, unlock, { once: true, capture: true }),
  );
}

export function playSound(src: string) {
  if (typeof window === "undefined") return;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}
