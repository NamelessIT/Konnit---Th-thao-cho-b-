import { describe, expect, it } from "vitest";
import { CMS_COMPONENT_CONFIG, cmsFieldsForStyle } from "@konnit/types";

describe("cmsFieldsForStyle", () => {
  it("uses photos instead of the legacy image fields for image_text style_5", () => {
    const fields = cmsFieldsForStyle(
      "image_text",
      "style_5",
      CMS_COMPONENT_CONFIG.image_text.fields,
    );

    expect(fields).toContain("photos");
    expect(fields).not.toContain("image");
    expect(fields).not.toContain("imagePosition");
  });

  it("keeps the single image field for other image_text styles", () => {
    const fields = cmsFieldsForStyle(
      "image_text",
      "style_1",
      CMS_COMPONENT_CONFIG.image_text.fields,
    );

    expect(fields).toContain("image");
    expect(fields).not.toContain("photos");
  });
});
