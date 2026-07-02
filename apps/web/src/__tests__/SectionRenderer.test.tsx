import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageTextStyle5 } from "@/components/cms-sections/ImageTextSection/ImageTextStyle5";

describe("ImageTextStyle5", () => {
  it("renders at most three media photos in order", () => {
    const { container } = render(
      <ImageTextStyle5
        contentJson={{
          photos: ["/one.jpg", "/two.jpg", "/three.jpg", "/four.jpg"],
        }}
      />,
    );

    const images = [...container.querySelectorAll("img")];
    expect(images).toHaveLength(3);
    expect(images.map((image) => image.getAttribute("src"))).toEqual([
      "/one.jpg",
      "/two.jpg",
      "/three.jpg",
    ]);
  });

  it("falls back to the legacy image field", () => {
    const { container } = render(
      <ImageTextStyle5 contentJson={{ image: "/legacy.jpg" }} />,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "/legacy.jpg");
  });
});
