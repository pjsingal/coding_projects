<script>
  // import { onMount } from "svelte";
  import PageHeader from "../components/PageHeader.svelte";
  // onMount(async () => {
  //   gtag("config", "UA-93549235-6", { page_path: "/cv" });
  // });
</script>

<style>
  div.pdfWrapper1 {
    margin-top: 2rem;
    margin-left: auto;
    margin-right: auto;
    width: 500px;
    height: calc(500px*1.44);
  }
  div.pdfWrapper2 {
    margin-top: 2rem;
    margin-left: auto;
    margin-right: auto;
    width: 900px;
    height: calc(900px/1.4);
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
  @media (max-width: 550px) {
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
<PageHeader>QVFT</PageHeader>
<div class="contentWrapper desktop">
  <p>
    <a href="https://www.qvft.ca/" target="_blank" rel="noopener noreferrer">Queen's Vertical Farming Team Website</a>
  </p>
  <p>
    <a href="QVFT-System-Guide.pdf" download>Download System Guide</a>
  </p>
  <p>
    <a href="QVFT-Mechatronics-Update.pdf" download>Download Mechatronics Update</a>
  </p>
  <div class="pdfWrapper1">
    <object
      width="100%"
      height="100%"
      title="System Guide"
      data="QVFT-System-Guide.pdf"
      type="application/pdf">
      <embed
        title="System Guide"
        width="100%"
        src="QVFT-System-Guide.pdf"
        type="application/pdf" />
    </object>
  </div>
  <div class="pdfWrapper2">
    <object
      width="100%"
      height="100%"
      title="Mechatronics Update"
      data="QVFT-Mechatronics-Update.pdf"
      type="application/pdf">
      <embed
        title="Mechatronics Update"
        width="100%"
        src="QVFT-Mechatronics-Update.pdf"
        type="application/pdf" />
    </object>
  </div>
</div>
<div class="contentWrapper mobile">
    <a class="button" href="https://www.qvft.ca/">Queen's Vertical Farming Team Website</a>
</div>
<div class="contentWrapper mobile">
    <a class="button" href="QVFT-System-Guide.pdf">Download System Guide</a>
</div>
<div class="contentWrapper mobile">
    <a class="button" href="QVFT-Mechatronics-Update.pdf">Download Mechatronics Update</a>
</div>




