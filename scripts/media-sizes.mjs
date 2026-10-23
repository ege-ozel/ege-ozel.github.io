// Which poster sizes to cut from a source file, chosen by its name:
//   <id>.png         desktop screenshot, 16:10
//   <id>.mobile.png  phone screenshot, 9:19.5
//   <id>.wide.png    16:9 film frame
//   <id>.tall.png    9:16 film frame
const KINDS = {
  mobile: { widths: [400, 800], ratio: 19.5 / 9 },
  wide: { widths: [800, 1600], ratio: 9 / 16 },
  tall: { widths: [400, 800], ratio: 16 / 9 },
};
const DESKTOP = { widths: [800, 1600], ratio: 10 / 16 };

export function posterPlan(file) {
  const match = /^(.+?)(?:\.(mobile|wide|tall))?\.(png|jpe?g)$/i.exec(file);
  if (!match) return null;
  const [, id, kind] = match;
  return { id, ...(kind ? KINDS[kind] : DESKTOP) };
}
