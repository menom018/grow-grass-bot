interface GithubPushConfig {
  token: string;
  owner: string;
  repo: string;
  files: {
    path: string;
    content: string;
  }[];
  fullyQualifiedRef: string;
  commitMessage: string;
}

const gitCommitPush = async (config: GithubPushConfig) => {};

export { gitCommitPush };
