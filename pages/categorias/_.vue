<template>
  <div>
    <div id="producto" :class="{ container: true, agotado: (product.stock === 0) }">
      
      <p class="breadcrumb">
        <router-link to="/">Inicio</router-link>
        <span v-if="category">
          <i>&gt;</i>
          <router-link :to="category.url">{{ category.name }}</router-link>
        </span>
        <i>&gt;</i>
        {{ product.name }}
      </p>
      
      <div class="row">    
        <div id="fotos" class="col-6">
          <div class="principal">
            <figure id="zoom" :style="{ backgroundImage: 'url(\'' + product.image + '\')' }">
              <img :src="product.image" :alt="product.name">
            </figure>
          </div>
          
          <ul>
            <li v-for="(image, i) in product.images" :key="i">
              <a :href="image.image" @click.prevent="product.image = image.image"><img :src="image.image" :alt="product.name"></a>
            </li>
          </ul>
        </div>
        
        <div id="info" class="col-6">
          <h2 class="tit-4">{{ product.manufacturer }}</h2>
          <h1 class="tit-3">{{ product.name }}</h1>
          
          <div class="precio">
            <span v-if="product.discount" class="descuento">-{{ product.discount }}%</span>
            <span class="pvp">{{ $price(product.price) }}</span>
            <s v-if="product.originalPrice > product.price">{{ $price(product.originalPrice) }}</s>
          </div>
          
          <div class="alertas">
            <p v-if="product.stock && product.lastUnits && product.stock <= product.lastUnits" class="ultimas">
              <template v-if="product.stock > 1">¡Quedan {{ product.stock }} unidades!</template>
              <template v-if="product.stock == 1">¡Queda {{ product.stock }} unidad!</template>
            </p>
            <p v-if="product.freeShipping" class="envio">Este producto tiene <strong>envío gratis</strong>.</p>
          </div>
          
          <div class="descripcion">
            <p>
              {{ $truncate(product.description, 200) }}
              <router-link :to="product.url + '#tabs'">más información</router-link>
            </p>
          </div>
          
          <form id="buy" @submit.prevent="buy()">
            <template v-if="product.stock > 0">
              <select v-for="(att, index) in product.attributes" v-if="att.values.length > 1 || (att.values[0] !== 'S-A' && att.values[0] !== 'S--A')" :key="index" v-model="product.selectedAttributes[att.id]" class="form-control" @change="updateVersionData()">
                <option :value="null">{{ att.name }}</option>
                <option v-for="(value, j) in att.values" :key="j" :value="value">{{ value }}</option>
              </select>
              <select v-model="quantity" class="form-control">
                <option v-for="i in Math.min(10, maxQuantity)" :key="i" :value="i">{{ i }}</option>
              </select>
              
              <div v-if="versionSelected && hasStock">
                <button type="submit" class="btn_1"><span>Agregar al carrito</span></button>
              </div>
              
              <div v-if="product.versions.length > 0">
                <div v-show="!product.selectedAttributes[1]">
                  <button type="button" class="btn_1" disabled="disabled"><span>Selecciona un modelo</span></button>
                </div>
              </div>
            </template>
            
            <div v-show="versionSelected && !hasStock" id="stockError">
              <button type="button" class="btn_1" disabled="disabled"><span>Producto agotado</span></button>
            </div>
            
          </form>
          
          <div class="social">
            <p>
              <span>Comparte ya esta promoción:</span>
              
              <a :href="facebookShare" @click.prevent="facebook($event)"><img src="~assets/img/facebook-grey.svg" alt="facebook"></a>
              <a :href="twitterShare" @click.prevent="twitter($event)"><img src="~assets/img/twitter-grey.svg" alt="twitter"></a>
            </p>
          </div>
        </div>
      </div>
      
      <div id="tabs" class="tabs">
        <h2 class="tit-3">Información</h2>
        
        <ul>
          <li :class="{ active: (visible == 'desc') }" @click="visible = 'desc'">Descripción</li>
          <li :class="{ active: (visible == 'deli') }" @click="visible = 'deli'">Envíos</li>
          <li :class="{ active: (visible == 'warr') }" @click="visible = 'warr'">Devoluciones</li>
        </ul>
        
        <div v-if="visible == 'desc'" class="tabContent" v-html="product.descriptionHTML" />
        <div v-if="visible == 'deli'" class="tabContent" v-html="product.deliveryInfoHTML" />
        <div v-if="visible == 'warr'" class="tabContent" v-html="product.warrantyHTML" />
        
      </div>
  
      <div class="relacionados">
  
        <h2 class="tit-3">También te puede interesar</h2>
        
        <ProductList :products="related" :list-name="'Relacionados ' + product.name" :type="0" size="small" />
        
      </div>
  
    </div>
  </div>
</template>

<script>
import Product from '~/components/gigantier/Product';
import Category from '~/components/gigantier/Category';
import User from '~/components/gigantier/User';
import ProductList from '~/components/ProductList';
import Cart from '~/components/Cart';
  
export default {
  name: 'Product',
  validate({ params }) {
    // Extract product id from {catId}-{slug}/{prodId}-{slug}
    const path = params.pathMatch.split('/');
    if (path.length !== 2) {
      return false;
    }
    params.id = path[1].split('-')[0];
    return !isNaN(params.id);
  },
  components: {
    ProductList
  },
  data: () => ({
    shop: {},
    quantity: 1,
    visible: 'desc',
    today: new Date(),
    facebookShare: null,
    twitterShare: null
  }),
  head() {
    return {
      titleTemplate: this.product.name + ' - %s',
      meta: [
        { hid: 'description', name: 'description', content: this.product.metaDesc },
        { hid: 'keywords', name: 'keywords', content: this.product.metaKeys },
        
        { hid: 'item-name', itemprop: 'name', content: this.product.name },
        { hid: 'item-description', itemprop: 'description', content: this.product.metaDesc },
        { hid: 'item-image', itemprop: 'image', content: this.product.image },

        { hid: 'og-title', property: 'og:title', content: this.product.name },
        { hid: 'og-description', property: 'og:description', content: this.product.metaDesc },
        { hid: 'og-image', property: 'og:image', content: this.product.image },
        { hid: 'og-type', property: 'og:type', content: 'article' },
        { hid: 'og-price-amount', property: 'og:price:amount', content: this.product.price },

        { hid: 'twitter-title', property: 'twitter:title', content: this.product.name },
        { hid: 'twitter-description', property: 'twitter:description', content: this.product.metaDesc },
        { hid: 'twitter-image', property: 'twitter:image', content: this.product.image }
      ]
    };
  },
  computed: {
    version: function () {
      return this.getVersion();
    },
    hasStock: function () {
      if (this.product.versions.length === 0) {
        return (this.product.stock > 0);
      } else {
        return (this.version && this.version.stock > 0);
      }
    },
    versionSelected: function () {
      if (this.product.versions.length === 0 || this.product.stock === 0) {
        return true;
      } else {
        const version = this.product.versions[0];
        for (let i = 0; i < version.attributes.length; i++) {
          if (this.product.selectedAttributes[version.attributes[i].id] === null) {
            return false;
          }
        }
        return true;
      }
    }
  },
  async asyncData(params) {
    let product = {};
    let category = null;
    let related = [];
    
    try {
      product = await Product.getProduct(params.params.id);
      product = product.data;
    } catch (err) {
      params.error({ statusCode: 404 });
      return false;
    }
    
    try {
      related = await Product.getRelated(params.params.id);
      related = related.data.products.slice(0, 4);
    } catch (err) {
      console.error(err);
    }
    
    try {
      if (product.categories.length) {
        category = await Category.getCategory(product.categories[0]);
        category = category.data;
      }
    } catch (err) {
      console.error(err);
    }
    
    let maxQuantity = product.stock;
    if (product.maxQuantity) {
      maxQuantity = product.maxQuantity;
    }
    
    return { product: product, related: related, maxQuantity: maxQuantity, category: category };
  },
  beforeRouteUpdate(to, from, next) {
    this.load(to.params.id);
    next();
  },
  created() {
    this.shop = this.$store.state.shop;
  },
  mounted() {
    this.updateVersionData();
    
    this.facebookShare = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURI(window.location.href);
    this.twitterShare = 'https://twitter.com/share?text=Ya+conoces+Geelbe%3F+Tu+Outlet+Privado.+Ll%C3%A9vate+las+mejores+marcas+de+moda+hasta+con+70%25+OFF+%40geelbeco&url=' + encodeURI(window.location.href);

    this.user = User;
    this.user.init();

    function zoom(e) {
      const zoomer = e.currentTarget;
      let offsetX, offsetY;
      e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX
      e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX
      const x = offsetX / zoomer.offsetWidth * 100
      const y = offsetY / zoomer.offsetHeight * 100
      zoomer.style.backgroundPosition = x + '% ' + y + '%';
    }
    
    document.getElementById('zoom').addEventListener('mousemove', zoom);
    
    setInterval(() => {
      this.today = new Date();
    }, 1000);
    
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: this.product.name,
        content_type: 'product',
        content_ids: [this.product.id],
        Brand: this.product.manufacturer,
        currency: 'COP',
        value: this.product.price
      });
    }
    
    // Google event
    this.$gtm.pushEvent({
      event: 'gtm.dom',
      ecommerce: {
        detail: {
          products: [{
            id: this.product.id,
            name: this.product.name,
            brand: this.product.manufacturer,
            price: this.product.price
          }]
        }
      }
    });
  },
  methods: {
    async load(id) {
      let product = null;
      let related = null;

      try {
        product = await Product.getProduct(id);
        this.product = product.data;
      } catch (error) {
        console.error(error);
      }
      
      try {
        related = await Product.getRelated(id);
        this.related = related.data.products.slice(0, 4);
      } catch (error) {
        console.error(error);
      }
    },
    getVersion() {
      if (this.product.versions.length === 0) {
        return null;
      }
      
      for (let i = 0; i < this.product.versions.length; i++) {
        let ok = true;
        
        for (let j = 0; j < this.product.versions[i].attributes.length; j++) {
          const atts = this.product.versions[i].attributes[j];
          if (atts.value !== this.product.selectedAttributes[atts.id]) {
            ok = false;
            break;
          }
        }
        
        if (ok) {
          return this.product.versions[i];
        }
      }
      
      return null;
    },
    updateVersionData() {
      if (this.version) {
        this.maxQuantity = this.version.stock;
        this.product.price = this.version.price;
        this.product.originalPrice = this.version.originalPrice;
      } else {
        this.maxQuantity = this.product.stock;
      }
    },
    buy() {
      Cart.commit('add', {
        product: this.product,
        versionId: (this.version ? this.version.id : null),
        quantity: this.quantity
      });
      this.$router.push('/carrito');
    },
    facebook(event) {
      const link = event.target.closest('a');
      window.open(link.href, '', 'width=600,height=300');
    },
    twitter(event) {
      const link = event.target.closest('a');
      window.open(link.href, '', 'width=600,height=500');
    }
  }
};
</script>
