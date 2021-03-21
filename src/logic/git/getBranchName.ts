export const getBranchName = (): string | undefined => {
  const ref = process.env.GITHUB_REF;
  if (!ref || !ref.startsWith("refs/heads/")) {
    return undefined;
  }

  return ref.split("/").slice(2).join("/");
};
