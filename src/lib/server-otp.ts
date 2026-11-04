import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export type OtpRecord = {
  code: string;
  expires_at: number;
  name?: string;
  is_vendor?: boolean;
  hashed_password?: string;
  password?: string;
  phone_number?: string;
  category?: string;
  upi_id?: string;
  photo_url?: string;
  document_url?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  is_shop_owner: boolean;
  email_verified: boolean;
  phone_number?: string;
  password_hash?: string;
  created_at: string;
};

export type StoredShop = {
  id: string;
  owner_id: string;
  name: string;
  category?: string;
  owner_name?: string | null;
  owner_email?: string | null;
  owner_phone?: string | null;
  phone_number?: string;
  address: string;
  latitude: number;
  longitude: number;
  upi_id?: string | null;
  photo_url?: string | null;
  document_url?: string | null;
  verification_document_url?: string | null;
  verification_document_name?: string | null;
  approval_status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  approval_reason?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  is_active: boolean;
  location_verified: boolean;
  location_verified_at?: string | null;
  created_at?: string;
};

// Path for serverless file storage in /tmp
const STORAGE_FILE = path.join(
  process.env.TEMP || process.env.TMP || "/tmp",
  "expirygo_serverless_store.json"
);

interface StoreData {
  otps: Record<string, OtpRecord>;
  users: Record<string, StoredUser>;
  shops: Record<string, StoredShop>;
  products: any[];
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read store file:", err);
  }
  return { otps: {}, users: {}, shops: {}, products: [] };
}

function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write store file:", err);
  }
}

// In-memory global store to share between function invocations
const globalStore: StoreData = (global as any).__EXPIRYGO_DATA_STORE || loadStore();
(global as any).__EXPIRYGO_DATA_STORE = globalStore;

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export function saveOtp(
  email: string,
  code: string,
  extra?: Partial<OtpRecord>
): void {
  const clean = email.trim().toLowerCase();
  globalStore.otps[clean] = {
    code: code.trim(),
    expires_at: Date.now() + 10 * 60 * 1000, // 10 minutes
    name: extra?.name,
    is_vendor: extra?.is_vendor,
    hashed_password: extra?.hashed_password || extra?.password,
    phone_number: extra?.phone_number,
    category: extra?.category,
    upi_id: extra?.upi_id,
    photo_url: extra?.photo_url,
    document_url: extra?.document_url,
    address: extra?.address,
    latitude: extra?.latitude,
    longitude: extra?.longitude,
  };
  saveStore(globalStore);
}

export function verifyOtpCode(email: string, code: string): { valid: boolean; record?: OtpRecord } {
  const clean = email.trim().toLowerCase();
  const cleanCode = code.trim();

  const record = globalStore.otps[clean];
  if (!record) {
    return { valid: false };
  }

  if (Date.now() > record.expires_at) {
    delete globalStore.otps[clean];
    saveStore(globalStore);
    return { valid: false };
  }

  // Exact OTP match only
  if (record.code === cleanCode) {
    delete globalStore.otps[clean];
    saveStore(globalStore);
    return { valid: true, record };
  }

  return { valid: false };
}

export function saveUser(user: StoredUser): void {
  globalStore.users[user.email.toLowerCase()] = user;
  saveStore(globalStore);
}

export function getUser(email: string): StoredUser | undefined {
  return globalStore.users[email.trim().toLowerCase()];
}

export function getUserById(id: string): StoredUser | undefined {
  return Object.values(globalStore.users).find((u) => u.id === id);
}

export function getAllUsers(): StoredUser[] {
  return Object.values(globalStore.users);
}

export function saveShop(shop: StoredShop): void {
  globalStore.shops[shop.id] = shop;
  saveStore(globalStore);
}

export function getShopById(id: string): StoredShop | undefined {
  return (
    globalStore.shops[id] ||
    Object.values(globalStore.shops).find((s) => s.id === id || s.owner_id === id)
  );
}

export function getShopByOwnerId(ownerId: string): StoredShop | undefined {
  return Object.values(globalStore.shops).find((s) => s.owner_id === ownerId);
}

export function getAllShops(): StoredShop[] {
  return Object.values(globalStore.shops);
}

export function deleteShop(id: string): void {
  delete globalStore.shops[id];
  saveStore(globalStore);
}

export function getAllProducts(): any[] {
  return globalStore.products || [];
}

export function addProduct(prod: any): void {
  if (!globalStore.products) globalStore.products = [];
  globalStore.products.push(prod);
  saveStore(globalStore);
}

export function createToken(userId: string, role: string = "CUSTOMER"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  ).toString("base64url");
  const secret = process.env.JWT_SECRET_KEY || "expirygo_jwt_secret_key_production";
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const secret = process.env.JWT_SECRET_KEY || "expirygo_jwt_secret_key_production";
    const expectedSig = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (decoded.exp && Date.now() / 1000 > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function sendSmtpOtp(email: string, code: string, name?: string): Promise<boolean> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || process.env.SMTP_USERNAME || "devpant2006@gmail.com";
  const pass = process.env.SMTP_PASSWORD || "emetdeljxehsoyau";

  console.log(`[SMTP DISPATCH] Sending 6-digit OTP to ${email} via ${host}:${port}`);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 28px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🌱 Meeva / ExpiryGo</h1>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Secure Account Verification</p>
    </div>
    <div style="padding: 28px;">
      <p style="font-size: 15px; font-weight: 600; margin-top: 0;">Hello ${name || "Valued User"},</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">Use the following 6-digit verification code to complete your registration or login:</p>
      <div style="background: #faf5ff; border: 2px dashed #d8b4fe; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #7c3aed;">${code}</span>
      </div>
      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">This code is valid for 10 minutes and is single-use only. Never share this code with anyone.</p>
    </div>
    <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      &copy; Meeva Surplus Marketplace. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Meeva" <${user}>`,
      to: email,
      subject: `🔐 Your Meeva Verification Code: ${code}`,
      text: `Your verification code is: ${code}. Valid for 10 minutes.`,
      html,
    });

    console.log(`[SMTP DISPATCH] Successfully sent email to ${email}`);
    return true;
  } catch (err: any) {
    console.error(`[SMTP ERROR] Could not deliver to ${email}:`, err.message);
    throw new Error(`Failed to deliver OTP email via SMTP: ${err.message}`);
  }
}
