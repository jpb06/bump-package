# bump-package

![Code quality](https://img.shields.io/codefactor/grade/github/jpb06/bump-package?logo=codefactor)
![Total coverage](./badges/coverage-global%20coverage.svg)
![Github workflow](https://img.shields.io/github/workflow/status/jpb06/bump-package/checks?label=last%20workflow&logo=github-actions)
![Last commit](https://img.shields.io/github/last-commit/jpb06/bump-package?logo=git)
![Commits activity](https://img.shields.io/github/commit-activity/m/jpb06/bump-package?logo=github)

## Description

This github action bumps version in package.json depending on keywords present in last commit message. The updated package.json file is then pushed to the repo.

## Inputs

### `keywords`

Keywords triggering a version bump to look for in commits messages. The action expects three keywords separated by commas: one for a major bump, one for a minor bump and one for a patch bump.

Default value: "[Major],[Minor],[Patch]"

## Usage example

```yaml
- uses: actions/bump-package@v1.0
  with:
    keywords: "Major,Minor,Patch"
```

Now, if the action runs on a commit that contains either "Major", "Minor" or "Patch", the version will be bumped.
