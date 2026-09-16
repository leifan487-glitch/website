// Owner authorized only this appended pointer hit-testing fix. Historical hashes stay intact.
export const controlFix = '\n/* Task0191: let the empty caption layer pass clicks to the video controls. */\n.applications-aligned .applications-hero__content { pointer-events: none; }\n.applications-aligned .applications-hero__content > * { pointer-events: auto; }\n';
export function beforeControlFix(file, bytes) {
  if (file !== 'src/editorial.css') return bytes;
  const text = bytes.toString();
  if (!text.endsWith(controlFix)) throw new Error('Unexpected Task0191 control fix');
  return Buffer.from(text.slice(0, -controlFix.length));
}
