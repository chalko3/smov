import { Stream } from "@movie-web/providers";

import { setDomainRule } from "@/backend/extension/messaging";

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url;
  }
}

function extractDomainsFromStream(stream: Stream): string[] {
  if (stream.type === "hls") {
    return [extractDomain(stream.playlist)];
  }
  if (stream.type === "file") {
    return Object.values(stream.qualities).map((v) => extractDomain(v.url));
  }
  return [];
}

function buildHeadersFromStream(stream: Stream): Record<string, string> {
  const headers: Record<string, string> = {};
  Object.entries(stream.headers ?? {}).forEach((entry) => {
    headers[entry[0]] = entry[1];
  });
  Object.entries(stream.preferredHeaders ?? {}).forEach((entry) => {
    headers[entry[0]] = entry[1];
  });
  return headers;
}

export async function prepareStream(stream: Stream) {
  await setDomainRule({
    ruleId: 1,
    targetDomains: extractDomainsFromStream(stream),
    requestHeaders: buildHeadersFromStream(stream),
  });
}
