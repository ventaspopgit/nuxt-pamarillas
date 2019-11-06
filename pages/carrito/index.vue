<template>
  <div id="carrito">
    <div class="container">
      
      <client-only>
        <div v-if="products.length > 0" class="contenido row justify-content-between">
          
          <div class="productos col-md-7">
            <h1 class="tit-3">Carrito de compras</h1>
                      
            <div v-for="(product, index) in products" :key="index" class="producto row">
              <div class="col-3">
                <div class="imagen">
                  <img :src="product.image">
                </div>
              </div>
              <div class="info col-9">
                <select v-model="products[index].quantity" @change="updateQuantity(index)">
                  <option v-for="i in Math.min(products[index].stock, 10)" :key="i" :value="i">{{ i }}</option>
                </select>
  
                <h2 class="tit-4">{{ product.name }}</h2>
                <p v-for="(attribute, index2) in product.attributes" v-if="attribute.value !== 'S-A' && attribute.value !== 'S--A'" :key="index2" class="att">{{ attribute.name }}: <strong>{{ attribute.value }}</strong></p>
                <p v-if="product.deliveryFrom && product.deliveryTo" class="entrega">Entrega estimada: {{ moment(product.deliveryFrom).format('DD MMMM') }} - {{ moment(product.deliveryTo).format('DD MMMM') }}</p>
                <div class="precio">
                  <span class="pvp">{{ $price(product.price) }}</span>
                  <s>{{ $price(product.originalPrice) }}</s>
                </div>
                <p class="eliminar"><a href="#" @click.prevent="removeProduct(index)">Eliminar</a></p>
              </div>
              <div class="mobile">
                <p v-if="product.deliveryFrom && product.deliveryTo" class="entrega">Entrega estimada: {{ moment(product.deliveryFrom).format('DD MMMM') }} - {{ moment(product.deliveryTo).format('DD MMMM') }}</p>
                <p class="eliminar"><a href="#" @click.prevent="removeProduct(index)">Eliminar</a></p>
              </div>
            </div>
          </div>
          
          <aside class="resumen col-md-4">
            <h2 class="tit-6">Resumen de tu pedido</h2>
            
            <p>Subtotal ({{ products.length }} producto{{ products.length > 1 ? 's' : '' }}) <strong>{{ $price(subtotal) }}</strong></p>
            <p v-if="remoteCredits > 0">Créditos <strong>{{ $price(-remoteCredits) }}</strong></p>
            <p v-for="(disc, index) in remoteDiscounts" :key="index">
              <img src="~assets/img/close-icon-dark-grey-big-web.svg" alt="Eliminar" @click="deleteDiscount(index)">
              {{ disc.name }} <strong>{{ $price(-disc.amount) }}</strong>
            </p>
            <p>Envío <strong>por definir</strong></p>
            
            <div class="cupones">
              
              <form v-if="multipleDiscounts || discounts.length === 0" class="cupon" @submit.prevent="addDiscount()">
                <label>¿Tienes algún cupón de descuento?</label>
                <input v-model="newDiscount" type="text" placeholder="Código del cupón" required="required">
                <button type="submit">Aplicar</button>
              </form>
              
              <form v-if="availableCredits > 0" class="cupon" @submit.prevent="addCredits()">
                <label>Tienes {{ $price(availableCredits) }} en G-cash, cuánto quieres usar?</label>
                <input v-model="credits" type="number" :placeholder="$price(availableCredits)">
                <button type="submit">Aplicar</button>
              </form>
              
              <form v-if="userBonuses.length > 0" class="cupon" @submit.prevent="addBonuses()">
                <label>Tienes <strong>{{ userBonuses.length }} bono{{ userBonuses.length > 1 ? 's' : '' }}</strong> por referidos</label>
                <select v-model="usedBonuses">
                  <option v-for="i in userBonuses.length" :key="i" :value="i">{{ i }} bono{{ i > 1 ? 's' : '' }}</option>
                </select>
                <button type="submit">Aplicar</button>
              </form>
              
            </div>
            
            <p class="ahorro">
              <strong>Tu ahorro total es de {{ $price(originalTotal - total) }}</strong>
              (valor total sin descuentos {{ $price(originalTotal) }})
            </p>
            
            <p class="total">Total <strong>{{ $price(total) }}</strong></p>
            
            <router-link :to="'carrito/direccion'" class="btn btn_1">Seguir con el envío</router-link>
            
            <router-link :to="'/'" class="btn btn_1 outline">Seguir comprando</router-link>
          </aside>
          
        </div>
  
        <div v-if="products.length == 0">
          <p class="tit-4">No tienes productos en tu carrito.</p>
        </div>
      </client-only>
    </div>      
  </div>
</template>

<script>
import moment from 'moment';
import Cart from '~/components/Cart';
import User from '~/components/gigantier/User';
import Order from '~/components/gigantier/Order';

moment.locale('es');
  
export default {
  name: 'Cart',
  data: () => ({
    newDiscount: '',
    credits: null,
    discount: 0,
    multipleDiscounts: false,
    remoteDiscounts: [],
    remoteCredits: 0,
    remoteSubtotal: null,
    remoteTotal: null,
    carrierLoading: false,
    userBonuses: [],
    usedBonuses: 0
  }),
  computed: {
    products() {
      return Cart.state.products;
    },
    discounts() {
      return Cart.state.discounts;
    },
    bonuses() {
      return Cart.state.bonuses;
    },
    subtotal() {
      return (this.remoteSubtotal !== null ? this.remoteSubtotal : Cart.getters.total);
    },
    total() {
      return (this.remoteTotal !== null ? this.remoteTotal : Cart.getters.total);
    },
    originalTotal() {
      return Cart.getters.originalTotal;
    },
    availableCredits() {
      return (this.user.logged ? this.user.credits() : 0);
    }
  },
  async created() {
    this.user = User;
    this.user.init();
    
    if (this.user.logged) {
      try {
        const bonos = await User.getDiscounts();
        this.userBonuses = bonos.data.discounts;
      } catch (err) {
        console.error(err);
      }
    }
    
    this.credits = Cart.state.credits;
    
    this.loadTotals();
    this.multipleDiscounts = parseInt(this.$store.state.shop.MULTIPLE_DISCOUNTS);
  },
  mounted() {
    if (!Cart.state.products.length) {
      this.$router.push('/');
      return false;
    }

    // Google event
    if (typeof this.$gtm !== 'undefined') {
      this.$gtm.pushEvent({
        event: 'checkout',
        ecommerce: {
          checkout: {
            actionField: { step: 1 },
            products: this.products.map((product) => {
              return {
                id: product.id,
                name: product.name,
                price: product.price,
                brand: product.manufacturer,
                variant: product.versionId,
                quantity: product.quantity
              };
            })
          }
        }
      });  
    }  
  },
  methods: {
    moment(args) {
      return moment(args);
    },
    async loadTotals() {
      if (!this.user.logged) {
        return false;
      }
      
      if (this.$nuxt.$loading && this.$nuxt.$loading.start) {
        this.$nuxt.$loading.start();
      }
      
      this.totalsLoaded = false;
      
      const params = {
        products: this.products.map(product => ({ id: product.productId, versionId: product.versionId, quantity: product.quantity })),
        discounts: this.discounts,
        credits: this.credits,
        access_token: this.user.accessToken()
      };
      
      try {
        const data = await Order.calculateTotal(params);
        this.discount = data.data.discount;
        this.remoteDiscounts = data.data.discounts;
        this.remoteSubtotal = data.data.subtotal;
        this.remoteTotal = data.data.total;
        this.remoteCredits = data.data.creditsAmount;
        
        if (data.data.invitationCode) {
          Cart.commit('setInvitationCode', data.data.invitationCode);
        }
        
        Cart.commit('setDiscounts', this.remoteDiscounts.map((discount) => { return discount.code; }));
        Cart.commit('setCredits', this.remoteCredits);
        
        this.totalsLoaded = true;

        const userBonusesCodes = this.userBonuses.map((x) => { return x.code });
        this.usedBonuses = this.discounts.filter(x => userBonusesCodes.includes(x)).length;      

        if (this.$nuxt.$loading && this.$nuxt.$loading.finish) {
          this.$nuxt.$loading.finish();
        }
      } catch (error) {
        this.$nuxt.$emit('error', error.response.data.error);
      
        // Remove unavailable product from cart
        if (error.response.data.id) {
          Cart.commit('removeProductId', error.response.data.id);
        }
        
        // Remove unavailable discount from cart
        if (error.response.data.discount) {
          Cart.commit('removeDiscountCode', error.response.data.discount);
        }
        
        // Remove unavailable credits from cart
        if (error.response.data.credits) {
          Cart.commit('setCredits', 0);
        }
        
        if (this.$nuxt.$loading && this.$nuxt.$loading.finish) {
          this.$nuxt.$loading.finish();
        }

        throw error.response.data.error;        
      }
    },
    updateQuantity(index) {
      if (this.products[index].quantity > this.products[index].stock) {
        this.products[index].quantity = this.products[index].stock;
      }
        
      Cart.commit('setProducts', this.products);
      this.loadTotals();
    },
    addQuantity(index, qty) {
      this.products[index].quantity = parseInt(this.products[index].quantity) + parseInt(qty);
      if (this.products[index].quantity < 1) {
        this.products[index].quantity = 1;
      }
      if (this.products[index].quantity > this.products[index].stock) {
        this.products[index].quantity = this.products[index].stock;
      }
      Cart.commit('setProducts', this.products);
      this.loadTotals();
    },
    removeProduct(index) {
      Cart.commit('remove', index);
      this.loadTotals();
    },
    addDiscount() {
      const originalDiscounts = JSON.parse(JSON.stringify(this.discounts));
      const newDiscounts = this.discounts;
      const newDiscountCode = this.newDiscount;

      if (newDiscounts.indexOf(newDiscountCode) === -1) {
        this.validateInvitationCode(newDiscountCode).then(() => {
          newDiscounts.push(newDiscountCode);
          Cart.commit('setDiscounts', newDiscounts);
          
          this.loadTotals().catch(() => {
            Cart.commit('setDiscounts', originalDiscounts);
          })
        }).catch((e) => {
          this.$nuxt.$emit('error', e.message);
        });
      }
        
      this.newDiscount = '';
    },
    async deleteDiscount(index) {
      const originalDiscounts = JSON.parse(JSON.stringify(this.discounts));
      this.discounts.splice(index, 1);
      Cart.commit('setDiscounts', this.discounts);

      try {
        await this.loadTotals();
      } catch (error) {
        Cart.commit('setDiscounts', originalDiscounts);
      }
    },
    async addCredits() {
      Cart.commit('setCredits', this.credits);
      
      try {
        await this.loadTotals();
      } catch (error) {
        Cart.commit('setCredits', 0);
      }
    },
    addBonuses() {
      for (let i = 0; i < this.usedBonuses; i++) {
        this.newDiscount = this.userBonuses[i].code;
        this.addDiscount();
      }
    },
    validateInvitationCode(code) {
      return new Promise((resolve, reject) => {
        // Verificar que código de descuento sea referido
        User.exists({ invitationCode: code }).then((data) => {
          if (data.data.exists) {
            // Validar monto de pedido
            if (this.subtotal < 50000) {
              reject(new Error('Este cupón solo puede ser usado en compras mayores a $50.000'));
            } else {
              // Validar primer pedido
              User.me().then((data) => {
                if (data.data.hasOrders) {
                  reject(new Error('No cumples los requisitos para acceder a este descuento.'));
                } else {
                  resolve();
                }
              })
            }
          } else {
            resolve();
          }
        });
      });
    }
  }
};
</script>
