<template>
  <div id="page">
    <Heading :shop="shop" :categories="categories" />
    <main id="main">
      <nuxt />
      <a id="scrollTop" @click.prevent="scrollTop()">
        <i class="icon-up-open-big" />
      </a>
    </main>
    <Foot :shop="shop" :pages="pages" />
    <Error :message="errorMessage" :visible="errorVisible" />
  </div>
</template>

<style lang="scss">
@import '~/assets/css/bootstrap.min.css';
@import '~/assets/css/style.css';
@import '~/assets/css/vendors.css';
@import '~/assets/css/custom.css';

:root {
  --red: #ef2d4a;
  --dark-grey: #313f48;
  --grey: #cecece;
  --light-grey: #f2f3f5;
  --yellow: #fec745;
}

@import '~/assets/css/_product.scss';
@import '~/assets/css/_carrito.scss';
</style>

<script>
import Error from '~/components/Error';
import Heading from '~/components/Header';
import Foot from '~/components/Footer';
import Cart from '~/components/Cart';

export default {
  name: 'App',
  components: {
    Heading,
    Foot,
    Error
  },
  data: () => ({
    shop: {},
    pages: [],
    categories: [],
    errorMessage: null,
    errorVisible: false
  }),
  created() {
    this.shop = this.$store.state.shop;
    this.pages = this.$store.state.pages.slice(0, 2);
    this.categories = this.$store.state.categories;

    this.$nuxt.$on('error', (message) => {
      this.errorVisible = true;
      this.errorMessage = message;
    });

    this.$nuxt.$on('dimissError', () => {
      this.errorVisible = false;
      this.errorMessage = null;
    });
  },
  mounted() {
    // referer
    const search = location.search.replace('?', '').split('&');
    const params = {};
    search.forEach((param) => {
      param = param.split('=');
      params[param[0]] = decodeURI(param[1]).trim();
    });
    
    if (params.referer) {
      Cart.commit('setReferer', params.referer);
    } else {
      const utm = [];
      
      if (params.utm_medium) {
        utm.push(params.utm_medium);
      }

      if (params.utm_campaign) {
        utm.push(params.utm_campaign);
      }

      if (params.utm_term) {
        utm.push(params.utm_term);
      }

      if (params.utm_content) {
        utm.push(params.utm_content);
      }
      
      if (utm.length > 0) {
        Cart.commit('setReferer', utm.join('-'));
      }
    }
    
    Cart.commit('checkProducts');
  },
  methods: {
    scrollTop() {
      const scroll = new SmoothScroll('#scrollTop');
      scroll.animateScroll(document.getElementById('page'));
    }
  }
};
</script>
