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
  action?: 'completed';
  commits?: GithubCommit[];
  ref?: string;
  repository?: GithubRepository;
  workflow_run?: {
    head_branch?: string;
    head_commit?: {
      message?: string;
    };
  };
}
