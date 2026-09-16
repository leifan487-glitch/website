import { useEffect, useRef, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  ));

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function StandardMediaPlayer({ media, homeLoop = false, className = "", label }) {
  const reducedMotion = usePrefersReducedMotion();
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!homeLoop);
  const [inViewport, setInViewport] = useState(!homeLoop);
  const video = homeLoop ? (media.homeVideo || media.video) : media.video;
  const poster = homeLoop ? (media.homePoster || media.poster) : media.poster;
  const accessibleLabel = label || `播放${media.titleZh}`;
  const autoplay = homeLoop && !reducedMotion;

  useEffect(() => {
    const player = playerRef.current;
    if (!homeLoop || !player) return undefined;

    const prepareObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setShouldLoad(true);
      prepareObserver.disconnect();
    }, { rootMargin: "80% 0px", threshold: 0.01 });
    const visibilityObserver = new IntersectionObserver((entries) => {
      setInViewport(entries.some((entry) => entry.isIntersecting));
    }, { threshold: 0.08 });

    prepareObserver.observe(player);
    visibilityObserver.observe(player);
    return () => {
      prepareObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [homeLoop]);

  useEffect(() => {
    const element = videoRef.current;
    if (!homeLoop || !element) return;
    if (!autoplay || !shouldLoad || !inViewport) {
      element.pause();
      setPlaying(false);
      return;
    }
    element.play().catch(() => setPlaying(false));
  }, [autoplay, homeLoop, inViewport, shouldLoad, video]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return undefined;
    // Capture the mounted element: React clears the ref before passive cleanup.
    return () => {
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [homeLoop, activated]);

  useEffect(() => {
    if (!activated || !videoRef.current) return;
    videoRef.current.focus();
    videoRef.current.play().catch(() => {});
  }, [activated]);

  async function togglePlayback() {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) await element.play().catch(() => {});
    else element.pause();
  }

  if (!homeLoop && !activated) {
    return (
      <button
        className={`standard-media-player standard-media-player--poster ${className}`.trim()}
        type="button"
        aria-label={accessibleLabel}
        onClick={() => setActivated(true)}
      >
        <img src={poster} alt="" width={media.width} height={media.height} loading="lazy" decoding="async" />
        <span className="standard-media-player__play" aria-hidden="true">播放视频</span>
      </button>
    );
  }

  return (
    <div
      ref={playerRef}
      className={`standard-media-player ${className}`.trim()}
      data-media-loaded={shouldLoad ? "true" : "false"}
      data-media-visible={inViewport ? "true" : "false"}
    >
      <video
        ref={videoRef}
        src={shouldLoad ? video : undefined}
        poster={poster}
        width={media.width}
        height={media.height}
        autoPlay={(autoplay && shouldLoad && inViewport) || activated}
        muted={autoplay}
        loop={homeLoop}
        playsInline
        controls={!autoplay}
        preload={shouldLoad && autoplay ? "metadata" : "none"}
        tabIndex="0"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {autoplay && shouldLoad ? (
        <button className="standard-media-player__control" type="button" aria-label={playing ? "暂停" : "播放"} onClick={togglePlayback}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
        </button>
      ) : null}
    </div>
  );
}
