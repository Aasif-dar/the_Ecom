// Anchor "now" for deterministic seed data. Orders, reviews and registrations are
// generated relative to this instant so server and client render the same HTML.
export const SEED_NOW = new Date("2026-10-06T09:30:00+05:30").getTime();
export const DAY = 24 * 60 * 60 * 1000;

/** Bump to discard everyone's persisted demo data and re-seed. */
export const SEED_VERSION = 4;

export const DEMO_CUSTOMER = {
  email: "demo@aadyam.in",
  password: "demo1234",
};

export const DEMO_ADMIN = {
  email: "admin@aadyam.in",
  password: "admin123",
};
