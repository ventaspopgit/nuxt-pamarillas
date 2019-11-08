<template>
  <header class="header_in">
    <div class="container">
      <div class="row">
        <div class="col-lg col-sm-12" style="flex-grow:0">
          <div id="logo">
            <router-link to="/">
              <img src="~assets/img/buscoshop.jpg" height="50" alt="" class="logo_sticky">
            </router-link>
          </div>
        </div>
        <form action="/buscar" method="get" class="search col-lg">
          <input type="text" placeholder="Buscar..." name="query" class="form-control">
          <button type="submit" />
        </form>
        <div class="col-lg col-sm-12">
          <ul v-if="cartProducts.length" id="top_menu">
            <li>
              <router-link to="/carrito" class="wishlist_bt_top" title="Tu carrito">
                Tu carrito
                <span class="n">{{ cartProducts.length }}</span>
              </router-link>
            
              <router-link to="/carrito" class="desplegable productos">
                <div v-for="(product, index) in cartProducts" :key="index" class="producto">
                  <div class="imagen">
                    <img :src="product.image" alt="">
                  </div>
                  <div class="info">
                    <p class="tit-5">{{ product.name }}</p>
                    <p class="precio">
                      {{ $price(product.price * product.quantity) }}
                    </p>
                  </div>
                </div>

                <div class="subtotal">
                  <p>Subtotal</p>
                  <strong>{{ $price(cartTotal) }}</strong>
                </div>
                
                <router-link to="/carrito" class="btn btn_1">Finalizar compra</router-link>
              </router-link>
            </li>
          </ul>
          <a href="#menu" class="btn_mobile">
            <div id="hamburger" class="hamburger hamburger--spin">
              <div class="hamburger-box">
                <div class="hamburger-inner" />
              </div>
            </div>
          </a>
          <nav id="menu" class="main-menu">
            <ul>
              <li v-for="(cat, index) in categories" :key="index">
                <span><router-link :to="cat.url">{{ cat.name }}</router-link></span>
              </li>
              <li v-if="user.logged">
                <span><a href="#">Hola {{ user.name() }}</a></span>
                <ul>
                  <li><span><a href="#" @click="user.logout()">Cerrar sesión</a></span></li>
                </ul>
              </li>
              <li v-if="!user.logged"><span><router-link to="/login">Login</router-link></span></li>
            </ul>
          </nav>
        </div>
      </div>
      <!-- /row -->
    </div>
    <!-- /container -->
  </header>
</template>

<script>
import User from '~/components/gigantier/User';
import Cart from '~/components/Cart';

export default {
  name: 'Header',
  props: {
    shop: {
      type: Object,
      required: true
    },
    categories: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    user: null,
    query: null,
    timeout: null,
    buscadorAbierto: false,
    sugerenciasAbiertas: false,
    sugerencias: [],
    marcas: []
  }),
  computed: {
    cartProducts() {
      return Cart.state.products;
    },
    cartQuantity() {
      return Cart.getters.quantity;
    },
    cartTotal() {
      return Cart.getters.total;
    },
    userName() {
      return (this.user ? this.user.name() : null);
    }
  },
  created() {
    this.user = User;
    this.user.init();
  }
};
</script>
