export function lazyProperties<T>(target: T, apply: () => void, keys: Iterable<string>): void {
  function restoreProperties() {
    for (const key of keys) {
      Object.defineProperty(target, key, {
        configurable: true,
        value: undefined,
        writable: true,
      });
    }
    apply.call(target);
  }

  for (const key of keys) {
    Object.defineProperty(target, key, {
      get: () => {
        restoreProperties();
        return (target as any)[key];
      },
      set: undefined,
      enumerable: true,
      configurable: true,
    });
  }
}
