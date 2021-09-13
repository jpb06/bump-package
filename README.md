# bump-package

[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/jpb06/bump-package)
![Code quality](https://img.shields.io/codefactor/grade/github/jpb06/bump-package?logo=codefactor)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=security_rating)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=code_smells)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=coverage)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
![Total coverage](./badges/coverage-global%20coverage.svg)
![Github workflow](https://img.shields.io/github/workflow/status/jpb06/bump-package/checks?label=last%20workflow&logo=github-actions)
![Last commit](https://img.shields.io/github/last-commit/jpb06/bump-package?logo=git)
![Commits activity](https://img.shields.io/github/commit-activity/m/jpb06/bump-package?logo=github)

## :zap: Description

This github action bumps package.json version after a commit is pushed or a pull request is merged to the repo master branch. The updated package.json file is then pushed to master and a tag is created.

**Warning**: This action requires [the checkout action](https://github.com/actions/checkout) to work.

## :zap: Inputs

### :diamonds: `major-keywords`

Commits messages starting with these keywords will trigger a major bump. Commas may be used to specify more than one keyword

> Default value: **[Major]:**

### :diamonds: `minor-keywords`

Commits messages starting with these keywords will trigger a minor bump. Commas may be used to specify more than one keyword

> Default value: **[Minor]:**

### :diamonds: `patch-keywords`

Commits messages starting with these keywords will trigger a patch bump. Commas may be used to specify more than one keyword

> Default value: **[Patch]:**

### :diamonds: `should-default-to-patch`

If no keywords are present in branch commits, bump anyway by doing a patch.

> Default value: **false**

## :zap: Usage

### :diamonds: Using defaults

If the action runs on a commit whose message starts with either `[Major]:`, `[Minor]:` or `[Patch]:`, the version will be bumped and a tag will be created.

```yaml
name: package bump
on: [push]
jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
    - name: Check out repository code
      uses: actions/checkout@v2
    [...]
    - uses: actions/bump-package@latest
```

### :diamonds: Using custom inputs

The action will bump the package depending on commits present in the pull request when it is merged to the master branch. By priority order:

- if any commit message contains `BREAKING CHANGE`, then there will be a major bump.
- if any commit message contains `feat` or `minor` but none of the above, then there will be a minor bump.
- if any commit message contains `fix` or `chore` but none of the above, then there will be a patch bump.

A tag will also be created by the action.

```yaml
name: package bump
on: [push]
jobs:
  bump:
    runs-on: ubuntu-latest
  - name: Check out repository code
    uses: actions/checkout@v2
  [...]
  - uses: actions/bump-package@latest
    with:
      major-keywords: BREAKING CHANGE
      minor-keywords: feat,minor
      patch-keywords: fix,chore
```

### :diamonds: Defaulting to patch bump

You may want to bump the package version even if no keywords were present in the commits list (if merging a PR) or in the last commit (if pushing to master branch).

By setting `should-default-to-patch` to `true` you can trigger this behavior. Here is an example:

```yaml
name: package bump
on: [push]
jobs:
  bump:
    runs-on: ubuntu-latest
  - name: Check out repository code
    uses: actions/checkout@v2
  [...]
  - uses: actions/bump-package@latest
    with:
      major-keywords: BREAKING CHANGE
      minor-keywords: feat,minor
      patch-keywords: fix,chore
      should-default-to-patch: true
```

Now let's imagine I'm running this action when merging a PR with the following commits:

- cool
- obnoxios commit message
- hey

Since no keywords were detected, the action will bump the package version with a patch (1.0.0 -> 1.0.1).
