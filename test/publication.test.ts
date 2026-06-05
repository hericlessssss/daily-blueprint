import { describe, expect, it } from "vitest";

import {
  buildPublicationPlan,
  formatDateInTimeZone,
  isPublishDay,
  selectFragmentCount
} from "../src/publication.js";

const timeZone = "America/Sao_Paulo";

describe("publication rules", () => {
  it("allows publication from Monday to Friday", () => {
    const monday = new Date("2026-06-08T12:00:00.000Z");
    const friday = new Date("2026-06-12T12:00:00.000Z");

    expect(isPublishDay(monday, { timeZone })).toBe(true);
    expect(isPublishDay(friday, { timeZone })).toBe(true);
  });

  it("blocks publication on Saturday and Sunday", () => {
    const saturday = new Date("2026-06-06T12:00:00.000Z");
    const sunday = new Date("2026-06-07T12:00:00.000Z");

    expect(isPublishDay(saturday, { timeZone })).toBe(false);
    expect(isPublishDay(sunday, { timeZone })).toBe(false);
  });

  it("formats the entry date in the configured timezone", () => {
    const lateNightInBrazil = new Date("2026-06-06T02:30:00.000Z");

    expect(formatDateInTimeZone(lateNightInBrazil, timeZone)).toBe("2026-06-05");
  });

  it("selects the minimum fragment count when random returns zero", () => {
    expect(selectFragmentCount({ min: 1, max: 3, random: () => 0 })).toBe(1);
  });

  it("selects the maximum fragment count near the upper random bound", () => {
    expect(selectFragmentCount({ min: 1, max: 3, random: () => 0.999 })).toBe(3);
  });

  it("builds a weekday publication plan", () => {
    const date = new Date("2026-06-08T12:00:00.000Z");

    expect(
      buildPublicationPlan({
        date,
        timeZone,
        minFragments: 1,
        maxFragments: 3,
        random: () => 0.5
      })
    ).toEqual({
      shouldPublish: true,
      entryDate: "2026-06-08",
      fragmentCount: 2
    });
  });

  it("builds a weekend skip plan without selecting fragments", () => {
    const date = new Date("2026-06-06T12:00:00.000Z");

    expect(
      buildPublicationPlan({
        date,
        timeZone,
        minFragments: 1,
        maxFragments: 3,
        random: () => 0.5
      })
    ).toEqual({
      shouldPublish: false,
      entryDate: "2026-06-06",
      fragmentCount: 0
    });
  });
});
