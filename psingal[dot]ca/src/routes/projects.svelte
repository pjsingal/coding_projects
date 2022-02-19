<script context="module">
  export async function preload() {
    const result = await this.fetch("index.json");
    const { projects } = await result.json();
    return {
      projects
    };
  }
</script>

<style>
  div.textLine {
    margin-top: 1rem;
    margin-bottom: -2rem;
    text-align: center;
    font-size: 0.8rem;
    font-style: italic;
    font-weight: 100;
  }
</style>

<script>
  import { onMount } from "svelte";
  import ProjectsImages from "../components/ProjectsImages.svelte";
  import PageHeader from "../components/PageHeader.svelte";

//   onMount(async () => {
//     gtag("config", "UA-93549235-6", { page_path: "/projects" });
//   });
  export let projects = [];
</script>

<svelte:head>
  <title>Patrick Singal</title>
</svelte:head>
<PageHeader>Design Projects</PageHeader>
<div class="textLine">
  <p>Click on a project to learn more!</p>
</div>
<ProjectsImages {projects} />
