import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

let state;
const setCrossfade = vi.fn();
const setWifiOnly = vi.fn();
vi.mock("../hooks/usePlayer", () => ({ usePlayer: () => ({ ...state, setCrossfade, setWifiOnly }) }));
import CrossfadeMenu from "../components/player/CrossfadeMenu";
afterEach(() => { cleanup(); vi.clearAllMocks(); });

test("hidden where crossfade is unsupported", () => {
  state = { crossfade: 0, crossfadeSupported: false };
  const { container } = render(<CrossfadeMenu />);
  expect(container.innerHTML).toBe("");
});
test("shows the current value, lists the options, and saves the pick", () => {
  state = { crossfade: 6, crossfadeSupported: true };
  render(<CrossfadeMenu />);
  const btn = screen.getByRole("button", { name: "Crossfade: 6 seconds" });
  expect(btn.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(btn);
  expect(screen.getAllByRole("menuitemradio").map((e) => e.textContent)).toEqual(["Off", "3 seconds", "6 seconds", "9 seconds", "12 seconds"]);
  expect(screen.getByRole("menuitemradio", { name: "6 seconds" }).getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByRole("menuitemradio", { name: "9 seconds" }));
  expect(setCrossfade).toHaveBeenCalledWith(9);
  expect(screen.queryByRole("menu")).toBeNull();
});
test("Wi-Fi-only preload checkbox reflects and flips the setting", () => {
  state = { crossfade: 0, crossfadeSupported: true, wifiOnly: false };
  render(<CrossfadeMenu />);
  fireEvent.click(screen.getByRole("button", { name: "Crossfade: Off" }));
  const box = screen.getByRole("menuitemcheckbox", { name: /Preload only on Wi-Fi/ });
  expect(box.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(box);
  expect(setWifiOnly).toHaveBeenCalledWith(true);
});
