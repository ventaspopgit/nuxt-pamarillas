<template>
  <div />
</template>

<script>
import Product from '~/components/gigantier/Product';
import Cart from '~/components/Cart';

export default {
  name: 'CartLoad',
  mounted() {
    try {
      const data = JSON.parse(atob(this.$route.params.pathMatch));
      data.forEach((row) => {
        Product.getProduct(row.id).then((product) => {
          Cart.commit('add', {
            product: product.data,
            versionId: row.versionId,
            quantity: row.quantity
          });
        });
      });
      
      this.$router.push('/carrito');
    } catch (e) {
      this.$nuxt.$emit('error', 'Error al cargar carrito');      
      this.$router.push('/');
    }
  }
};
</script>
