import { useRef, useState } from "react";
import { fitToContent } from "../canvas/viewportActions";
import { deserializeBoard, downloadBoardAsJson, InvalidBoardFileError } from "../serialization/schema";
import { useStore } from "../state/store";
import { clampZoom } from "../utils/math";
import { ShortcutsHelp } from "./ShortcutsHelp";

export function TopBar() {
  const board = useStore((s) => s.board);
  const viewport = useStore((s) => s.viewport);
  const setViewport = useStore((s) => s.setViewport);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.history.past.length > 0);
  const canRedo = useStore((s) => s.history.future.length > 0);
  const loadBoard = useStore((s) => s.loadBoard);
  const newBoard = useStore((s) => s.newBoard);

  const [helpOpen, setHelpOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const zoomBy = (factor: number) => setViewport({ zoom: clampZoom(viewport.zoom * factor) });

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const imported = deserializeBoard(text);
      loadBoard(imported);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof InvalidBoardFileError ? err.message : "Couldn't import that file.");
    }
  };

  return (
    <header className="gb-topbar">
      <div className="gb-topbar-left">
        <span className="gb-logo">
          <GhostMark /> GhostBoard
        </span>
        <span className="gb-board-name">{board.name}</span>
      </div>

      <div className="gb-topbar-center">
        <button className="gb-icon-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <UndoIcon />
        </button>
        <button className="gb-icon-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <UndoIcon flip />
        </button>
        <div className="gb-divider" />
        <button className="gb-icon-btn" onClick={() => zoomBy(0.8)} title="Zoom out (-)">
          –
        </button>
        <button className="gb-zoom-label" onClick={() => setViewport({ zoom: 1 })} title="Reset zoom">
          {Math.round(viewport.zoom * 100)}%
        </button>
        <button className="gb-icon-btn" onClick={() => zoomBy(1.25)} title="Zoom in (+)">
          +
        </button>
        <button className="gb-text-btn" onClick={() => fitToContent()} title="Fit to content">
          Fit view
        </button>
      </div>

      <div className="gb-topbar-right">
        {importError && <span className="gb-import-error">{importError}</span>}
        <button className="gb-text-btn" onClick={newBoard}>
          New board
        </button>
        <button className="gb-text-btn" onClick={handleImportClick}>
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="gb-hidden-input"
          onChange={handleFileChange}
        />
        <button className="gb-text-btn gb-text-btn--accent" onClick={() => downloadBoardAsJson(board)}>
          Export
        </button>
        <button className="gb-icon-btn" onClick={() => setHelpOpen(true)} title="Keyboard shortcuts (?)">
          ?
        </button>
      </div>

      {helpOpen && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}
    </header>
  );
}

function GhostMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C7 2 3.5 5.8 3.5 10.7V21l2.6-2.2L8.6 21l2.6-2.2L13.8 21l2.6-2.2L19 21V10.7C19 5.8 16 2 12 2z"
        fill="var(--gb-accent)"
      />
      <circle cx={9.3} cy={10.5} r={1.3} fill="var(--gb-bg)" />
      <circle cx={14.7} cy={10.5} r={1.3} fill="var(--gb-bg)" />
    </svg>
  );
}

function UndoIcon({ flip }: { flip?: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M7 7v5H2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M2 12a9 9 0 1 1 3 6.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
