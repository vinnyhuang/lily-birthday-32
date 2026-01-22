"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { TOUR_STEPS } from "./tourSteps";
import { TourOverlay } from "./TourOverlay";
import { TourTooltip } from "./TourTooltip";

const STORAGE_KEY = "lily-birthday-tour-seen";

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  start: () => void;
}

const TourContext = createContext<TourContextType>({
  isActive: false,
  currentStep: 0,
  totalSteps: TOUR_STEPS.length,
  start: () => {},
});

export function useTour() {
  return useContext(TourContext);
}

interface TourProviderProps {
  children: ReactNode;
  setActiveTab: (tab: string) => void;
}

export function TourProvider({ children, setActiveTab }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const step = TOUR_STEPS[currentStep];

  // Find target element and get its bounding rect
  const updateTargetRect = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Update rect after scroll
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect());
        }, 300);
      }
    } else {
      // Element not found yet (tab might be switching), retry
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        const retryEl = document.querySelector(`[data-tour="${step.target}"]`);
        if (retryEl) {
          setTargetRect(retryEl.getBoundingClientRect());
        }
      }, 150);
    }
  }, [step]);

  // Update rect when step changes
  useEffect(() => {
    if (!isActive) return;
    updateTargetRect();
  }, [isActive, currentStep, updateTargetRect]);

  // Listen for window resize and scroll to reposition
  useEffect(() => {
    if (!isActive) return;

    const handleUpdate = () => updateTargetRect();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isActive, updateTargetRect]);

  // Observe target element for size/position changes
  useEffect(() => {
    if (!isActive || !step?.target) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      setTargetRect(el.getBoundingClientRect());
    });
    resizeObserverRef.current.observe(el);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [isActive, step]);

  // Switch tab if needed for current step
  useEffect(() => {
    if (!isActive || !step?.requiredTab) return;
    setActiveTab(step.requiredTab);
    // After tab switch, wait for DOM to update then find target
    setTimeout(() => updateTargetRect(), 100);
  }, [isActive, currentStep, step, setActiveTab, updateTargetRect]);

  const start = useCallback(() => {
    setActiveTab("canvas");
    setCurrentStep(0);
    setIsActive(true);
  }, [setActiveTab]);

  const next = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Tour complete
      setIsActive(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, [currentStep]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  // Auto-start on first visit
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        setActiveTab("canvas");
        setIsActive(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [setActiveTab]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  return (
    <TourContext.Provider
      value={{ isActive, currentStep, totalSteps: TOUR_STEPS.length, start }}
    >
      {children}
      {isActive && step && (
        <>
          <TourOverlay targetRect={targetRect} onSkip={skip} />
          <TourTooltip
            targetRect={targetRect}
            position={step.position}
            step={currentStep}
            totalSteps={TOUR_STEPS.length}
            title={step.title}
            description={step.description}
            onNext={next}
            onPrev={prev}
            onSkip={skip}
            isFirst={currentStep === 0}
            isLast={currentStep === TOUR_STEPS.length - 1}
          />
        </>
      )}
    </TourContext.Provider>
  );
}
