const SHORTCUTS: [string, string][] = [
  ["V", "Select tool"],
  ["H / Space+drag", "Pan"],
  ["S", "Sticky note"],
  ["R", "Rectangle"],
  ["U", "Rounded rectangle"],
  ["O", "Ellipse"],
  ["L", "Line"],
  ["A", "Arrow"],
  ["P", "Pen"],
  ["E", "Eraser"],
  ["Delete / Backspace", "Delete selection"],
  ["Ctrl/Cmd+D", "Duplicate selection"],
  ["Ctrl/Cmd+C / V", "Copy / paste"],
  ["Ctrl/Cmd+Z", "Undo"],
  ["Ctrl/Cmd+Shift+Z", "Redo"],
  ["Ctrl/Cmd+A", "Select all"],
  ["Ctrl/Cmd+Scroll", "Zoom"],
  ["+ / -", "Zoom in / out"],
  ["Shift+click", "Add to selection"],
  ["Escape", "Deselect / cancel"],
];

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="gb-modal-backdrop" onClick={onClose}>
      <div className="gb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gb-modal-header">
          <h2>Keyboard shortcuts</h2>
          <button className="gb-icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <dl className="gb-shortcut-list">
          {SHORTCUTS.map(([keys, desc]) => (
            <div className="gb-shortcut-row" key={keys}>
              <dt>
                {keys.split(" / ").map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </dt>
              <dd>{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
