import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();

  useEffect(() => {
    let start = 0;
    let end =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.]/g, ""))
        : value;
    let startTime = null;
    function animate(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplay(current);
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      } else {
        setDisplay(end);
      }
    }
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  // Format with commas
  const formatted = display.toLocaleString();
  let prefix = value[0] === "$" ? "$" : "";
  let suffix = value.includes("+") ? "+" : "";
  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
