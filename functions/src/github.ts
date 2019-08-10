interface GithubPushConfig {
  token: string;
  owner: string;
  repo: string;
  file: {
    path: string;
    content: string;
  };
  branch: string;
  commitMessage: string;
}

import * as GitHubApi from "@octokit/rest";

const gitCommitPush = async (config: GithubPushConfig) => {
  const gh = new GitHubApi({
    auth: config.token
  });

  const ref = await gh.git.getRef({
    owner: config.owner,
    repo: config.repo,
    ref: `heads/${config.branch}`
  });
  const parentSha: string = ref.data.object.sha;
  const parentCommit = await gh.git.getCommit({
    owner: config.owner,
    repo: config.repo,
    commit_sha: parentSha
  });
  const createBlob = await gh.git.createBlob({
    owner: config.owner,
    repo: config.repo,
    content: config.file.content,
    encoding: "utf-8"
  });
  const createTree = await gh.git.createTree({
    owner: config.owner,
    repo: config.repo,
    base_tree: parentCommit.data.tree.sha,
    tree: [
      {
        path: config.file.path,
        sha: createBlob.data.sha,
        mode: `100644`,
        type: `blob`
      }
    ]
  });

  const createCommit = await gh.git.createCommit({
    message: config.commitMessage,
    owner: config.owner,
    repo: config.repo,
    parents: [parentSha],
    tree: createTree.data.sha
  });

  const updateRef = await gh.git.updateRef({
    owner: config.owner,
    repo: config.repo,
    ref: `heads/${config.branch}`,
    sha: createCommit.data.sha
  });

  console.log("commit success:", updateRef.data);
};

export { gitCommitPush };
