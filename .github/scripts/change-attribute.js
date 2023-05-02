const core = require('@actions/core');
const github = require('@actions/github');
const { request } = require('@octokit/request');
const token = process.env.GITHUB_TOKEN;

(async () => {
  try {
    const context = github.context;
    const { owner, repo } = context.repo;
    const projectId = "4";
    const relationId = "Priority";
    const issueId = context.issue.number;

    console.log("Issue ID:", issueId);
    
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
        "Low-Priority": "P3",
        "Medium-Priority": "P2",
        "High-Priority": "P1"
      };

      let newPriority;
      issue.data.labels.forEach((label) => {
        if (priorityLabels.hasOwnProperty(label.name)) {
          newPriority = priorityLabels[label.name];
        }
      });
      
      console.log("Issue:", issue.data);
      console.log("New Priority:", newPriority);

      if (!newPriority) {
        console.log('No matching priority label found, skipping update');
        return;
      }

      console.log("Getting project data for:", "https://github.com/users/asharda2022/projects/"+project_id);
      
      const project = await request("GET /projects/:project_id", {
        project_id: projectId,
        headers: {
          authorization: `token ${token}`,
          accept: "application/vnd.github+json",
        },
      });
      
      console.log("Project:", project.data);

      const issueCard = await request("GET /repos/:owner/:repo/issues/:issue_number/project_cards", {
        owner,
        repo,
        issue_number: issueId,
        headers: {
          authorization: `token ${token}`,
          accept: "application/vnd.github.inertia-preview+json",
        },
      });
      
      console.log("Issue Card:", issueCard.data);

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
      
      console.log("Priority updated successfully");
    }

    await updatePriority();

  } catch (error) {
    core.error("Token: " + token);
    core.error("Token length: " + token.length);
    core.setFailed(error.message);
  }
})();
