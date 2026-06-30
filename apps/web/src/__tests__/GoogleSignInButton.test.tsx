import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("next/script", () => ({
  default: () => null,
}));

describe("GoogleSignInButton client navigation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "test-client-id");
  });

  it("renders again after the login page unmounts and remounts", async () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    Object.defineProperty(window, "google", {
      configurable: true,
      value: {
        accounts: {
          id: { initialize, renderButton },
        },
      },
    });
    const { GoogleSignInButton } = await import(
      "@/components/auth/GoogleSignInButton"
    );

    const firstPage = render(<GoogleSignInButton />);
    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(1));
    firstPage.unmount();

    render(<GoogleSignInButton />);
    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(2));
    expect(initialize).toHaveBeenCalledTimes(2);
  });
});
