"use client"

/**
 * Light and dark, with light as the default for everyone.
 *
 * The whole state is one attribute on <html>: data-theme. CSS reads it for the
 * tokens and for which glyph shows, so this component holds no react state and
 * nothing flickers on hydration. The inline script in app/layout.tsx applies a
 * remembered choice before first paint; this only writes it.
 */
export const THEME_KEY = "theme"

export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === "dark" ? "light" : "dark"
    root.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* private browsing: the choice just lasts for this page */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="switch between light and dark"
      title="light / dark"
      className="ml-auto -my-1 shrink-0 cursor-pointer p-1 text-muted transition-colors hover:text-fg"
    >
      {/* moon: shown in light mode, because it is what you get if you press */}
      <svg
        className="theme-icon-moon"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
      </svg>
      {/* sun: shown in dark mode */}
      <svg
        className="theme-icon-sun"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
    </button>
  )
}
