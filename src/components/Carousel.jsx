// Carousel.jsx

import React, { useEffect, useRef, useState } from "react";
import "./Carousel.css";

export default function Carousel({ items = [] }) {
  const [index, setIndex] = useState(0);
  const [dotAnim, setDotAnim] = useState("");
  const intervalRef = useRef(null);
  const prevIndexRef = useRef(0);

  if (!items.length) return null;

  /* ---------- Navigation ---------- */
  const prev = () => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % items.length);
  };

  /* ---------- Detect direction (dot spring) ---------- */
  useEffect(() => {
    if (index > prevIndexRef.current) {
      setDotAnim("spring-right");
    } else if (index < prevIndexRef.current) {
      setDotAnim("spring-left");
    }

    prevIndexRef.current = index;

    const t = setTimeout(() => setDotAnim(""), 300);
    return () => clearTimeout(t);
  }, [index]);

  /* ---------- Keyboard navigation ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Auto scroll ---------- */
  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [index]);

  const startAutoScroll = () => {
    stopAutoScroll();
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 3500);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /* ---------- DOT LOGIC ---------- */
  const isFirst = index === 0;
  const isLast = index === items.length - 1;
  const activeDot = isFirst ? 0 : isLast ? 2 : 1;

  return (
    <div
      className="chat-carousel"
      role="region"
      aria-label="carousel"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      {/* ---------- Left Arrow ---------- */}
      <button className="carousel-arrow left" onClick={prev} aria-label="Previous">
        ‹
      </button>

      {/* ---------- Slides ---------- */}
      <div className="carousel-slide">
        {items.map((item, i) => (
          <div
            key={i}
            className={`carousel-item ${i === index ? "active" : ""} ${
              item.link ? "clickable" : ""
            }`}
            role={item.link ? "link" : undefined}
            tabIndex={item.link ? 0 : -1}
            aria-hidden={i !== index}
            onClick={
              item.link
                ? () => window.open(item.link, "_blank", "noopener,noreferrer")
                : undefined
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && item.link) {
                window.open(item.link, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <img
              src={item.imageUrl}
              alt={`carousel slide ${i + 1}`}
              loading="lazy"
              className="carousel-image"
            />
          </div>
        ))}
      </div>

      {/* ---------- Right Arrow ---------- */}
      <button className="carousel-arrow right" onClick={next} aria-label="Next">
        ›
      </button>

      {/* ---------- CONTINUOUS 3 DOTS (SPRING) ---------- */}
      <div className={`carousel-dots ${dotAnim}`}>
        {[0, 1, 2].map((dotIndex) => (
          <span
            key={dotIndex}
            className={`dot ${dotIndex === activeDot ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
