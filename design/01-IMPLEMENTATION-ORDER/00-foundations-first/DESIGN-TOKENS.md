# CareerScope Design Tokens — Implementation Contract
Use the approved CareerScope brand palette as the source of truth:
Navy #0B1F44; Primary #2563EB; Light Blue #3B82F6; Background #EAF2FF;
Success #10B981; Warning #F59E0B; Error #EF4444. Typography: Inter.

Define semantic tokens rather than scattering raw values. Maintain documented spacing, radius,
shadow, z-index and motion scales in code. Generated boards may contain illustrative token values;
they do not override the canonical brand values above.

Responsive targets: desktop reference around 1440px; sensible 1280 reflow; tablet and mobile
must reflow rather than horizontally scroll. Sidebar becomes collapsible/drawer/bottom navigation
as appropriate. Respect reduced-motion preferences.
