import { NextRequest, NextResponse } from "next/server";
import { zipPrefixToZone, stateNames } from "@/lib/zip-zone-data";

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid ZIP code" }, { status: 400 });
  }

  const prefix = zip.slice(0, 3);
  const info = zipPrefixToZone[prefix];

  if (!info) {
    return NextResponse.json(
      { error: "Zone not found for this ZIP" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    zip,
    state: info.state,
    stateName: stateNames[info.state] ?? info.state,
    zone: info.zone,
  });
}
