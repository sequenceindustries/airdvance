/**
 * Demo/seed data for Airdvance.
 * Run with: npm run seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Creates:
 *  - 1 admin user, 1 demo customer
 *  - 6 smartphones, 4 tablets, 4 laptops, each with 3 rental plans
 *  - A demo application (approved), one active agreement w/ partial payments
 *  - A demo overdue agreement with a RESTRICTED device
 *  - A demo completed/OWNED agreement
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { totalPayable } from "../lib/pricing";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  category: "SMARTPHONE" | "TABLET" | "LAPTOP";
  description: string;
  specifications: Record<string, string>;
  cash_price: number;
  images: string[];
  plans: { term_months: number; monthly_payment: number; deposit: number }[];
};

const smartphones: SeedProduct[] = [
  {
    name: "Samsung Galaxy A25 128GB",
    slug: "samsung-galaxy-a25-128gb",
    brand: "Samsung",
    category: "SMARTPHONE",
    description: "A reliable everyday smartphone with a bright 120Hz display and all-day battery.",
    specifications: { Display: "6.5\" Super AMOLED, 120Hz", Storage: "128GB", RAM: "6GB", Camera: "50MP triple camera", Battery: "5000mAh" },
    cash_price: 14376,
    images: ["/products/galaxy-a25.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 999, deposit: 0 },
      { term_months: 18, monthly_payment: 749, deposit: 0 },
      { term_months: 24, monthly_payment: 599, deposit: 0 },
    ],
  },
  {
    name: "iPhone 13 128GB",
    slug: "iphone-13-128gb",
    brand: "Apple",
    category: "SMARTPHONE",
    description: "The iPhone people know and trust, now within easy monthly reach.",
    specifications: { Display: "6.1\" Super Retina XDR", Storage: "128GB", Camera: "Dual 12MP", Chip: "A15 Bionic" },
    cash_price: 18999,
    images: ["/products/iphone-13.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 1299, deposit: 500 },
      { term_months: 24, monthly_payment: 789, deposit: 500 },
    ],
  },
  {
    name: "Xiaomi Redmi Note 13",
    slug: "xiaomi-redmi-note-13",
    brand: "Xiaomi",
    category: "SMARTPHONE",
    description: "Big screen, big battery, small monthly payment.",
    specifications: { Display: "6.67\" AMOLED", Storage: "256GB", RAM: "8GB", Battery: "5000mAh" },
    cash_price: 8999,
    images: ["/products/redmi-note-13.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 649, deposit: 0 },
      { term_months: 18, monthly_payment: 459, deposit: 0 },
    ],
  },
  {
    name: "Samsung Galaxy S23",
    slug: "samsung-galaxy-s23",
    brand: "Samsung",
    category: "SMARTPHONE",
    description: "Flagship performance and camera, spread over a manageable monthly plan.",
    specifications: { Display: "6.1\" Dynamic AMOLED 2X", Storage: "256GB", Camera: "50MP triple camera", Chip: "Snapdragon 8 Gen 2" },
    cash_price: 21999,
    images: ["/products/galaxy-s23.jpg"],
    plans: [
      { term_months: 18, monthly_payment: 1349, deposit: 500 },
      { term_months: 24, monthly_payment: 999, deposit: 500 },
    ],
  },
  {
    name: "Google Pixel 8",
    slug: "google-pixel-8",
    brand: "Google",
    category: "SMARTPHONE",
    description: "The best of Google, straight out of the box, with class-leading photos.",
    specifications: { Display: "6.2\" OLED, 120Hz", Storage: "128GB", Camera: "50MP dual camera", Chip: "Google Tensor G3" },
    cash_price: 17499,
    images: ["/products/pixel-8.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 1599, deposit: 0 },
      { term_months: 24, monthly_payment: 899, deposit: 0 },
    ],
  },
  {
    name: "Nokia G42",
    slug: "nokia-g42",
    brand: "Nokia",
    category: "SMARTPHONE",
    description: "Dependable, repairable, and budget-friendly — a practical first smartphone.",
    specifications: { Display: "6.56\" HD+", Storage: "128GB", Battery: "5000mAh" },
    cash_price: 5499,
    images: ["/products/nokia-g42.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 499, deposit: 0 },
      { term_months: 18, monthly_payment: 349, deposit: 0 },
    ],
  },
];

const tablets: SeedProduct[] = [
  {
    name: "iPad 10th Gen 64GB",
    slug: "ipad-10th-gen-64gb",
    brand: "Apple",
    category: "TABLET",
    description: "A colourful, capable everyday tablet for work, study and streaming.",
    specifications: { Display: "10.9\" Liquid Retina", Storage: "64GB", Chip: "A14 Bionic" },
    cash_price: 10999,
    images: ["/products/ipad-10.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 999, deposit: 0 },
      { term_months: 24, monthly_payment: 549, deposit: 0 },
    ],
  },
  {
    name: "Samsung Galaxy Tab A9+",
    slug: "samsung-galaxy-tab-a9-plus",
    brand: "Samsung",
    category: "TABLET",
    description: "A spacious screen for entertainment and productivity at an accessible price.",
    specifications: { Display: "11\" LCD", Storage: "128GB", Battery: "7040mAh" },
    cash_price: 6499,
    images: ["/products/tab-a9-plus.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 599, deposit: 0 },
      { term_months: 18, monthly_payment: 429, deposit: 0 },
    ],
  },
  {
    name: "Lenovo Tab M11",
    slug: "lenovo-tab-m11",
    brand: "Lenovo",
    category: "TABLET",
    description: "A dependable family tablet with a big battery and stylus support.",
    specifications: { Display: "11\" 2K", Storage: "128GB", Battery: "7040mAh" },
    cash_price: 5999,
    images: ["/products/lenovo-tab-m11.jpg"],
    plans: [{ term_months: 12, monthly_payment: 549, deposit: 0 }],
  },
  {
    name: "iPad Air 11-inch",
    slug: "ipad-air-11-inch",
    brand: "Apple",
    category: "TABLET",
    description: "Serious power in a slim frame, ideal for creative work on the move.",
    specifications: { Display: "11\" Liquid Retina", Storage: "128GB", Chip: "M2" },
    cash_price: 16999,
    images: ["/products/ipad-air.jpg"],
    plans: [{ term_months: 24, monthly_payment: 849, deposit: 500 }],
  },
];

const laptops: SeedProduct[] = [
  {
    name: "Lenovo IdeaPad Slim 3",
    slug: "lenovo-ideapad-slim-3",
    brand: "Lenovo",
    category: "LAPTOP",
    description: "A light, dependable laptop for study, admin and everyday browsing.",
    specifications: { CPU: "AMD Ryzen 5", RAM: "8GB", Storage: "512GB SSD", Display: "15.6\" FHD" },
    cash_price: 12999,
    images: ["/products/ideapad-slim-3.jpg"],
    plans: [
      { term_months: 12, monthly_payment: 1199, deposit: 0 },
      { term_months: 24, monthly_payment: 649, deposit: 0 },
    ],
  },
  {
    name: "HP 15 Laptop",
    slug: "hp-15-laptop",
    brand: "HP",
    category: "LAPTOP",
    description: "A well-rounded laptop built for work, home and remote learning.",
    specifications: { CPU: "Intel Core i5", RAM: "8GB", Storage: "512GB SSD", Display: "15.6\" FHD" },
    cash_price: 14499,
    images: ["/products/hp-15.jpg"],
    plans: [
      { term_months: 18, monthly_payment: 949, deposit: 0 },
      { term_months: 24, monthly_payment: 729, deposit: 0 },
    ],
  },
  {
    name: "MacBook Air M1",
    slug: "macbook-air-m1",
    brand: "Apple",
    category: "LAPTOP",
    description: "Apple's silent, all-day laptop — now on a plan that fits your budget.",
    specifications: { Chip: "Apple M1", RAM: "8GB", Storage: "256GB SSD", Display: "13.3\" Retina" },
    cash_price: 17999,
    images: ["/products/macbook-air-m1.jpg"],
    plans: [
      { term_months: 24, monthly_payment: 899, deposit: 500 },
    ],
  },
  {
    name: "Dell Inspiron 15",
    slug: "dell-inspiron-15",
    brand: "Dell",
    category: "LAPTOP",
    description: "A dependable Dell for the home office, with room to grow.",
    specifications: { CPU: "Intel Core i5", RAM: "16GB", Storage: "512GB SSD", Display: "15.6\" FHD" },
    cash_price: 16499,
    images: ["/products/dell-inspiron-15.jpg"],
    plans: [
      { term_months: 18, monthly_payment: 1099, deposit: 0 },
      { term_months: 24, monthly_payment: 849, deposit: 0 },
    ],
  },
];

async function ensureUser(email: string, full_name: string, role: "ADMIN" | "CUSTOMER") {
  const { data: existing } = await supabase.auth.admin.listUsers();
  let user = existing.users.find((u) => u.email === email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: "Airdvance!Demo123",
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }

  await supabase.from("profiles").upsert({
    id: user!.id,
    full_name,
    email,
    mobile: "+27 82 000 0000",
    role,
  });

  return user!.id;
}

async function seedCatalogue(products: SeedProduct[]) {
  const created: { productId: string; plans: { id: string; term_months: number; monthly_payment: number }[] }[] = [];

  for (const p of products) {
    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          category: p.category,
          description: p.description,
          specifications: p.specifications,
          cash_price: p.cash_price,
          images: p.images,
          status: "ACTIVE",
        },
        { onConflict: "slug" },
      )
      .select()
      .single();
    if (error) throw error;

    await supabase.from("rental_plans").delete().eq("product_id", product.id);
    const { data: plans, error: planErr } = await supabase
      .from("rental_plans")
      .insert(
        p.plans.map((plan) => ({
          product_id: product.id,
          term_months: plan.term_months,
          monthly_payment: plan.monthly_payment,
          deposit: plan.deposit,
          total_payable: totalPayable(plan as any),
          status: "ACTIVE",
        })),
      )
      .select();
    if (planErr) throw planErr;

    created.push({ productId: product.id, plans: plans! });
  }

  return created;
}

async function seedInventory(productId: string, assetPrefix: string, count: number) {
  const rows = Array.from({ length: count }).map((_, i) => ({
    product_id: productId,
    asset_number: `${assetPrefix}-${String(i + 1).padStart(4, "0")}`,
    serial_number: `SN${assetPrefix}${1000 + i}`,
    imei: assetPrefix.startsWith("LAP") ? null : `35${Math.floor(100000000000 + Math.random() * 899999999999)}`,
    condition: "NEW",
    status: "AVAILABLE" as const,
  }));
  const { data, error } = await supabase.from("inventory").insert(rows).select();
  if (error) throw error;
  return data!;
}

async function allocateDevice(deviceId: string, agreementId: string, customerId: string, status: "ALLOCATED" | "ACTIVE" | "OWNED") {
  await supabase.from("inventory").update({ status, agreement_id: agreementId, customer_id: customerId }).eq("id", deviceId);
}

async function createAgreement(opts: {
  agreementNumber: string;
  customerId: string;
  productId: string;
  deviceId: string;
  planId: string;
  termMonths: number;
  monthlyPayment: number;
  deposit: number;
  paymentsCompleted: number;
  status: "PENDING" | "ACTIVE" | "DEFAULTED" | "COMPLETED";
  ownershipStatus: "NOT_OWNED" | "OWNERSHIP_PENDING" | "OWNED";
}) {
  const total = totalPayable({ monthly_payment: opts.monthlyPayment, term_months: opts.termMonths, deposit: opts.deposit });
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - opts.paymentsCompleted);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + opts.termMonths);

  const { data: agreement, error } = await supabase
    .from("agreements")
    .insert({
      agreement_number: opts.agreementNumber,
      customer_id: opts.customerId,
      product_id: opts.productId,
      device_id: opts.deviceId,
      rental_plan_id: opts.planId,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      term_months: opts.termMonths,
      monthly_payment: opts.monthlyPayment,
      deposit: opts.deposit,
      total_payable: total,
      payments_required: opts.termMonths,
      payments_completed: opts.paymentsCompleted,
      amount_paid: opts.monthlyPayment * opts.paymentsCompleted,
      amount_remaining: total - opts.monthlyPayment * opts.paymentsCompleted,
      status: opts.status,
      ownership_status: opts.ownershipStatus,
      completed_at: opts.status === "COMPLETED" ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;

  const schedule = Array.from({ length: opts.termMonths }).map((_, i) => {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i);
    const paymentNumber = i + 1;
    const isPaid = paymentNumber <= opts.paymentsCompleted;
    return {
      agreement_id: agreement.id,
      customer_id: opts.customerId,
      payment_number: paymentNumber,
      amount: opts.monthlyPayment,
      due_date: due.toISOString().slice(0, 10),
      status: isPaid ? "PAID" : paymentNumber === opts.paymentsCompleted + 1 && opts.status === "DEFAULTED" ? "OVERDUE" : "SCHEDULED",
      paid_date: isPaid ? due.toISOString().slice(0, 10) : null,
      payment_reference: isPaid ? `PMT-${agreement.agreement_number}-${paymentNumber}` : null,
      provider: isPaid ? "mock-gateway" : null,
    };
  });
  const { error: schedErr } = await supabase.from("payment_schedule").insert(schedule);
  if (schedErr) throw schedErr;

  return agreement;
}

async function main() {
  console.log("Seeding Airdvance demo data...");

  const adminId = await ensureUser("admin@airdvance.demo", "Airdvance Admin", "ADMIN");
  const customerId = await ensureUser("john.doe@airdvance.demo", "John Doe", "CUSTOMER");
  console.log("Users ready:", { adminId, customerId });

  const phones = await seedCatalogue(smartphones);
  const tabs = await seedCatalogue(tablets);
  const laps = await seedCatalogue(laptops);
  console.log("Catalogue seeded.");

  const phoneInventory = await seedInventory(phones[0].productId, "AIR-PH", 8);
  const tabInventory = await seedInventory(tabs[0].productId, "AIR-TB", 4);
  const lapInventory = await seedInventory(laps[0].productId, "AIR-LP", 4);

  // Register device_control rows for all inventory created above.
  const allDevices = [...phoneInventory, ...tabInventory, ...lapInventory];
  await supabase.from("device_control").insert(
    allDevices.map((d) => ({ device_id: d.id, provider: "mock", status: "REGISTERED" })),
  );

  // --- Active agreement, 18/24 payments completed ---
  const activeDevice = phoneInventory[0];
  const activeAgreement = await createAgreement({
    agreementNumber: "AIR-000123",
    customerId,
    productId: phones[0].productId,
    deviceId: activeDevice.id,
    planId: phones[0].plans.find((p) => p.term_months === 24)!.id,
    termMonths: 24,
    monthlyPayment: 599,
    deposit: 0,
    paymentsCompleted: 18,
    status: "ACTIVE",
    ownershipStatus: "NOT_OWNED",
  });
  await allocateDevice(activeDevice.id, activeAgreement.id, customerId, "ACTIVE");
  await supabase.from("device_control").update({ status: "ACTIVE" }).eq("device_id", activeDevice.id);

  // --- Overdue / restricted agreement ---
  const restrictedDevice = tabInventory[0];
  const overdueAgreement = await createAgreement({
    agreementNumber: "AIR-000124",
    customerId,
    productId: tabs[0].productId,
    deviceId: restrictedDevice.id,
    planId: tabs[0].plans[0].id,
    termMonths: 12,
    monthlyPayment: 599,
    deposit: 0,
    paymentsCompleted: 5,
    status: "DEFAULTED",
    ownershipStatus: "NOT_OWNED",
  });
  await allocateDevice(restrictedDevice.id, overdueAgreement.id, customerId, "ACTIVE");
  await supabase
    .from("device_control")
    .update({
      status: "RESTRICTED",
      restriction_reason: "Payment overdue by more than 7 days",
      restricted_at: new Date().toISOString(),
      last_command: "restrictDevice",
      last_command_at: new Date().toISOString(),
    })
    .eq("device_id", restrictedDevice.id);

  // --- Completed / owned agreement ---
  const ownedDevice = lapInventory[0];
  const completedAgreement = await createAgreement({
    agreementNumber: "AIR-000100",
    customerId,
    productId: laps[0].productId,
    deviceId: ownedDevice.id,
    planId: laps[0].plans[0].id,
    termMonths: 12,
    monthlyPayment: 1199,
    deposit: 0,
    paymentsCompleted: 12,
    status: "COMPLETED",
    ownershipStatus: "OWNED",
  });
  await allocateDevice(ownedDevice.id, completedAgreement.id, customerId, "OWNED");
  await supabase.from("device_control").update({ status: "RELEASED" }).eq("device_id", ownedDevice.id);

  // --- A pending application awaiting admin review ---
  await supabase.from("applications").insert({
    customer_id: customerId,
    product_id: phones[1].productId,
    rental_plan_id: phones[1].plans[0].id,
    status: "UNDER_REVIEW",
    personal_info: {
      full_name: "John Doe",
      id_number: "9001015800086",
      date_of_birth: "1990-01-01",
      mobile: "+27 82 000 0000",
      email: "john.doe@airdvance.demo",
    },
    address: { residential: "12 Main Road, Johannesburg", postal: "12 Main Road, Johannesburg" },
    employment: { status: "Employed", employer: "Acme Logistics", monthly_income: 18500 },
    documents: [],
    consent_accepted: true,
    submitted_at: new Date().toISOString(),
  });

  console.log("Seed complete.");
  console.log("Demo admin login: admin@airdvance.demo / Airdvance!Demo123");
  console.log("Demo customer login: john.doe@airdvance.demo / Airdvance!Demo123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
