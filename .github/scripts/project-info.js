const { request } = require("@octokit/request");

(async function getProjectInfo() {
  try {
    const projectId = process.env.PROJECT_ID;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!projectId || !githubToken) {
      throw new Error("Project ID and GitHub token are required.");
    }

    const response = await request("GET /projects/:project_id", {
      project_id: projectId,
      headers: {
        authorization: `token ${githubToken}`,
        accept: "application/vnd.github+json",
      },
    });

    console.log("Project Info:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
