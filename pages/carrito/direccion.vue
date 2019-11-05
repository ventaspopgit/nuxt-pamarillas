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
            
            <h1 class="tit-3">Selecciona forma de pago</h1>
            
            <div class="form">
              
              <ul class="pagos row justify-content-between">
                <li v-for="(pm, index) in enabledPaymentMethods" :key="index" class="col-4">
                  <label>
                    <input v-model="paymentMethodId" :value="parseInt(pm.id)" type="radio" name="paymentMethod">
                    <span>{{ pm.displayName }}</span>
                  </label>
                </li>
              </ul>
              
              <div v-if="enabledPaymentMethods.length === 0">
                <h2 class="tit-4">El monto mínimo para realizar compras es de {{ $price(minimumAmount) }}.</h2>
                
                <router-link :to="'/'" class="btn btn_1 outline" style="margin-top:2em">Seguir comprando</router-link>
              </div>
              
              <div v-if="paymentMethodId == 20">
                <h2 class="tit-6">Mis tarjetas</h2>
                
                <div class="row">
                  <div class="col-md-6">
                    <label>
                      Tarjeta para pago
                      <select v-model="payUTarjeta.tokenId">
                        <option v-for="(card, index) in payUTarjeta.cards" :key="index" :value="card.token">{{ card.paymentMethod }} {{ card.maskedNumber }}</option>
                        <option :value="null">Nueva tarjeta</option>
                      </select>
                    </label>
                  </div>
                  <div v-if="payUTarjeta.tokenId" class="col-md">
                    <label>
                      CVV *
                      <the-mask v-model="payUTarjeta.securityCode" mask="####" :masked="false" type="text" placeholder="000" required maxlength="4" />
                    </label>
                  </div>
                  <div v-if="payUTarjeta.tokenId" class="col-md">
                    <label>
                      # de cuotas
                      <select v-model="payUTarjeta.installments" required>
                        <option v-for="i in 12" :key="i" :value="i">{{ i }}</option>
                      </select>
                    </label>
                  </div>
                </div>

                <template v-if="!payUTarjeta.tokenId">
                  <h2 class="tit-6">Nueva tarjeta de crédito</h2>
  
                  <div class="row">
                    <div class="col-md">
                      <label>
                        Tipo de tarjeta *
                        <select v-model="payUTarjeta.type" required>
                          <option :value="null">Seleccione</option>
                          <option v-for="(type, index) in payUTarjeta.types" :key="index" :value="type.id">{{ type.name }}</option>
                        </select>
                      </label>
                    </div>
                    <div class="col-md">
                      <label>
                        Número de la tarjeta *
                        <the-mask v-model="payUTarjeta.number" mask="#### #### #### ####" :masked="false" type="text" placeholder="0000 0000 0000 0000" required />
                      </label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md">
                      <label>
                        Nombre en la tarjeta *
                        <input v-model="payUTarjeta.name" type="text" placeholder="Andrés Felipe Fernandez" required>
                      </label>
                    </div>
                    <div class="col">
                      <label>
                        Fecha de vencimiento *
                        <div class="row">
                          <div class="col-6">
                            <select v-model="payUTarjeta.expiration.month">
                              <option v-for="i in 12" :key="i" :value="i">{{ i }}</option>
                            </select>
                          </div>
                          <div class="col-6">
                            <select v-model="payUTarjeta.expiration.year">
                              <option v-for="i in payUTarjeta.years" :key="i" :value="i">{{ i }}</option>
                            </select>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md">
                      <label>
                        CVV *
                        <the-mask v-model="payUTarjeta.securityCode" mask="####" :masked="false" type="text" placeholder="000" required maxlength="4" />
                      </label>
                    </div>
                    <div class="col-md">
                      <label>
                        # de cuotas
                        <select v-model="payUTarjeta.installments" required>
                          <option v-for="i in 12" :key="i" :value="i">{{ i }}</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md">
                      <label>
                        Tipo de documento *
                        <select v-model="payUTarjeta.dniType" required>
                          <option :value="null">Seleccione</option>
                          <option v-for="(type, index) in payUTarjeta.dniTypes" :key="index" :value="type.id">{{ type.name }}</option>
                        </select>
                      </label>
                    </div>
                    <div class="col-md">
                      <label>
                        Número de documento *
                        <input v-model="payUTarjeta.doc" type="text" required>
                      </label>
                    </div>
                  </div>                  
                  <div class="buttons help">
                    <button v-if="!payUTarjeta.saving" type="submit" class="btn btn_1" @click="saveNewCard = true">Guardar dirección</button>
                    <button v-if="payUTarjeta.saving" type="button" class="btn btn_1">Espera por favor...</button>
                    <p>Puedes guardar una tarjeta nueva o continuar sin guardar y sólo usarla una vez.</p>
                  </div>
                </template>
              </div>
  
              <div v-if="paymentMethodId == 31">
                <h2 class="tit-6">PayU Codensa</h2>
                
                <div class="row">
                  <div class="col-md">
                    <label>
                      Tipo de tarjeta *
                      <select v-model="payUTarjeta.type" required>
                        <option :value="null">Seleccione</option>
                        <option value="CODENSA">Codensa</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Número de la tarjeta *
                      <the-mask v-model="payUTarjeta.number" mask="#### #### #### ####" :masked="false" type="text" placeholder="0000 0000 0000 0000" required />
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Nombre en la tarjeta *
                      <input v-model="payUTarjeta.name" type="text" placeholder="Andrés Felipe Fernandez" required>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Fecha de vencimiento *
                      <div class="row">
                        <div class="col-6">
                          <select v-model="payUTarjeta.expiration.month">
                            <option v-for="i in 12" :key="i" :value="i">{{ i }}</option>
                          </select>
                        </div>
                        <div class="col-6">
                          <select v-model="payUTarjeta.expiration.year">
                            <option v-for="i in payUTarjeta.years" :key="i" :value="i">{{ i }}</option>
                          </select>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      CVV *
                      <the-mask v-model="payUTarjeta.securityCode" mask="####" :masked="false" type="text" placeholder="000" required maxlength="4" />
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      # de cuotas
                      <select v-model="payUTarjeta.installments" required>
                        <option v-for="i in 12" :key="i" :value="i">{{ i }}</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Tipo de documento *
                      <select v-model="payUTarjeta.dniType" required>
                        <option :value="null">Seleccione</option>
                        <option v-for="(type, index) in payUTarjeta.dniTypes" :key="index" :value="type.id">{{ type.name }}</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Número de documento *
                      <input v-model="payUTarjeta.doc" type="text" required>
                    </label>
                  </div>
                </div>
              </div>
              
              <div v-if="paymentMethodId == 19">
                <h2 class="tit-6">PayU PSE</h2>
                
                <div class="row">
                  <div class="col-md">
                    <label>
                      Banco *
                      <select v-model="payUPSE.bank" required>
                        <option :value="null">Seleccione</option>
                        <option v-for="(type, index) in payUPSE.banks" :key="index" :value="type.id">{{ type.name }}</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Tipo de persona *
                      <select v-model="payUPSE.personType" required>
                        <option :value="null">Seleccione</option>
                        <option v-for="(type, index) in payUPSE.personTypes" :key="index" :value="type.id">{{ type.name }}</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Tipo de documento *
                      <select v-model="payUPSE.docType" required>
                        <option :value="null">Seleccione</option>
                        <option v-for="(type, index) in payUPSE.docTypes" :key="index" :value="type.id">{{ type.name }}</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Número de documento *
                      <input v-model="payUPSE.doc" type="text" required>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Nombre y apellidos *
                      <input v-model="payUPSE.name" type="text" required>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Teléfono *
                      <input v-model="payUPSE.tel" type="text" required>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      E-mail *
                      <input v-model="payUPSE.email" type="email" required>
                    </label>
                  </div>
                </div>
              </div>
              
              <div v-if="paymentMethodId == 90">
                <h2 class="tit-6">MercadoPago Tarjeta de Crédito</h2>
                
                <div class="row">
                  <div class="col-md">
                    <label>
                      Tipo de tarjeta *
                      <select v-model="mercadoPago.paymentMethodId" required data-checkout="paymentMethodId" @change="loadMercadoPagoIssuers()">
                        <option :value="null">Seleccione</option>
                        <option v-for="pm in mercadoPago.paymentMethods" :key="pm.id" :value="pm.id">{{ pm.name }}</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Banco *
                      <select v-model="mercadoPago.issuer" required data-checkout="installments" @change="loadMercadoPagoInstallments()">
                        <option :value="null">Seleccione</option>
                        <option v-for="issuer in mercadoPago.issuers" :key="issuer.id" :value="issuer.id">{{ issuer.name }}</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Número de tarjeta *
                      <the-mask v-model="mercadoPago.cardNumber" mask="#### #### #### ####" :masked="false" type="text" placeholder="0000 0000 0000 0000" required data-checkout="cardNumber" @change="loadMercadoPagoInstallments()" />
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      CVV *
                      <the-mask v-model="mercadoPago.securityCode" mask="####" :masked="false" type="text" placeholder="000" required maxlength="4" data-checkout="securityCode" />
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      # de cuotas
                      <select v-model="mercadoPago.installments" required data-checkout="installments">
                        <option v-for="inst in mercadoPago.availInstallments" :key="inst.id" :value="inst.value">{{ inst.name }}</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Nombre en la tarjeta *
                      <input v-model="mercadoPago.cardholderName" type="text" placeholder="Andrés Felipe Fernandez" required data-checkout="cardholderName">
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Fecha de vencimiento *
                      <div class="row">
                        <div class="col-6">
                          <select v-model="mercadoPago.expiration.month" data-checkout="cardExpirationMonth">
                            <option v-for="i in 12" :key="i" :value="i">{{ i }}</option>
                          </select>
                        </div>
                        <div class="col-6">
                          <select v-model="mercadoPago.expiration.year" data-checkout="cardExpirationYear">
                            <option v-for="i in mercadoPago.years" :key="i" :value="i">{{ i }}</option>
                          </select>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md">
                    <label>
                      Tipo de documento *
                      <select v-model="mercadoPago.docType" required data-checkout="docType">
                        <option :value="null">Seleccione</option>
                        <option v-for="(type, index) in mercadoPago.docTypes" :key="index" :value="type.id">{{ type.name }}</option>
                      </select>
                    </label>
                  </div>
                  <div class="col-md">
                    <label>
                      Número de documento *
                      <input v-model="mercadoPago.docNumber" type="text" required data-checkout="docNumber">
                    </label>
                  </div>
                </div>
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
              <button v-if="!creating" type="submit" class="btn btn_1" @click="saveNewCard = false">Pagar {{ $price(total) }}</button>
              <button v-if="creating" type="button" class="btn btn_1">Espera por favor...</button>
            </div>
            <router-link :to="'/'" class="btn btn_1 outline">Seguir comprando</router-link>
          </aside>
          
        </form>
      </client-only>
    </div>      
  </div>
</template>

<script>
/* global Mercadopago */

import { TheMask } from 'vue-the-mask'  
import Cart from '~/components/Cart';
import User from '~/components/gigantier/User';
import Country from '~/components/gigantier/Country';
import State from '~/components/gigantier/State';
import City from '~/components/gigantier/City';
import Carrier from '~/components/gigantier/Carrier';
import Order from '~/components/gigantier/Order';

import PaymentMethod from '~/components/gigantier/PaymentMethod';
import PayUBaloto from '~/components/gigantier/PayUBaloto';
import PayUEfecty from '~/components/gigantier/PayUEfecty';
import PayUTarjeta from '~/components/gigantier/PayUTarjeta';
import PayUPSE from '~/components/gigantier/PayUPSE';
import PuntoRed from '~/components/gigantier/PuntoRed';
import MercadoPagoCreditCard from '~/components/gigantier/MercadoPagoCreditCard';
  
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
    user: User,
    paymentMethodId: null,
    paymentMethods: [],
    creating: false,
    saveNewCard: false,
    payUTarjeta: {
      inited: false,
      type: null,
      types: [],
      number: null,
      name: Cart.state.name,
      expiration: {
        month: null,
        year: null
      },
      securityCode: null,
      installments: 1,
      dniType: null,
      tokenId: null,
      dniTypes: [],
      doc: Cart.state.doc,
      years: [],
      cards: [],
      saving: false
    },
    payUPSE: {
      inited: false,
      banks: [],
      personTypes: [],
      docTypes: [],
      bank: null,
      personType: null,
      docType: null,
      doc: Cart.state.doc,
      name: Cart.state.name,
      tel: Cart.state.tel,
      email: Cart.state.email
    },
    mercadoPago: {
      inited: false,
      paymentMethodId: null,
      issuer: null,
      cardNumber: null,
      installments: 1,
      securityCode: null,
      cardholderName: Cart.state.name,
      expiration: {
        month: null,
        year: null
      },
      docType: null,
      docNumber: Cart.state.doc,
      token: null,
      paymentMethods: [],
      issuers: [],
      availInstallments: [],
      docTypes: [],
      years: []
    }    
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
    },
    enabledPaymentMethods() {
      return this.paymentMethods.filter((pm) => {
        return (pm.minimumAmount === null || pm.minimumAmount <= this.total) && (pm.maximumAmount === null || pm.maximumAmount >= this.total);
      });
    },
    minimumAmount() {
      return Math.min(...this.paymentMethods.filter((pm) => { return pm.minimumAmount; }).map((pm) => { return pm.minimumAmount; }));
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
    },
    paymentMethodId() {
      if ((this.paymentMethodId === 20 || this.paymentMethodId === 31) && !this.payUTarjeta.inited) {
        this.loadPayUTarjeta();
      } else if (this.paymentMethodId === 19 && !this.payUPSE.inited) {
        this.loadPSETarjeta();
      } else if (this.paymentMethodId === 90 && !this.mercadoPago.inited) {
        this.loadMercadoPago();
      }
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
    
    const pm = await PaymentMethod.get();
    this.paymentMethods = pm.data.paymentMethods;
    
    this.payUTarjeta.years = [];
    const now = new Date().getFullYear();
    for (let i = now; i <= now + 10; i++) {
      this.payUTarjeta.years.push(i);
    }    
    
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
        
        this.newOrder();
      }
    },
    goTo(path) {
      this.$router.push(path);
    },
    loadPayUTarjeta() {
      this.payUTarjeta.inited = true;
      
      PayUTarjeta.getTypes().then((types) => {
        this.payUTarjeta.types = types.data.types;
      });

      PayUTarjeta.getDniTypes().then((types) => {
        this.payUTarjeta.dniTypes = types.data.types;
      });
      
      PayUTarjeta.getCards().then((cards) => {
        this.payUTarjeta.cards = cards.data.cards;
        if (this.payUTarjeta.cards.length) {
          this.payUTarjeta.tokenId = this.payUTarjeta.cards[0].token;
        }
      });
    },
    loadPSETarjeta() {
      this.payUPSE.inited = true;
      
      PayUPSE.getBanks().then((banks) => {
        this.payUPSE.banks = banks.data.banks;
      });

      PayUPSE.getPersonTypes().then((types) => {
        this.payUPSE.personTypes = types.data.types;
      });

      PayUPSE.getDniTypes().then((types) => {
        this.payUPSE.docTypes = types.data.types;
      });
    },
    loadMercadoPago() {
      this.mercadoPago.inited = true;
      
      MercadoPagoCreditCard.getPaymentMethods().then((pms) => {
        this.mercadoPago.paymentMethods = pms.data.paymentMethods;
      });

      this.mercadoPago.years = [];
      const now = new Date().getFullYear();
      for (let i = now; i <= now + 10; i++) {
        this.mercadoPago.years.push(i);
      }
      
      const script = document.createElement('script');
      script.src = 'https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js';
      document.body.appendChild(script);

      script.addEventListener('load', () => {
        Mercadopago.setPublishableKey(this.$store.state.shop.MERCADOPAGO_CC_PUBLIC_KEY);
        
        Mercadopago.getIdentificationTypes((status, obj) => {
          this.mercadoPago.docTypes = obj;
        });        
      });
    },
    loadMercadoPagoIssuers() {
      Mercadopago.getIssuers(this.mercadoPago.paymentMethodId, (status, issuers) => {
        this.mercadoPago.issuers = issuers;
      });
    },
    loadMercadoPagoInstallments() {
      if (!this.mercadoPago.issuer || !this.mercadoPago.cardNumber) {
        return false;
      }
      
      const params = {
        amount: this.total,
        issuer_id: this.mercadoPago.issuer,
        bin: this.mercadoPago.cardNumber.replace(/[ .-]/g, '').slice(0, 6)
      };
      
      Mercadopago.getInstallments(params, (status, response) => {
        const inst = [];
          
        if (response.length) {
          response[0].payer_costs.forEach((pc) => {
            inst.push({
              value: pc.installments,
              total: pc.total_amount,
              name: (pc.recommended_message || pc.installments)
            });
          });
        } else {
          inst.push({
            value: 1,
            total: this.total,
            name: '1 cuota'
          });
        }
        
        this.mercadoPago.availInstallments = inst;        
      });
    },
    setMercadoPagoToken() {
      return new Promise((resolve, reject) => {
        if (this.paymentMethodId === 90) {
          Mercadopago.createToken(document.getElementById('pay'), (status, response) => {
            if (status !== 200 && status !== 201) {
              let error = 'Los datos de su tarjeta de crédito son incorrectos';
              
              if (response.cause.length) {
                const errores = {
                  205: 'parameter cardExpirationMonth can not be null/empty',
                  208: 'Elige un mes.',
                  209: 'Elige un año.',
                  212: 'Ingresa tu documento.',
                  213: 'Ingresa tu documento.',
                  214: 'Ingresa tu documento.',
                  220: 'Ingresa tu banco emisor.',
                  221: 'Ingresa el nombre y apellido.',
                  224: 'Ingresa el código de seguridad.',
                  E301: 'Hay algo mal en ese número. Vuelve a ingresarlo.',
                  E302: 'Revisa el código de seguridad.',
                  316: 'Ingresa un nombre válido.',
                  322: 'Revisa tu documento.',
                  323: 'Revisa tu documento.',
                  324: 'Revisa tu documento.',
                  325: 'Revisa la fecha.',
                  326: 'Revisa la fecha.'
                };
                
                if (typeof errores[response.cause[0].code] !== 'undefined') {
                  error += ': ' + errores[response.cause[0].code];
                }
              }
              
              reject(error);
            } else {
              this.mercadoPago.token = response.id;
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    },
    pay(order) {
      order = order.data;
      if (this.paymentMethodId === 19) {
        return this.payPayUPSE(order);
      } else if (this.paymentMethodId === 20) {
        return this.payPayUTarjeta(order);
      } else if (this.paymentMethodId === 17) {
        return this.payPayUEfecty(order);
      } else if (this.paymentMethodId === 18) {
        return this.payPayUBaloto(order);
      } else if (this.paymentMethodId === 30) {
        return this.payPuntoRed(order);
      } else if (this.paymentMethodId === 90) {
        return this.payMercadoPagoCreditCard(order);
      } else {
        return new Promise((resolve, reject) => {
          order.url = `pedidos/${order.id}`;
          resolve(order);
        });
      }
    },
    orderURL(id) {
      return location.pathname.replace('/carrito/direccion', '/pedidos/' + id);
    },
    payPayUPSE(order) {
      const data = this.payUPSE;
      data.orderId = order.id;
      data.returnURL = location.protocol + '//' + location.host + this.orderURL(order.id);
      
      const fallback = {
        url: data.returnURL
      };

      return new Promise(function (resolve, reject) {
        PayUPSE.pay(data).then((res) => {
          if (res.data.ok) {
            location.href = res.data.url;
          } else {
            resolve(fallback);
          }
        }).catch(() => {
          resolve(fallback);
        });
      });
    },
    payPayUTarjeta(order) {
      const data = this.payUTarjeta;
      data.orderId = order.id;
      data.expiration = data.expiration.year + '/' + (data.expiration.month >= 10 ? data.expiration.month : '0' + data.expiration.month);
      
      if (!data.tokenId) {
        delete data.tokenId;
        data.saveCard = 1;
      }
      
      const ret = {
        url: this.orderURL(order.id)
      };
      
      return new Promise(function (resolve, reject) {
        PayUTarjeta.pay(data).then((res) => {
          resolve(ret);
        }).catch(() => {
          resolve(ret);
        });
      });
    },
    payPayUBaloto(order) {
      const data = {
        orderId: order.id
      };
      
      const ret = {
        url: this.orderURL(order.id)
      };
      
      return new Promise(function (resolve, reject) {
        PayUBaloto.pay(data).then((res) => {
          resolve(ret);
        }).catch(() => {
          resolve(ret);
        });
      });
    },
    payPayUEfecty(order) {
      const data = {
        orderId: order.id
      };
      
      const ret = {
        url: this.orderURL(order.id)
      };
      
      return new Promise(function (resolve, reject) {
        PayUEfecty.pay(data).then((res) => {
          resolve(ret);
        }).catch(() => {
          resolve(ret);
        });
      });
    },
    payPuntoRed(order) {
      const data = {
        orderId: order.id
      };
      
      const ret = {
        url: this.orderURL(order.id)
      };
      
      return new Promise(function (resolve, reject) {
        PuntoRed.pay(data).then((res) => {
          resolve(ret);
        }).catch(() => {
          resolve(ret);
        });
      });
    },
    payMercadoPagoCreditCard(order) {
      const data = {
        orderId: order.id,
        paymentMethodId: this.mercadoPago.paymentMethodId,
        token: this.mercadoPago.token,
        installments: this.mercadoPago.installments
      }
      const ret = {
        url: this.orderURL(order.id)
      };
      
      return new Promise(function (resolve, reject) {
        MercadoPagoCreditCard.pay(data).then((res) => {
          resolve(ret);
        }).catch(() => {
          resolve(ret);
        });
      });
    },
    saveCard() {
      this.payUTarjeta.saving = true;
      const data = {
        expiration: this.payUTarjeta.expiration.year + '/' + (this.payUTarjeta.expiration.month >= 10 ? this.payUTarjeta.expiration.month : '0' + this.payUTarjeta.expiration.month),
        name: this.payUTarjeta.name,
        number: this.payUTarjeta.number,
        type: this.payUTarjeta.type,
        doc: this.payUTarjeta.doc
      };
      
      PayUTarjeta.createCard(data).then((res) => {
        if (res.data && res.data.ok) {          
          this.payUTarjeta.tokenId = res.data.token;

          PayUTarjeta.getCards().then((cards) => {
            this.payUTarjeta.cards = cards.data.cards;
          });
        } else {
          this.$nuxt.$emit('error', (res.data ? res.data.error : res.response.data.error));            
        }
      }).catch((error) => {
        this.$nuxt.$emit('error', error.response.data.error);
      }).then(() => {
        this.payUTarjeta.saving = false;
      });
    },    
    newOrder() {
      if (this.saveNewCard) {
        this.saveCard();
      } else {
        if (!this.paymentMethodId) {
          return this.$nuxt.$emit('error', 'Debes seleccionar una forma de pago.');
        }
        
        this.setMercadoPagoToken().then(() => {
          this.$nuxt.$loading.start();      
          this.creating = true;
    
          Order.create({
            name: Cart.state.name,
            surname: Cart.state.surname,
            email: Cart.state.email,
            doc: Cart.state.doc,
            tel: Cart.state.tel,
            address: Cart.state.address,
            address2: Cart.state.address2,
            address3: Cart.state.address3,
            address4: Cart.state.address4,
            address5: Cart.state.address5,
            countryId: Cart.state.countryId,
            stateId: Cart.state.stateId,
            cityId: Cart.state.cityId,
            carrierId: Cart.state.carrierId,
            paymentMethodId: this.paymentMethodId,
            products: this.products.map(product => ({ id: product.productId, versionId: product.versionId, quantity: product.quantity })),
            discounts: this.discounts,
            credits: this.credits,
            invitationCode: Cart.state.invitationCode,
            referer: Cart.state.referer,
            sourceId: this.sourceId()
          }).then(this.pay).then((res) => {        
            this.$router.push(res.url);
            Cart.commit('reset');
          }).catch((error) => {
            this.$nuxt.$emit('error', error.response.data.error);
          }).then(() => {
            this.creating = false;
            this.$nuxt.$loading.finish();
          });
        }, (error) => {
          this.$nuxt.$emit('error', error);
        });
      }
    },
    sourceId() {
      if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
        return 6;
      } else {
        return 1;
      }
    }    
  }
};
</script>
