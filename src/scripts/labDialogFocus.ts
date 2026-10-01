// Native dialogs make the background inert. Explicit wrapping keeps Tab within
// the desktop dialog instead of sending focus to browser chrome at a boundary.
export function initLabDialogFocus() {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
    if (!dialog) return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]',
    )).filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    const active = document.activeElement;
    if (!first || !last) {
      event.preventDefault();
      dialog.focus();
    } else if (!controls.includes(active as HTMLElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
