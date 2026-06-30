import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const LEGACY_FILES = ["index.html", "services.html", "community.html", "store.html"] as const;
const ROUTE_BY_FILE: Record<(typeof LEGACY_FILES)[number], string> = {
  "index.html": "/",
  "services.html": "/services",
  "community.html": "/community",
  "store.html": "/store",
};
const FILE_BY_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_BY_FILE).map(([file, route]) => [route, file]),
) as Record<string, (typeof LEGACY_FILES)[number]>;

const workspaceRoot = resolve(__dirname, "../../../..");

function loadDocument(root: "static-legacy" | "apps/web/public/legacy", file: string) {
  return new DOMParser().parseFromString(
    readFileSync(resolve(workspaceRoot, root, file), "utf8"),
    "text/html",
  );
}

function canonicalHref(href: string, currentFile: (typeof LEGACY_FILES)[number]) {
  if (/^(mailto:|tel:|https?:\/\/)/.test(href)) return href;

  const currentRoute = ROUTE_BY_FILE[currentFile];
  if (href.startsWith("#")) return `${currentRoute}${href}`;

  const match = href.match(/^(?:\.\/|\/legacy\/)?([^#]+?)(?:\.html)?(#[^#]+)?$/);
  if (!match) return href;

  const fileOrRoute = match[1];
  const hash = match[2] ?? "";
  if (fileOrRoute === "index") return `/${hash}`;
  if (fileOrRoute === "services") return `/services${hash}`;
  if (fileOrRoute === "community") return `/community${hash}`;
  if (fileOrRoute === "store") return `/store${hash}`;
  return href;
}

function linkSignatures(
  document: Document,
  currentFile: (typeof LEGACY_FILES)[number],
) {
  return new Set(
    [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map((link) => {
      const label = link.textContent?.replace(/\s+/g, " ").trim() ?? "";
      return `${label}|${canonicalHref(link.getAttribute("href") ?? "", currentFile)}`;
    }),
  );
}

describe("legacy link mapping", () => {
  it.each(LEGACY_FILES)("%s keeps every meaningful source link after normalization", (file) => {
    const sourceLinks = linkSignatures(loadDocument("static-legacy", file), file);
    const publicLinks = linkSignatures(loadDocument("apps/web/public/legacy", file), file);

    for (const signature of sourceLinks) {
      expect(publicLinks, `missing normalized legacy link: ${signature}`).toContain(
        signature,
      );
    }
  });

  it.each(LEGACY_FILES)("%s has no obsolete .html or /legacy page href", (file) => {
    const document = loadDocument("apps/web/public/legacy", file);
    for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const href = link.getAttribute("href") ?? "";
      expect(href).not.toMatch(/\.html(?:#|$)/);
      expect(href).not.toMatch(/^\/legacy\//);
    }
  });

  it.each(LEGACY_FILES)("%s only links to anchors that exist", (file) => {
    const document = loadDocument("apps/web/public/legacy", file);
    for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const canonical = canonicalHref(link.getAttribute("href") ?? "", file);
      const hashIndex = canonical.indexOf("#");
      if (hashIndex < 0) continue;

      const route = canonical.slice(0, hashIndex);
      const targetFile = FILE_BY_ROUTE[route];
      if (!targetFile) continue;

      const anchorId = decodeURIComponent(canonical.slice(hashIndex + 1));
      const targetDocument = loadDocument("apps/web/public/legacy", targetFile);
      expect(
        targetDocument.getElementById(anchorId),
        `${canonical} from ${file} has no destination`,
      ).not.toBeNull();
    }
  });
});
