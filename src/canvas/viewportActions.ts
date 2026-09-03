import { getBounds, unionBounds } from "../model/geometry";
import { useStore } from "../state/store";
import { clampZoom } from "../utils/math";

/** Frames the viewport around all objects on the board, or resets to the
 * default view if the board is empty. Used by the "Fit view" button and
 * the `0` keyboard shortcut. */
export function fitToContent(padding = 80) {
  const { board, setViewport } = useStore.getState();
  const svg = document.querySelector(".gb-canvas") as SVGSVGElement | null;
  const viewportSize = svg ? svg.getBoundingClientRect() : { width: 1200, height: 800 };
  const bounds = unionBounds(board.objects.map(getBounds));
  if (!bounds) {
    setViewport({ x: 0, y: 0, zoom: 1 });
    return;
  }
  const zoomX = viewportSize.width / (bounds.width + padding * 2);
  const zoomY = viewportSize.height / (bounds.height + padding * 2);
  const zoom = clampZoom(Math.min(zoomX, zoomY, 2));
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  setViewport({
    zoom,
    x: cx - viewportSize.width / 2 / zoom,
    y: cy - viewportSize.height / 2 / zoom,
  });
}
