# bump-package

[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://github.dev/jpb06/bump-package)
![Github workflow](https://img.shields.io/github/actions/workflow/status/jpb06/bump-package/tests-scan.yml?branch=master&logo=github-actions&label=last%20workflow)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=jpb06_bump-package)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=security_rating)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=coverage)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
![Total coverage](./badges/coverage-jest%20coverage.svg)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=jpb06_bump-package)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=jpb06_bump-package)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=code_smells)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=bugs)](https://sonarcloud.io/summary/new_code?id=jpb06_bump-package)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=jpb06_bump-package)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=jpb06_bump-package&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=jpb06_bump-package)
![Last commit](https://img.shields.io/github/last-commit/jpb06/bump-package?logo=git)

A github action bumping the version of a package and pushing the version bump to the repo.

<!-- readme-package-icons start -->

<p align="left"><a href="https://docs.github.com/en/actions" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/GithubActions-Dark.svg" /></a>&nbsp;<a href="https://www.typescriptlang.org/docs/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/TypeScript.svg" /></a>&nbsp;<a href="https://nodejs.org/en/docs/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/NodeJS-Dark.svg" /></a>&nbsp;<a href="https://pnpm.io/motivation" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Pnpm-Dark.svg" /></a>&nbsp;<a href="https://github.com/conventional-changelog" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/CommitLint.Dark.svg" /></a>&nbsp;<a href="https://eslint.org/docs/latest/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Eslint-Dark.svg" /></a>&nbsp;<a href="https://prettier.io/docs/en/index.html" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Prettier-Dark.svg" /></a>&nbsp;<a href="https://vitest.dev/guide/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Vitest-Dark.svg" /></a></p>

<!-- readme-package-icons end -->

## ⚡ Description

This github action bumps package.json version after a commit is pushed or a pull request is merged to the repo master branch. The updated package.json file is then pushed to master and a tag is created.

### ⚠️ This action requires [the checkout action](https://github.com/actions/checkout) to work

### ⚠️ You need to allow read and write operations granted to the GITHUB_TOKEN for workflows

> You can find the configuration option in `Settings -> Actions -> Workflow permissions`.

### 🔶 Pushing directly to default branch

If you push directly to default branch, then only the pushed commit message will be scanned to define if a bump should be performed.

### 🔶 Pull requests

In the case of a pull request, the action will adapt to the merging strategy chosen.

#### 🧿 Merge commits

If the PR is merged using the merge commit strategy, then all the messages of all the commits in the branch will be scanned.

#### 🧿 Squash merging

If the PR is merged using the squash merging strategy, all the commits will be squashed into one. Github typically joins the messages of all the squashed commits into the single commit that will be written to the target branch. This message typically looks like this from the squash of 3 commits:

```text
Doing cool stuff (#3)

* feat: my cool feature

* chore: fixing stuff

* yolo
```

In that case, this message will be scanned to define whether a bump should be performed. In this example, it would result in a minor bump with the following config:

```yaml
# [...]
- name: ⏫ Bumping version
  uses: jpb06/bump-package@latest
  with:
    major-keywords: BREAKING CHANGE
    minor-keywords: feat,minor
    patch-keywords: fix,chore
```

#### 🧿 Completed workflow events

You can also run the action by depending on another workflow. In that case the commits messages will be extracted from the `completed` webhook event:

```yaml
[...]

on:
  workflow_run:
    workflows: ['my-other-workflow']
    types:
      - completed

jobs:
  version-bump:
    name: 🆕 Version bump
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      [...]

      - name: ⏫ Bump package version
        id: bumping-version
        uses: jpb06/bump-package@latest
```

## ⚡ Inputs

### 🔶 `major-keywords`

Commits messages starting with these keywords will trigger a major bump. Commas may be used to specify more than one keyword

> Default value: **[Major]:**

### 🔶 `minor-keywords`

Commits messages starting with these keywords will trigger a minor bump. Commas may be used to specify more than one keyword

> Default value: **[Minor]:**

### 🔶 `patch-keywords`

Commits messages starting with these keywords will trigger a patch bump. Commas may be used to specify more than one keyword

> Default value: **[Patch]:**

### 🔶 `should-default-to-patch`

If no keywords are present in branch commits, bump anyway by doing a patch.

> Default value: **false**

### 🔶 `commit-user`

Customizing the name of the user committing generated badges (optional).

> Default value: **<context.actor>**

### 🔶 `commit-user-email`

Customizing the email of the user committing generated badges (optional).

> Default value: **<context.actor>@users.noreply.github.com**

### 🔶 `debug`

Debug mode. Will display event github event data.

> Default value: **false**

## ⚡ Outputs

### 🔶 `bump-performed`

`true` if version has been bumped in package.json.

## ⚡ Usage

### 🔶 Using defaults

If the action runs on a commit whose message starts with either `[Major]:`, `[Minor]:` or `[Patch]:`, the version will be bumped and a tag will be created.

```yaml
name: ⚡ Package version bump
on: [push]

jobs:
  bump:
    name: 🆕 Version bump
    runs-on: ubuntu-latest
    steps:

    - name: ⬇️ Checkout repo
      uses: actions/checkout@v4

    [...]

    - name: ⏫ Bumping version
      uses: jpb06/bump-package@latest
```

### 🔶 Using custom inputs

The action will bump the package depending on commits present in the pull request when it is merged to the master branch. By priority order:

- if any commit message contains `BREAKING CHANGE`, then there will be a major bump.
- if any commit message contains `feat` or `minor` but none of the above, then there will be a minor bump.
- if any commit message contains `fix` or `chore` but none of the above, then there will be a patch bump.

A tag will also be created by the action.

```yaml
name: ⚡ Package version bump
on: [push]

jobs:
  bump:
    name: 🆕 Version version bump
    runs-on: ubuntu-latest
    steps:

    - name: ⬇️ Checkout repo
      uses: actions/checkout@v4

    [...]

    - name: ⏫ Bumping version
      uses: jpb06/bump-package@latest
      with:
        major-keywords: BREAKING CHANGE
        minor-keywords: feat,minor
        patch-keywords: fix,chore
```

### 🔶 Defaulting to patch bump

You may want to bump the package version even if no keywords were present in the commits list (if merging a PR) or in the last commit (if pushing to master branch).

By setting `should-default-to-patch` to `true` you can trigger this behavior. Here is an example:

```yaml
name: ⚡ Package version bump
on: [push]
jobs:
  bump:
    name: 🆕 Version bump
    runs-on: ubuntu-latest
    steps:

    - name: ⬇️ Checkout repo
      uses: actions/checkout@v4

    [...]

    - name: ⏫ Bumping version
      uses: jpb06/bump-package@latest
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

Since no keywords were detected, the action will bump the package version with a patch: `1.0.0` -> `1.0.1`.

### 🔶 Using output

We may want to perform an action if package.json has been bumped. We can use `bump-performed` output for this:

```yaml
name: ⚡ Package version bump
on: [push]
jobs:
  bump:
    name: 🆕 Version bump
    runs-on: ubuntu-latest
    steps:

    - name: ⬇️ Checkout repo
      uses: actions/checkout@v4

    [...]

    - name: ⏫ Bumping version
      id: bumping-version
      uses: jpb06/bump-package@latest

    - name: 🚀 Publishing package
      if: steps.bumping-version.outputs.bump-performed == 'true'
      run: |
        cd dist
        yarn publish --non-interactive
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
