import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MediaPickerDialog } from "@/components/cms/MediaPickerDialog";

vi.mock("@/hooks/useCmsData", () => ({
  useFetch: () => ({
    data: [
      { id: 1, original_name: "one.jpg", mime_type: "image/jpeg", path: "uploads/one.jpg" },
      { id: 2, original_name: "two.jpg", mime_type: "image/jpeg", path: "uploads/two.jpg" },
      { id: 3, original_name: "notes.pdf", mime_type: "application/pdf", path: "uploads/notes.pdf" },
    ],
    loading: false,
  }),
}));

describe("MediaPickerDialog", () => {
  it("keeps the existing single-select behavior", () => {
    const onSelect = vi.fn();
    render(<MediaPickerDialog onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Chọn từ Media" }));
    fireEvent.click(screen.getByRole("button", { name: /one\.jpg/ }));

    expect(onSelect).toHaveBeenCalledWith("http://localhost:4000/uploads/one.jpg");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles multiple images and confirms once", () => {
    const onSelectMultiple = vi.fn();
    render(
      <MediaPickerDialog
        multiple
        selectedUrls={["http://localhost:4000/uploads/one.jpg"]}
        onSelectMultiple={onSelectMultiple}
        maxSelections={2}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Chọn từ Media" }));
    expect(screen.getByRole("button", { name: /one\.jpg/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("button", { name: /notes\.pdf/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /two\.jpg/ }));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận (2)" }));

    expect(onSelectMultiple).toHaveBeenCalledWith([
      "http://localhost:4000/uploads/one.jpg",
      "http://localhost:4000/uploads/two.jpg",
    ]);
  });
});
