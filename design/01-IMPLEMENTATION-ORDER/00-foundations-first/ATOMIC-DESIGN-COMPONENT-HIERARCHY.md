# CareerScope Atomic Design / Component Build Order

Build shared primitives BEFORE page implementation. Pages must compose these components rather than
introduce one-off styles.

## 1. Tokens
Colors, typography, spacing, radius, shadows, z-index, breakpoints, motion, icon sizing.

## 2. Atoms
Logo/brand mark usage, Icon, Avatar, Badge, Button, IconButton, Link, Label, Text,
Heading, Divider, Spinner/Loader, Skeleton primitive, Checkbox, Radio, Switch,
Input, Textarea, Select trigger, Tooltip, Progress, StatusDot.

Required states: default, hover, focus-visible, active, disabled, loading, success,
warning, error, destructive where applicable.

## 3. Molecules
SearchInput, Combobox, FormField, PasswordField, OTPField, Date/Time control,
FileUpload, FilterChip, Pagination, Breadcrumbs, Tabs, Toast, Alert, EmptyState,
ErrorState, MetricCard, JobCard, CandidateCard, ProviderStatus, ConsentRow,
PermissionRow, ConfirmationDialog, DropdownMenu.

## 4. Organisms
AppHeader, PublicHeader, Sidebar, MobileNavigation, FilterPanel, DataTable,
JobList, JobDetailsPanel, ApplicationTimeline, ResumePanel, NotificationCenter,
CommandPalette, Modal/Drawer, CMS editor shell, ChartCard, LogsViewer,
ServerHealthPanel, IntegrationProviderPanel, AuditTable.

## 5. Templates
Public marketing, Auth, Onboarding, Candidate app shell, Recruiter shell,
Admin shell, Full-screen system state, Mobile shell.

## 6. Pages
Only after the preceding layers are stable. Every page must reuse the same tokens/components.

## Shared system assets
Use the approved CareerScope logo/brand reference and the global loader system consistently.
Do not invent alternate logos, loader styles, icon families, colors, shadows or spacing systems.
