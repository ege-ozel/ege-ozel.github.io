// Starts the metronome and lets the visualiser run. Cut the clip from about second 2.
export const url = 'https://ege-ozel.github.io/metronome/';

export default async function run(page) {
  await page.waitForTimeout(1500);
  await page.keyboard.press('Space');
  await page.waitForTimeout(10000);
  await page.keyboard.press('Space');
}
