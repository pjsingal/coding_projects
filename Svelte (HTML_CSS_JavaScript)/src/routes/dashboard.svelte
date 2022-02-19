<script>
    import { onMount } from "svelte";
    import PageHeader from "../components/PageHeader.svelte";
</script>

<style>
    .dashboard {
        position: absolute; 
        overflow: visible; 

        /* position: absolute; 
        overflow: hidden;  */

        top: 19.2rem; 
        bottom: 0px; 
        right: 0px; 
        width: 100%; 
        border: none; margin: 0; 
        padding: 0; overflow: hidden; 
        z-index: 999999; 
        height: 100%;
    }
    @media only screen and (max-width: 600px) {
        .dashboard {
            top: 19.2rem; 
        }
    }
</style>

<svelte:head>
  <title>Patrick Singal</title>
</svelte:head>
<PageHeader>QVFT Dash (Beta)</PageHeader> 
<div>
    <!-- Embedded Dashboard Page-->
    <iframe src="https://directorqvft.pythonanywhere.com/" class="dashboard" title="QVFT Dash (Beta)"></iframe>
</div>
