import { createHash } from 'node:crypto';
import { TICKET_STATUSES } from './ticket-workflow.mjs';

// Only explicitly named independent reviewers may issue whole-spec receipts.
// The original reviewer remains valid; the active remediation wave also uses
// the bounded read-only reviewer that produced the current receipts.
const WHOLE_SPEC_REVIEWERS = new Set(['/root/phase325_review', '/root/cs78_review']);

export const SECTIONS = Object.freeze([
  'identity',
  'problem',
  'value',
  'currentState',
  'desiredOutcome',
  'inScope',
  'outOfScope',
  'functionalRequirements',
  'nonFunctionalRequirements',
  'technicalApproach',
  'persistence',
  'apiContract',
  'design',
  'sharedComponents',
  'accessibility',
  'responsive',
  'browsers',
  'seo',
  'securityPrivacy',
  'observability',
  'testStrategy',
  'visualRegression',
  'acceptanceCriteria',
  'definitionOfDone',
  'completionEvidence',
  'implementationChecklist',
  'dependencies',
  'manualExternalGates',
  'risksRecovery',
  'delivery',
]);
export const VERIFICATION_TYPES = Object.freeze([
  'AUTOMATED_UNIT',
  'AUTOMATED_INTEGRATION',
  'AUTOMATED_CONTRACT',
  'AUTOMATED_COMPONENT',
  'AUTOMATED_BROWSER',
  'AUTOMATED_ACCESSIBILITY',
  'AUTOMATED_SECURITY',
  'VISUAL_REGRESSION',
  'MANUAL_ACCESSIBILITY',
  'MANUAL_PRODUCT',
  'MANUAL_OPERATOR',
  'HOSTED_CI',
  'LIVE_HOST',
  'EXTERNAL_PROVIDER',
  'PRODUCTION_SMOKE',
]);
export const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const bindingDigest = (bindings) =>
  digest(bindings.map(({ reviewStatus: _reviewStatus, ...binding }) => binding));
export const specificationDigest = (specification) =>
  digest({
    ticketId: specification.ticketId,
    primaryEpicId: specification.primaryEpicId,
    gaps: specification.gaps,
    sections: specification.sections,
  });
const present = (requirements, sources) => ({ applicability: 'APPLICABLE', requirements, sources });
const na = (reason) => ({ applicability: 'NOT_APPLICABLE', reason });
const group = (items, key) =>
  items.reduce((counts, item) => {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});

export function dependencyGraph(tickets, sequencing = []) {
  const ids = new Set(tickets.map((ticket) => ticket.id));
  const edges = tickets.flatMap((ticket) =>
    ticket.dependencies.map((dependency) => ({
      prerequisite: dependency,
      dependent: ticket.id,
      type: 'HARD',
      source: `.ai/backlog.json#${ticket.id}.dependencies`,
      rationale: 'Declared prerequisite; no dependency was invented or weakened.',
    })),
  );
  const errors = [];
  for (const edge of sequencing) {
    const criterion = tickets.find((ticket) => ticket.id === edge.dependent)?.acceptanceCriteria?.[
      edge.sourceAcIndex
    ];
    if (
      !Number.isInteger(edge.sourceAcIndex) ||
      !criterion?.match(/\bCS-\d+\b/g)?.includes(edge.prerequisite) ||
      !criterion.includes('sequenced after')
    )
      errors.push(`unproven sequencing ${edge.prerequisite}:${edge.dependent}`);
    edges.push({
      prerequisite: edge.prerequisite,
      dependent: edge.dependent,
      type: 'SEQUENCING',
      source: `.ai/backlog.json#${edge.dependent}.acceptanceCriteria[${edge.sourceAcIndex}]`,
      rationale:
        'Explicit ordering in source acceptance criterion; owner prioritization remains a separate manual gate.',
    });
  }
  const seen = new Set();
  for (const edge of edges) {
    if (!ids.has(edge.prerequisite)) errors.push(`dangling dependency ${edge.prerequisite}`);
    if (!ids.has(edge.dependent)) errors.push(`dangling dependent ${edge.dependent}`);
    if (edge.prerequisite === edge.dependent) errors.push(`self dependency ${edge.dependent}`);
    const key = `${edge.prerequisite}:${edge.dependent}`;
    if (seen.has(key)) errors.push(`duplicate dependency ${key}`);
    seen.add(key);
  }
  const remaining = new Set(ids);
  const layers = [];
  while (remaining.size) {
    const ready = [...remaining]
      .filter(
        (id) => !edges.some((edge) => edge.dependent === id && remaining.has(edge.prerequisite)),
      )
      .sort(numericId);
    if (!ready.length) break;
    layers.push(ready);
    for (const id of ready) remaining.delete(id);
  }
  // Report residual cycle membership separately from errors: callers fail closed.
  const cyclicOrCycleDependent = [...remaining].sort(numericId);
  const adjacency = new Map(
    [...ids].map((id) => [
      id,
      edges
        .filter((edge) => edge.prerequisite === id && ids.has(edge.dependent))
        .map((edge) => edge.dependent),
    ]),
  );
  const indexes = new Map();
  const lows = new Map();
  const stack = [];
  const active = new Set();
  const cycles = [];
  let index = 0;
  function visit(id) {
    indexes.set(id, index);
    lows.set(id, index++);
    stack.push(id);
    active.add(id);
    for (const next of adjacency.get(id)) {
      if (!indexes.has(next)) {
        visit(next);
        lows.set(id, Math.min(lows.get(id), lows.get(next)));
      } else if (active.has(next)) lows.set(id, Math.min(lows.get(id), indexes.get(next)));
    }
    if (lows.get(id) === indexes.get(id)) {
      const component = [];
      let member;
      do {
        member = stack.pop();
        active.delete(member);
        component.push(member);
      } while (member !== id);
      if (component.length > 1 || adjacency.get(id).includes(id))
        cycles.push(component.sort(numericId));
    }
  }
  for (const id of ids) if (!indexes.has(id)) visit(id);
  const paths = new Map();
  for (const layer of layers)
    for (const id of layer) {
      const predecessors = edges
        .filter((edge) => edge.dependent === id)
        .map((edge) => paths.get(edge.prerequisite) ?? []);
      predecessors.sort((a, b) => b.length - a.length || numericId(a[0] ?? 'CS-0', b[0] ?? 'CS-0'));
      paths.set(id, [...(predecessors[0] ?? []), id]);
    }
  const longestDeclaredChain =
    [...paths.values()].sort((a, b) => b.length - a.length || numericId(a[0], b[0]))[0] ?? [];
  if (remaining.size)
    errors.push(`cycle or cycle-dependent tickets: ${cyclicOrCycleDependent.join(', ')}`);
  return {
    nodes: [...ids].sort(numericId),
    edges,
    layers,
    cyclicOrCycleDependent,
    cycles,
    longestDeclaredChain,
    errors,
  };
}
export function numericId(a, b) {
  return Number(a.replace('CS-', '')) - Number(b.replace('CS-', ''));
}

export function parseManualActions(text) {
  return [...text.matchAll(/^### (CS-\d+) — ([^\r\n]+)\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm)].map(
    (match) => {
      const field = (label) =>
        new RegExp(`\\*\\*${label}:\\*\\* ([^\\r\\n]+)`).exec(match[3])?.[1] ?? null;
      return {
        ticketId: match[1],
        title: match[2],
        owner: field('Owner'),
        reason: field('Why manual'),
        instructions: field('Safe steps'),
        evidence: field('Pass evidence'),
        recovery: field('Rollback'),
        source: `hostpending.txt#${match[1]}`,
      };
    },
  );
}

function verification(ticket, criterion, index, commands) {
  const types = new Set();
  const text = criterion.toLowerCase();
  if (/owner.confirm|approved|approval|decision|design review/.test(text))
    types.add('MANUAL_PRODUCT');
  if (/screen.reader|nvda|voiceover/.test(text)) types.add('MANUAL_ACCESSIBILITY');
  if (/keyboard|axe|accessible|accessibility/.test(text)) types.add('AUTOMATED_ACCESSIBILITY');
  if (/screenshot|visual|reference|pixel|layout/.test(text)) types.add('VISUAL_REGRESSION');
  if (/browser|chromium|firefox|webkit|mobile|viewport|ui|render/.test(text))
    types.add('AUTOMATED_BROWSER');
  if (/ci|pipeline|workflow/.test(text)) types.add('HOSTED_CI');
  if (/live|host|deployed|production|timer/.test(text)) types.add('LIVE_HOST');
  if (/cognito|otp|sms|provider.*approval|deliverability/.test(text))
    types.add('EXTERNAL_PROVIDER');
  if (/auth|owner|csrf|secret|permission|denial|token|private/.test(text))
    types.add('AUTOMATED_SECURITY');
  if (/database|schema|migration|persist|queue|outbox|worker/.test(text))
    types.add('AUTOMATED_INTEGRATION');
  if (!types.size) types.add('AUTOMATED_CONTRACT');
  return {
    ticketId: ticket.id,
    acId: `${ticket.id}-AC${index + 1}`,
    criterion,
    verification: [...types].map((type) => ({
      type,
      expectedCheck: `${ticket.id}-AC${index + 1}: assert the stated behavior, including denial/malformed/failure cases when the condition permits.`,
      candidateCommand:
        type === 'AUTOMATED_INTEGRATION'
          ? commands.integration
          : ['AUTOMATED_BROWSER', 'AUTOMATED_ACCESSIBILITY', 'VISUAL_REGRESSION'].includes(type)
            ? commands.browser
            : type.startsWith('AUTOMATED')
              ? commands.contract
              : null,
      evidenceRequired: type.startsWith('AUTOMATED')
        ? 'Future test path, named assertion, command, Node >=24, exit status and nonzero pass totals for the reviewed content.'
        : type === 'HOSTED_CI'
          ? 'Future exact-SHA hosted run URL, job/check name and conclusion; a local command is insufficient.'
          : 'Future dated independent observation with declared actor, test condition and result; redacted evidence only.',
      automationStatus: type.startsWith('AUTOMATED')
        ? 'PLANNED_NOT_EXECUTED'
        : 'MANUAL_OR_EXTERNAL_NOT_EXECUTED',
      owner: type.startsWith('AUTOMATED')
        ? 'QA'
        : (ticket.blockedOwner ?? 'Product owner / authorized reviewer'),
    })),
    releaseGate: ticket.releaseState ?? 'SOURCE_RELEASE_ASSIGNMENT_REQUIRES_REVIEW',
    mappingBasis:
      'Suggested verification plan from explicit criterion terms; independent review required; no existing execution is claimed.',
  };
}

export function buildCatalog({ backlog, coverage, designIndex, blockers, manualText, policy }) {
  const tickets = backlog.items;
  const mapped = new Map(coverage.tickets.map((ticket) => [ticket.ticketId, ticket]));
  const blockerMap = new Map(blockers.tickets.map((ticket) => [ticket.ticketId, ticket]));
  const actions = parseManualActions(manualText);
  const graph = dependencyGraph(tickets, policy.sequencingEdges);
  const traceability = [];
  const designTraceability = [];
  const findings = [];
  const specs = tickets.map((ticket) => {
    const designModel = mapped.get(ticket.id);
    const blocker = blockerMap.get(ticket.id);
    const refinement = policy.ticketRefinements?.[ticket.id];
    const processScope = refinement?.processScope;
    const deliveryClassification = refinement?.deliveryClassification;
    const profile = policy.domains[ticket.area] ?? policy.domains.default;
    const epicId =
      ticket.epicId ??
      designModel?.epicId ??
      policy.epicAssignments[ticket.id] ??
      policy.areaEpicMap[ticket.area];
    const ownedScreens = designIndex.entries.filter(
      (entry) =>
        entry.primaryTicketId === ticket.id ||
        entry.childTicketIds?.includes(ticket.id) ||
        entry.crossCuttingTicketIds?.includes(ticket.id),
    );
    const relatedMapping = refinement?.relatedDesignScreenMapping;
    const relatedScreens = relatedMapping
      ? relatedMapping.screenIds
          .map((screenId) => designIndex.entries.find((entry) => entry.designId === screenId))
          .filter(Boolean)
          .map((screen) => ({
            ...screen,
            mappingRelationship: relatedMapping.relationship,
            mappingRationale: relatedMapping.rationale,
          }))
      : [];
    const screens = [
      ...ownedScreens,
      ...relatedScreens.filter(
        (screen) => !ownedScreens.some((owned) => owned.designId === screen.designId),
      ),
    ];
    const refs = [
      ...new Set([
        ...(designModel?.designRefs ?? ticket.designRefs ?? []),
        ...(refinement?.designReferenceAdditions ?? []),
      ]),
    ].sort();
    const ui =
      ticket.area === 'frontend' ||
      screens.length > 0 ||
      ticket.id === 'CS-216' ||
      policy.uiTicketIds.includes(ticket.id) ||
      [
        'EPIC-FOUNDATIONS',
        'EPIC-GLOBAL-UX',
        'EPIC-ACCESSIBILITY-RESPONSIVE',
        'EPIC-VISUAL-REGRESSION',
        'EPIC-SEO',
      ].includes(epicId);
    // Design release scope controls design sequencing, not product activation.
    // Only the canonical ticket or an explicitly reviewed blocker disposition
    // may supply effective release state. A design map's RELEASE label must
    // never turn an unassigned ticket into IMPLEMENT_NOW.
    const release = processScope
      ? processScope.effectiveReleaseState
      : deliveryClassification
        ? deliveryClassification.effectiveReleaseState
        : (ticket.releaseState ??
          (ticket.blocked && blocker?.hostpending && blocker.releaseDisposition === 'ACTIVE_R1'
            ? 'ACTIVE_R1'
            : 'UNSPECIFIED'));
    const deliveryMode = processScope
      ? processScope.deliveryMode
      : deliveryClassification
        ? deliveryClassification.deliveryMode
        : release === 'UNSPECIFIED'
          ? 'UNDECIDED'
          : release === 'HOLD'
            ? 'HOLD'
            : release === 'FUTURE'
              ? 'FUTURE_RELEASE'
              : release === 'CONDITIONAL'
                ? 'FEATURE_FLAGGED'
                : ticket.blocked
                  ? blocker?.hostpending
                    ? 'MANUAL_GATE'
                    : 'EXTERNAL_DEPENDENCY'
                  : 'IMPLEMENT_NOW';
    const designOverride = refinement?.designDisposition;
    const designStatus = designOverride?.status
      ? designOverride.status
      : !ui
        ? 'DESIGN_NOT_APPLICABLE'
        : ticket.id === 'CS-216' || !refs.length
          ? 'DESIGN_GAP'
          : ownedScreens.length
            ? 'DESIGN_VERIFIED'
            : 'DESIGN_PARTIAL';
    const rows = ticket.acceptanceCriteria.map((criterion, index) =>
      verification(ticket, criterion, index, profile.commands),
    );
    for (const row of rows) {
      const amendments = refinement?.bindingAmendments?.[row.acId] ?? {};
     row.exactBindings = (policy.exactVerificationBindings?.[row.acId] ?? []).map(
       (binding, index) => ({ ...binding, ...(amendments[String(index)] ?? {}) }),
     );
      const corrections = refinement?.bindingCorrections?.[row.acId] ?? {};
      row.exactBindings = row.exactBindings.map((binding, index) => ({
        ...binding,
        ...(corrections[String(index)] ?? {}),
      }));
      const additions = refinement?.bindingAdditions?.[row.acId] ?? [];
      if (Array.isArray(additions) && additions.length)
        row.exactBindings.push(...additions);
      if (row.exactBindings.length) {
        row.verification = row.exactBindings.map((binding) => ({
          type: binding.type,
          expectedCheck: binding.assertion,
          candidateCommand: null,
          evidenceRequired: binding.evidenceArtifact,
          automationStatus: binding.testStatus,
          owner: binding.reviewer,
          releaseGate: binding.releaseGate,
        }));
        row.mappingBasis =
          'Explicit exact binding in .ai/ticket-specification-policy.json; review/execution status is shown separately.';
      }
    }
    traceability.push(...rows);
    const gaps = [];
    const gap = (code, section, reason, owner, requiredEvidence) =>
      gaps.push({ code, section, reason, owner, requiredEvidence });
    if (!ticket.architectureImpact?.trim())
      gap(
        'MISSING_ARCHITECTURE_ASSESSMENT',
        'technicalApproach',
        'Source architecture impact note is absent.',
        ticket.ownerAgent,
        'Ticket-specific affected modules, integration boundary and reviewed change rationale.',
      );
    if (!ticket.securityImpact?.trim())
      gap(
        'MISSING_SECURITY_ASSESSMENT',
        'securityPrivacy',
        'Source security/privacy impact note is absent.',
        'Security reviewer',
        'Ticket-specific actor, data classification, ownership/abuse cases and reviewed N/A rationale where appropriate.',
      );
    if (blocker?.primaryClass === 'B1_PRODUCT_OR_OWNER_DECISION')
      gap(
        'OWNER_DECISION',
        'technicalApproach',
        blocker.reason,
        blocker.owner,
        blocker.requiredEvidence,
      );
    for (const requirement of designModel?.apiData?.missingRequirements ?? [])
      gap(
        'MISSING_DOMAIN_CONTRACT',
        'apiContract',
        requirement,
        ticket.ownerAgent,
        'Reviewed request/response/error/authorization/data ownership contract with negative tests before implementation.',
      );
    if (designStatus === 'DESIGN_GAP')
      gap(
        'MISSING_EXACT_DESIGN',
        'design',
        'No exact approved screen reference is mapped; a README or generic board does not verify this surface.',
        'UX / Product owner',
        'Exact design asset, route/role/state/viewport mapping and approval.',
      );
    if (designStatus === 'DESIGN_PARTIAL')
      gap(
        'PARTIAL_DESIGN',
        'design',
        'References exist, but the exact ticket-specific surface/state mapping is not established by the screen index.',
        'UX',
        'Ticket-specific state and viewport mapping or independently approved design N/A rationale.',
      );
    if (
      (!ticket.releaseTarget || ticket.releaseTarget === 'backlog') &&
      blocker?.releaseDisposition !== 'DEFERRED_BY_OWNER' &&
      deliveryClassification?.effectiveReleaseState !== 'ACTIVE_R1'
    )
      gap(
        'RELEASE_TARGET_UNDECIDED',
        'delivery',
        'Source registry has no approved release assignment.',
        'Product owner',
        'Explicit release assignment or owner-approved future-release disposition.',
      );
    if (
      (release === 'UNSPECIFIED' &&
        deliveryClassification?.effectiveReleaseState !== 'ACTIVE_R1') ||
      processScope
    )
      gap(
        'RELEASE_STATE_UNSPECIFIED',
        'delivery',
        processScope
          ? 'Source has no product release/HOLD state because this ticket is a repository process checkpoint; product release/activation is explicitly not applicable.'
          : 'Source ticket has no release/HOLD activation classification.',
        'Product owner / release reviewer',
        processScope
          ? 'Preserve the source workflow/status and distinguish the branch-local process checkpoint from product release/activation.'
          : 'Approved activation classification; historical package versions are not release authorization.',
      );
    if (
      ticket.id === 'CS-47' &&
      !graph.edges.some((edge) => edge.dependent === ticket.id && edge.type === 'SEQUENCING')
    )
      gap(
        'UNMODELED_SEQUENCING',
        'dependencies',
        'Source AC4 requires CS-6, CS-13, CS-14, CS-16, CS-17, CS-18 and CS-19 first, but registry dependencies is empty. Layer 0 is not executable readiness.',
        'Product Architect / owner',
        'Reviewed source-linked sequencing supplement and prioritization decision without editing frozen workflow evidence.',
      );
    // No test identifier was invented: a suggested method is not executable traceability.
    gap(
      'EXACT_AC_TEST_BINDING',
      'testStrategy',
      'Every criterion has a suggested verification method, but current test assertions have not been individually bound to it.',
      'QA',
      'Reviewed test path and test/assertion name, or exact manual procedure and expected outcome, for each AC.',
    );
    if (Number(ticket.id.slice(3)) >= 95 && ticket.id !== 'CS-216')
      gap(
        'SURFACE_SPEC_REFINEMENT',
        'functionalRequirements',
        'Phase 1 criteria are broad cross-surface requirements; screenshot controls, per-field validation and interactions still need a ticket-specific written contract.',
        'Product Architect / UX / domain owner',
        'Reviewed per-surface behavior/state/validation inventory tied to each numbered criterion; do not infer functionality from image labels.',
      );
    for (const item of gaps) {
      const decision = policy.decisionReconciliations?.[ticket.id];
      const exactBound = rows.every(
        (row) =>
          row.exactBindings?.length &&
          row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'),
      );
      const disposition =
        item.code === 'EXACT_AC_TEST_BINDING' && exactBound
          ? 'RESOLVED'
          : item.code === 'OWNER_DECISION' &&
              decision &&
              !policy.findingDispositions?.[ticket.id]?.[item.code]
            ? 'RECLASSIFIED'
            : (policy.findingDispositions?.[ticket.id]?.[item.code]?.disposition ?? 'OPEN');
      const dispositionOverride = policy.findingDispositions?.[ticket.id]?.[item.code];
      item.disposition = disposition;
      if (dispositionOverride?.reason) item.reason = dispositionOverride.reason;
      if (dispositionOverride?.requiredEvidence)
        item.requiredEvidence = dispositionOverride.requiredEvidence;
      findings.push({
        ticketId: ticket.id,
        ...item,
        disposition,
        ...(dispositionOverride
          ? {
              dispositionRationale: dispositionOverride.rationale,
              dispositionSources: dispositionOverride.sources,
            }
          : {}),
      });
    }
    const source = `.ai/backlog.json#${ticket.id}`;
    const trace = {
      ticketId: ticket.id,
      ui,
      status: designStatus,
      primaryRef: designModel?.primaryDesignRef ?? null,
      references: refs,
      screens: screens.map((screen) => ({
        designId: screen.designId,
        referencePath: screen.referencePath,
        route: screen.route,
        role: designModel?.role ?? ticket.role ?? null,
        state: screen.surface,
        variantType: screen.variantType,
        ...(screen.mappingRelationship
          ? {
              ownerTicketId: screen.primaryTicketId,
              mappingRelationship: screen.mappingRelationship,
              mappingRationale: screen.mappingRationale,
            }
          : {}),
        componentContract: 'CS-105 / CS-106',
        viewport:
          'Exact reference dimensions; approved mobile policy must be recorded before visual acceptance.',
        testRequirements: screen.acceptanceEvidenceRequirements,
      })),
      reason:
        designOverride?.reason ??
        (designStatus === 'DESIGN_NOT_APPLICABLE'
          ? 'Non-UI engineering/domain task; no page rendering is required by its scope.'
          : designStatus === 'DESIGN_PARTIAL' && relatedScreens.length > 0
            ? 'The canonical full-reference board maps this ticket to related screens, but those screens remain owned by their named child tickets; parent-level state designs are incomplete, so this remains partial.'
            : 'Mappings are copied from the authoritative design index; asset presence does not establish implementation or product capability.'),
    };
    designTraceability.push(trace);
    const criteria = rows.map((row) => ({
      id: row.acId,
      sourceText: row.criterion,
      expectedResult: row.criterion,
      verificationIds:
        row.exactBindings.length > 0
          ? [...new Set(row.exactBindings.map((binding) => binding.type))]
          : row.verification.map((entry) => entry.type),
      authority: source,
      reviewStatus: 'UNREVIEWED_SPECIFICATION',
    }));
    const sections = {
      identity: present(
        [
          {
            ticketId: ticket.id,
            title: ticket.title,
            primaryEpicId: epicId,
            area: ticket.area,
            priority: ticket.priority,
            status: ticket.status,
            owner: ticket.ownerAgent,
            reviewers: ticket.reviewAgents,
            releaseTarget: ticket.releaseTarget ?? null,
            blocked: ticket.blocked,
            blockedReason: ticket.blockedReason,
            blockedOwner: ticket.blockedOwner,
            blockedSince: ticket.blockedSince,
            unblockEvidenceRequired: ticket.unblockEvidenceRequired,
          },
        ],
        [source],
      ),
      problem: present([ticket.userProblem], [source]),
      value: present([ticket.summary ?? ticket.userProblem], [source]),
      currentState: present(
        [
          {
            evidence: ticket.evidence ?? [],
            currentStep: ticket.currentStep,
            evidenceClassification: 'HISTORICAL_SOURCE_RECORDS_NOT_CURRENT_PROOF',
            completedSteps: ticket.completedSteps,
            limitations: 'docs/KNOWN-LIMITATIONS.md',
          },
        ],
        [source, 'docs/PROJECT-STATE.md'],
      ),
      desiredOutcome: present(ticket.acceptanceCriteria, [source]),
      inScope: present(ticket.acceptanceCriteria, [source]),
      outOfScope: present(policy.productInvariants, [
        'docs/PROJECT-STATE.md',
        'docs/ARCHITECTURE.md',
        source,
      ]),
      functionalRequirements: present(criteria, [source]),
      nonFunctionalRequirements: present(profile.nonFunctional, profile.sources),
      technicalApproach: present(
        [
          ticket.architectureImpact ||
            ((ticket.id === 'CS-78' || ticket.id === 'CS-79') &&
            policy.findingDispositions?.[ticket.id]?.MISSING_ARCHITECTURE_ASSESSMENT
              ?.disposition === 'RESOLVED'
              ? ticket.id === 'CS-78'
                ? 'The source registry has no architecture-impact field; the ticket-specific architecture assessment is documented in the reviewed supplemental specification requirements below.'
                : 'The source registry has no architecture-impact field; the ticket-specific architecture assessment is documented in the CS-79 supplemental requirements below.'
              : 'UNRESOLVED: source architecture assessment is absent; see recorded specification gap.'),
          ...profile.approach,
        ],
        [source, ...profile.sources],
      ),
      persistence: present(
        [
          {
            source: 'packages/core/src/schema.ts',
            rule: profile.persistence,
            proposedChanges: designModel?.apiData?.missingRequirements ?? [],
            approval:
              'No new schema, index or retention policy is implied by a screenshot; approve before implementing.',
          },
        ],
        [source, ...profile.sources],
      ),
      apiContract:
        refinement?.globalSectionOverrides?.apiContract === 'NOT_APPLICABLE'
          ? na(
              refinement.globalSectionOverrides.apiContractReason ??
                'This ticket has no application API or HTTP contract; process/module evidence is specified in its ticket-scoped requirements.',
            )
          : present(
              [
                {
                  sourceMapping: designModel?.apiData ?? null,
                  registrationAuthority: 'apps/api/src/app.ts',
                  rule: profile.api,
                  errors:
                    '400 invalid input; 401 session absent; 403 origin/CSRF; owner-safe 404; 409 revision/idempotency conflict; 413 payload; 429 rate limit; 507 storage capacity only where applicable.',
                  unknownContracts: gaps.filter((item) => item.section === 'apiContract'),
                },
              ],
              [source, 'docs/API-SURFACE.md'],
            ),
      design: ui
        ? present([trace], ['design/DESIGN-INDEX.json', '.ai/design-ticket-coverage.json'])
        : na(trace.reason),
      sharedComponents: ui
        ? present(
            [
              'Reuse tokens, atoms and composites through CS-95, CS-105 and CS-106; routes compose feature components and the canonical API client.',
            ],
            ['design/foundations/ATOMIC-DESIGN-COMPONENT-HIERARCHY.md'],
          )
        : na('No UI component is introduced by this engineering/domain scope.'),
      accessibility: ui
        ? present(policy.ui.accessibility, policy.ui.sources)
        : na(
            'No user-facing rendered control in this scope; accessible reports remain readable Markdown.',
          ),
      responsive: ui
        ? present(policy.ui.responsive, policy.ui.sources)
        : na('No viewport-dependent rendered interface in this scope.'),
      browsers: ui
        ? present(['Chromium', 'Firefox', 'WebKit'], ['docs/TESTING.md'])
        : na('No browser behavior is introduced by this task.'),
      seo:
        ui && designModel?.role === 'public' && epicId === 'EPIC-MARKETING'
          ? present(policy.ui.publicSeo, ['docs/PRODUCT-SURFACE.md'])
          : na(
              'Engineering, authenticated and internal/admin surfaces are not public search targets; keep private pages noindex and user data out of metadata.',
            ),
      securityPrivacy:
        refinement?.globalSectionOverrides?.securityPrivacy === 'NOT_APPLICABLE'
          ? na(
              refinement.globalSectionOverrides.securityPrivacyReason ??
                'No application security/privacy boundary is introduced by this ticket; only ticket-specific process or artifact controls apply.',
            )
          : present(
              [
                refinement?.securityPrivacyBase ||
                  ticket.securityImpact ||
                  ((ticket.id === 'CS-78' || ticket.id === 'CS-79') &&
                  policy.findingDispositions?.[ticket.id]?.MISSING_SECURITY_ASSESSMENT
                    ?.disposition === 'RESOLVED'
                    ? ticket.id === 'CS-78'
                      ? 'The source registry has no security-impact field; the ticket-specific security/privacy assessment is documented in the reviewed supplemental specification requirements below.'
                      : 'The source registry has no security-impact field; the ticket-specific security/privacy assessment is documented in the CS-79 supplemental requirements below.'
                    : 'UNRESOLVED: source security/privacy assessment is absent; see recorded specification gap.'),
                ...(refinement?.globalSectionOverrides?.securityPrivacy === 'TICKET_SCOPED'
                  ? []
                  : ticket.id === 'CS-79'
                    ? []
                    : policy.security),
              ],
              [source, 'docs/SECURITY.md', 'docs/PRIVACY.md'],
            ),
      observability: present(
        ticket.telemetryRequirements?.length ? ticket.telemetryRequirements : profile.observability,
        [source, ...profile.sources],
      ),
      testStrategy: present(rows, [source, 'docs/TESTING.md']),
      visualRegression: ui
        ? present(
            [
              {
                exactReferences: refs,
                masks: 'Only unavoidable dynamic regions; no blanket widget masks.',
                tolerance:
                  'Owner-approved deterministic threshold is required; not invented in planning.',
                evidence:
                  'Future reference/render capture, dimensions, state, browser and independent approval.',
              },
            ],
            ['design/01-IMPLEMENTATION-ORDER/00-foundations-first/visual-parity-acceptance.md'],
          )
        : na('No visual surface is changed by this scope.'),
      acceptanceCriteria: present(criteria, [source]),
      definitionOfDone: present(policy.definitionOfDone, ['docs/ai/quality-gates.md']),
      completionEvidence: present(
        [
          {
            commands: profile.commands,
            sourceEvidence: 'Historical evidence is retained above, not treated as fresh pass.',
            required: ticket.unblockEvidenceRequired,
            rule: 'Future exact-content command results, independent review, docs and relevant service/manual acceptance; specification completion is not ticket promotion.',
          },
        ],
        ['docs/TESTING.md', source],
      ),
      implementationChecklist: present(
        [
          ticket.id === 'CS-79'
            ? 'Review the historical append defect and all three source criteria against the tracked attribute rules; reviewer ownership remains unassigned in the canonical registry.'
            : `Review ${ticket.id} problem and each criterion with ${ticket.ownerAgent}.`,
          `Resolve only the recorded ${ticket.id} specification/activation gaps before claiming readiness.`,
          `Inspect and change only modules permitted by the technical approach for ${ticket.title}.`,
          ...ticket.acceptanceCriteria.map(
            (criterion, index) => `Implement and verify ${ticket.id}-AC${index + 1}: ${criterion}`,
          ),
          `Reconcile ${ticket.id} documentation, redacted evidence and independent review before workflow promotion.`,
        ],
        [source],
      ),
      dependencies: present(
        [
          {
            prerequisites: ticket.dependencies,
            sequencingPrerequisites: graph.edges
              .filter((edge) => edge.dependent === ticket.id && edge.type === 'SEQUENCING')
              .map((edge) => edge.prerequisite),
            downstream: graph.edges
              .filter((edge) => edge.prerequisite === ticket.id)
              .map((edge) => edge.dependent),
            edgePolicy:
              'Existing declared dependencies are HARD unless individually approved otherwise.',
          },
        ],
        [source],
      ),
      manualExternalGates: present(
        [
          {
            blockerClass: blocker?.primaryClass ?? null,
            owner: ticket.blockedOwner,
            evidence: ticket.unblockEvidenceRequired,
            actions: actions.filter((action) => action.ticketId === ticket.id),
          },
        ],
        [source, '.ai/blocker-classification.json', 'hostpending.txt'],
      ),
      risksRecovery: present(
        [
          {
            risks: ticket.risk,
            assumptions:
              'No provider capability, product decision or production acceptance is inferred from design.',
            failureModes: profile.failureModes,
            recovery: profile.recovery,
          },
        ],
        [source, ...profile.sources],
      ),
      delivery: present(
        [
          {
            size: ticket.size,
            complexity: ticket.complexity,
            releaseTarget: processScope
              ? processScope.effectiveReleaseTarget
              : deliveryClassification
                ? deliveryClassification.effectiveReleaseTarget
                : (ticket.releaseTarget ?? null),
            releaseState: release,
            ...(processScope
              ? {
                  sourceReleaseTarget: ticket.releaseTarget ?? null,
                  processScope,
                }
              : deliveryClassification
                ? {
                    sourceReleaseTarget: ticket.releaseTarget ?? null,
                    deliveryClassification,
                  }
                : {}),
            sourceDisposition: blocker?.releaseDisposition ?? null,
            deferredDecision:
              blocker?.releaseDisposition === 'DEFERRED_BY_OWNER'
                ? {
                    reason: blocker.decisionReason,
                    source: blocker.decisionSource,
                    schedule: 'OWNER_DEFERRED_UNSCHEDULED',
                  }
                : null,
            deliveryMode,
            featureFlag: ticket.featureFlag ?? null,
            holdReason: ticket.holdReason ?? null,
            implementationOrder: ticket.implementationOrder ?? null,
            reviewers: ticket.reviewAgents,
            activation: 'No activation or implementation is authorized during Phase 3.25.',
          },
        ],
        [
          source,
          ...(designModel ? ['.ai/design-ticket-coverage.json'] : []),
          '.ai/blocker-classification.json',
        ],
      ),
    };
    const decision = policy.decisionReconciliations?.[ticket.id];
    if (decision) {
      const reconciliation = {
        classification: policy.ownerDecisionSource.classification,
        source: policy.ownerDecisionSource,
        section: decision.section,
        approvedDirection: decision.decision,
        remainingGate: decision.remainingGate,
        evidenceSemantics:
          'Owner direction only; not implementation, review approval or live evidence.',
      };
      for (const section of ['technicalApproach', 'manualExternalGates']) {
        sections[section].requirements.push(reconciliation);
        sections[section].sources.push(policy.ownerDecisionSource.path);
      }
    }
    if (refinement) {
      for (const [section, requirements] of Object.entries(refinement.additionalRequirements)) {
        if (section === 'sectionTextReplacements') continue;
        sections[section] = present(
          [
            ...(sections[section].requirements ?? []),
            ...requirements.map((requirement) => ({
              requirement,
              reviewStatus: refinement.reviewStatus,
              authority: decision
                ? 'OWNER_DIRECTION_PROPAGATED_SPECIFICATION_REVIEW_PENDING'
                : 'EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR',
            })),
          ],
          [...new Set([...(sections[section].sources ?? []), ...refinement.sourceReferences])],
        );
      }
      if (refinement.implementationChecklistOverride) {
        sections.implementationChecklist = present(
          refinement.implementationChecklistOverride.map((requirement) => ({
            requirement,
            reviewStatus: refinement.reviewStatus,
            authority: decision
              ? 'OWNER_DIRECTION_PROPAGATED_SPECIFICATION_REVIEW_PENDING'
              : 'EDITORIAL_PROPOSAL_NOT_ACCEPTED_PRODUCT_BEHAVIOR',
          })),
          [source, ...refinement.sourceReferences],
        );
      }
      // A ticket-scoped N/A must remain authoritative after additive refinements;
      // otherwise generic domain sections are reintroduced and contradict the
      // ticket's reviewed boundary.
      for (const [section, override] of Object.entries(refinement.globalSectionOverrides ?? {})) {
        if (section.endsWith('Reason')) continue;
        if (override === 'NOT_APPLICABLE') {
          sections[section] = na(
            refinement.globalSectionOverrides[`${section}Reason`] ??
              'This section is not applicable to the ticket-specific scope.',
          );
        }
      }
      if (refinement.apiContractSourceMappingOverride) {
        const first = sections.apiContract?.requirements?.[0];
        if (first?.sourceMapping) {
          first.sourceMapping = {
            ...first.sourceMapping,
            ...refinement.apiContractSourceMappingOverride,
          };
        }
      }
      for (const [section, replacements] of Object.entries(
        refinement.sectionTextReplacements ??
          refinement.additionalRequirements?.sectionTextReplacements ??
          {},
      )) {
        if (
          !Array.isArray(replacements) ||
          !sections[section] ||
          !Array.isArray(sections[section].requirements)
        )
          continue;
        const replace = (value) => {
          if (typeof value === 'string')
            return replacements.reduce(
              (current, [from, to]) =>
                current.includes(from) ? current.replaceAll(from, to) : current,
              value,
            );
          if (Array.isArray(value)) return value.map(replace);
          if (value && typeof value === 'object')
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replace(item)]));
          return value;
        };
        sections[section].requirements = sections[section].requirements.map(replace);
      }
    }
    if (processScope) {
      const processDoD = [
        'Specification/process DoD: preserve the canonical backlog status and Phase 3 migration evidence; record the exact branch, immutable base SHA, complete authored-input path set, generated-output subset and rolling predecessor/current manifest hashes.',
        'Run the named Phase 3.25 generation twice and require zero second-run drift; validate the exact rolling manifest, privacy/publication guards, focused specification tests and diff/path review before any separately authorized branch-local checkpoint.',
        'Obtain independent whole-ticket and exact-AC review receipts bound to the resulting specification/binding content; do not treat this process checkpoint as product acceptance, PROD evidence, main integration authorization, merge or deployment approval.',
      ];
      sections.definitionOfDone = present(processDoD, [
        source,
        'docs/OWNER-DECISIONS-2026-10-02.md#OD-2026-10-07-CS80-AC3-V2',
        'docs/TESTING.md',
      ]);
      sections.completionEvidence = present(
        [
          {
            commands: [
              'npm run tickets:spec:generate (run twice; second run must report changedFiles: 0)',
              'npm run tickets:spec:check',
              'npm run tickets:spec:test',
              'npm run privacy:test',
              'npm run privacy:check',
              'node --test scripts/stage-pages.test.mjs',
              'git diff --check',
            ],
            sourceEvidence:
              'Record the actual base/branch and manifest predecessor/current hash, path count/delta, redacted path review, reviewer verdict and clean/dirty result; command output must be from the exact checkpoint content.',
            required: [
              'exact branch-local manifest and path/diff review',
              'deterministic second-generation no-op',
              'passing Phase 3.25 specification and privacy/publication validation',
              'content-bound independent whole-specification and AC-binding receipts',
            ],
            rule: 'This is repository process evidence only; product integration/browser/production acceptance and deployed-revision evidence are not CS-80 completion criteria.',
          },
        ],
        [source, 'docs/OWNER-DECISIONS-2026-10-02.md#OD-2026-10-07-CS80-AC3-V2'],
      );
    }
    const specification = {
      ticketId: ticket.id,
      primaryEpicId: epicId,
      readiness: 'INCOMPLETE',
      reviewState: 'DRAFT',
      gaps,
      sections,
    };
    const receipt = policy.specificationReviewReceipts?.[ticket.id];
    const receiptMatches =
      receipt?.verdict === 'APPROVED' &&
      WHOLE_SPEC_REVIEWERS.has(receipt?.reviewer) &&
      receipt.artifact === 'docs/PHASE-3-25-REMEDIATION-REVIEW-01.md' &&
      receipt.contentHash === specificationDigest(specification) &&
      gaps.every((gap) => gap.disposition !== 'OPEN');
    if (receiptMatches) {
      specification.readiness = 'IMPLEMENTATION_READY';
      specification.reviewState = 'APPROVED';
    }
    return specification;
  });
  const epicIds = [...new Set(specs.map((spec) => spec.primaryEpicId))];
  const epics = epicIds.map((id) => {
    const source =
      coverage.epics.find((epic) => epic.id === id) ??
      policy.engineeringEpics.find((epic) => epic.id === id);
    const children = specs.filter((spec) => spec.primaryEpicId === id).map((spec) => spec.ticketId);
    const members = tickets.filter((ticket) => children.includes(ticket.id));
    return {
      ...source,
      childTicketIds: children,
      objective: source?.title,
      scope: members.map((ticket) => ({ ticketId: ticket.id, title: ticket.title })),
      exclusions: policy.productInvariants,
      dependencies: [
        ...new Set(
          members.flatMap((ticket) => ticket.dependencies).filter((id) => !children.includes(id)),
        ),
      ],
      designScope: designTraceability
        .filter((entry) => children.includes(entry.ticketId))
        .map((entry) => ({
          ticketId: entry.ticketId,
          status: entry.status,
          primaryRef: entry.primaryRef,
        })),
      totals: {
        tickets: members.length,
        completeSpecifications: members.filter(
          (ticket) => specs.find((spec) => spec.ticketId === ticket.id)?.reviewState === 'APPROVED',
        ).length,
        blocked: members.filter((ticket) => ticket.blocked).length,
        workflow: Object.fromEntries(
          TICKET_STATUSES.map((status) => [
            status,
            members.filter((ticket) => ticket.status === status).length,
          ]),
        ),
      },
      completionSemantics:
        'Specification, implementation, acceptance and production promotion are separate gates.',
    };
  });
  const counts = {
    ticketCount: tickets.length,
    specificationCount: specs.length,
    completeSpecificationCount: specs.filter((spec) => spec.reviewState === 'APPROVED').length,
    incompleteSpecificationCount: specs.filter((spec) => spec.reviewState !== 'APPROVED').length,
    epicMappedCount: specs.filter((spec) => !!spec.primaryEpicId).length,
    orphanTicketCount: 0,
    duplicateIdCount: tickets.length - new Set(tickets.map((ticket) => ticket.id)).size,
    dependencyEdgeCount: graph.edges.length,
    invalidDependencyCount: graph.errors.length,
    dependencyCycleCount: graph.cycles.length,
    dependencySemanticGapCount: findings.filter(
      (finding) => finding.code === 'UNMODELED_SEQUENCING',
    ).length,
    acceptanceCriterionCount: traceability.length,
    suggestedAcceptanceCriterionCount: traceability.length,
    mappedAcceptanceCriterionCount: traceability.filter(
      (row) =>
        row.exactBindings.length &&
        row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'),
    ).length,
    unmappedAcceptanceCriterionCount: traceability.filter(
      (row) =>
        !row.exactBindings.length ||
        row.exactBindings.some((binding) => binding.reviewStatus !== 'REVIEWED'),
    ).length,
    reviewedExactTestBindingCount: traceability.reduce(
      (sum, row) =>
        sum + row.exactBindings.filter((binding) => binding.reviewStatus === 'REVIEWED').length,
      0,
    ),
    authoredExactTestBindingCount: traceability.reduce(
      (sum, row) => sum + row.exactBindings.length,
      0,
    ),
    acceptanceCriteriaWithAuthoredBindings: traceability.filter((row) => row.exactBindings.length)
      .length,
    draftSpecificationCount: specs.filter((spec) => spec.reviewState === 'DRAFT').length,
    reviseSpecificationCount: 0,
    reviewedSpecificationCount: 0,
    approvedSpecificationCount: specs.filter((spec) => spec.reviewState === 'APPROVED').length,
    ownerDecisionReconciliationCount: Object.keys(policy.decisionReconciliations ?? {}).length,
    uiTicketCount: designTraceability.filter((entry) => entry.ui).length,
    designCounts: group(designTraceability, (entry) => entry.status),
    blockedTicketCount: tickets.filter((ticket) => ticket.blocked).length,
    hostpendingActionCount: actions.length,
    holdTicketCount: tickets.filter((ticket) => ticket.releaseState === 'HOLD').length,
    releaseTargetCounts: group(tickets, (ticket) => ticket.releaseTarget ?? 'UNASSIGNED'),
    currentReleaseTicketCount: tickets.filter(
      (ticket) =>
        ['R1', 'R1-boundary'].includes(ticket.releaseTarget) &&
        !['HOLD', 'FUTURE'].includes(ticket.releaseState),
    ).length,
    workflow: Object.fromEntries(
      TICKET_STATUSES.map((status) => [
        status,
        tickets.filter((ticket) => ticket.status === status).length,
      ]),
    ),
    sourceBacklogHash: digest(backlog),
    specificationCoveragePercent:
      specs.length === 0
        ? 0
        : (100 * specs.filter((spec) => spec.reviewState === 'APPROVED').length) / specs.length,
    suggestedVerificationMappingPercent: traceability.length ? 100 : 0,
    exactReviewedTraceabilityPercent: traceability.length
      ? (traceability.filter(
          (row) =>
            row.exactBindings.length &&
            row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'),
        ).length *
          100) /
        traceability.length
      : 0,
    findingsCount: findings.length,
    openFindingCount: findings.filter((finding) => finding.disposition === 'OPEN').length,
    resolvedFindingCount: findings.filter((finding) => finding.disposition === 'RESOLVED').length,
    reclassifiedFindingCount: findings.filter((finding) => finding.disposition === 'RECLASSIFIED')
      .length,
  };
  return { specs, epics, graph, traceability, designTraceability, actions, findings, counts };
}

export function validateCatalog(model, inputs, resolvePath) {
  const errors = [];
  const canonicalAcs = new Set(
    inputs.backlog.items.flatMap((ticket) =>
      ticket.acceptanceCriteria.map((_, index) => `${ticket.id}-AC${index + 1}`),
    ),
  );
  const decisionIds = Object.keys(inputs.policy.decisionReconciliations ?? {});
  if (decisionIds.length) {
    const source = inputs.policy.ownerDecisionSource;
    if (
      !source ||
      !/^[a-f0-9]{40}$/.test(source.commit ?? '') ||
      !resolvePath(source.path ?? '') ||
      source.classification !== 'DECISION_EXISTS_BUT_NOT_PROPAGATED_TO_SPEC'
    )
      errors.push('invalid owner decision provenance');
    for (const id of decisionIds) {
      const decision = inputs.policy.decisionReconciliations[id];
      if (!inputs.backlog.items.some((ticket) => ticket.id === id))
        errors.push(`orphan decision reconciliation ${id}`);
      for (const field of ['section', 'decision', 'remainingGate'])
        if (typeof decision[field] !== 'string' || !decision[field].trim())
          errors.push(`incomplete decision reconciliation ${id}.${field}`);
      if (!inputs.ownerDecisionText?.includes(`## ${decision.section}`))
        errors.push(`unresolved owner decision section ${id}`);
    }
  }
  for (const [acId, bindings] of Object.entries(inputs.policy.exactVerificationBindings ?? {})) {
    if (!canonicalAcs.has(acId)) errors.push(`orphan exact binding ${acId}`);
    if (!Array.isArray(bindings) || !bindings.length) {
      errors.push(`empty exact binding ${acId}`);
      continue;
    }
    const ticketId = acId.split("-AC")[0];
    const corrections = inputs.policy.ticketRefinements?.[ticketId]?.bindingCorrections?.[acId] ?? {};
    const reviewedBindings = Object.keys(corrections).length
      ? bindings.map((binding, index) => ({ ...binding, ...(corrections[String(index)] ?? {}) }))
      : bindings;
    const names = new Set();
    const receipt = inputs.policy.verificationReviewReceipts?.[acId];
    if (
      reviewedBindings.some((binding) => binding.reviewStatus === 'REVIEWED') &&
      (receipt?.verdict !== 'APPROVED' ||
        !WHOLE_SPEC_REVIEWERS.has(receipt.reviewer) ||
        receipt.artifact !== 'docs/PHASE-3-25-REMEDIATION-REVIEW-01.md' ||
        !resolvePath(receipt.artifact ?? '') ||
        receipt.contentHash !== bindingDigest(reviewedBindings) ||
        !inputs.verificationReviewText?.includes(receipt.contentHash))
    )
      errors.push(`unproven content-bound verification review ${acId}`);
    for (const binding of reviewedBindings) {
      for (const field of [
        'preconditions',
        'setup',
        'procedure',
        'assertion',
        'expectedResult',
        'testName',
        'testFileOrProcedureId',
        'fixtures',
        'negativeCase',
        'evidenceArtifact',
        'reviewer',
        'releaseGate',
      ])
        if (typeof binding[field] !== 'string' || !binding[field].trim())
          errors.push(`incomplete exact binding ${acId}.${field}`);
      if (!VERIFICATION_TYPES.includes(binding.type))
        errors.push(`invalid exact binding type ${acId}`);
      if (
        ![
          'EXISTING_VERIFIED',
          'PLANNED',
          'MANUAL_REQUIRED',
          'HOSTED_REQUIRED',
          'EXTERNAL_REQUIRED',
        ].includes(binding.testStatus) ||
        !['DRAFT', 'REVIEWED'].includes(binding.reviewStatus)
      )
        errors.push(`unproven exact binding approval/execution ${acId}`);
      if (names.has(binding.testName)) errors.push(`duplicate exact binding ${acId}`);
      names.add(binding.testName);
    }
  }
  const specificationReceipts = inputs.policy.specificationReviewReceipts ?? {};
  for (const [ticketId, receipt] of Object.entries(specificationReceipts)) {
    const specification = model.specs.find((entry) => entry.ticketId === ticketId);
    if (!specification) {
      errors.push(`orphan whole-specification review receipt ${ticketId}`);
      continue;
    }
    if (
      receipt?.verdict !== 'APPROVED' ||
      !WHOLE_SPEC_REVIEWERS.has(receipt.reviewer) ||
      receipt.artifact !== 'docs/PHASE-3-25-REMEDIATION-REVIEW-01.md' ||
      !resolvePath(receipt.artifact ?? '') ||
      receipt.contentHash !== specificationDigest(specification) ||
      specification.gaps.some((gap) => gap.disposition === 'OPEN') ||
      !inputs.verificationReviewText?.includes(receipt.contentHash)
    )
      errors.push(`unproven content-bound whole-specification review ${ticketId}`);
  }
  for (const [id, refinement] of Object.entries(inputs.policy.ticketRefinements ?? {})) {
    if (!inputs.backlog.items.some((ticket) => ticket.id === id))
      errors.push(`orphan refinement ${id}`);
    if (refinement.reviewStatus !== 'DRAFT') errors.push(`unproven editorial review ${id}`);
    if (refinement.processScope !== undefined) {
      const scope = refinement.processScope;
      if (
        id !== 'CS-80' ||
        scope.kind !== 'REPOSITORY_PROCESS_CHECKPOINT' ||
        scope.phase !== 'PHASE_3_25' ||
        scope.effectiveReleaseTarget !== 'NOT_APPLICABLE' ||
        scope.effectiveReleaseState !== 'NOT_APPLICABLE' ||
        scope.deliveryMode !== 'PROCESS_CHECKPOINT' ||
        scope.branch !== 'phase-3.25/cloud-continuation' ||
        scope.mainIntegrationAuthorized !== false ||
        typeof scope.rationale !== 'string' ||
        !scope.rationale.trim()
      )
        errors.push(`invalid process delivery classification ${id}`);
    }
    if (refinement.deliveryClassification !== undefined) {
      const classification = refinement.deliveryClassification;
      if (
        typeof classification.effectiveReleaseTarget !== 'string' ||
        typeof classification.effectiveReleaseState !== 'string' ||
        typeof classification.deliveryMode !== 'string' ||
        typeof classification.rationale !== 'string' ||
        !classification.rationale.trim() ||
        !Array.isArray(classification.sources) ||
        classification.sources.length === 0 ||
        classification.sources.some((source) => !resolvePath(source.split('#')[0]))
      )
        errors.push(`invalid delivery classification ${id}`);
    }
    if (refinement.relatedDesignScreenMapping !== undefined) {
      const mapping = refinement.relatedDesignScreenMapping;
      const board = (inputs.designIndex.fullReferenceBoards ?? []).find(
        (entry) => entry.primaryTicketId === id,
      );
      if (
        !board ||
        mapping.relationship !== 'RELATED_SCOPE_NOT_OWNERSHIP' ||
        typeof mapping.rationale !== 'string' ||
        !mapping.rationale.trim() ||
        !Array.isArray(mapping.screenIds) ||
        mapping.screenIds.length === 0 ||
        new Set(mapping.screenIds).size !== mapping.screenIds.length
      )
        errors.push(`invalid related design screen mapping ${id}`);
      for (const screenId of mapping.screenIds ?? []) {
        const screen = inputs.designIndex.entries.find((entry) => entry.designId === screenId);
        if (
          !screen ||
          !board?.componentScreenIds.includes(screenId) ||
          !inputs.backlog.items.some((ticket) => ticket.id === screen.primaryTicketId)
        )
        errors.push(`unresolved related design screen mapping ${id}.${screenId}`);
      }
    }
    if (refinement.designDisposition !== undefined) {
      const disposition = refinement.designDisposition;
      if (
        !['DESIGN_EXACT', 'DESIGN_PARTIAL', 'DESIGN_PARTIAL_NON_BLOCKING', 'DESIGN_NOT_APPLICABLE'].includes(
          disposition.status,
        ) ||
        typeof disposition.reason !== 'string' ||
        !disposition.reason.trim()
      )
        errors.push('invalid design disposition ' + id);
    }
    if (
      !refinement.sourceReferences?.length ||
      refinement.sourceReferences.some((source) => !resolvePath(source.split('#')[0]))
    )
      errors.push(`missing refinement source ${id}`);
    for (const [section, requirements] of Object.entries(refinement.additionalRequirements)) {
      if (
        !SECTIONS.includes(section) ||
        [
          'identity',
          'currentState',
          'design',
          'acceptanceCriteria',
          'dependencies',
          'delivery',
        ].includes(section)
      )
        errors.push(`protected/invalid refinement section ${id}.${section}`);
      if (
        !Array.isArray(requirements) ||
        !requirements.length ||
        requirements.some((requirement) => typeof requirement !== 'string' || !requirement.trim())
      )
        errors.push(`invalid refinement requirements ${id}.${section}`);
    }
    if (
      refinement.implementationChecklistOverride !== undefined &&
      (!Array.isArray(refinement.implementationChecklistOverride) ||
        refinement.implementationChecklistOverride.length === 0 ||
        refinement.implementationChecklistOverride.some(
          (requirement) => typeof requirement !== 'string' || !requirement.trim(),
        ))
    )
      errors.push(`invalid implementation checklist override ${id}`);
    for (const [acId, amendments] of Object.entries(refinement.bindingAmendments ?? {})) {
      if (!canonicalAcs.has(acId) || !acId.startsWith(`${id}-AC`))
        errors.push(`orphan binding amendment ${acId}`);
      const sourceBindings = inputs.policy.exactVerificationBindings?.[acId];
      if (!Array.isArray(sourceBindings)) {
        errors.push(`binding amendment has no source binding ${acId}`);
        continue;
      }
      for (const [index, fields] of Object.entries(amendments)) {
        if (
          !Number.isInteger(Number(index)) ||
          Number(index) < 0 ||
          Number(index) >= sourceBindings.length
        )
          errors.push(`invalid binding amendment index ${acId}.${index}`);
        if (
          !fields ||
          typeof fields !== 'object' ||
          Array.isArray(fields) ||
          Object.entries(fields).some(
            ([field, value]) =>
              ![
                'setup',
                'fixtureOrData',
                'action',
                'procedure',
                'failureCase',
                'negativeCase',
                'reviewStatus',
              ].includes(field) ||
              typeof value !== 'string' ||
              !value.trim(),
          )
        )
          errors.push(`invalid binding amendment fields ${acId}.${index}`);
      }
    }
  }
  for (const [ticketId, dispositions] of Object.entries(inputs.policy.findingDispositions ?? {})) {
    if (!inputs.backlog.items.some((ticket) => ticket.id === ticketId))
      errors.push(`orphan finding disposition ${ticketId}`);
    for (const [code, disposition] of Object.entries(dispositions)) {
      if (!model.findings.some((finding) => finding.ticketId === ticketId && finding.code === code))
        errors.push(`unknown finding disposition ${ticketId}.${code}`);
      if (
        !['RESOLVED', 'RECLASSIFIED', 'OWNER_DECISION_REQUIRED', 'EXTERNAL_GATE'].includes(
          disposition.disposition,
        )
      )
        errors.push(`invalid finding disposition ${ticketId}.${code}`);
      if (
        typeof disposition.rationale !== 'string' ||
        !disposition.rationale.trim() ||
        !Array.isArray(disposition.sources) ||
        disposition.sources.length === 0 ||
        disposition.sources.some((source) => !resolvePath(source.split('#')[0]))
      )
        errors.push(`unproven finding disposition ${ticketId}.${code}`);
    }
  }
  const expected = buildCatalog(inputs);
  for (const field of [
    'specs',
    'epics',
    'graph',
    'traceability',
    'designTraceability',
    'actions',
    'findings',
    'counts',
  ]) {
    if (digest(model[field]) !== digest(expected[field]))
      errors.push(`source projection drift: ${field}`);
  }
  const ids = new Set(inputs.backlog.items.map((ticket) => ticket.id));
  if (ids.size !== 216 || inputs.backlog.items.length !== 216)
    errors.push('expected exactly 216 unique canonical tickets');
  const specIds = new Set();
  for (const spec of model.specs) {
    if (!ids.has(spec.ticketId) || specIds.has(spec.ticketId))
      errors.push(`orphan/duplicate spec ${spec.ticketId}`);
    specIds.add(spec.ticketId);
    if (!model.epics.some((epic) => epic.id === spec.primaryEpicId))
      errors.push(`invalid epic ${spec.ticketId}`);
    if (Object.keys(spec.sections).length !== SECTIONS.length)
      errors.push(`section count ${spec.ticketId}`);
    for (const section of SECTIONS) {
      const value = spec.sections[section];
      if (!value || !['APPLICABLE', 'NOT_APPLICABLE'].includes(value.applicability))
        errors.push(`invalid section ${spec.ticketId}.${section}`);
      else if (
        value.applicability === 'NOT_APPLICABLE'
          ? !value.reason?.trim()
          : !Array.isArray(value.requirements) ||
            !value.requirements.length ||
            !value.sources?.length
      )
        errors.push(`empty section ${spec.ticketId}.${section}`);
      if (value?.applicability === 'APPLICABLE') {
        if (
          value.requirements.some(
            (entry) => entry == null || (typeof entry === 'string' && !entry.trim()),
          )
        )
          errors.push(`malformed requirement ${spec.ticketId}.${section}`);
        for (const source of value.sources ?? [])
          if (typeof source !== 'string' || !resolvePath(source.split('#')[0]))
            errors.push(`missing source ${spec.ticketId}.${section}`);
      }
    }
    const ticket = inputs.backlog.items.find((ticket) => ticket.id === spec.ticketId);
    if (!ticket) continue;
    if (!TICKET_STATUSES.includes(ticket.status)) errors.push(`legacy workflow ${ticket.id}`);
    const acs = spec.sections.acceptanceCriteria?.requirements ?? [];
    if (acs.length !== ticket.acceptanceCriteria.length) errors.push(`lost criterion ${ticket.id}`);
    for (const [index, ac] of acs.entries()) {
      if (
        ac.id !== `${ticket.id}-AC${index + 1}` ||
        ac.sourceText !== ticket.acceptanceCriteria[index] ||
        !ac.sourceText?.trim()
      )
        errors.push(`criterion drift ${ticket.id}`);
      const row = model.traceability.find(
        (entry) => entry.acId === ac.id && entry.ticketId === ticket.id,
      );
      if (
        !row?.verification?.length ||
        row.verification.some((entry) => !VERIFICATION_TYPES.includes(entry.type))
      )
        errors.push(`unmapped AC ${ac.id}`);
    }
  }
  for (const id of ids) if (!specIds.has(id)) errors.push(`missing specification ${id}`);
  const expectedAcs = new Map(
    inputs.backlog.items.flatMap((ticket) =>
      ticket.acceptanceCriteria.map((criterion, index) => [
        `${ticket.id}-AC${index + 1}`,
        { ticketId: ticket.id, criterion },
      ]),
    ),
  );
  const seenAcs = new Set();
  for (const entry of model.traceability) {
    const expected = expectedAcs.get(entry.acId);
    if (!expected || expected.ticketId !== entry.ticketId || expected.criterion !== entry.criterion)
      errors.push(`orphan/drift test ${entry.acId}`);
    if (seenAcs.has(entry.acId)) errors.push(`duplicate test mapping ${entry.acId}`);
    seenAcs.add(entry.acId);
  }
  for (const [id] of expectedAcs) if (!seenAcs.has(id)) errors.push(`missing test mapping ${id}`);
  const epicIds = new Set();
  const memberships = new Map();
  for (const epic of model.epics) {
    if (!epic.id || epicIds.has(epic.id)) errors.push(`invalid/duplicate epic ${epic.id}`);
    epicIds.add(epic.id);
    for (const id of epic.childTicketIds) {
      if (!ids.has(id) || memberships.has(id))
        errors.push(`orphan/duplicate epic membership ${id}`);
      memberships.set(id, epic.id);
    }
  }
  for (const spec of model.specs)
    if (memberships.get(spec.ticketId) !== spec.primaryEpicId)
      errors.push(`epic membership mismatch ${spec.ticketId}`);
  for (const entry of model.designTraceability)
    for (const ref of entry.references) {
      if (!resolvePath(ref)) errors.push(`missing reference ${ref}`);
    }
  const manualIds = new Set();
  for (const action of model.actions) {
    if (!ids.has(action.ticketId) || manualIds.has(action.ticketId))
      errors.push(`orphan/duplicate hostpending ${action.ticketId}`);
    if (!action.owner || !action.instructions || !action.evidence || !action.recovery)
      errors.push(`incomplete manual action ${action.ticketId}`);
    manualIds.add(action.ticketId);
  }
  for (const blocker of inputs.blockers.tickets) {
    const ticket = inputs.backlog.items.find((entry) => entry.id === blocker.ticketId);
    if (!ticket || ticket.blocked !== blocker.blocked)
      errors.push(`blocker drift ${blocker.ticketId}`);
    if (blocker.hostpending && !manualIds.has(blocker.ticketId))
      errors.push(`missing hostpending ${blocker.ticketId}`);
  }
  for (const action of model.actions)
    if (
      !inputs.blockers.tickets.some(
        (blocker) => blocker.ticketId === action.ticketId && blocker.hostpending,
      )
    )
      errors.push(`unregistered hostpending ${action.ticketId}`);
  errors.push(...dependencyGraph(inputs.backlog.items, inputs.policy.sequencingEdges).errors);
  return errors;
}
