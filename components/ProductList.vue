<template>
  <div :class="{ row: (type === 0) }">
    <!-- GRID -->
    <div v-for="(product, index) in products" v-if="type === 0" :key="index" :data-id="product.id" itemscope itemtype="http://schema.org/Product" :data-manufacturer="product.manufacturer" :class="{ 'col-md-6': (size === 'large'), 'col-md-4': (size === 'small'), 'col-md-3': (size === 'smallest') }">
      <div class="strip grid">
        <figure>
          <small v-if="product.discount" class="discount">-{{ product.discount }}%</small>
          <router-link v-if="product.image" :to="product.url" event="" @click.native.prevent="visit(product, index)">
            <img :src="product.image" class="img-fluid" alt="">
          </router-link>
        </figure>
        <div class="wrapper">
          <h3><router-link :to="product.url" event="" @click.native.prevent="visit(product, index)">{{ product.name }}</router-link></h3>
          <small>{{ product.code }}</small>
          <p class="price">
            {{ $price(product.price) }}
            <s v-if="product.originalPrice && product.originalPrice > product.price">{{ $price(product.originalPrice) }}</s>
          </p>
        </div>
      </div>
    </div>
    <!-- LIST -->
    <div v-for="(product, index) in products" v-if="type === 1" :key="index" data-id="product.id" itemscope itemtype="http://schema.org/Product" :data-manufacturer="product.manufacturer" class="strip list_view">
      <div class="row no-gutters">
        <div class="col" style="flex-shrink:1;flex-grow:0">
          <figure>
            <small v-if="product.discount" class="discount">-{{ product.discount }}%</small>
            <router-link v-if="product.image" :to="product.url" event="" @click.native.prevent="visit(product, index)">
              <img :src="product.image" class="img-fluid" alt="">
            </router-link>
          </figure>
        </div>
        <div class="col">
          <div class="wrapper">
            <h3><router-link :to="product.url" event="" @click.native.prevent="visit(product, index)">{{ product.name }}</router-link></h3>
            <small>{{ product.code }}</small>
            <p class="price">
              {{ $price(product.price) }}
              <s v-if="product.originalPrice && product.originalPrice > product.price">{{ $price(product.originalPrice) }}</s>
            </p>
          </div>
        </div>
      </div>
    </div>    
  </div>
</template>

<script>
import User from '~/components/gigantier/User';

export default {
  name: 'ProductList',
  props: {
    products: {
      type: Array,
      required: true
    },
    classNames: {
      type: String,
      required: false,
      default: ''
    },
    listName: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      default: 'large'
    }
  },
  data: () => ({
    user: null
  }),
  mounted() {
    this.user = User;
    this.user.init();

    this.$gtm.pushEvent({
      event: 'gtm.dom',
      ecommerce: {
        impressions: this.products.map((product, index) => {
          return {
            id: product.id,
            name: product.name,
            brand: product.manufacturer,
            price: product.price,
            position: index,
            list: this.listName
          };
        })
      }
    });  
  },
  methods: {
    visit(product, index) {
      this.$gtm.pushEvent({
        event: 'productClick',
        ecommerce: {
          click: {
            actionField: { list: this.listName },
            products: [{
              id: product.id,
              name: product.name,
              brand: product.manufacturer,
              price: product.price,
              position: index,
              list: this.listName
            }]
          }
        }
      });
      this.$router.push(product.url);
    }
  }
};
</script>
