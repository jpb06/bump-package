# bump-package

![Code quality](https://img.shields.io/codefactor/grade/github/jpb06/bump-package?logo=codefactor)
![Total coverage](./badges/coverage-global%20coverage.svg)
![Github workflow](https://img.shields.io/github/workflow/status/jpb06/bump-package/checks?label=last%20workflow&logo=github-actions)
![Last commit](https://img.shields.io/github/last-commit/jpb06/bump-package?logo=git)
![Commits activity](https://img.shields.io/github/commit-activity/m/jpb06/bump-package?logo=github)

## :zap: Description

This github action mainly bumps package.json version depending on keywords present in last commit message. The updated package.json file is then pushed to the repo.
Optionally, it can also publish the package to npm registry.

## :zap: Inputs

### :diamonds: `keywords`

Keywords triggering a version bump to look for in commits messages. The action expects three keywords separated by commas: one for a major bump, one for a minor bump and one for a patch bump.

> Default value: **[Major],[Minor],[Patch]**

### :diamonds: `publish`

Specifies whether the package should be published to the npm registry. If set to `true`, the package will be published.
Please note you will have to pass an automation token through the env variable `NODE_AUTH_TOKEN`, so that publish can be performed.

> Default value: **false**

### :diamonds: `publish-root`

Defines the folder to publish. Typically, this would be the dist folder. The action runs the build script in order to make sure the transpiled payload will be ready for publish.

> Default value: **dist**

## :zap: Usage

### :diamonds: Using defaults

If the action runs on a commit whose message starts with either `[Major]`, `[Minor]` or `[Patch]`, the version will be bumped. No build followed by a publish will be performed.

```yaml
- uses: actions/bump-package@v1.2.5
```

### :diamonds: Using custom inputs

The action will bump the package, build it and then publish it if the commit either starts with `BREAKING CHANGE:`, `feat` or `fix`. We are here using the secret `NPM_TOKEN` defined on the repo.

```yaml
- uses: actions/bump-package@v1.2.5
  with:
    keywords: BREAKING CHANGE:, feat, fix
    publish: true
    publish-root: dist
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
