/**
 * The index that a menu key moves the focus to, with wrap-around, or null for any other key.
 * The bar menu and the timescale menu share this keyboard model.
 */
export function menuKeyTarget(key: string, index: number, count: number): number | null {
  if (key === 'ArrowDown') {
    return (index + 1) % count;
  }
  if (key === 'ArrowUp') {
    return (index - 1 + count) % count;
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return count - 1;
  }
  return null;
}
