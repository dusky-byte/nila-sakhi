import { NextResponse } from "next/server";
import type { ScreenTimeConfig } from "@/lib/nila/types";

export async function GET() {
  const config: ScreenTimeConfig = {
    reminderMinutes: parseInt(process.env.SCREEN_TIME_REMINDER_MINUTES ?? "60", 10),
    demoMode:        process.env.SCREEN_TIME_DEMO === "true",
    demoMinutes:     parseInt(process.env.SCREEN_TIME_DEMO_MINUTES ?? "2", 10),
  };
  return NextResponse.json(config);
}
