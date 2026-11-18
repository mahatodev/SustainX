import crypto from "crypto";
import { prisma } from "./prisma";

export function computeSha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function computeHmacSha256(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function checkQrReplay(nonceHash: string): Promise<boolean> {
  const existing = await prisma.greenAction.findUnique({
    where: { qrNonceHash: nonceHash },
  });
  return !!existing;
}

export async function checkPHashCollision(pHash: string): Promise<{ isCollision: boolean; collidingActionId?: string }> {
  // Exact match or direct query
  const existing = await prisma.greenAction.findUnique({
    where: { pHash },
  });
  if (existing) {
    return { isCollision: true, collidingActionId: existing.id };
  }
  return { isCollision: false };
}
