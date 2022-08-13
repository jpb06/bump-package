type GithubCommitter = {
  email: string;
  name: string;
};

type GithubCommit = {
  distinct: boolean;
  message: string;
  committer: GithubCommitter;
};

type GithubRepository = {
  master_branch?: string;
  default_branch?: string;
};

export type GithubEvent = {
  commits?: Array<GithubCommit>;
  ref?: string;
  repository?: GithubRepository;
};
