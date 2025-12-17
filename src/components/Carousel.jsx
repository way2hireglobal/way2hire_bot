import React, { useEffect, useRef, useState } from "react";
import "./Carousel.css";

export default function Carousel({ items = [] }) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  if (!items.length) return null;

  /* ---------- Navigation ---------- */
  const prev = () => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  };

  const next = () => {
    setIndex((i) => (i + 1) % items.length);
  };

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

  return (
    <div
      className="chat-carousel"
      role="region"
      aria-label="carousel"
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      {/* ---------- Left Arrow ---------- */}
      <button
        className="carousel-arrow left"
        onClick={prev}
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* ---------- Slides ---------- */}
      <div className="carousel-slide">
        {items.map((item, i) => (
          <div
            key={i}
            className={`carousel-item ${i === index ? "active" : ""}`}
            aria-hidden={i !== index}
            role="link"
            tabIndex={0}
            onClick={() => {
              if (item.link) {
                window.open(item.link, "_blank", "noopener,noreferrer");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && item.link) {
                window.open(item.link, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <img
              src={item.imageUrl}
              alt={`carousel ${i + 1}`}
              loading="lazy"
              className="carousel-image"
            />
          </div>
        ))}
      </div>

      {/* ---------- Right Arrow ---------- */}
      <button
        className="carousel-arrow right"
        onClick={next}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* ---------- Dots ---------- */}
      <div className="carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
