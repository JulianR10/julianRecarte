export function safeT<T extends Record<string, unknown>>(obj: T): T {
  return new Proxy(obj, {
    get(target, prop: string) {
      if (prop in target) {
        const val = target[prop];
        if (typeof val === "object" && val !== null) {
          return safeT(val as Record<string, unknown>);
        }
        return val ?? "";
      }
      return "";
    },
  });
}
