import { useState, useEffect } from "react";

export const useTimer = (initialTime: number, active: boolean) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    let interval: any;
    if (active && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  return { timeLeft, setTimeLeft };
};
