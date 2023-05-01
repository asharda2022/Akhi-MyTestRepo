const core = require('@actions/core');
const github = require('@actions/github');
const { request } = require('@octokit/request');

(async () => {
  try {
    const context = github.context;
    const token = core.getInput('GH_PERSONAL_ACCESS_TOKEN');
    const { owner, repo } = context.repo;
    const projectId = "2";
    const relationId = "Priority";
    const issueId = context.issue.number;

    async function updatePriority() {
      const issue = await request("GET /repos/:owner/:repo/issues/:issue_number", {
        owner,
        repo,
        issue_number: issueId,
        headers: {
          authorization: `token ${token}`,
        },
      });

      const priorityLabels = {
        "Low-Priority": "Low",
        "Medium-Priority": "Medium",
        "High-Priority": "High"
      };

      let newPriority;
      issue.data.labels.forEach((label) => {
        if (priorityLabels.hasOwnProperty(label.name)) {
          newPriority = priorityLabels[label.name];
        }
      });

      if (!newPriority) {
        console.log('No matching priority label found, skipping update');
        return;
      }

      const project = await request("GET /projects/:project_id", {
        project_id: projectId,
        headers: {
          authorization: `token ${token}`,
          accept: "application/vnd.github+json",
        },
      });

      const issueCard = await request("GET /repos/:owner/:repo/issues/:issue_number/project_cards", {
        owner,
        repo,
        issue_number: issueId,
        headers: {
          authorization: `token ${token}`,
          accept: "application/vnd.github.inertia-preview+json",
        },
      });

      if (issueCard.data.length === 0) {
        console.log('Issue is not linked to any project card, skipping update');
        return;
      }

      await request("PUT /projects/columns/cards/:card_id/fields/:relation_id", {
        card_id: issueCard.data[0].id,
        relation_id: relationId,
        value: newPriority,
        headers: {
          authorization: `token ${token}`,
          accept: "application/vnd.github+json",
        },
      });
    }

    await updatePriority();

  } catch (error) {
    core.setFailed(error.message);
  }
})();
