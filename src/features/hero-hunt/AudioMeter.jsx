import { useEffect, useRef } from "react";

export function useAudioMeter(audio, playing) {
  const bars = useRef(null);
  const graph = useRef(null);
  useEffect(() => {
    let frame;
    if (!playing || !audio.current || !bars.current) return;
    const element = audio.current;
    try {
      if (graph.current?.element !== element) {
        graph.current?.context.close().catch(() => {});
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = context.createAnalyser();
        analyser.fftSize = 64;
        context.createMediaElementSource(element).connect(analyser);
        analyser.connect(context.destination);
        graph.current = { context, analyser, element };
      }
      const { context, analyser } = graph.current;
      context.resume().catch(() => {});
      const values = new Uint8Array(analyser.frequencyBinCount);
      function draw() {
        analyser.getByteFrequencyData(values);
        [...bars.current.children].forEach((bar, i) => {
          bar.style.transform = "scaleY(" + (0.18 + values[i * 3] / 160) + ")";
        });
        frame = requestAnimationFrame(draw);
      }
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) draw();
    } catch {}
    return () => {
      cancelAnimationFrame(frame);
      if (bars.current) for (const bar of bars.current.children) bar.style.transform = "";
    };
  }, [playing, audio]);
  useEffect(() => () => { graph.current?.context.close().catch(() => {}); }, []);
  return bars;
}
