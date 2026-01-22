"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavigationProps {
  currentPage: number; // 1-indexed for display
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function PageNavigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PageNavigationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      {/* Page label and indicator */}
      <div className="text-center select-none">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Page
        </div>
        <div className="text-[12px] font-medium">
          {currentPage}/{totalPages}
        </div>
      </div>

      {/* Navigation buttons inline */}
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button
                variant="ghost"
                size="icon"
                className="h-[18px] w-[18px] min-w-0 p-0"
                onClick={onPrevious}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Previous Page</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button
                variant="ghost"
                size="icon"
                className="h-[18px] w-[18px] min-w-0 p-0"
                onClick={onNext}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Next Page</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
