interface GithubCommitter {
  email: string;
  name: string;
}

interface GithubCommit {
  distinct: boolean;
  message: string;
  committer: GithubCommitter;
}

interface GithubRepository {
  master_branch?: string;
  default_branch?: string;
}

export interface GithubEvent {
  commits?: GithubCommit[];
  ref?: string;
  repository?: GithubRepository;
}
