# GitHub release lifecycle

The repository currently has no GitHub Actions workflows or Dependabot
configuration. Changes do not trigger hosted CI, deployment, dependency update
PRs, load tests or release publication. Run the documented local checks before
committing. Local checks do not certify production acceptance.

Production deployment tooling still requires successful CI for the exact
reviewed revision. Without an approved hosted validation process, deployment
must remain blocked. See [Deployment](DEPLOYMENT.md).

The first accepted canonical production release remains `v1.0.0`. Create it
only after deployment and production acceptance. Package metadata currently
uses `3.0.0`; normalize package/display versions together as a separate release
change after auditing consumers. API protocol versions are independent.

Replacing the repository's visible commit graph with an initial snapshot
does not erase other clones, caches, pull-request references or backups.
Tags and published releases can retain old commits, so any history replacement
must account for them explicitly. No release is created by repository cleanup.
