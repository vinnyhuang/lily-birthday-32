export interface TourStep {
  id: string;
  target: string | null; // data-tour selector value, null = centered
  position: "top" | "bottom" | "left" | "right" | "center";
  title: string;
  description: string;
  requiredTab?: "photos" | "canvas";
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: null,
    position: "center",
    title: "Welcome!",
    description:
      "Let's walk through how to create your scrapbook page for Lily's 32nd birthday.",
  },
  {
    id: "photos-tab",
    target: "photos-tab",
    position: "bottom",
    title: "Upload Your Media",
    description:
      "Start here! Upload photos and videos. Once added, click any photo/video to add a caption, location, and date \u2014 these power the Map and Timeline views.",
    requiredTab: "canvas",
  },
  {
    id: "canvas-tab",
    target: "canvas-tab",
    position: "bottom",
    title: "Your Canvas",
    description:
      "Start designing your scrapbook pages here. Drag, resize, and rotate elements to arrange your page.",
    requiredTab: "canvas",
  },
  {
    id: "toolbar-content",
    target: "toolbar-content",
    position: "right",
    title: "Add Content",
    description:
      "Use these buttons to pull in your photos/videos, add decorative elements, and change backgrounds.",
    requiredTab: "canvas",
  },
  {
    id: "btn-draw",
    target: "btn-draw",
    position: "right",
    title: "Drawing",
    description:
      "Freehand draw with pens here. Once done, you can click on drawn layers to modify them like any other element.",
    requiredTab: "canvas",
  },
  {
    id: "toolbar-manage",
    target: "toolbar-manage",
    position: "right",
    title: "Manage Elements",
    description:
      "Select elements (Ctrl/Cmd+click to multi-select) and delete or re-order them here. If applicable, selected elements can be configured via menus to the right of the canvas.",
    requiredTab: "canvas",
  },
  {
    id: "toolbar-history",
    target: "toolbar-history",
    position: "right",
    title: "Undo & Redo",
    description: "Made a mistake? Step backwards or forwards anytime.",
    requiredTab: "canvas",
  },
  {
    id: "page-nav",
    target: "page-nav",
    position: "right",
    title: "Multiple Pages",
    description:
      "Create additional pages and navigate between them. Use the page manager to add, reorder, or delete. Your work saves automatically.",
    requiredTab: "canvas",
  },
  {
    id: "done",
    target: null,
    position: "center",
    title: "You're all set!",
    description:
      "Have fun creating your page for Lily. Click the ? button in the bottom right to revisit this guide.",
  },
];
