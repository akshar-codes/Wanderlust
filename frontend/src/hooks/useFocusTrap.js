import { useEffect, useRef } from "react";

export function useFocusTrap(
  containerRef,
  { enabled = true, onEscape, returnFocusRef },
) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Save previous focus when trap activates
    previousFocusRef.current = document.activeElement;
    const returnNode = returnFocusRef?.current || previousFocusRef.current;

    const container = containerRef.current;
    if (!container) return;

    // Helper to get focusable elements
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !container.contains(document.activeElement)
          ) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus first element on open
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small timeout to allow render to complete
      setTimeout(() => {
        focusableElements[0].focus();
      }, 0);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus on close
      if (returnNode && typeof returnNode.focus === "function") {
        // Small timeout to ensure element exists in DOM before focusing
        setTimeout(() => {
          returnNode.focus();
        }, 0);
      }
    };
  }, [enabled, onEscape, returnFocusRef, containerRef]);
}
