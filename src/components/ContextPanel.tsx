import { STICKY_COLORS } from "../model/factory";
import { useStore } from "../state/store";

const SHAPE_COLORS = ["#7DE0C7", "#A78BFA", "#F4D35E", "#F28482", "#8ECAE6", "#E8EAED"];

export function ContextPanel() {
  const selection = useStore((s) => s.selection);
  const board = useStore((s) => s.board);
  const tool = useStore((s) => s.tool);
  const toolOptions = useStore((s) => s.toolOptions);
  const setToolOptions = useStore((s) => s.setToolOptions);
  const updateObjectsCommitted = useStore((s) => s.updateObjectsCommitted);
  const deleteSelected = useStore((s) => s.deleteSelected);
  const duplicateSelected = useStore((s) => s.duplicateSelected);

  const selectedObjects = board.objects.filter((o) => selection.includes(o.id));

  if (selectedObjects.length > 0) {
    const allSticky = selectedObjects.every((o) => o.type === "sticky");
    const canStroke = selectedObjects.some((o) => o.type !== "sticky");

    return (
      <aside className="gb-context-panel">
        <div className="gb-panel-title">{selectedObjects.length > 1 ? `${selectedObjects.length} selected` : titleFor(selectedObjects[0].type)}</div>

        {allSticky && (
          <div className="gb-swatch-row">
            {STICKY_COLORS.map((c) => (
              <button
                key={c}
                className="gb-swatch"
                style={{ background: c }}
                onClick={() => {
                  const patch: Record<string, any> = {};
                  for (const o of selectedObjects) patch[o.id] = { style: { ...o.style, fill: c, stroke: c } };
                  updateObjectsCommitted(patch);
                }}
              />
            ))}
          </div>
        )}

        {canStroke && (
          <>
            <div className="gb-panel-label">Color</div>
            <div className="gb-swatch-row">
              {SHAPE_COLORS.map((c) => (
                <button
                  key={c}
                  className="gb-swatch"
                  style={{ background: c }}
                  onClick={() => {
                    const patch: Record<string, any> = {};
                    for (const o of selectedObjects) {
                      if (o.type === "sticky") continue;
                      patch[o.id] = { style: { ...o.style, stroke: c, fill: o.type === "line" || o.type === "arrow" ? "transparent" : c + "26" } };
                    }
                    updateObjectsCommitted(patch);
                  }}
                />
              ))}
            </div>
            <div className="gb-panel-label">Stroke width</div>
            <input
              type="range"
              min={1}
              max={16}
              defaultValue={selectedObjects[0].style.strokeWidth}
              onChange={(e) => {
                const patch: Record<string, any> = {};
                for (const o of selectedObjects) {
                  if (o.type === "sticky") continue;
                  patch[o.id] = { style: { ...o.style, strokeWidth: Number(e.target.value) } };
                }
                updateObjectsCommitted(patch);
              }}
            />
          </>
        )}

        <div className="gb-panel-actions">
          <button className="gb-text-btn" onClick={duplicateSelected} title="Duplicate (Ctrl+D)">
            Duplicate
          </button>
          <button className="gb-text-btn gb-text-btn--danger" onClick={deleteSelected} title="Delete (Del)">
            Delete
          </button>
        </div>
      </aside>
    );
  }

  if (tool === "sticky") {
    return (
      <aside className="gb-context-panel">
        <div className="gb-panel-title">Sticky note color</div>
        <div className="gb-swatch-row">
          {STICKY_COLORS.map((c) => (
            <button
              key={c}
              className="gb-swatch"
              style={{ background: c, outline: toolOptions.stickyColor === c ? "2px solid var(--gb-accent)" : undefined }}
              onClick={() => setToolOptions({ stickyColor: c })}
            />
          ))}
        </div>
      </aside>
    );
  }

  if (["rectangle", "roundedRectangle", "ellipse", "line", "arrow", "pen"].includes(tool)) {
    return (
      <aside className="gb-context-panel">
        <div className="gb-panel-title">Stroke width</div>
        <input
          type="range"
          min={1}
          max={16}
          value={toolOptions.strokeWidth}
          onChange={(e) => setToolOptions({ strokeWidth: Number(e.target.value) })}
        />
      </aside>
    );
  }

  return null;
}

function titleFor(type: string): string {
  switch (type) {
    case "sticky":
      return "Sticky note";
    case "rectangle":
      return "Rectangle";
    case "ellipse":
      return "Ellipse";
    case "line":
      return "Line";
    case "arrow":
      return "Arrow";
    case "pen":
      return "Drawing";
    default:
      return "Object";
  }
}
