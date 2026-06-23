export function playSound(src: string) {
  if (typeof window === "undefined") return;
  const audio = new Audio(src);
  audio.play().catch(() => {});
}
