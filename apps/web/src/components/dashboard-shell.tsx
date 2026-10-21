'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  Bookmark,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Library,
  LogOut,
  Moon,
  Mountain,
  Search,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';
import BrandLogo from './brand-logo';
import { api } from '@/lib/api';
import styles from './dashboard-shell.module.css';

type NotificationItem = {
  id: string;
  leadId: string;
  createdAt: string;
  readAt: string | null;
};

function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const result = await api<{ items: NotificationItem[]; unreadCount: number }>(
        '/notifications',
      );
      setError(false);
      setItems(result.items);
      setUnreadCount(result.unreadCount);
      setLoaded(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadNotifications(), 0);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadNotifications();
    };
    const refreshInterval = window.setInterval(refreshWhenVisible, 30_000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [loadNotifications]);

  async function markRead(id: string) {
    try {
      await api(`/notifications/${id}/read`, { method: 'PUT' });
      await loadNotifications();
    } catch {
      setError(true);
    }
  }

  return (
    <details
      className={styles.notificationControl}
      onToggle={(event) => {
        if (event.currentTarget.open) void loadNotifications();
      }}
    >
      <summary
        className={styles.iconButton}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        title="Notifications"
      >
        <Bell size={17} aria-hidden="true" />
        {unreadCount > 0 && <span className={styles.notificationCount}>{unreadCount}</span>}
      </summary>
      <section className={styles.notificationPanel} aria-label="Notifications">
        <h2>Notifications</h2>
        <p className={styles.notificationPrivacy}>
          Interview reminders appear here. No interview details are included in the alert.
        </p>
        <div aria-live="polite" aria-busy={loading}>
          {loading && <p role="status">Loading notifications…</p>}
          {!loading && error && (
            <div role="alert">
              <p>Notifications could not be loaded.</p>
              <button type="button" onClick={() => void loadNotifications(true)}>
                Retry
              </button>
            </div>
          )}
          {!loading && !error && loaded && items.length === 0 && <p>No interview reminders yet.</p>}
          {!loading && !error && items.length > 0 && (
            <ul className={styles.notificationList}>
              {items.map((item) => (
                <li key={item.id} data-read={item.readAt !== null}>
                  <span>You have an upcoming interview round.</span>
                  <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                  <div>
                    <Link href={`/saved?lead=${encodeURIComponent(item.leadId)}`}>
                      Open application
                    </Link>
                    {item.readAt === null && (
                      <button type="button" onClick={() => void markRead(item.id)}>
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </details>
  );
}

// Every entry here was seen consistently across the approved design handoff
// under design/, in this order, plus "Preparation" (real existing
// functionality with no design mockup and no exact match to any design nav
// label — added as its own honestly-labelled item rather than folded into
// "Skills", which is a distinct, still-unbuilt concept). `href: null` marks a
// nav item the design shows but that has no real destination in CareerScope
// today — rendered disabled with a "Not yet available" tag rather than as a
// dead or fake-functional link. Every other entry is now a real, dedicated
// Next.js route (CS-6) rather than a `?view=` deep-link into one shared page
// — a label must reach the screen it names. See
// docs/FRONTEND-ADMIN-ROADMAP.md for the full per-item disposition.
// "Preparation" is placed last, after every item the design mockups show,
// rather than inserted in the middle — inserting it earlier would shift
// every item below it down by one row and out of the position the design
// puts it at, for a page the design never depicted in the first place.
const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'jobs', label: 'Jobs', icon: Search, href: '/jobs' },
  { key: 'applications', label: 'Applications', icon: ClipboardList, href: '/applications' },
  { key: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
  { key: 'resume', label: 'Resume', icon: FileText, href: '/resume' },
  { key: 'skills', label: 'Skills', icon: TrendingUp, href: null },
  { key: 'insights', label: 'Insights', icon: TrendingUp, href: null },
  { key: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, href: null },
  { key: 'career-resources', label: 'Career Resources', icon: Library, href: '/career-resources' },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  { key: 'preparation', label: 'Preparation', icon: ClipboardCheck, href: '/preparation' },
] as const;
export type NavKey = (typeof navItems)[number]['key'];

// Derives the active sidebar item straight from the URL — the single place
// that mapping lives, rather than each page passing its own `active` literal
// (which drifts the moment a route is renamed and nothing catches it).
export function navKeyForPath(pathname: string): NavKey {
  const match = navItems.find((item) => item.href === pathname);
  return match?.key ?? 'dashboard';
}

// A real initials avatar derived from the signed-in owner's own verified contact
// (never a fabricated photo/portrait of anyone) — ChatGPT-reviewed choice,
// 2026-09-23, for the avatar position both the sidebar footer and topbar
// show in the owner-supplied design. Falls back to a generic mark when the
// identity genuinely isn't available yet (still loading, or none returned).
function initialsFrom(identity: string | undefined) {
  if (!identity) return '·';
  const local = identity.split('@')[0] ?? identity;
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0]![0]}${parts[1]![0]}` : local.slice(0, 2);
  return letters.toUpperCase();
}

function InitialsAvatar({ identity }: { identity: string | undefined }) {
  return (
    <span className={styles.avatar} aria-hidden="true" title={identity ?? 'Signed in'}>
      {initialsFrom(identity)}
    </span>
  );
}

export function DashboardSidebar({
  active,
  identity,
}: {
  active: (typeof navItems)[number]['key'];
  identity?: string;
}) {
  return (
    <nav className={styles.sidebar} aria-label="CareerScope">
      <div className={styles.brandRow}>
        <BrandLogo compact />
        <div>
          <div className={styles.brandTagline}>Discover · Prepare · Grow</div>
        </div>
      </div>
      <div className={styles.nav}>
        {navItems.map(({ key, label, icon: Icon, href }) =>
          href ? (
            <Link
              key={key}
              href={href}
              tabIndex={0}
              className={styles.navItem}
              aria-current={key === active ? 'page' : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ) : (
            <span
              key={key}
              className={styles.navItemDisabled}
              aria-disabled="true"
              title="Not yet available in CareerScope"
            >
              <Icon size={16} aria-hidden="true" />
              {label}
              <span className={styles.navSoon}>Soon</span>
            </span>
          ),
        )}
      </div>
      {/* Purely decorative motivational copy — not a data claim, so it stays
          even though CareerScope has no billing/plan concept to attach it to
          (the design's "Upgrade Plan" button is deliberately not reproduced;
          single-owner apps have nothing to upgrade to). */}
      <div className={styles.sidebarIllustration}>
        <Mountain size={28} aria-hidden="true" />
        <strong>Small Steps, Big Opportunities</strong>
        <p>Your next chapter is closer than you think.</p>
      </div>
      <div className={styles.sidebarAccount}>
        <InitialsAvatar identity={identity} />
        <div>
          <div className={styles.sidebarAccountEmail}>{identity ?? 'Signed in'}</div>
          <div className={styles.sidebarFooter}>Private, single-owner workspace.</div>
        </div>
      </div>
    </nav>
  );
}

// Below 768px the sidebar is hidden entirely (design shows a bottom tab bar
// on its mobile variants, but only for the 4-5 items each specific screen
// chose to surface there — there is no single mobile nav mockup covering
// every sidebar item). This strip reuses the exact same nav data instead of
// inventing a distinct mobile taxonomy, so every item the desktop sidebar
// can reach, the mobile view can reach too — never fewer capabilities on
// the narrower viewport.
export function DashboardMobileNav({ active }: { active: (typeof navItems)[number]['key'] }) {
  return (
    <nav className={styles.mobileNav} aria-label="CareerScope, compact">
      {navItems.map(({ key, label, icon: Icon, href }) =>
        href ? (
          <Link
            key={key}
            href={href}
            className={styles.mobileNavItem}
            aria-current={key === active ? 'page' : undefined}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </Link>
        ) : (
          <span
            key={key}
            className={styles.mobileNavItemDisabled}
            aria-disabled="true"
            title="Not yet available in CareerScope"
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </span>
        ),
      )}
    </nav>
  );
}

export function DashboardTopbar({
  theme,
  onToggleTheme,
  identity,
  onSignOut,
  signOutPending,
}: {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  identity?: string;
  onSignOut: () => void;
  signOutPending: boolean;
}) {
  return (
    <header className={styles.topbar}>
      {/* Links into the real, existing search workspace rather than an
          instant-search box with nothing behind it: CareerScope has no
          cross-entity search endpoint today, so a functional-looking
          search field here would be a UI element that does nothing. */}
      <Link href="/jobs" className={styles.topbarSearch}>
        <Search size={15} aria-hidden="true" />
        <span>Search jobs in your workspace</span>
      </Link>
      <div className={styles.topbarActions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onSignOut}
          disabled={signOutPending}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
        <NotificationCenter key={identity ?? 'signed-in'} />
        <InitialsAvatar identity={identity} />
      </div>
    </header>
  );
}
