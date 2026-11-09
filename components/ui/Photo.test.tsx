// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { Photo } from "./Photo";

afterEach(cleanup);

describe("Photo", () => {
  test("without a file, shows a labelled placeholder exposed as an image", () => {
    render(<Photo photo={{ alt: "A couple holding hands", label: "Couple at golden hour" }} />);

    const placeholder = screen.getByRole("img", { name: "A couple holding hands" });
    expect(placeholder.dataset.photoPlaceholder).toBe("true");
    expect(placeholder.textContent).toContain("Couple at golden hour");
  });

  test("a decorative placeholder (empty alt) is hidden from assistive tech", () => {
    const { container } = render(<Photo photo={{ alt: "", label: "Table setting" }} />);

    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector('[data-photo-placeholder="true"]')?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  test("with a file, renders an optimised <img> with alt text", () => {
    render(
      <Photo
        photo={{ src: "/images/hero.jpg", width: 2400, height: 1600, alt: "Guests dancing", label: "x" }}
        sizes="100vw"
      />,
    );

    const img = screen.getByRole("img", { name: "Guests dancing" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.getAttribute("srcset")).toContain("/_next/image?url=%2Fimages%2Fhero.jpg");
    expect(img.getAttribute("sizes")).toBe("100vw");
    expect(img.getAttribute("loading")).toBe("lazy");
  });

  test("priority photos load eagerly with high fetch priority", () => {
    render(
      <Photo
        photo={{ src: "/images/hero.jpg", width: 2400, height: 1600, alt: "Hero", label: "x" }}
        sizes="100vw"
        priority
      />,
    );

    const img = screen.getByRole("img", { name: "Hero" });
    expect(img.getAttribute("loading")).not.toBe("lazy");
    expect(img.getAttribute("fetchpriority")).toBe("high");
  });

  test("adds the dark overlay only when asked, so white text stays readable", () => {
    const { container, rerender } = render(<Photo photo={{ alt: "", label: "x" }} />);
    expect(container.querySelector("[data-photo-overlay]")).toBeNull();

    rerender(<Photo photo={{ alt: "", label: "x" }} overlay />);
    expect(container.querySelector("[data-photo-overlay]")?.getAttribute("aria-hidden")).toBe("true");
  });
});
