'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks which page is being read in the continuous view.
 *
 * Pages register their own element, and an IntersectionObserver squeezed to a
 * band across the middle of the viewport reports the page the reader is
 * actually looking at. Element heights are unknown until each image loads, so
 * measuring beats any arithmetic over assumed page heights.
 */
export function useVisiblePage(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const nodes = useRef(new Map<number, HTMLElement>());
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [totalPages]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const visible = new Map<number, number>();

    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (!Number.isFinite(page)) continue;
          if (entry.isIntersecting) visible.set(page, entry.intersectionRatio);
          else visible.delete(page);
        }
        if (visible.size === 0) return;

        // The lowest-numbered page in the band is the one being read: the next
        // page only takes over once the current one has scrolled past.
        const page = Math.min(...visible.keys());
        setCurrentPage(page);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    for (const node of nodes.current.values()) observer.current.observe(node);

    return () => {
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [totalPages]);

  const registerPage = useCallback((page: number, node: HTMLElement | null) => {
    const existing = nodes.current.get(page);
    if (existing && existing !== node) observer.current?.unobserve(existing);

    if (node) {
      nodes.current.set(page, node);
      observer.current?.observe(node);
    } else {
      nodes.current.delete(page);
    }
  }, []);

  const scrollToPage = useCallback((page: number) => {
    const node = nodes.current.get(page);
    if (!node) return false;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }, []);

  return { currentPage, setCurrentPage, registerPage, scrollToPage };
}
