import { NextRequest, NextResponse } from "next/server";
import { extensionSources, knownPdfUrls } from "@/data/extension-sources";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { state, grassType } = body as { state?: string; grassType?: string };

  if (!state || !grassType) {
    return NextResponse.json(
      { error: "state and grassType are required" },
      { status: 400 }
    );
  }

  const stateUpper = state.toUpperCase();
  const source = extensionSources[stateUpper];

  if (!source) {
    return NextResponse.json(
      { error: `No extension source found for state: ${state}` },
      { status: 404 }
    );
  }

  // Check known PDF URLs first
  const knownKey = `${stateUpper}_${grassType}`;
  if (knownPdfUrls[knownKey]) {
    return NextResponse.json({
      pdfUrl: knownPdfUrls[knownKey],
      source: source.universityName,
    });
  }

  // Build search URL and return it as the best guess
  const query = encodeURIComponent(`${grassType} lawn care maintenance`);
  const searchUrl = `${source.searchUrl}${query}`;

  return NextResponse.json({
    pdfUrl: searchUrl,
    source: source.universityName,
    fallback: true,
  });
}
