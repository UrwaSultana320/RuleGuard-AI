import { beforeEach, vi } from "vitest";
// Default deny: tests must explicitly provide a fake fetch for upstream adapters.
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("External network is forbidden in offline tests");
    }),
  );
});
