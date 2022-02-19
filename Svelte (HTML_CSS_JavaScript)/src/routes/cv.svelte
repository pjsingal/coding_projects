<script>
  // import { onMount } from "svelte";
  import PageHeader from "../components/PageHeader.svelte";
  // onMount(async () => {
  //   gtag("config", "UA-93549235-6", { page_path: "/cv" });
  // });
</script>

<style>
  div.pdfWrapper {
    margin-top: 2rem;
    width: 100%;
    height: 298vh;
  }
  a.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 3rem;
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    line-height: 1.4rem;
    color: white;
    text-decoration: none;
    background-color: var(--themeColorDark);
    border-radius: 0.5rem;
    box-shadow: 1px 1px 2px 2px #dedededd;
  }
  .contentWrapper {
    margin-top: 2rem;
  }
  .mobile {
    display: none;
    justify-content: center;
  }
  @media (max-width: 700px) {
    .mobile {
      display: flex !important;
    }
    .desktop {
      display: none;
    }
  }
</style>

<svelte:head>
  <title>Patrick Singal</title>
</svelte:head>
<PageHeader>CV</PageHeader>
<div class="contentWrapper desktop">
  <p>
    <a
      href="Patrick-Singal-CV.pdf"
      download>
      Download CV here
    </a>
  </p>
  <div class="pdfWrapper">
    <object
      width="100%"
      height="100%"
      title="Patrick Singal CV"
      data="Patrick-Singal-CV.pdf"
      type="application/pdf">
      <embed
        title="Patrick Singal CV"
        width="100%"
        src="Patrick-Singal-CV.pdf"
        type="application/pdf" />
    </object>
  </div>
</div>
<div class="contentWrapper mobile">
  <a class="button" href="Patrick-Singal-CV.pdf">View CV</a>
</div>
