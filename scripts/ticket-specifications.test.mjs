import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCatalog,
  dependencyGraph,
  validateCatalog,
  SECTIONS,
} from './lib/ticket-specification.mjs';
import {
  artifacts,
  authorizedCs80SourceAmendment,
  committedPredecessorManifestHash,
  exactCheckpointPathsMatch,
  isAuthorizedOwnerDecisionAppend,
  isApprovedV1Bootstrap,
  isApprovedV1CoverageAnchor,
  loadInputs,
  rollingManifestDigest,
  validateCs80AmendmentPair,
  validatePreviousManifest,
  validateGeneratedArtifactCheckpoint,
} from './ticket-specifications.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fresh = () => loadInputs(root);
const validate = (model, inputs) =>
  validateCatalog(model, inputs, (ref) => {
    const full = path.resolve(root, ref);
    return full.startsWith(root + path.sep) && fs.existsSync(full);
  });

test('CS67 historical column criterion is preserved while its plan consumes the frozen Phase3 model', () => {
  const inputs = fresh();
  const before = JSON.stringify(inputs.backlog);
  const model = buildCatalog(inputs);
  const criterion = inputs.backlog.items.find((ticket) => ticket.id === 'CS-67')
    .acceptanceCriteria[0];
  assert.equal(criterion, 'BLOCKED renders in its own named column and is counted there');
  const row = model.traceability.find((entry) => entry.acId === 'CS-67-AC1');
  assert.match(row.exactBindings[0].assertion, /no Blocked column/);
  assert.match(row.exactBindings[0].expectedResult, /historical AC1/);
  assert.equal(row.exactBindings[0].testStatus, 'PLANNED');
  assert.equal(JSON.stringify(inputs.backlog), before);
});

test('CS78 resolved supplemental architecture and security reviews do not render unresolved placeholders', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-78');
  const technical = spec.sections.technicalApproach.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  const security = spec.sections.securityPrivacy.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );

  assert.ok(
    technical.some((entry) => /ticket-specific architecture assessment is documented/.test(entry)),
  );
  assert.ok(
    security.some((entry) =>
      /ticket-specific security\/privacy assessment is documented/.test(entry),
    ),
  );
  assert.ok(!technical.some((entry) => /UNRESOLVED: source architecture assessment/.test(entry)));
  assert.ok(
    !security.some((entry) => /UNRESOLVED: source security\/privacy assessment/.test(entry)),
  );
  assert.equal(
    spec.gaps.find((gap) => gap.code === 'MISSING_ARCHITECTURE_ASSESSMENT').disposition,
    'RESOLVED',
  );
  assert.equal(
    spec.gaps.find((gap) => gap.code === 'MISSING_SECURITY_ASSESSMENT').disposition,
    'RESOLVED',
  );
});

test('CS79 tooling scope renders its scoped architecture and security assessment without candidate boilerplate', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-79');
  const technical = spec.sections.technicalApproach.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  const security = spec.sections.securityPrivacy.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  const checklist = spec.sections.implementationChecklist.requirements;

  assert.ok(
    technical.some((entry) => /ticket-specific architecture assessment is documented/.test(entry)),
  );
  assert.ok(!technical.some((entry) => /UNRESOLVED: source architecture assessment/.test(entry)));
  assert.ok(
    security.some((entry) =>
      /ticket-specific security\/privacy assessment is documented/.test(entry),
    ),
  );
  assert.ok(
    !security.some((entry) => /UNRESOLVED: source security\/privacy assessment/.test(entry)),
  );
  assert.ok(
    !security.some((entry) =>
      /candidate profile\/resume|Admin\/recruiter roles|cross-owner denial/.test(entry),
    ),
  );
  assert.ok(!checklist.some((entry) => /with undefined/.test(entry)));
  assert.equal(
    spec.gaps.find((gap) => gap.code === 'MISSING_ARCHITECTURE_ASSESSMENT').disposition,
    'RESOLVED',
  );
  assert.equal(
    spec.gaps.find((gap) => gap.code === 'MISSING_SECURITY_ASSESSMENT').disposition,
    'RESOLVED',
  );
});

test('CS82 preserves the fixed-main host contract and moving-main gate', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((item) => item.id === 'CS-82');
  const hostWorkflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  const pagesWorkflow = fs.readFileSync(
    path.join(root, '.github/workflows/publish-pages.yml'),
    'utf8',
  );
  const bindings = ticket.acceptanceCriteria.map(
    (_, index) =>
      model.traceability.find((entry) => entry.acId === `CS-82-AC${index + 1}`).exactBindings[0],
  );
  const scope = inputs.policy.ticketRefinements['CS-82'].additionalRequirements;

  assert.equal(bindings.length, 4);
  assert.ok(bindings.every((binding) => binding.testStatus === 'PLANNED'));
  assert.match(bindings[0].testName, /reject automatic triggers/);
  assert.match(bindings[1].negativeCase, /moving-main race/);
  assert.match(bindings[2].assertion, /exact resolved SHA/);
  assert.match(
    bindings[3].testName,
    /push-trigger and bypass mutations make the executable delivery gate fail/,
  );
  assert.match(
    bindings[3].testFileOrProcedureId,
    /^PLANNED:scripts\/check-deploy-gate\.test\.mjs::rejects push-trigger and bypass mutations$/,
  );
  assert.match(bindings[3].repositoryCommand, /baseline command: npm run deploy:gate:test/);
  assert.match(hostWorkflow, /ref: main/);
  assert.match(hostWorkflow, /environment: production/);
  assert.doesNotMatch(hostWorkflow, /^\s{6}ref:\r?$/m);
  assert.match(pagesWorkflow, /inputs\.ref/);
  assert.match(pagesWorkflow, /inputs\.environment/);
  assert.match(scope.manualExternalGates.join('\n'), /OWNER_DECISION_RESOLVED/);
  assert.equal(ticket.status, 'UAT');
});

test('CS71 scope separates explicit determination from language expansion and execution evidence', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  for (const suffix of ['AC1', 'AC2', 'AC3']) {
    const binding = model.traceability.find((row) => row.acId === `CS-71-${suffix}`)
      .exactBindings[0];
    assert.equal(binding.testStatus, 'PLANNED');
    assert.ok(binding.negativeCase.length > 30);
  }
  const paired = model.traceability.find((row) => row.acId === 'CS-71-AC2').exactBindings[0];
  assert.match(paired.assertion, /same test/);
  assert.match(paired.assertion, /Senior Software Engineer/);
  const scope = model.traceability.find((row) => row.acId === 'CS-71-AC3').exactBindings[0];
  assert.match(scope.assertion, /ROLE_WORDS entries are unchanged/);
  assert.match(scope.fixtures, /does not yet exist/);
  assert.equal(model.specs.find((spec) => spec.ticketId === 'CS-71').reviewState, 'APPROVED');
});

test('CS2 keeps the unreproduced 768px source defect separate from the historical 390px fix', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((item) => item.id === 'CS-2');
  assert.equal(ticket.title, 'Lead table header offset is wrong on Linux WebKit at 768px');
  assert.deepEqual(ticket.acceptanceCriteria, [
    'Reproduced in the Playwright Linux container, not guessed from Windows',
    'Root cause named; the assertion is not widened',
    'check-ui.mjs green on all three engines in CI',
  ]);
  const bindings = ticket.acceptanceCriteria.map((_, index) => {
    const acId = `CS-2-AC${index + 1}`;
    return model.traceability.find((row) => row.acId === acId).exactBindings[0];
  });
  assert.ok(bindings.every((binding) => binding.testStatus === 'PLANNED'));
  assert.ok(bindings.every((binding) => binding.reviewStatus === 'DRAFT'));
  assert.match(bindings[0].assertion, /390px overlap result cannot satisfy/);
  assert.match(bindings[0].procedure, /PostgreSQL with migrations, Redis, LocalStack SQS/);
  assert.match(bindings[1].negativeCase, /no 768px failure can be demonstrated/);
  assert.match(
    bindings[2].testFileOrProcedureId,
    /ci\.yml#integration\/Test CareerScope \(browser acceptance and axe accessibility/,
  );
  assert.match(
    bindings[2].assertion,
    /768px defect assertion is required only in its target WebKit run/,
  );
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-2');
  const requirements = spec.sections.functionalRequirements.requirements;
  assert.ok(requirements.some((entry) => /390px/.test(entry.requirement)));
  assert.ok(requirements.some((entry) => /scripts\/check-ui\.ts/.test(entry.requirement)));
  assert.match(
    bindings[2].procedure,
    /full current browser suite ran in Linux Chromium, Firefox and WebKit.*CS-2-specific 768px geometry assertion ran in Linux WebKit only/s,
  );
  const checklist = spec.sections.implementationChecklist.requirements.map((item) =>
    typeof item === 'string' ? item : item.requirement,
  );
  assert.ok(
    checklist.some((item) =>
      /frozen source acceptance-criterion wording unchanged.*current executable equivalent.*scripts\/check-ui\.ts/s.test(
        item,
      ),
    ),
  );
  assert.ok(
    checklist.some((item) =>
      /full browser suite on Chromium, Firefox, and WebKit.*768px geometry only in WebKit/s.test(
        item,
      ),
    ),
  );
  assert.ok(!checklist.some((item) => /check-ui\.mjs green on all three engines/.test(item)));
  assert.equal(ticket.acceptanceCriteria[2], 'check-ui.mjs green on all three engines in CI');
  assert.equal(spec.reviewState, 'DRAFT');
  assert.equal(spec.readiness, 'INCOMPLETE');
});

test('CS4 uses injected publication fixtures and requires both stage and commit path assertions', () => {
  const model = buildCatalog(fresh());
  for (const acId of ['CS-4-AC1', 'CS-4-AC2']) {
    const binding = model.traceability.find((row) => row.acId === acId).exactBindings[0];
    assert.equal(binding.testStatus, 'PLANNED');
    assert.match(binding.assertion, /git add/);
    assert.match(binding.assertion, /commit --only/);
    assert.match(binding.negativeCase, /hardcoded|Removing any canonical key/);
  }
});

test('CS8 separates parser contracts from rendered browser proof and module-root isolation', () => {
  const model = buildCatalog(fresh());
  const bindings = model.traceability.find((row) => row.acId === 'CS-8-AC2').exactBindings;
  assert.equal(bindings.length, 2);
  assert.deepEqual(
    bindings.map((binding) => binding.type),
    ['AUTOMATED_CONTRACT', 'AUTOMATED_BROWSER'],
  );
  assert.match(bindings[0].procedure, /separately required/);
  assert.match(bindings[1].preconditions, /modules\/assets are copied/);
  assert.match(bindings[1].negativeCase, /cwd/);
  assert.match(bindings[1].assertion, /valid restoration/);
  assert.ok(bindings.every((binding) => binding.testStatus === 'PLANNED'));
});

test('CI bindings preserve no bypass and separate registration from service execution', () => {
  const model = buildCatalog(fresh());
  const cs7 = model.specs.find((entry) => entry.ticketId === 'CS-7');
  const cs7Criteria = cs7.sections.acceptanceCriteria.requirements;
  const cs7Ac2 = cs7Criteria.find((entry) => entry.id === 'CS-7-AC2');
  assert.equal(
    cs7Ac2.sourceText,
    'An override exists, requires explicit intent and is recorded in the run log',
  );
  assert.equal(cs7Ac2.expectedResult, cs7Ac2.sourceText);
  const cs7Ac3 = cs7Criteria.find((entry) => entry.id === 'CS-7-AC3');
  assert.equal(cs7Ac3.expectedResult, cs7Ac3.sourceText);
  assert.match(
    cs7.sections.functionalRequirements.requirements.map((entry) => entry.requirement).join(' '),
    /supersedes historical AC2: no override/i,
  );
  assert.match(
    cs7.sections.manualExternalGates.requirements.map((entry) => entry.requirement).join(' '),
    /owner.*approve/i,
  );
  assert.ok(
    cs7.sections.implementationChecklist.requirements.every(
      (entry) =>
        !/implement .*override|push(?:ing)? .*deliberately failing/i.test(entry.requirement),
    ),
  );
  const exactSha = model.traceability.find((row) => row.acId === 'CS-7-AC1').exactBindings[0];
  assert.match(exactSha.setup, /advance fixture origin\/main to SHA B/);
  assert.match(exactSha.testFileOrProcedureId, /require-ci-workflow\.test\.mjs/);
  assert.equal(exactSha.reviewStatus, 'REVIEWED');
  const override = model.traceability.find((row) => row.acId === 'CS-7-AC2').exactBindings[0];
  assert.match(override.assertion, /No override_ci/);
  assert.match(override.expectedResult, /No actor can bypass exact-SHA CI/);
  const refusal = model.traceability.find((row) => row.acId === 'CS-7-AC3').exactBindings[0];
  assert.match(refusal.assertion, /source hash/);
  assert.match(refusal.assertion, /needs\/conditions/);
  assert.match(refusal.setup, /three independent runs/);
  assert.match(refusal.procedure, /success-A then advance fixture main to B/);
  assert.match(refusal.assertion, /distinct success-A\/move-main-to-B run/);
  assert.match(refusal.negativeCase, /advances main only during a failed-A run is insufficient/);
  assert.equal(refusal.reviewStatus, 'REVIEWED');
  const integration = model.traceability.find((row) => row.acId === 'CS-9-AC2').exactBindings;
  assert.deepEqual(
    integration.map((entry) => entry.type),
    ['AUTOMATED_CONTRACT', 'AUTOMATED_INTEGRATION'],
  );
  assert.match(integration[0].assertion, /not execution evidence/);
  assert.match(integration[1].assertion, /actual executed tests/);
  assert.ok(integration.every((entry) => entry.testStatus === 'PLANNED'));
});

test('private rendering plan distinguishes cold session fixtures and genuine API denial', () => {
  const binding = buildCatalog(fresh()).traceability.find((row) => row.acId === 'CS-6-AC2')
    .exactBindings[0];
  assert.match(binding.setup, /fresh browser context/);
  assert.match(binding.setup, /not mocked false session/);
  assert.match(binding.assertion, /cached authenticated navigation remains usable/);
  assert.match(binding.procedure, /actual private feature components/);
  assert.equal(binding.testStatus, 'PLANNED');
});

test('proxy plan limits container publication without prohibiting approved management access', () => {
  const binding = buildCatalog(fresh()).traceability.find((row) => row.acId === 'CS-3-AC2')
    .exactBindings[0];
  assert.equal(binding.type, 'LIVE_HOST');
  assert.match(binding.assertion, /anchor and dependent namespace identities are unchanged/);
  assert.match(binding.assertion, /Host publication remains only the intended edge ports/);
  assert.match(binding.assertion, /SSH\/operator access is not disabled/);
  assert.equal(binding.testStatus, 'PLANNED');
});

test('CS3 distinguishes tested recovery logic from current deployed topology evidence', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-3');
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-3');
  assert.equal(ticket.releaseTarget, '3.0.1');
  assert.equal(ticket.status, 'UAT');
  assert.equal(ticket.blocked, true);
  assert.equal(spec.sections.delivery.requirements[0].releaseState, 'ACTIVE_R1');
  assert.equal(spec.sections.delivery.requirements[0].deliveryMode, 'MANUAL_GATE');
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  const current = spec.sections.completionEvidence.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  assert.ok(current.some((entry) => /2026-09-28/.test(entry) && /2026-09-29/.test(entry)));
  assert.ok(current.some((entry) => /currentStep mentions backup work unrelated/.test(entry)));
  const checklist = spec.sections.implementationChecklist.requirements.map((entry) =>
    typeof entry === 'string' ? entry : entry.requirement,
  );
  assert.ok(checklist.some((entry) => /infra\/compose\.production\.yml/.test(entry)));
  assert.ok(
    checklist.some((entry) => /human-approved live-host Caddy-only crash procedure/.test(entry)),
  );
  const ac1 = model.traceability.find((entry) => entry.acId === 'CS-3-AC1').exactBindings[0];
  const ac2 = model.traceability.find((entry) => entry.acId === 'CS-3-AC2').exactBindings[0];
  assert.deepEqual(
    spec.sections.acceptanceCriteria.requirements.map((entry) => entry.verificationIds),
    [['AUTOMATED_UNIT'], ['LIVE_HOST']],
  );
  assert.deepEqual([ac1.type, ac2.type], ['AUTOMATED_UNIT', 'LIVE_HOST']);
  assert.ok(
    spec.sections.testStrategy.requirements.some((entry) =>
      entry.verification?.some(
        (verification) =>
          verification.type === 'LIVE_HOST' &&
          verification.expectedCheck === ac2.assertion &&
          verification.releaseGate === 'LIVE_PROXY_TOPOLOGY_RECOVERY',
      ),
    ),
  );
  assert.match(ac1.assertion, /cooldown/);
  assert.match(ac2.procedure, /terminate only that container/);
  assert.ok([ac1, ac2].every((entry) => entry.testStatus === 'PLANNED'));
  assert.equal(ac2.reviewStatus, 'REVIEWED');
  assert.match(ac2.preconditions, /otherwise this AC cannot pass/);
  assert.match(ac2.setup, /owner-defined start\/end bounds/);
  const asyncScope = spec.sections.functionalRequirements.requirements
    .map((entry) => (typeof entry === 'string' ? entry : entry.requirement))
    .join(' ');
  assert.match(asyncScope, /frozen AC2 only requires killing Caddy and observing the result/);
  assert.match(asyncScope, /frozen host observation separately as PARTIAL/);
  assert.match(asyncScope, /strengthened AC2 verification NOT_VERIFIED/);
  assert.match(asyncScope, /do not accept the ticket/);
  const operatorRunbook = fs.readFileSync(
    path.join(root, '.ai/OPERATOR-RUNBOOK-host-evidence.md'),
    'utf8',
  );
  const cs3Runbook = operatorRunbook
    .split('## CS-3 — proxy crash and stable-anchor observation')[1]
    .split('## CS-25 —')[0];
  assert.match(cs3Runbook, /infra\/check-proxy-recovery\.sh/);
  assert.doesNotMatch(cs3Runbook, /infra\/v3\/check-proxy-recovery\.sh/);
  assert.match(
    spec.sections.manualExternalGates.requirements.map((entry) => entry.requirement).join(' '),
    /historical warning against a proxy-only restart applies if Caddy owns the shared namespace/,
  );
  assert.equal(
    model.designTraceability.find((entry) => entry.ticketId === 'CS-3').status,
    'DESIGN_NOT_APPLICABLE',
  );
});

test('native reviewer no-edit observation is not capability enforcement evidence', () => {
  const binding = buildCatalog(fresh()).traceability.find((row) => row.acId === 'CS-12-AC4')
    .exactBindings[0];
  assert.match(binding.assertion, /not PASS/);
  assert.match(binding.negativeCase, /zero observed edits alone cannot pass/);
  assert.equal(binding.testStatus, 'PLANNED');
});

test('whole-spec approval is content-bound and invalidates after substantive changes', () => {
  const inputs = fresh();
  const approved = buildCatalog(inputs).specs.find((entry) => entry.ticketId === 'CS-3');
  assert.equal(approved.reviewState, 'APPROVED');
  assert.equal(approved.readiness, 'IMPLEMENTATION_READY');
  assert.equal(approved.gaps[0].disposition, 'RESOLVED');
  assert.equal(buildCatalog(inputs).counts.approvedSpecificationCount, 63);

  inputs.policy.ticketRefinements['CS-3'].additionalRequirements.value[0] +=
    ' Substantive mutation invalidates review.';
  const changedModel = buildCatalog(inputs);
  assert.equal(changedModel.specs.find((entry) => entry.ticketId === 'CS-3').reviewState, 'DRAFT');
  assert.ok(
    validate(changedModel, inputs).some((error) =>
      error.includes('unproven content-bound whole-specification review CS-3'),
    ),
  );
});

test('public static planning retains partial design and named future audit boundaries', () => {
  const model = buildCatalog(fresh());
  assert.equal(
    model.designTraceability.find((row) => row.ticketId === 'CS-11').status,
    'DESIGN_PARTIAL',
  );
  const visual = model.traceability.find((row) => row.acId === 'CS-11-AC1').exactBindings[0];
  assert.match(visual.assertion, /Missing exact mapping returns DESIGN_PARTIAL/);
  const audit = model.traceability.find((row) => row.acId === 'CS-11-AC4').exactBindings[0];
  assert.equal(audit.type, 'MANUAL_ACCESSIBILITY');
  assert.match(audit.assertion, /Unavailable audit tools/);
  assert.equal(audit.testStatus, 'PLANNED');
  const privacy = model.traceability.find((row) => row.acId === 'CS-11-AC5').exactBindings[0];
  assert.match(privacy.assertion, /pageFiles list unchanged/);
});

test('CS-100 full-reference board maps related candidate screens without transferring ownership', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const trace = model.designTraceability.find((row) => row.ticketId === 'CS-100');

  assert.equal(trace.status, 'DESIGN_PARTIAL');
  assert.deepEqual(
    trace.screens.map((screen) => [
      screen.designId,
      screen.ownerTicketId,
      screen.mappingRelationship,
    ]),
    [
      [
        'connectors-connected-accounts-connected-accounts-user',
        'CS-162',
        'RELATED_SCOPE_NOT_OWNERSHIP',
      ],
      [
        'connectors-connected-accounts-mobile-connected-accounts',
        'CS-169',
        'RELATED_SCOPE_NOT_OWNERSHIP',
      ],
    ],
  );
  assert.ok(
    trace.screens.every((screen) =>
      screen.mappingRationale.includes('remain implementation-owned'),
    ),
  );
  assert.ok(!trace.screens.some((screen) => screen.variantType === 'ADMIN_SURFACE'));
  const ac3 = model.traceability.find((row) => row.acId === 'CS-100-AC3');
  assert.match(ac3.exactBindings[1].procedure, /expired-session/);
  assert.match(ac3.exactBindings[1].procedure, /contract-defined recovery destination/);
  assert.equal(ac3.exactBindings[1].testStatus, 'MANUAL_REQUIRED');
  assert.equal(ac3.exactBindings[1].reviewStatus, 'REVIEWED');
  assert.ok(validate(model, inputs).every((error) => !error.includes('board mapping')));
});

test('CS-101 specifies only the real preparation AI boundary and preserves CS-130 screen ownership', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-101');
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-101');
  const text = JSON.stringify(spec);
  const trace = new Map(model.traceability.map((row) => [row.acId, row]));

  assert.equal(ticket.status, 'BACKLOG');
  assert.equal(ticket.releaseState, 'CONDITIONAL');
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(
    model.designTraceability.find((entry) => entry.ticketId === 'CS-101').status,
    'DESIGN_PARTIAL',
  );
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-101' && finding.code === 'PARTIAL_DESIGN',
    ).disposition,
    'RECLASSIFIED',
  );
  assert.match(text, /CS-130/);
  assert.match(text, /route UNKNOWN/);
  assert.match(text, /preparation-coaching/);
  assert.match(text, /No AI application assistant route/);
  assert.match(text, /never marks Applied/);
  assert.match(text, /AI_ENABLED/);
  assert.doesNotMatch(text, /stage_8_enabled is a live runtime flag/);

  for (const id of ['CS-101-AC1', 'CS-101-AC2', 'CS-101-AC3', 'CS-101-AC4']) {
    const row = trace.get(id);
    assert.ok(row, `${id} must remain mapped to a source criterion`);
    assert.ok(row.exactBindings.length > 0, `${id} requires an exact planned or manual binding`);
    assert.ok(row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'));
    assert.ok(
      row.exactBindings.every((binding) =>
        ['PLANNED', 'MANUAL_REQUIRED'].includes(binding.testStatus),
      ),
      `${id} must not fabricate execution evidence`,
    );
  }
  assert.ok(
    trace
      .get('CS-101-AC3')
      .exactBindings.some((binding) => binding.type === 'MANUAL_ACCESSIBILITY'),
  );
  assert.ok(
    trace.get('CS-101-AC2').exactBindings.some((binding) => binding.type === 'VISUAL_REGRESSION'),
  );
  const ac1 = trace.get('CS-101-AC1').exactBindings[0];
  assert.match(ac1.setup, /POST \/api\/preparation\/\{checkId\}\/ai-elaborate/);
  assert.match(ac1.setup, /Do not mock or claim a provider invocation/);
  assert.match(ac1.procedure, /exactly one POST/);
  assert.match(ac1.procedure, /encoded checkId/);
  assert.match(ac1.procedure, /zero `POST \/api\/preparation\/\{checkId\}\/ai-elaborate` requests/);
  assert.match(
    ac1.procedure,
    /ordinary deterministic `GET \/api\/preparation` report may still load/,
  );
  assert.doesNotMatch(JSON.stringify(ac1), /provider spy|deterministic provider mock/);
  const ac4 = trace.get('CS-101-AC4').exactBindings[0];
  assert.match(ac4.procedure, /no AI-driven application submission or resume-rewrite operation/);
  assert.match(
    ac4.procedure,
    /existing candidate-owned resume\/application APIs are not disabled or redefined/,
  );
  assert.doesNotMatch(ac4.procedure, /no API\/application operation exists/);
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-101' && finding.code === 'SURFACE_SPEC_REFINEMENT',
    ).disposition,
    'RESOLVED',
  );
});

test('CS-102 specifies a future recruiter shell without inventing route or consent contracts', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-102');
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-102');
  const text = JSON.stringify(spec);
  const trace = new Map(model.traceability.map((row) => [row.acId, row]));

  assert.equal(ticket.status, 'BACKLOG');
  assert.equal(ticket.releaseState, 'FUTURE');
  assert.equal(ticket.route.state, 'NOT_APPLICABLE');
  assert.equal(ticket.featureFlag.default, false);
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(
    model.designTraceability.find((entry) => entry.ticketId === 'CS-102').status,
    'DESIGN_PARTIAL',
  );
  assert.match(text, /CS-177–CS-192/);
  assert.match(text, /server-derived recruiter principal/);
  assert.match(text, /withdrawn/);
  assert.match(text, /does not assign a standalone URL/);
  assert.match(text, /NOT_APPLICABLE for CS-102 itself/);
  assert.match(text, /stage_9_enabled/);
  assert.equal(ticket.route.path, null);

  for (let index = 1; index <= 4; index += 1) {
    const row = trace.get(`CS-102-AC${index}`);
    assert.ok(row?.exactBindings.length, `CS-102-AC${index} must have an exact binding`);
    assert.ok(row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'));
    assert.ok(
      row.exactBindings.every((binding) =>
        ['PLANNED', 'MANUAL_REQUIRED'].includes(binding.testStatus),
      ),
    );
  }
  assert.ok(
    trace.get('CS-102-AC2').exactBindings.some((binding) => binding.type === 'VISUAL_REGRESSION'),
  );
  assert.ok(
    trace
      .get('CS-102-AC3')
      .exactBindings.some((binding) => binding.type === 'MANUAL_ACCESSIBILITY'),
  );
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-102' && finding.code === 'PARTIAL_DESIGN',
    ).disposition,
    'RECLASSIFIED',
  );
});

test('CS-103 specifies only a fail-closed redacted operations shell boundary', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-103');
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-103');
  const text = JSON.stringify(spec);
  const trace = new Map(model.traceability.map((row) => [row.acId, row]));

  assert.equal(ticket.status, 'BACKLOG');
  assert.equal(ticket.releaseState, 'FUTURE');
  assert.equal(ticket.route.path, null);
  assert.equal(ticket.featureFlag.default, false);
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  assert.equal(
    model.designTraceability.find((entry) => entry.ticketId === 'CS-103').status,
    'DESIGN_PARTIAL',
  );
  assert.match(text, /CS-201–CS-212/);
  assert.match(text, /CS-104/);
  assert.match(text, /no operations-data read/);
  assert.match(text, /generic database console/);
  assert.match(text, /never render design-board names, counts, costs/);
  assert.match(text, /NOT_APPLICABLE for CS-103 itself/);
  assert.match(text, /stage_11_enabled/);
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-103' && finding.code === 'PARTIAL_DESIGN',
    ).disposition,
    'RECLASSIFIED',
  );
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-103' && finding.code === 'SURFACE_SPEC_REFINEMENT',
    ).disposition,
    'RESOLVED',
  );

  for (let index = 1; index <= 4; index += 1) {
    const row = trace.get(`CS-103-AC${index}`);
    assert.ok(row?.exactBindings.length, `CS-103-AC${index} must have an exact binding`);
    assert.ok(row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'));
    assert.ok(
      row.exactBindings.every((binding) =>
        ['PLANNED', 'MANUAL_REQUIRED'].includes(binding.testStatus),
      ),
      `CS-103-AC${index} must not claim future verification as executed`,
    );
    assert.ok(
      row.exactBindings.every(
        (binding) =>
          binding.setup &&
          binding.procedure &&
          binding.assertion &&
          binding.expectedResult &&
          binding.testName &&
          binding.testFileOrProcedureId &&
          binding.fixtures &&
          binding.negativeCase &&
          binding.evidenceArtifact &&
          binding.reviewer &&
          binding.releaseGate,
      ),
      `CS-103-AC${index} bindings must be actionable and evidence-specific`,
    );
  }
  assert.ok(
    trace.get('CS-103-AC3').exactBindings.some((binding) => binding.type === 'AUTOMATED_SECURITY'),
  );
  assert.ok(
    trace
      .get('CS-103-AC3')
      .exactBindings.some((binding) => binding.type === 'MANUAL_ACCESSIBILITY'),
  );
  assert.ok(
    trace.get('CS-103-AC2').exactBindings.some((binding) => binding.type === 'VISUAL_REGRESSION'),
  );
  assert.match(text, /Render no secret, token, cookie, authorization header/);
  assert.match(text, /raw resume, raw candidate record/);
  assert.match(text, /generic administrative action/);
});

test('CS-104 specifies the shared server-authoritative permission and transaction boundary', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-104');
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-104');
  const text = JSON.stringify(spec);
  const trace = new Map(model.traceability.map((row) => [row.acId, row]));

  assert.equal(ticket.status, 'BACKLOG');
  assert.equal(ticket.releaseState, 'RELEASE');
  assert.equal(ticket.route.path, null);
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  assert.equal(
    model.designTraceability.find((entry) => entry.ticketId === 'CS-104').status,
    'DESIGN_VERIFIED',
  );
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-104' && finding.code === 'SURFACE_SPEC_REFINEMENT',
    ).disposition,
    'RESOLVED',
  );
  assert.match(text, /route\/role\/release\/flag matrix/);
  assert.match(text, /Server\/API authorization derives the principal/);
  assert.match(text, /Client-selected owner IDs, roles, permissions/);
  assert.match(text, /idempotency\/replay protection/);
  assert.match(text, /generic admin database operation/);
  assert.match(text, /EXISTING_CONTRACT/);
  assert.match(text, /PLANNED_CONTRACT/);
  assert.match(text, /NOT_APPLICABLE for new persistence/);
  assert.match(text, /no protected read on denial/);

  for (let index = 1; index <= 3; index += 1) {
    const row = trace.get(`CS-104-AC${index}`);
    assert.ok(row?.exactBindings.length, `CS-104-AC${index} must have an exact binding`);
    assert.ok(row.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'));
    assert.ok(
      row.exactBindings.every((binding) => binding.testStatus === 'PLANNED'),
      `CS-104-AC${index} must not claim future checks executed`,
    );
    assert.ok(
      row.exactBindings.every(
        (binding) =>
          binding.setup &&
          binding.procedure &&
          binding.assertion &&
          binding.expectedResult &&
          binding.testName &&
          binding.testFileOrProcedureId &&
          binding.fixtures &&
          binding.negativeCase &&
          binding.failureCase &&
          binding.evidenceArtifact &&
          binding.reviewer &&
          binding.releaseGate,
      ),
    );
  }
  assert.ok(
    trace.get('CS-104-AC1').exactBindings.some((binding) => binding.type === 'AUTOMATED_SECURITY'),
  );
  assert.ok(
    trace.get('CS-104-AC2').exactBindings.some((binding) => binding.type === 'AUTOMATED_CONTRACT'),
  );
  assert.ok(
    trace.get('CS-104-AC3').exactBindings.some((binding) => binding.type === 'AUTOMATED_SECURITY'),
  );
});

test('CS-105 shared primitives preserve source-backed assets and manual accessibility gates', () => {
  const model = buildCatalog(fresh());
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-105');
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  assert.match(JSON.stringify(spec.sections.functionalRequirements), /upward-growth-arrow/);
  assert.match(JSON.stringify(spec.sections.testStrategy), /NVDA|VoiceOver/);
  assert.match(JSON.stringify(spec.sections.securityPrivacy), /client-selected owner/);
  assert.equal(spec.sections.design.applicability, 'APPLICABLE');
  const ac5 = model.traceability.find((row) => row.acId === 'CS-105-AC5');
  assert.equal(ac5.exactBindings.length, 2);
  assert.ok(ac5.exactBindings.some((binding) => binding.type === 'MANUAL_ACCESSIBILITY'));
  assert.ok(ac5.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'));
  assert.ok(ac5.exactBindings.every((binding) => binding.testStatus !== 'EXISTING_VERIFIED'));
});

test('CS-106 shared interaction components keep ownership and accessibility boundaries explicit', () => {
  const model = buildCatalog(fresh());
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-106');
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  assert.match(JSON.stringify(spec.sections.functionalRequirements), /page\/shell templates/);
  assert.match(JSON.stringify(spec.sections.securityPrivacy), /never authorize actions/);
  assert.match(JSON.stringify(spec.sections.accessibility), /NVDA\/VoiceOver/);
  const ac4 = model.traceability.find((row) => row.acId === 'CS-106-AC4');
  assert.equal(ac4.exactBindings.length, 2);
  assert.ok(ac4.exactBindings.some((binding) => binding.type === 'AUTOMATED_ACCESSIBILITY'));
  assert.ok(ac4.exactBindings.some((binding) => binding.type === 'MANUAL_ACCESSIBILITY'));
  assert.ok(ac4.exactBindings.every((binding) => binding.reviewStatus === 'REVIEWED'));
});

test('CS-107 cross-surface evidence keeps accessibility, locale and authorization boundaries explicit', () => {
  const model = buildCatalog(fresh());
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-107');
  assert.equal(spec.reviewState, 'APPROVED');
  assert.equal(spec.readiness, 'IMPLEMENTATION_READY');
  assert.match(JSON.stringify(spec.sections.functionalRequirements), /must not claim translations/);
  assert.match(JSON.stringify(spec.sections.securityPrivacy), /client-selected owner/);
  const ac1 = model.traceability.find((row) => row.acId === 'CS-107-AC1');
  const ac2 = model.traceability.find((row) => row.acId === 'CS-107-AC2');
  const ac3 = model.traceability.find((row) => row.acId === 'CS-107-AC3');
  assert.equal(ac1.exactBindings.length, 2);
  assert.equal(ac3.exactBindings.length, 2);
  assert.ok(ac1.exactBindings.some((binding) => binding.type === 'MANUAL_ACCESSIBILITY'));
  assert.match(ac2.exactBindings[0].procedure, /independently authored expected-output oracle/);
  assert.ok(ac3.exactBindings.some((binding) => binding.type === 'AUTOMATED_BROWSER'));
  assert.ok(
    [...ac1.exactBindings, ...ac2.exactBindings, ...ac3.exactBindings].every(
      (binding) => binding.reviewStatus === 'REVIEWED',
    ),
  );
});

test('CS-100 binding refinement fails closed for unsupported ACs, fields, and indexes', () => {
  const inputs = fresh();
  inputs.policy.ticketRefinements['CS-100'].bindingAmendments['CS-100-AC9'] = {
    0: { procedure: 'No source criterion exists.' },
  };
  inputs.policy.ticketRefinements['CS-100'].bindingAmendments['CS-100-AC3']['9'] = {
    procedure: 'There is no ninth AC3 binding.',
  };
  inputs.policy.ticketRefinements['CS-100'].bindingAmendments['CS-100-AC3']['1'].reviewStatus =
    'APPROVED';

  const errors = validate(buildCatalog(inputs), inputs);
  assert.ok(errors.some((error) => error.includes('orphan binding amendment CS-100-AC9')));
  assert.ok(errors.some((error) => error.includes('invalid binding amendment index CS-100-AC3.9')));
  assert.ok(
    errors.some((error) => error.includes('invalid binding amendment fields CS-100-AC3.1')),
  );
});

test('216 source-linked drafts preserve registry and canonical stages without readiness fabrication', () => {
  const inputs = fresh();
  const before = JSON.stringify(inputs);
  const model = buildCatalog(inputs);
  assert.deepEqual(validate(model, inputs), []);
  assert.equal(JSON.stringify(inputs), before);
  assert.equal(model.specs.length, 216);
  assert.equal(SECTIONS.length, 30);
  assert.deepEqual(model.counts.workflow, {
    BACKLOG: 141,
    TODO: 0,
    IN_PROGRESS: 0,
    QA: 5,
    UAT: 70,
    PROD: 0,
  });
  assert.equal(model.counts.blockedTicketCount, 37);
  assert.equal(model.actions.length, 15);
  assert.equal(model.counts.completeSpecificationCount, 63);
  assert.equal(model.counts.incompleteSpecificationCount, 153);
  assert.equal(model.counts.approvedSpecificationCount, 63);
  assert.equal(model.counts.reviewedExactTestBindingCount, 272);
  assert.equal(model.counts.acceptanceCriterionCount, 906);
  assert.equal(model.counts.mappedAcceptanceCriterionCount, 255);
  assert.equal(model.counts.unmappedAcceptanceCriterionCount, 651);
  assert.equal(model.counts.authoredExactTestBindingCount, 348);
  assert.equal(model.counts.ownerDecisionReconciliationCount, 11);
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-46' && finding.code === 'EXACT_AC_TEST_BINDING',
    ).disposition,
    'RESOLVED',
  );
  assert.equal(
    model.findings.find(
      (finding) => finding.ticketId === 'CS-8' && finding.code === 'EXACT_AC_TEST_BINDING',
    ).disposition,
    'RESOLVED',
  );
  assert.equal(model.findings.length, 650);
  for (const id of ['CS-45', 'CS-107', 'CS-108'])
    assert.equal(model.designTraceability.find((entry) => entry.ticketId === id).ui, true);
  assert.ok(
    model.traceability.every((row) =>
      row.verification.every((entry) =>
        /^(MANUAL_OR_EXTERNAL_NOT_EXECUTED|PLANNED|PLANNED_NOT_EXECUTED|EXISTING_VERIFIED|MANUAL_REQUIRED|HOSTED_REQUIRED|EXTERNAL_REQUIRED)$/.test(
          entry.automationStatus,
        ),
      ),
    ),
  );
  assert.equal(
    model.specs.find((spec) => spec.ticketId === 'CS-216').sections.design.requirements[0].status,
    'DESIGN_GAP',
  );
  assert.ok(
    model.specs
      .find((spec) => spec.ticketId === 'CS-46')
      .gaps.some((gap) => gap.code === 'OWNER_DECISION'),
  );
});

test('existing owner directions retain source provenance without fabricated readiness', () => {
  const inputs = fresh();
  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === 'CS-46');
  const direction = spec.sections.technicalApproach.requirements.find(
    (entry) => entry?.approvedDirection,
  );
  assert.equal(direction.source.commit, '154974acc372ee0ec2434c95107e7746ee3c59a7');
  assert.match(direction.approvedDirection, /without silently clearing candidate intent/);
  assert.match(direction.remainingGate, /lower bound/);
  assert.equal(spec.reviewState, 'DRAFT');
  assert.equal(model.counts.approvedSpecificationCount, 63);
  inputs.policy.decisionReconciliations['CS-46'].section = 'invented owner approval';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unresolved owner decision section CS-46'),
    ),
  );
});

test('exact draft bindings cannot masquerade as reviewed or passing tests', () => {
  const inputs = fresh();
  const binding = inputs.policy.exactVerificationBindings['CS-46-AC2'][0];
  assert.match(binding.assertion, /reparse/);
  assert.match(binding.negativeCase, /foreign-owner/);
  binding.testStatus = 'PASS';
  binding.reviewStatus = 'APPROVED';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven exact binding approval/execution'),
    ),
  );
});

test('exact bindings preserve planned, existing, manual, hosted, and external evidence states', () => {
  const inputs = fresh();
  const binding = inputs.policy.exactVerificationBindings['CS-46-AC2'][0];
  for (const status of [
    'EXISTING_VERIFIED',
    'PLANNED',
    'MANUAL_REQUIRED',
    'HOSTED_REQUIRED',
    'EXTERNAL_REQUIRED',
  ]) {
    binding.testStatus = status;
    assert.equal(
      validate(buildCatalog(inputs), inputs).some((error) =>
        error.includes('unproven exact binding approval/execution CS-46-AC2'),
      ),
      false,
      `${status} should be representable without claiming a test passed`,
    );
  }
  binding.testStatus = 'PASS';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven exact binding approval/execution CS-46-AC2'),
    ),
  );
});

test('changing an assertion invalidates independent content-bound binding review', () => {
  const inputs = fresh();
  inputs.policy.exactVerificationBindings['CS-46-AC2'][0].assertion += ' silently clear exclusions';
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven content-bound verification review CS-46-AC2'),
    ),
  );
});

test('missing review receipt cannot count as independently reviewed traceability', () => {
  const inputs = fresh();
  delete inputs.policy.verificationReviewReceipts['CS-46-AC1'];
  assert.ok(
    validate(buildCatalog(inputs), inputs).some((error) =>
      error.includes('unproven content-bound verification review CS-46-AC1'),
    ),
  );
});

test('agile fixture scenarios preserve canonical state byte-for-byte', () => {
  const files = [
    '.ai/backlog.json',
    '.ai/LOOP-STATE.json',
    '.ai/process-mode.json',
    '.ai/findings.json',
    '.ai/release-plan.json',
    `.ai/tickets/${new Date().toISOString().slice(0, 10)}.json`,
  ];
  const snapshot = () =>
    files.map((file) => {
      const full = path.join(root, file);
      return fs.existsSync(full) ? fs.readFileSync(full).toString('base64') : null;
    });
  const before = snapshot();
  const result = spawnSync(process.execPath, ['scripts/check-agile-gates.mjs'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.deepEqual(
    snapshot(),
    before,
    'fixture suite must never replace canonical ticket/review state',
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ALL AGILE GATES PROVEN/);
});

test('inherited sandbox flag cannot run destructive fixtures in the canonical checkout', () => {
  const files = [
    '.ai/backlog.json',
    '.ai/LOOP-STATE.json',
    '.ai/findings.json',
    '.ai/process-mode.json',
  ];
  const snapshot = () =>
    files.map((file) => fs.readFileSync(path.join(root, file)).toString('base64'));
  const before = snapshot();
  const result = spawnSync(process.execPath, ['scripts/check-agile-gates.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      CAREERSCOPE_AGILE_GATE_SANDBOX: '1',
      CAREERSCOPE_AGILE_GATE_ROOT: root,
      CAREERSCOPE_AGILE_GATE_SOURCE: root,
      CAREERSCOPE_AGILE_GATE_PARENT_TMP: path.dirname(root),
    },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /REFUSED: agile fixtures require/);
  assert.deepEqual(snapshot(), before);
});

test('bindings require complete procedures, canonical AC IDs and valid verification types', () => {
  const inputs = fresh();
  const binding = inputs.policy.exactVerificationBindings['CS-46-AC2'][0];
  delete binding.assertion;
  binding.type = 'TRUST_ME';
  inputs.policy.exactVerificationBindings['CS-999-AC1'] = [binding];
  const errors = validate(buildCatalog(inputs), inputs);
  assert.ok(errors.some((error) => error.includes('incomplete exact binding CS-46-AC2.assertion')));
  assert.ok(errors.some((error) => error.includes('invalid exact binding type')));
  assert.ok(errors.some((error) => error.includes('orphan exact binding')));
});

test('unknown release assignments do not become implementation authorization', () => {
  const inputs = fresh();
  const ticket = inputs.backlog.items.find((ticket) => ticket.id === 'CS-1');
  delete ticket.releaseState;
  inputs.coverage.tickets = inputs.coverage.tickets.filter((entry) => entry.ticketId !== ticket.id);
  const spec = buildCatalog(inputs).specs.find((entry) => entry.ticketId === ticket.id);
  assert.equal(spec.sections.delivery.requirements[0].deliveryMode, 'UNDECIDED');
});

test('design release scope cannot authorize an unassigned ticket for implementation', () => {
  const inputs = fresh();
  const ticket = inputs.backlog.items.find((entry) => entry.id === 'CS-6');
  delete ticket.releaseState;
  ticket.releaseTarget = null;
  const design = inputs.coverage.tickets.find((entry) => entry.ticketId === ticket.id);
  design.releaseState = 'RELEASE';

  const model = buildCatalog(inputs);
  const spec = model.specs.find((entry) => entry.ticketId === ticket.id);
  const delivery = spec.sections.delivery.requirements[0];
  assert.equal(design.releaseState, 'RELEASE');
  assert.equal(delivery.releaseState, 'UNSPECIFIED');
  assert.equal(delivery.deliveryMode, 'UNDECIDED');
  assert.ok(spec.gaps.some((gap) => gap.code === 'RELEASE_TARGET_UNDECIDED'));
  assert.ok(spec.gaps.some((gap) => gap.code === 'RELEASE_STATE_UNSPECIFIED'));
});

test('graph rejects dangling, duplicate, self and cyclic prerequisites without repairing source', () => {
  const graph = dependencyGraph([
    { id: 'CS-1', dependencies: ['CS-2', 'CS-2', 'CS-99'] },
    { id: 'CS-2', dependencies: ['CS-1'] },
    { id: 'CS-3', dependencies: ['CS-3'] },
  ]);
  for (const pattern of ['dangling', 'duplicate', 'self', 'cycle'])
    assert.ok(graph.errors.some((error) => error.includes(pattern)));
  assert.deepEqual(graph.cyclicOrCycleDependent, ['CS-1', 'CS-2', 'CS-3']);
  assert.deepEqual(graph.cycles, [['CS-1', 'CS-2'], ['CS-3']]);
});

test('cycle detection separates cyclic components from downstream blocked nodes', () => {
  const graph = dependencyGraph([
    { id: 'CS-1', dependencies: ['CS-2'] },
    { id: 'CS-2', dependencies: ['CS-1'] },
    { id: 'CS-3', dependencies: ['CS-2'] },
    { id: 'CS-4', dependencies: [] },
    { id: 'CS-5', dependencies: ['CS-4'] },
  ]);
  assert.deepEqual(graph.cycles, [['CS-1', 'CS-2']]);
  assert.deepEqual(graph.cyclicOrCycleDependent, ['CS-1', 'CS-2', 'CS-3']);
  assert.deepEqual(graph.longestDeclaredChain, ['CS-4', 'CS-5']);
});

test('graph layers put every prerequisite before its dependent', () => {
  const model = buildCatalog(fresh());
  const layer = new Map(model.graph.layers.flatMap((ids, index) => ids.map((id) => [id, index])));
  assert.equal(layer.size, 216);
  for (const edge of model.graph.edges)
    assert.ok(layer.get(edge.prerequisite) < layer.get(edge.dependent));
  assert.equal(
    model.graph.edges.filter((edge) => edge.type === 'SEQUENCING' && edge.dependent === 'CS-47')
      .length,
    7,
  );
  assert.ok(layer.get('CS-47') > layer.get('CS-19'));
});

test('editorial sequencing requires exact source AC support', () => {
  const inputs = fresh();
  inputs.policy.sequencingEdges.push({
    prerequisite: 'CS-25',
    dependent: 'CS-47',
    sourceAcIndex: 3,
  });
  const model = buildCatalog(inputs);
  assert.ok(validate(model, inputs).some((error) => error.includes('unproven sequencing')));
});

test('sequencing proof never accepts CS-1 as a prefix of CS-13', () => {
  const inputs = fresh();
  inputs.policy.sequencingEdges.push({
    prerequisite: 'CS-1',
    dependent: 'CS-47',
    sourceAcIndex: 3,
  });
  const model = buildCatalog(inputs);
  assert.ok(
    validate(model, inputs).some((error) => error.includes('unproven sequencing CS-1:CS-47')),
  );
});

for (const [name, corrupt, expected] of [
  ['missing spec', (model) => model.specs.pop(), 'missing specification'],
  [
    'null requirement',
    (model) => {
      model.specs[0].sections.problem.requirements = [null];
    },
    'malformed requirement',
  ],
  [
    'nonexistent source',
    (model) => {
      model.specs[0].sections.securityPrivacy.sources = ['docs/missing.md'];
    },
    'missing source',
  ],
  [
    'empty expected check',
    (model) => {
      model.traceability[0].verification[0].expectedCheck = '';
    },
    'source projection drift',
  ],
  [
    'invalid release state',
    (model) => {
      model.specs[0].sections.delivery.requirements[0].releaseState = 'ENABLED';
    },
    'source projection drift',
  ],
  ['removed design mapping', (model) => model.designTraceability.pop(), 'source projection drift'],
  [
    'false verified design',
    (model) => {
      model.designTraceability.find((entry) => entry.ticketId === 'CS-216').status =
        'DESIGN_VERIFIED';
    },
    'source projection drift',
  ],
  [
    'lost graph edge',
    (model) => {
      model.graph.edges = [];
    },
    'source projection drift',
  ],
  [
    'orphan spec',
    (model) => {
      model.specs[0].ticketId = 'CS-999';
    },
    'orphan/duplicate spec',
  ],
  [
    'missing section',
    (model) => {
      delete model.specs[0].sections.seo;
    },
    'invalid section',
  ],
  [
    'empty N/A rationale',
    (model) => {
      model.specs[0].sections.seo = { applicability: 'NOT_APPLICABLE', reason: '' };
    },
    'empty section',
  ],
  [
    'changed criterion',
    (model) => {
      model.specs[0].sections.acceptanceCriteria.requirements[0].sourceText = 'works';
    },
    'criterion drift',
  ],
  [
    'missing verification',
    (model) => {
      model.traceability[0].verification = [];
    },
    'unmapped AC',
  ],
  [
    'invalid verification type',
    (model) => {
      model.traceability[0].verification[0].type = 'FAKE_APPROVAL';
    },
    'unmapped AC',
  ],
  [
    'duplicate traceability',
    (model) => model.traceability.push(model.traceability[0]),
    'duplicate test mapping',
  ],
  [
    'orphan traceability',
    (model) => {
      model.traceability[0].acId = 'CS-999-AC1';
    },
    'orphan/drift test',
  ],
  [
    'duplicate epic membership',
    (model) => model.epics[1].childTicketIds.push(model.epics[0].childTicketIds[0]),
    'duplicate epic membership',
  ],
  [
    'missing design asset',
    (model) => model.designTraceability[0].references.push('design/missing.png'),
    'missing reference',
  ],
  [
    'missing manual instructions',
    (model) => {
      model.actions[0].instructions = '';
    },
    'incomplete manual action',
  ],
  ['lost hostpending action', (model) => model.actions.pop(), 'missing hostpending'],
]) {
  test(`checker fails closed: ${name}`, () => {
    const inputs = fresh();
    const model = buildCatalog(inputs);
    corrupt(model);
    assert.ok(validate(model, inputs).some((error) => error.includes(expected)));
  });
}

test('canonical status and blocker drift cannot pass specification validation', () => {
  const inputs = fresh();
  inputs.backlog.items[0].status = 'BLOCKED';
  inputs.backlog.items[0].blocked = !inputs.backlog.items[0].blocked;
  const errors = validate(buildCatalog(inputs), inputs);
  assert.ok(errors.some((error) => error.includes('legacy workflow')));
  assert.ok(errors.some((error) => error.includes('blocker drift')));
});

test('generation twice has identical names and formatted bytes without timestamps', async () => {
  const first = await artifacts(fresh(), root);
  const second = await artifacts(fresh(), root);
  assert.equal(first.output.size, 231);
  assert.deepEqual([...first.output], [...second.output]);
});

test('CS-80 owner decision append is exact and cannot broaden scope or authorize main integration', () => {
  const inputs = fresh();
  const source = inputs.policy.ownerDecisionSource;
  const original = spawnSync('git', ['show', `${source.commit}:${source.path}`], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 5 * 1024 * 1024,
  }).stdout;
  const current = fs.readFileSync(path.join(root, source.path), 'utf8');
  assert.equal(isAuthorizedOwnerDecisionAppend(original, current), true);
  assert.equal(
    isAuthorizedOwnerDecisionAppend(
      original,
      current.replace('No merge to `main` is authorized.', 'Merge to `main` is authorized.'),
    ),
    false,
  );
  assert.equal(
    isAuthorizedOwnerDecisionAppend(
      original,
      current.replace('only for deterministic outputs', 'for all generated outputs'),
    ),
    false,
  );
});

test('CS-80 source exception is limited to the exact canonical amendment and migration provenance', () => {
  const inputs = fresh();
  const baselineBacklog = spawnSync(
    'git',
    ['show', `${inputs.policy.sourcePhase3Commit}:.ai/backlog.json`],
    { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  ).stdout;
  const currentBacklog = fs.readFileSync(path.join(root, '.ai/backlog.json'), 'utf8');
  const baselineMigration = spawnSync(
    'git',
    ['show', `${inputs.policy.sourcePhase3Commit}:.ai/workflow-migration.json`],
    { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  ).stdout;
  const currentMigration = fs.readFileSync(path.join(root, '.ai/workflow-migration.json'), 'utf8');
  assert.equal(
    authorizedCs80SourceAmendment('.ai/backlog.json', baselineBacklog, currentBacklog),
    true,
  );
  assert.equal(
    authorizedCs80SourceAmendment(
      '.ai/backlog.json',
      baselineBacklog,
      currentBacklog.replace(
        'No personal data, resume, database',
        'All generated output, personal data, resume, database',
      ),
    ),
    false,
  );
  assert.equal(
    authorizedCs80SourceAmendment(
      '.ai/workflow-migration.json',
      baselineMigration,
      currentMigration,
    ),
    true,
  );
  assert.equal(
    authorizedCs80SourceAmendment(
      '.ai/workflow-migration.json',
      baselineMigration,
      currentMigration.replace(
        'no main integration authorization.',
        'main integration authorization.',
      ),
    ),
    false,
  );
});

test('generated-artifact checkpoint allowlist must exactly match outputs and approved branch', () => {
  const inputs = fresh();
  const checkpoint = inputs.policy.generatedArtifactCheckpoint;
  assert.equal(
    exactCheckpointPathsMatch(checkpoint, checkpoint.generatedPaths, checkpoint.branch),
    true,
  );
  assert.equal(
    exactCheckpointPathsMatch(
      { ...checkpoint, generatedPathCount: checkpoint.generatedPathCount + 1 },
      checkpoint.generatedPaths,
      checkpoint.branch,
    ),
    false,
  );
  assert.equal(
    exactCheckpointPathsMatch(
      { ...checkpoint, generatedPathsSha256: '0'.repeat(64) },
      checkpoint.generatedPaths,
      checkpoint.branch,
    ),
    false,
  );
  assert.equal(
    exactCheckpointPathsMatch(
      { ...checkpoint, baseCommit: '0000000000000000000000000000000000000000' },
      checkpoint.generatedPaths,
      checkpoint.branch,
    ),
    false,
  );
  assert.equal(
    exactCheckpointPathsMatch(
      { ...checkpoint, generatedPaths: checkpoint.generatedPaths.slice(1) },
      checkpoint.generatedPaths,
      checkpoint.branch,
    ),
    false,
  );
  assert.equal(
    exactCheckpointPathsMatch(
      { ...checkpoint, generatedPaths: [...checkpoint.generatedPaths, '.env'] },
      checkpoint.generatedPaths,
      checkpoint.branch,
    ),
    false,
  );
  assert.equal(exactCheckpointPathsMatch(checkpoint, checkpoint.generatedPaths, 'main'), false);
});

test('CS-80 checkpoint requires its manifest and remains bound to the immutable pre-checkpoint base', async () => {
  const inputs = fresh();
  assert.equal(validateCs80AmendmentPair(inputs.backlog, inputs.migration), true);
  const sourceMigration = JSON.parse(
    spawnSync('git', ['show', `${inputs.policy.sourcePhase3Commit}:.ai/workflow-migration.json`], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }).stdout,
  );
  assert.throws(
    () => validateCs80AmendmentPair(inputs.backlog, sourceMigration),
    /must be present as an exact pair/,
    'amended backlog cannot bypass checkpoint validation by restoring the old migration ledger',
  );
  const { output } = await artifacts(inputs, root);
  const checkpoint = inputs.policy.generatedArtifactCheckpoint;
  assert.doesNotThrow(() =>
    validateGeneratedArtifactCheckpoint(
      inputs.policy,
      output,
      root,
      'phase-3.25/cloud-continuation',
    ),
  );
  assert.throws(
    () =>
      validateGeneratedArtifactCheckpoint(
        { ...inputs.policy, generatedArtifactCheckpoint: undefined },
        output,
        root,
        'phase-3.25/cloud-continuation',
      ),
    /requires its exact checkpoint manifest/,
  );
  assert.equal(checkpoint.baseCommit, '3911a52fb2167707a1b04e258c15c403815286e4');
});

test('CS-80 V2 manifest admits reviewed ticket specs only as generator-owned artifacts', async () => {
  const inputs = fresh();
  const { output } = await artifacts(inputs, root);
  const coverage = JSON.parse(output.get('.ai/ticket-specification-coverage.json'));
  const manifest = coverage.artifactManifest;
  const committedCoverage = JSON.parse(
    spawnSync('git', ['show', 'HEAD:.ai/ticket-specification-coverage.json'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }).stdout,
  );
  const cs101 = manifest.paths.find((entry) => entry.path === 'docs/tickets/CS-101.md');

  assert.equal(manifest.policy, 'CONTROLLED_ROLLING_DETERMINISTIC_MANIFEST');
  assert.equal(manifest.decisionId, 'OD-2026-10-07-CS80-AC3-V2');
  assert.equal(manifest.baseCommit, '3911a52fb2167707a1b04e258c15c403815286e4');
  const manifestIsNoOp =
    manifest.currentManifestHash === committedCoverage.artifactManifest.currentManifestHash;
  assert.equal(
    manifest.previousManifestHash,
    manifestIsNoOp
      ? committedCoverage.artifactManifest.previousManifestHash
      : committedCoverage.artifactManifest.currentManifestHash,
  );
  assert.equal(manifest.currentManifestHash, rollingManifestDigest(manifest));
  const previousPathCount = committedCoverage.artifactManifest.currentPathCount;
  const previousPaths = new Set(
    committedCoverage.artifactManifest.paths.map((entry) => entry.path),
  );
  assert.equal(manifest.currentPathCount, output.size);
  assert.equal(manifest.previousPathCount, previousPathCount);
  assert.equal(
    manifest.addedPaths.length,
    manifest.paths.filter((entry) => !previousPaths.has(entry.path)).length,
  );
  assert.equal(
    manifest.addedPaths.includes('docs/tickets/CS-101.md'),
    !previousPaths.has('docs/tickets/CS-101.md'),
  );
  assert.equal(manifest.removedPaths.length, 0);
  assert.equal(manifest.unchangedPaths.length, previousPathCount);
  assert.match(manifest.currentManifestHash, /^[0-9a-f]{64}$/);
  assert.ok(
    manifest.changedContentPathsFromBase.every((name) =>
      manifest.paths.some((entry) => entry.path === name),
    ),
  );
  assert.equal(cs101.artifactClass, 'TICKET_SPECIFICATION');
  assert.equal(cs101.generatorOwned, 'YES');
  assert.equal(manifest.safetyValidated, 'YES');
  assert.equal(manifest.determinismValidated, 'YES');
  assert.equal(manifest.mainIntegrationAuthorized, 'NO');
  assert.doesNotThrow(() =>
    validateGeneratedArtifactCheckpoint(
      inputs.policy,
      output,
      root,
      inputs.policy.generatedArtifactCheckpoint.branch,
    ),
  );
  assert.throws(
    () => validateGeneratedArtifactCheckpoint(inputs.policy, output, root, 'main'),
    /decision, base, branch or manifest is invalid|policy, base, branch or prior manifest is invalid/,
  );
});

test('CS-80 rolling manifest validates strict predecessor schema, deltas and committed provenance', async () => {
  const inputs = fresh();
  const { output } = await artifacts(inputs, root);
  const coverage = JSON.parse(output.get('.ai/ticket-specification-coverage.json'));
  const manifest = coverage.artifactManifest;
  const ticketIds = new Set(inputs.backlog.items.map((ticket) => ticket.id));
  const committedCoverage = JSON.parse(
    spawnSync('git', ['show', 'HEAD:.ai/ticket-specification-coverage.json'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }).stdout,
  );
  const approvedPreviousHash =
    manifest.currentManifestHash === committedCoverage.artifactManifest.currentManifestHash
      ? committedCoverage.artifactManifest.previousManifestHash
      : committedCoverage.artifactManifest.currentManifestHash;
  assert.doesNotThrow(() => validatePreviousManifest(manifest, ticketIds, approvedPreviousHash));

  const malformedCases = [
    (copy) => {
      copy.schemaVersion = 2;
    },
    (copy) => {
      copy.previousPathCount += 1;
    },
    (copy) => {
      copy.addedPaths.push(copy.addedPaths[0]);
    },
    (copy) => {
      copy.unchangedPaths.push(copy.unchangedPaths[0]);
    },
    (copy) => {
      copy.changedContentPathsFromBase.push(copy.changedContentPathsFromBase[0]);
    },
    (copy) => {
      copy.previousManifestHash = 'f'.repeat(64);
    },
    (copy) => {
      copy.unhashedExtension = 'ignored-by-digest';
    },
    (copy) => {
      copy.paths[0].unhashedExtension = 'ignored-by-digest';
    },
  ];
  for (const mutate of malformedCases) {
    const copy = structuredClone(manifest);
    mutate(copy);
    copy.currentManifestHash = rollingManifestDigest(copy);
    assert.throws(
      () => validatePreviousManifest(copy, ticketIds, approvedPreviousHash),
      /malformed, unprovenanced or hash-invalid/,
    );
  }
  assert.equal(
    committedPredecessorManifestHash(root, ticketIds),
    committedCoverage.artifactManifest.previousManifestHash,
  );
});

test('CS-80 predecessor lookup tolerates unrelated commits and repeated coverage snapshots', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'careerscope-cs80-history-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  const run = (args, options = {}) => {
    const result = spawnSync('git', args, {
      cwd: fixture,
      encoding: 'utf8',
      ...options,
    });
    assert.equal(result.status, 0, result.stderr || `git ${args.join(' ')} failed`);
    return result.stdout.trim();
  };
  const readAt = (commit, file) =>
    spawnSync('git', ['show', `${commit}:${file}`], {
      cwd: root,
      encoding: 'buffer',
      maxBuffer: 20 * 1024 * 1024,
    }).stdout;
  const coveragePath = '.ai/ticket-specification-coverage.json';
  const history = spawnSync(
    'git',
    ['log', '--format=%H', '--reverse', 'HEAD', '--', coveragePath],
    {
      cwd: root,
      encoding: 'utf8',
    },
  )
    .stdout.trim()
    .split(/\r?\n/);
  const anchor = history.findIndex((commit) =>
    isApprovedV1CoverageAnchor(
      readAt(commit, coveragePath),
      readAt(commit, 'docs/OWNER-DECISIONS-2026-10-02.md'),
    ),
  );
  assert.notEqual(anchor, -1, 'the fixture source history contains the approved V1 anchor');

  run(['init', '-b', 'main']);
  run(['config', 'user.name', 'CareerScope Test']);
  run(['config', 'user.email', 'careerscope-test@example.invalid']);
  for (const [index, commit] of history.slice(anchor).entries()) {
    const coverage = readAt(commit, coveragePath);
    const coverageFile = path.join(fixture, coveragePath);
    fs.mkdirSync(path.dirname(coverageFile), { recursive: true });
    fs.writeFileSync(coverageFile, coverage);
    if (index === 0) {
      const ownerFile = path.join(fixture, 'docs/OWNER-DECISIONS-2026-10-02.md');
      fs.mkdirSync(path.dirname(ownerFile), { recursive: true });
      fs.writeFileSync(ownerFile, readAt(commit, 'docs/OWNER-DECISIONS-2026-10-02.md'));
      run(['add', '--', coveragePath, 'docs/OWNER-DECISIONS-2026-10-02.md']);
    } else {
      run(['add', '--', coveragePath]);
    }
    run(['commit', '-m', `fixture coverage snapshot ${index}`]);
  }

  const ticketIds = new Set(fresh().backlog.items.map((ticket) => ticket.id));
  const expected = JSON.parse(fs.readFileSync(path.join(fixture, coveragePath), 'utf8'))
    .artifactManifest.previousManifestHash;
  assert.equal(committedPredecessorManifestHash(fixture, ticketIds), expected);

  fs.writeFileSync(path.join(fixture, 'unrelated.txt'), 'unrelated process checkpoint\n');
  run(['add', '--', 'unrelated.txt']);
  run(['commit', '-m', 'unrelated commit after generated coverage']);
  assert.equal(committedPredecessorManifestHash(fixture, ticketIds), expected);

  const repeatedCoverage = JSON.parse(fs.readFileSync(path.join(fixture, coveragePath), 'utf8'));
  repeatedCoverage.processCheckpointNote = 'same generated manifest, separate coverage commit';
  fs.writeFileSync(
    path.join(fixture, coveragePath),
    `${JSON.stringify(repeatedCoverage, null, 2)}\n`,
  );
  run(['add', '--', coveragePath]);
  run(['commit', '-m', 'same manifest in a later coverage checkpoint']);
  assert.equal(committedPredecessorManifestHash(fixture, ticketIds), expected);
});

test('CS-80 V1 bootstrap is bound to the exact immutable base coverage and owner decision bytes', () => {
  const checkpoint = fresh().policy.generatedArtifactCheckpoint;
  const legacyBootstrapCommit = '281618e63e1c2d8130e667600fc7e2b643238477';
  const coverageBytes = spawnSync(
    'git',
    ['show', `${legacyBootstrapCommit}:.ai/ticket-specification-coverage.json`],
    {
      cwd: root,
      encoding: 'buffer',
      maxBuffer: 20 * 1024 * 1024,
    },
  ).stdout;
  const ownerBytes = spawnSync(
    'git',
    ['show', `${legacyBootstrapCommit}:docs/OWNER-DECISIONS-2026-10-02.md`],
    {
      cwd: root,
      encoding: 'buffer',
      maxBuffer: 5 * 1024 * 1024,
    },
  ).stdout;
  assert.equal(isApprovedV1Bootstrap(coverageBytes, ownerBytes, checkpoint), true);
  assert.equal(isApprovedV1CoverageAnchor(coverageBytes, ownerBytes), true);
  assert.equal(
    isApprovedV1Bootstrap(Buffer.concat([coverageBytes, Buffer.from(' ')]), ownerBytes, checkpoint),
    false,
  );
  assert.equal(
    isApprovedV1Bootstrap(coverageBytes, Buffer.from('altered owner decision'), checkpoint),
    false,
  );
  assert.equal(
    isApprovedV1CoverageAnchor(coverageBytes, Buffer.from('altered owner decision')),
    false,
  );
  assert.equal(
    isApprovedV1Bootstrap(coverageBytes, ownerBytes, {
      ...checkpoint,
      previousManifestHash: '0'.repeat(64),
    }),
    false,
  );
});

test('CS-80 delivery is classified as a branch-local process checkpoint, not product release', () => {
  const inputs = fresh();
  const before = JSON.stringify(inputs.backlog);
  const model = buildCatalog(inputs);
  const source = inputs.backlog.items.find((ticket) => ticket.id === 'CS-80');
  const specification = model.specs.find((spec) => spec.ticketId === 'CS-80');
  const delivery = specification.sections.delivery.requirements[0];

  assert.equal(source.status, 'BACKLOG');
  assert.equal(source.releaseTarget, undefined);
  assert.equal(delivery.releaseTarget, 'NOT_APPLICABLE');
  assert.equal(delivery.sourceReleaseTarget, null);
  assert.equal(delivery.releaseState, 'NOT_APPLICABLE');
  assert.equal(delivery.deliveryMode, 'PROCESS_CHECKPOINT');
  assert.equal(delivery.processScope.mainIntegrationAuthorized, false);
  assert.ok(
    specification.sections.definitionOfDone.requirements.some((entry) =>
      entry.includes('product acceptance, PROD evidence'),
    ),
  );
  const completion = specification.sections.completionEvidence.requirements[0];
  assert.ok(completion.commands.includes('npm run tickets:spec:test'));
  assert.ok(!completion.commands.includes('test:integration'));
  assert.ok(!completion.commands.includes('test:ui'));
  assert.match(completion.rule, /not CS-80 completion criteria/);
  assert.equal(JSON.stringify(inputs.backlog), before);
});

test('CS-80 rolling manifest fails closed for new roots, unknown tickets, and altered deltas', async () => {
  const inputs = fresh();
  const { output } = await artifacts(inputs, root);
  const unexpectedRoot = new Map(output);
  unexpectedRoot.set('.ai/unapproved.json', '{}');
  assert.throws(
    () =>
      validateGeneratedArtifactCheckpoint(
        inputs.policy,
        unexpectedRoot,
        root,
        inputs.policy.generatedArtifactCheckpoint.branch,
      ),
    /outside the approved artifact classes\/roots/,
  );

  const unknownTicket = new Map(output);
  unknownTicket.set('docs/tickets/CS-217.md', '# not a canonical ticket');
  assert.throws(
    () =>
      validateGeneratedArtifactCheckpoint(
        inputs.policy,
        unknownTicket,
        root,
        inputs.policy.generatedArtifactCheckpoint.branch,
      ),
    /outside the approved artifact classes\/roots/,
  );

  const unchangedDisallowedPath = new Map(output);
  const baseBacklog = spawnSync(
    'git',
    ['show', `${inputs.policy.generatedArtifactCheckpoint.baseCommit}:.ai/backlog.json`],
    { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  ).stdout;
  unchangedDisallowedPath.set('.ai/backlog.json', baseBacklog);
  assert.throws(
    () =>
      validateGeneratedArtifactCheckpoint(
        inputs.policy,
        unchangedDisallowedPath,
        root,
        inputs.policy.generatedArtifactCheckpoint.branch,
      ),
    /outside the approved artifact classes\/roots/,
    'an output matching a base blob is still rejected if its path/class is not approved',
  );

  const alteredDelta = new Map(output);
  const coverage = JSON.parse(alteredDelta.get('.ai/ticket-specification-coverage.json'));
  coverage.artifactManifest.addedPaths.push('docs/tickets/CS-217.md');
  alteredDelta.set('.ai/ticket-specification-coverage.json', JSON.stringify(coverage));
  assert.throws(
    () =>
      validateGeneratedArtifactCheckpoint(
        inputs.policy,
        alteredDelta,
        root,
        inputs.policy.generatedArtifactCheckpoint.branch,
      ),
    /does not exactly match generator output/,
  );
});
