import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Path riêng tư giờ có prefix locale (/vi/..., /en/...) → dùng wildcard segment.
      disallow: [
        "/admin/",
        "/api/",
        "/*/tai-khoan/",
        "/*/don-hang/",
        "/*/thanh-toan",
        "/*/gio-hang",
        "/*/dang-nhap",
        "/*/dang-ky",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
