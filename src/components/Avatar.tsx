import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/collection";

const cache = new Map<string, string>();

interface Props {
  seed: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic 2D pixel-art portrait for an agent, generated locally
 * (no network) and rendered with crisp pixels for the terminal look.
 */
export function Avatar({ seed, size = 44, className }: Props) {
  const uri = useMemo(() => {
    const cached = cache.get(seed);
    if (cached) return cached;
    const svg = createAvatar(pixelArt, {
      seed,
      backgroundColor: ["0c0d0f"],
      backgroundType: ["solid"],
    }).toString();
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    cache.set(seed, dataUri);
    return dataUri;
  }, [seed]);

  return (
    <img
      className={`avatar-img${className ? ` ${className}` : ""}`}
      src={uri}
      width={size}
      height={size}
      alt={seed}
      draggable={false}
    />
  );
}
