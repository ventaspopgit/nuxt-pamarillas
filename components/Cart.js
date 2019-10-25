import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersist from 'vuex-persist';
import CartProduct from './gigantier/CartProduct.js';
import User from './gigantier/User.js';

const dummyStorageSSR = {
  setItem(key, value) {
  },
  getItem(key) {
  },
  removeItem(key) {
  },
  key(n) {
  },
  clear() {
  }
};

const vuexPersist = new VuexPersist({
  key: 'cart',
  storage: (!process.server ? localStorage : dummyStorageSSR)
});

Vue.use(Vuex);

const Cart = new Vuex.Store({
  plugins: [vuexPersist.plugin],
  state: {
    label: null,
    name: null,
    surname: null,
    doc: null,
    email: null,
    tel: null,
    address: null,
    address2: null,
    address3: null,
    address4: null,
    address5: null,
    countryId: null,
    stateId: null,
    cityId: null,
    carrierId: null,
    products: [],
    discounts: [],
    credits: 0,
    remoteSubtotal: 0,
    remoteDiscounts: [],
    remoteShipping: 0,
    remoteTotal: 0,
    invitationCode: null,
    referer: null
  },
  getters: {
    quantity(state) {
      return state.products.reduce((sum, p) => { return sum + p.quantity; }, 0);
    },
    total(state) {
      return state.products.reduce((sum, p) => { return sum + (p.price * p.quantity); }, 0);
    },
    originalTotal(state) {
      return state.products.reduce((sum, p) => { return sum + (p.originalPrice * p.quantity); }, 0);
    }
  },
  mutations: {
    setProducts(state, payload) {
      this.state.products = payload;
    },
    
    setDiscounts(state, payload) {
      this.state.discounts = payload;
    },
    
    setCredits(state, payload) {
      this.state.credits = payload;
    },
    
    setInvitationCode(state, payload) {
      this.state.invitationCode = payload;
    },
    
    setReferer(state, payload) {
      this.state.referer = payload;
    },
    
    add(state, payload) {
      let attributes = [];
      let version = [];
      const versions = payload.product.versions.filter(v => (v.id === payload.versionId));
      
      if (versions.length) {
        version = versions.pop();
        attributes = version.attributes.map(a => ({ name: a.name, value: a.value }))
      }

      const existing = this.state.products.findIndex((prod) => {
        return (prod.productId === payload.product.id && prod.versionId === payload.versionId);
      });

      // Remove existing product from cart
      if (existing >= 0) {
        this.commit('remove', existing);
      }
      
      this.state.products.push({
        productId: payload.product.id,
        versionId: payload.versionId,
        quantity: payload.quantity,
        code: payload.product.code,
        name: payload.product.name,
        discount: payload.product.discount,
        originalPrice: (version.id ? version.originalPrice : payload.product.originalPrice),
        price: (version.id ? version.price : payload.product.price),
        stock: Math.min((version.id ? version.stock : payload.product.stock), payload.product.maxQuantity),
        image: payload.product.image,
        attributes: attributes,
        deliveryFrom: (payload.product.campaigns.length ? payload.product.campaigns[0].deliveryFrom : null),
        deliveryTo: (payload.product.campaigns.length ? payload.product.campaigns[0].deliveryTo : null),
        created: new Date().getTime()
      });
      
      // Facebook event
      if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
          content_name: payload.product.name,
          content_type: 'product',
          content_ids: [payload.product.id],
          Brand: payload.product.manufacturer,
          currency: 'COP',
          value: payload.product.price
        });
      }
      
      // Google event
      window.$nuxt.$gtm.pushEvent({
        event: 'addToCart',
        ecommerce: {
          add: {
            products: [{
              id: payload.product.id,
              name: payload.product.name,
              brand: payload.product.manufacturer,
              quantity: payload.quantity,
              variant: payload.versionId,
              price: parseFloat(payload.product.price)
            }]
          }
        }
      });
      
      // Save remotely
      User.init();
      if (User.logged) {
        CartProduct.create({
          productId: payload.product.id,
          versionId: payload.versionId,
          quantity: payload.quantity,
          userId: User.id()
        }).then((data) => {
          this.commit('setCartProductId', { productId: payload.product.id, versionId: payload.versionId, cartProductId: data.data._id });
        });
      }
    },
    
    setCartProductId(state, payload) {
      const existing = this.state.products.findIndex((prod) => {
        return (prod.productId === payload.productId && prod.versionId === payload.versionId);
      });
      
      const product = state.products[existing];
      this.commit('remove', existing);
      
      product.cartProductId = payload.cartProductId;
      this.state.products.push(product);      
    },
    
    setCarrier(state, payload) {
      this.state.carrierId = payload;
    },
    
    setAddress(state, payload) {
      this.state.label = payload.label;
      this.state.name = payload.name;
      this.state.surname = payload.surname;
      this.state.doc = payload.doc;
      this.state.email = payload.email;
      this.state.tel = payload.tel;
      this.state.address = payload.address;
      this.state.address2 = payload.address2;
      this.state.address3 = payload.address3;
      this.state.address4 = payload.address4;
      this.state.address5 = payload.address5;
      this.state.countryId = payload.countryId;
      this.state.stateId = payload.stateId;
      this.state.cityId = payload.cityId;
    },
    
    setTotals(state, payload) {
      this.state.remoteTotal = payload.remoteTotal;
      this.state.remoteSubtotal = payload.remoteSubtotal;
      this.state.remoteShipping = payload.remoteShipping;
      this.state.remoteDiscounts = payload.remoteDiscounts;
    },
    
    remove(state, index) {
      if (this.state.products[index].cartProductId) {
        const product = this.state.products[index];
        
        window.$nuxt.$gtm.pushEvent({
          event: 'removeFromCart',
          ecommerce: {
            remove: {
              products: [{
                id: product.id,
                name: product.name,
                brand: product.manufacturer,
                quantity: product.quantity,
                variant: product.versionId,
                price: parseFloat(product.price)
              }]
            }
          }
        });
        
        CartProduct.delete(this.state.products[index].cartProductId);
      }  
      
      this.state.products.splice(index, 1);
    },
    
    removeProductId(state, id) {
      const prods = this.state.products;
      for (let i = 0; i < prods.length; i++) {
        if (prods[i].productId === id) {
          this.commit('remove', i);
        }
      }
    },
    
    addDiscount(state, code) {
      this.state.discounts.push(code);
    },
    
    removeDiscountCode(state, id) {
      this.state.discounts = this.state.discounts.filter((disc) => { return disc !== id; });
    },
    
    reset() {
      this.state.products.map((product) => {
        CartProduct.delete(product.cartProductId);
      });
      
      this.state.products = [];
      this.state.discounts = [];
      this.state.credits = 0;
      this.state.invitationCode = null;
      this.state.referer = null;
    },
    
    checkProducts() {
      const maxLifetime = 2 * 60 * 60 * 1000; // 2 hours
      this.state.products = this.state.products.filter((p) => {
        return (new Date().getTime() - p.created < maxLifetime);
      });
    }
  }
});

export default Cart;
