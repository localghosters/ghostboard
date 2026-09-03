import { useRef, useEffect } from "react";
import type { StickyNoteObject } from "../../model/types";
import { useStore } from "../../state/store";

export function StickyNote({ object }: { object: StickyNoteObject }) {
  const editingTextId = useStore((s) => s.editingTextId);
  const updateObjectsCommitted = useStore((s) => s.updateObjectsCommitted);
  const isEditing = editingTextId === object.id;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  return (
    <g data-object-id={object.id} data-object-type="sticky">
      <rect
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        rx={6}
        fill={object.style.fill}
        opacity={object.style.opacity}
        style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))" }}
      />
      <foreignObject x={object.x} y={object.y} width={object.width} height={object.height}>
        <div
          ref={ref}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onPointerDown={(e) => {
            if (isEditing) e.stopPropagation();
          }}
          onBlur={(e) => {
            const text = e.currentTarget.innerText;
            if (text !== object.text) {
              updateObjectsCommitted({ [object.id]: { text } });
            }
          }}
          className="gb-sticky-text"
          data-placeholder="Type something..."
        >
          {object.text}
        </div>
      </foreignObject>
    </g>
  );
}
