import { Line } from "react-konva";
import { AlignmentGuide } from "@/lib/canvas/types";

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  color?: string;
  opacity?: number;
}

const GUIDE_COLOR = "#E8846E"; // Coral color from theme
const GUIDE_OPACITY = 0.5;

export function AlignmentGuides({
  guides,
  color = GUIDE_COLOR,
  opacity = GUIDE_OPACITY,
}: AlignmentGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <>
      {guides.map((guide, index) => {
        const points =
          guide.type === "vertical"
            ? [guide.position, guide.start, guide.position, guide.end]
            : [guide.start, guide.position, guide.end, guide.position];

        return (
          <Line
            key={`guide-${guide.type}-${index}`}
            points={points}
            stroke={color}
            strokeWidth={1}
            opacity={opacity}
            dash={[4, 4]} // Subtle dashed line
            listening={false} // Don't capture mouse events
          />
        );
      })}
    </>
  );
}
