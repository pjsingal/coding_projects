<script>
  import { fade } from "svelte/transition";
  import FaEnvelope from "svelte-icons/fa/FaEnvelope.svelte";
  import FaLinkedin from "svelte-icons/fa/FaLinkedin.svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  export let projects;

  let selectedProject;

  const showProject = project => {
    selectedProject = project;
    if (selectedProject) {
      document.body.style.overflow = "hidden";
      //gtag("event", "view_item", { event_label: selectedProject.name });
    } else {
      document.body.style.overflow = "visible";
    }
  };

  const stopPropagation = e => e.stopPropagation();
</script>

<style>
  .imageWrapper {
    height: 330px;
    width: 330px;
    overflow: hidden;
    margin-bottom: 0.7rem;
    position: relative;
  }

  .portfolioProject.clickable {
    cursor: grabbing;
  }
  .imageWrapper .portfolioProjectImage > * {
    /* position: absolute; */
    height: 330px;
    width: auto;
    margin-right: auto;
    margin-left: auto;
    /* top: 0;
    left: 0;
    bottom: 0;
    right: 0; */
  }

  .imageWrapper div.caption {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: absolute;
    left: 0;
    background-color: rgba(255, 255, 255, 0.8);
    width: 100%;
    padding: 0.5rem;
    font-size: 0.9rem;
    line-height: 0.9rem;
    box-sizing: border-box;
    height: 3rem;
    bottom: -3rem;
    transition: bottom 0.3s ease;
  }

  .imageWrapper:hover div.caption {
    bottom: 0;
  }

  @media (hover: none) {
    .imageWrapper div.caption {
      bottom: 0 !important;
    }
  }

  div.projects {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin: 3rem auto 0;
    max-width: calc(370px * 4);
  }
  div.portfolioProject {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0.2rem;
  }
  div.name {
    font-weight: 600;
    color: var(--darkGrey);
    font-size: 0.9rem;
    line-height: 0.9rem;
  }

  /* div.position {
    color: var(--darkGrey);
    font-weight: 500;
    font-style: italic;
    font-size: 0.9rem;
    line-height: 2rem;
} */

  div.modal {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.93);
    z-index: 48;
    display: flex;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .modal div.modalContent {
    min-width: 70%;
    min-height: 60%;
    margin: auto;
    padding: 1rem;
  }

  .modal div.modalHead {
    display: flex;
    align-items: center;
  }

  .modal div.nameAndPosition > * {
    padding: 0;
    margin: 0;
    text-transform: unset;
    font-weight: 500;
  }

  div.modalHead > div.modalImageWrapper {
    height: 73vh;
    overflow: hidden;
    margin-left: auto;
    margin-right: auto;
  }

  .modal div.modalImageWrapper picture > * {
    height: 100%;
    width: 100%;
  }

  /* .modal div.modalPosition {
    font-size: 0.9rem;
  } */

  .modal div.blurb {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.1rem;
    font-weight: 300;
    text-align: justify;
    text-justify: inter-word;
  }

  /*.modal p.blurb {
    margin: 1.5rem 0;
    line-height: 1.8rem;
  }*/

  .modal h3 {
    font-size: 1.5rem;
    line-height:1.5rem;
    padding-top: 1rem;
    padding-bottom: 0.5rem;
  }
</style>

{#if selectedProject}
  <div
    class="modal"
    in:fade={{ duration: 100 }}
    on:click={() => showProject(null)}>
    <div class="modalContent contentWrapper">
      <div class="modalHead">
        <div class="modalImageWrapper">
          <picture class="portfolioProjectImage">
            <source
              srcset="{`/projects/${selectedProject.image}`}.webp"
              type="image/webp" />
            <source
              srcset="{`/projects/${selectedProject.image}`}.png"
              type="image/jpeg" />
            <img
              src="{`/projects/${selectedProject.image}`}.webp"
              alt={selectedProject.name} />
          </picture>
        </div>
      </div>
      <div class="nameAndPosition">
        <div><h3>{selectedProject.name}</h3></div>
        <div class="blurb">{selectedProject.blurb[0]}</div>
        {#if selectedProject.blurb[1]}
          <div class="blurb">{selectedProject.blurb[1]}</div>
        {/if}
        {#if selectedProject.blurb[2]}
          <div class="blurb">{selectedProject.blurb[2]}</div>
        {/if}
        {#if selectedProject.blurb[3]}
          <div class="blurb">{selectedProject.blurb[3]}</div>
        {/if}
        {#if selectedProject.blurb[4]}
          <div class="blurb">{selectedProject.blurb[4]}</div>
        {/if}
        {#if selectedProject.blurb[5]}
          <div class="blurb">{selectedProject.blurb[5]}</div>
        {/if}
        {#if selectedProject.blurb[6]}
          <div class="blurb">{selectedProject.blurb[6]}</div>
        {/if}
        {#if selectedProject.blurb[7]}
          <div class="blurb">{selectedProject.blurb[7]}</div>
        {/if}
        {#if selectedProject.blurb[8]}
          <div class="blurb">{selectedProject.blurb[8]}</div>
        {/if}
        {#if selectedProject.blurb[9]}
          <div class="blurb">{selectedProject.blurb[9]}</div>
        {/if}
        {#if selectedProject.blurb[10]}
          <div class="blurb">{selectedProject.blurb[10]}</div>
        {/if}
        <!-- <p>{selectedProject.blurb.join()}</p> -->
      </div>
    </div>
  </div>
{/if}
<div class="projects {selectedProject ? 'noScroll' : ''}">
  {#each projects as project}
    <div
      class="portfolioProject {project.blurb.join("\n") ? 'clickable' : ''}"
      on:click={() => {
        if (project.blurb) {
          showProject(project);
        }
      }}>
      <div class="imageWrapper">
        <picture class="portfolioProjectImage">
          <source srcset="{`/projects/${project.image}`}.webp" type="image/webp" />
          <source srcset="{`/projects/${project.image}`}.png" type="image/png" />
          <img src="{`/projects/${project.image}`}.webp" alt={project.name} />
        </picture>
        <div class="caption">
          <div class="name">{project.name}</div>
        </div>
      </div>
    </div>
  {/each}
</div>
