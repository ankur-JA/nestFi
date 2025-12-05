"use client";

import { useState, useEffect } from "react";

export const usePageViews = () => {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/pageviews/count");
        const data = await response.json();

        if (data.success) {
          setCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching page views:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  const formatCount = (num: number | null): string => {
    if (num === null) return "...";
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return { count, loading, formatCount };
};
