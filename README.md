# bump-package

![Code quality](https://img.shields.io/codefactor/grade/github/jpb06/bump-package?logo=codefactor)
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
    - uses: actions/bump-package@v2.1.4
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
  - uses: actions/bump-package@v2.1.4
    with:
      major-keywords: BREAKING CHANGE
      minor-keywords: feat,minor
      patch-keywords: fix,chore
```
