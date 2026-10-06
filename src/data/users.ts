import type { Address, AddressType, User } from "@/types";
import { BUILDINGS, CITIES, EMAIL_DOMAINS, FEMALE_NAMES, LAST_NAMES, MALE_NAMES } from "./geo";
import { DAY, DEMO_ADMIN, DEMO_CUSTOMER, SEED_NOW } from "./seed-config";
import { chance, int, mulberry32, pick, type Rng } from "@/lib/rng";

export function makePhone(rng: Rng) {
  const first = String(pick(rng, [6, 7, 8, 9]));
  const rest = String(int(rng, 0, 99999999)).padStart(8, "0");
  const digits = first + rest + String(int(rng, 0, 9));
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function makeAddress(
  rng: Rng,
  id: string,
  fullName: string,
  phone: string,
  type: AddressType,
  isDefault: boolean,
  cityIdx?: number,
): Address {
  const c = CITIES[cityIdx ?? int(rng, 0, CITIES.length - 1)];
  const flat = `${pick(rng, ["A", "B", "C", "D", "F"])}-${int(rng, 101, 1204)}`;
  return {
    id,
    fullName,
    phone,
    line1: `${flat}, ${pick(rng, BUILDINGS)}`,
    line2: pick(rng, c.areas),
    city: c.city,
    state: c.state,
    pincode: String(c.pin + int(rng, 0, 9)),
    type,
    isDefault,
  };
}

const defaultPrefs = { newsletter: true, orderUpdates: true, smsAlerts: true, offers: true };

function buildDemoUser(): User {
  const rng = mulberry32(777);
  const name = "Meera Nair";
  const phone = "+91 98450 12873";
  return {
    id: "usr_demo",
    name,
    email: DEMO_CUSTOMER.email,
    phone,
    password: DEMO_CUSTOMER.password,
    role: "customer",
    status: "active",
    createdAt: new Date(SEED_NOW - 410 * DAY).toISOString(),
    gender: "female",
    dateOfBirth: "1994-03-18",
    addresses: [
      makeAddress(rng, "adr_demo_home", name, phone, "home", true, 2),
      makeAddress(rng, "adr_demo_work", name, phone, "work", false, 2),
    ],
    preferences: { ...defaultPrefs },
  };
}

function buildAdminUser(): User {
  return {
    id: "usr_admin",
    name: "Rohan Desai",
    email: DEMO_ADMIN.email,
    phone: "+91 80 4123 9087",
    password: DEMO_ADMIN.password,
    role: "admin",
    status: "active",
    createdAt: new Date(SEED_NOW - 900 * DAY).toISOString(),
    addresses: [],
    preferences: { ...defaultPrefs },
  };
}

export const CUSTOMER_COUNT = 64;

function buildCustomers(): User[] {
  const rng = mulberry32(4242);
  const used = new Set<string>();
  const out: User[] = [];
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const female = chance(rng, 0.55);
    let first = "", last = "", email = "";
    do {
      first = pick(rng, female ? FEMALE_NAMES : MALE_NAMES);
      last = pick(rng, LAST_NAMES);
      const sep = pick(rng, [".", "", "_"]);
      const suffix = chance(rng, 0.35) ? String(int(rng, 7, 99)) : "";
      email = `${first}${sep}${last}${suffix}@${pick(rng, EMAIL_DOMAINS)}`.toLowerCase().replace(/'/g, "");
    } while (used.has(email));
    used.add(email);
    const name = `${first} ${last}`;
    const phone = makePhone(rng);
    // registrations spread over the 18 months before the seed date, skewed towards recent
    const ageDays = Math.floor(Math.pow(rng(), 1.4) * 540) + 3;
    const addrCount = chance(rng, 0.3) ? 2 : 1;
    const cityIdx = int(rng, 0, CITIES.length - 1);
    const addresses = Array.from({ length: addrCount }, (_, k) =>
      makeAddress(rng, `adr_${String(i + 1).padStart(3, "0")}_${k + 1}`, name, phone, k === 0 ? "home" : "work", k === 0, cityIdx),
    );
    out.push({
      id: `usr_${String(i + 1).padStart(3, "0")}`,
      name,
      email,
      phone,
      password: "Welcome@123",
      role: "customer",
      status: i === 11 || i === 37 ? "blocked" : "active",
      createdAt: new Date(SEED_NOW - ageDays * DAY).toISOString(),
      gender: female ? "female" : "male",
      addresses,
      preferences: { ...defaultPrefs, offers: chance(rng, 0.7), smsAlerts: chance(rng, 0.6) },
    });
  }
  return out;
}

export const SEED_USERS: User[] = [buildAdminUser(), buildDemoUser(), ...buildCustomers()];
