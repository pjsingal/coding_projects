import dateformat from "dateformat";

function getData() {
  const projectsFile = require("../../../content/projects.json");

  const projects = projectsFile
    .filter(project => !project.hidden)
    .map(project => {
      return {
        name: project.title,
        position: project.subtitle,
        image: project.image,
        blurb: project.blurb
      };
    });

  return { projects };
}

export function get(req, res) {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  const { projects } = getData();
  res.end(JSON.stringify({ projects }));
}
