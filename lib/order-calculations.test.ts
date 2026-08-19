import { describe, expect, it } from "vitest";
import { calculateOrderTotal, calculateSubtotal, formatCOPProxy, getLoyaltyStatus } from "./test-helpers";

describe("order calculations", () => {
  it("calculates subtotal", () => {
    expect(calculateSubtotal([{ price: 22000, quantity: 2 }, { price: 10000, quantity: 1 }])).toBe(54000);
  });

  it("calculates 10 percent discount", () => {
    expect(calculateOrderTotal([{ price: 30000, quantity: 2 }], 10)).toEqual({
      subtotal: 60000,
      discountAmount: 6000,
      total: 54000
    });
  });

  it.each([
    [0, 0, false, 0],
    [1, 0, false, 1],
    [2, 0, false, 2],
    [3, 0, true, 0],
    [4, 1, false, 1],
    [5, 1, false, 2],
    [6, 1, true, 0],
    [7, 2, false, 1]
  ])("loyalty delivered=%i consumed=%i", (delivered, consumed, hasReward, progress) => {
    const status = getLoyaltyStatus(delivered, consumed);
    expect(status.hasAvailableReward).toBe(hasReward);
    expect(status.progress).toBe(progress);
  });

  it("formats COP", () => {
    expect(formatCOPProxy(24000)).toBe("$ 24.000");
  });
});
