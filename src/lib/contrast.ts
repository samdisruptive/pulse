function channel(value: number): number {
  const scale = value / 255;
  return scale <= 0.03928 ? scale / 12.92 : ((scale + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const value = hex.replace("#", "");
    const red = channel(Number.parseInt(value.slice(0, 2), 16));
    const green = channel(Number.parseInt(value.slice(2, 4), 16));
    const blue = channel(Number.parseInt(value.slice(4, 6), 16));
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}
