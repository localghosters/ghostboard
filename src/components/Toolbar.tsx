import clsx from "clsx";
import { useStore, type ToolType } from "../state/store";

const TOOLS: { id: ToolType; label: string; icon: string; shortcut: string }[] = [
  { id: "select", label: "Select", icon: "cursor", shortcut: "V" },
  { id: "hand", label: "Pan", icon: "hand", shortcut: "H" },
  { id: "sticky", label: "Sticky note", icon: "sticky", shortcut: "S" },
  { id: "rectangle", label: "Rectangle", icon: "rect", shortcut: "R" },
  { id: "roundedRectangle", label: "Rounded rectangle", icon: "rrect", shortcut: "U" },
  { id: "ellipse", label: "Ellipse", icon: "ellipse", shortcut: "O" },
  { id: "line", label: "Line", icon: "line", shortcut: "L" },
  { id: "arrow", label: "Arrow", icon: "arrow", shortcut: "A" },
  { id: "pen", label: "Pen", icon: "pen", shortcut: "P" },
  { id: "eraser", label: "Eraser", icon: "eraser", shortcut: "E" },
];

export function Toolbar() {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);

  return (
    <div className="gb-toolbar" role="toolbar" aria-label="Tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={clsx("gb-tool-btn", tool === t.id && "gb-tool-btn--active")}
          onClick={() => setTool(t.id)}
          title={`${t.label} (${t.shortcut})`}
          aria-pressed={tool === t.id}
        >
          <ToolIcon icon={t.icon} />
        </button>
      ))}
    </div>
  );
}

function ToolIcon({ icon }: { icon: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const };
  switch (icon) {
    case "cursor":
      return (
        <svg {...common}>
          <path d="M5 3l14 8-6 1.5L11 19 5 3z" fill="currentColor" />
        </svg>
      );
    case "hand":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.6}>
          <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10m0 0V5.5a1.5 1.5 0 0 1 3 0V11m0 .5V9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L5 14.8c-.6-.8-.4-1.7.3-2.2.7-.4 1.6-.2 2 .4L8 14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "sticky":
      return (
        <svg {...common}>
          <path d="M4 4h16v10.5L14.5 20H4V4z" fill="currentColor" opacity={0.9} />
          <path d="M14.5 20v-5.5H20" fill="none" stroke="var(--gb-bg)" strokeWidth={1.4} />
        </svg>
      );
    case "rect":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <rect x={4} y={6} width={16} height={12} />
        </svg>
      );
    case "rrect":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <rect x={4} y={6} width={16} height={12} rx={4} />
        </svg>
      );
    case "ellipse":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <ellipse cx={12} cy={12} rx={8} ry={6} />
        </svg>
      );
    case "line":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <line x1={5} y1={19} x2={19} y2={5} strokeLinecap="round" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <line x1={5} y1={19} x2={17} y2={7} strokeLinecap="round" />
          <path d="M12 7h5v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "pen":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <path
            d="M4 20l1-4.2L15.5 5.3a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "eraser":
      return (
        <svg {...common} stroke="currentColor" strokeWidth={1.8}>
          <path d="M18 13.5 9.5 5 3.5 11l7 7H14M9 21h9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
