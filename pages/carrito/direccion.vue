<template>
  <div id="carrito">
    <div class="container">
      
      <client-only>
        <form class="contenido row justify-content-between" @submit.prevent="saveCartAddress()">
          
          <div class="productos col-md-7">
            <h1 class="tit-3">Selecciona tu dirección de envío</h1>
            <h2 class="tit-4">Escoge una de tus direcciones guardadas o crea una nueva.</h2>
            
            <div class="form">
              
              <template v-if="addresses.length">
                <h3 class="tit-6">Mis direcciones</h3>
              
                <div class="row">
                  <div class="col">
                    <label>
                      Dirección de envío
                      <select v-model="addressIndex" required="required">
                        <option v-for="(address, index) in addresses" :key="index" :value="index">{{ address.label }} - {{ address.address }} {{ address.address2 }} {{ address.address3 }} {{ address.address4 }} {{ address.address5 }}</option>
                        <option :value="null">Nueva dirección</option>
                      </select>
                    </label>
                  </div>
                </div>
              </template>

              <h3 class="tit-6">Dirección seleccionada</h3>

              <div v-if="user.logged" class="row">
                <div class="col">
                  <label>
                    ¿Cómo quieres llamar esta dirección?
                    <input v-model="label" type="text" name="label" :required="saveNewAddress">
                  </label>
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <label>
                    Nombre
                    <input v-model="name" type="text" name="name" required="required">
                  </label>
                </div>
                <div class="col">
                  <label>
                    Apellido
                    <input v-model="surname" type="text" name="surname" required="required">
                  </label>
                </div>
                <div class="col">
                  <label>
                    Cédula
                    <input v-model="doc" type="text" name="doc" required="required">
                  </label>
                </div>
              </div>
              
              <div class="row">
                <div class="col">
                  <label>
                    E-mail
                    <input v-model="email" type="email" name="email" required="required" :readonly="user.logged">
                  </label>
                </div>
                <div class="col">
                  <label>
                    Teléfono
                    <the-mask v-model="tel" mask="##########" :masked="false" type="tel" required />
                  </label>
                </div>
              </div>
              
              <div class="row">                
                <div class="col">
                  <div class="label">
                    Dirección *
                    <div class="row address">
                      <div class="col">
                        <select v-model="address" required="required">
                          <option :value="null">Seleccione</option>
                          <option v-for="(type, index) in addressTypes" :key="index" :value="type">{{ type }}</option>
                        </select>
                      </div>
                      <div class="col single">
                        <input v-model="address2" type="text" name="address2" required="required">
                        #
                      </div>
                      <div class="col single">
                        <input v-model="address3" type="text" name="address3" required="required">
                        -
                      </div>
                      <div class="col single">
                        <input v-model="address4" type="text" name="address4" required="required">
                      </div>
                      <div class="col-md">
                        <input v-model="address5" type="text" name="address5" placeholder="Piso / Oficina / Depto">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col">
                  <label>
                    Departamento
                    <select v-model="stateId" required="required">
                      <option v-for="(state, index) in states" :key="index" :value="state.id">{{ state.name }}</option>
                    </select>
                  </label>
                </div>
                <div class="col">
                  <label>
                    Ciudad
                    <select v-model="cityId" required="required">
                      <option v-for="(city, index) in cities" :key="index" :value="city.id">{{ city.name }}</option>
                    </select>
                  </label>
                </div>
              </div>
              
              <div v-if="user.logged && addressIndex === null" class="buttons help">
                <button v-if="!savingAddress" type="submit" class="btn btn_1" @click="saveNewAddress = true">Guardar dirección</button>
                <button v-if="savingAddress" type="button" class="btn btn_1">Espera por favor...</button>
                <p>Puedes guardar una dirección nueva o continuar sin guardar y sólo usarla una vez.</p>
              </div>
            </div>
          </div>
          
          <aside class="resumen col-md-4">
            <h2 class="tit-6">Tu orden</h2>
  
            <div v-for="(product, index) in products" :key="index" class="producto">
              <div class="imagen">
                <img :src="product.image">
              </div>
              <div class="info">
                <p class="tit-5">{{ product.name }}</p>
                <p class="precio">
                  <span>{{ $price(product.price) }}</span>
                  <s>{{ $price(product.originalPrice) }}</s>
                </p>
              </div>
            </div>
            
            <p>Subtotal<strong>{{ $price(subtotal) }}</strong></p>
            <p v-if="credits > 0">Créditos <strong>{{ $price(-credits) }}</strong></p>
            <p v-for="(disc, index) in remoteDiscounts" :key="'d' + index">
              {{ disc.name }} <strong>{{ $price(-disc.amount) }}</strong>
            </p>
            <p>Envío <strong>{{ $price(shipping) }}</strong></p>
            <!--<a href="" class="ayuda">¿Por qué ese valor?</a>-->
            
            <p class="total">Total <strong>{{ $price(total) }}</strong></p>
                        
            <div v-if="totalsLoaded">
              <button type="submit" class="btn btn_1" @click="saveNewAddress = false">Seguir con el pago</button>
            </div>
            <router-link :to="'/'" class="btn btn_1 outline">Seguir comprando</router-link>
          </aside>
          
        </form>
      </client-only>
    </div>      
  </div>
</template>

<script>
import { TheMask } from 'vue-the-mask'  
import Cart from '~/components/Cart';
import User from '~/components/gigantier/User';
import Country from '~/components/gigantier/Country';
import State from '~/components/gigantier/State';
import City from '~/components/gigantier/City';
import Carrier from '~/components/gigantier/Carrier';
import Order from '~/components/gigantier/Order';
  
export default {
  name: 'Cart',
  components: {
    TheMask
  },
  data: () => ({
    addresses: [],
    addressId: null,
    addressIndex: null,
    label: null,
    name: Cart.state.name,
    surname: Cart.state.surname,
    email: Cart.state.email,
    tel: Cart.state.tel,
    doc: Cart.state.doc,
    address: Cart.state.address,
    address2: Cart.state.address2,
    address3: Cart.state.address3,
    address4: Cart.state.address4,
    address5: Cart.state.address5,
    countryId: Cart.state.countryId,
    stateId: Cart.state.stateId,
    cityId: Cart.state.cityId,
    carrierId: Cart.state.carrierId,
    countries: [],
    states: [],
    cities: [],
    carriers: [],
    remoteDiscounts: [],
    credits: 0,
    shipping: 0,
    discount: 0,
    remoteSubtotal: null,
    remoteCredits: null,
    remoteTotal: null,
    carrierLoading: false,
    totalsLoaded: false,
    addressTypes: [],
    saveNewAddress: false,
    savingAddress: false,
    user: User
  }),
  computed: {
    products() {
      return Cart.state.products;
    },
    discounts() {
      return Cart.state.discounts;
    },
    subtotal() {
      return (this.remoteSubtotal !== null ? this.remoteSubtotal : Cart.getters.total);
    },
    total() {
      return (this.remoteTotal !== null ? this.remoteTotal : Cart.getters.total);
    },
    originalTotal() {
      return Cart.getters.originalTotal;
    }
  },
  watch: {
    addressIndex: function (addressIndex) {
      if (addressIndex !== null) {
        this.addressId = this.addresses[addressIndex].id
        this.label = this.addresses[addressIndex].label;
        this.name = this.addresses[addressIndex].name;
        this.surname = this.addresses[addressIndex].surname;
        this.tel = this.addresses[addressIndex].tel;
        this.address = this.addresses[addressIndex].address;
        this.address2 = this.addresses[addressIndex].address2;
        this.address3 = this.addresses[addressIndex].address3;
        this.address4 = this.addresses[addressIndex].address4;
        this.address5 = this.addresses[addressIndex].address5;
        this.stateId = this.addresses[addressIndex].stateId;
        this.cityId = this.addresses[addressIndex].cityId;
      } else {
        this.addressId = null;
        this.label = null;
        this.name = Cart.state.name;
        this.surname = Cart.state.surname;
        this.tel = null;
        this.address = null;
        this.address2 = null;
        this.address3 = null;
        this.address4 = null;
        this.address5 = null;
        this.stateId = null;
        this.cityId = null;
      }
    },
    countryId: function (countryId) {
      if (countryId) {
        this.loadStates();
      }
    },
    stateId: function (stateId) {
      if (stateId) {
        this.loadCities();
      }
    },
    cityId: function (cityId) {
      if (this.stateId && cityId) {
        this.loadCarriers();
      }
    },
    carrierId: function () {
      this.updateShipping();
    }
  },
  async mounted() {
    if (!Cart.state.products.length) {
      this.$router.push('/');
      return false;
    }

    this.user = User;
    this.user.init();

    this.addressTypes = this.user.addressTypes();

    this.credits = Cart.state.credits;
    
    const ct = await Country.get();
    this.countries = ct.data.countries;
    this.countryId = this.countries[0].id;
  
    this.loadAddresses();
    this.loadStates();
    this.loadCarriers();
    this.loadTotals();
    
    // Facebook event
    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', {
        currency: 'COP',
        value: this.total,
        num_items: this.products.length
      });
    }
    
    // Google event
    this.$gtm.pushEvent({
      event: 'checkout',
      ecommerce: {
        checkout: {
          actionField: { step: 2 },
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
  },
  methods: {
    async loadTotals() {
      if (this.$nuxt.$loading && this.$nuxt.$loading.start) {
        this.$nuxt.$loading.start();
      }
      this.totalsLoaded = false;
      
      const params = {
        products: this.products.map(product => ({ id: product.productId, versionId: product.versionId, quantity: product.quantity })),
        discounts: this.discounts,
        credits: this.credits
      };
  
      if (this.user.logged) {
        params.access_token = this.user.accessToken();
      }
      
      if (this.stateId) {
        params.stateId = this.stateId;
      }
      
      if (this.cityId) {
        params.cityId = this.cityId;
      }
      
      if (this.carrierId) {
        params.carrierId = this.carrierId;
      }

      try {      
        const data = await Order.calculateTotal(params);      

        this.discount = data.data.discount;
        this.shipping = data.data.shipping;
        this.remoteDiscounts = data.data.discounts;
        this.remoteSubtotal = data.data.subtotal;
        this.remoteTotal = data.data.total;
        this.remoteCredits = data.data.credits;

        this.totalsLoaded = true;
      } catch (error) {
        this.$nuxt.$emit('error', error.response.data.error);
      }
      
      if (this.$nuxt.$loading && this.$nuxt.$loading.finish) {
        this.$nuxt.$loading.finish();
      }
    },
    async loadStates() {
      const st = await State.get(this.countryId);
      this.states = st.data.states.map((state) => {
        state.id = parseInt(state.id);
        return state;
      });
      
      if (this.stateId) {
        this.loadCities();
      }
      
      this.updateShipping();
    },
    async loadCities() {
      const st = await City.get(this.stateId);
      this.cities = st.data.cities.map((city) => {
        city.id = parseInt(city.id);
        return city;
      });
      this.updateShipping();
    },
    async loadCarriers() {
      this.carrierLoading = true;
      this.carriers = [];
      
      const st = await Carrier.get(this.stateId, this.cityId);
      this.carriers = st.data.carriers;
      this.carrierLoading = false;

      if (this.carriers.length) {
        this.carrierId = st.data.carriers[0].id;
        this.updateShipping();
      } else {
        alert('No se encontraron envíos disponibles para tu ciudad.');
      }      
    },
    loadAddresses() {
      if (User.logged) {
        this.addresses = [{ id: null, name: 'Cargando...' }];
        
        return new Promise((resolve, reject) => {
          User.getAddresses().then((st) => {
            this.addresses = st.data.addresses;
            
            if (this.addresses.length) {
              this.addressIndex = 0;
            }
            
            resolve(this.addresses);
          });
        });
      }
    },
    updateShipping() {
      if (!this.countryId || !this.stateId || !this.cityId || !this.carrierId) {
        return false;
      }
      
      this.loadTotals();
    },
    saveAddress() {
      this.savingAddress = true;
      
      const data = {
        label: this.label,
        name: this.name,
        surname: this.surname,
        tel: this.tel,
        address: this.address,
        address2: this.address2,
        address3: this.address3,
        address4: this.address4,
        address5: this.address5,
        countryId: this.countryId,
        stateId: this.stateId,
        cityId: this.cityId
      }
      
      this.user.createAddress(data).then((res) => {
        if (res.data.ok) {
          this.loadAddresses().then((addresses) => {
            for (let i = 0; i < addresses.length; i++) {
              if (addresses[i].id === parseInt(res.data.id)) {
                this.addressIndex = i;
                break;
              }
            }
          });
        } else {
          this.$nuxt.$emit('error', res.data.error);            
        }
      }).catch((error) => {
        this.$nuxt.$emit('error', error.response.data.error);
      }).then(() => {
        this.savingAddress = false;
      });
    },
    saveCartAddress() {
      if (this.saveNewAddress) {
        this.saveAddress();
      } else {
        Cart.commit('setCarrier', this.carrierId);
        
        Cart.commit('setAddress', {
          name: this.name,
          surname: this.surname,
          doc: this.doc,
          tel: this.tel,
          email: this.email,
          address: this.address,
          address2: this.address2,
          address3: this.address3,
          address4: this.address4,
          address5: this.address5,
          countryId: this.countryId,
          stateId: this.stateId,
          cityId: this.cityId
        });
  
        Cart.commit('setTotals', {
          remoteTotal: this.remoteTotal,
          remoteSubtotal: this.remoteSubtotal,
          remoteDiscounts: this.remoteDiscounts,
          remoteShipping: this.shipping
        });
        
        this.$router.push('/carrito/pago');
      }
    },
    goTo(path) {
      this.$router.push(path);
    }
  }
};
</script>
