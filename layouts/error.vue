<template>
  <div id="error404">
    <div class="container">
      <h1>{{ error.statusCode }}</h1>
      <h2>La página que estás buscando no existe.</h2>
      <p>Te pedimos disculpas por el inconveniente, parece ser que estas intentando entrar a una pagina que fue borrada o que nunca existió.</p>
      <router-link :to="'/'" class="btn">Ir al home</router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: () => ({ statusCode: 404 })
    }
  },
  layout: 'default'
};
</script>
