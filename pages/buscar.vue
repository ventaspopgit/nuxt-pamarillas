<template>
  <div>
    <div class="filters_listing version_2  sticky_horizontal">
      <div class="container">
        <ul class="clearfix">
          <li>
            <div class="switch-field" />
          </li>
          <li>
            <div class="layout_view">
              <a href="#" :class="{ active: (type === 0) }" @click.prevent="type = 0"><i class="icon-th" /></a>
              <a href="#" :class="{ active: (type === 1) }" @click.prevent="type = 1"><i class="icon-th-list" /></a>
            </div>
          </li>
          <li />
        </ul>
      </div>
      <!-- /container -->
    </div>
    <!-- /filters -->
    
    <div id="collapseMap" class="collapse">
      <div id="map" class="map" />
    </div>
    <!-- /Map -->
    
    <div class="container margin_60_35">
      <div class="row">
        <aside id="sidebar" class="col-lg-3">
          <form id="buscar" action="" method="get">
            <div id="filters_col">
              <a id="filters_col_bt" data-toggle="collapse" href="#collapseFilters" aria-expanded="false" aria-controls="collapseFilters">Filtros </a>
              <div id="collapseFilters" class="collapse show">
                <div class="filter_type">
                  
                  <div class="filtros">
                    <template v-for="(values, index) in attributesFilters">
                      <span v-for="(value, i2) in attributesFilters[index]" :key="index+'-'+i2" class="label" @click="deselectAttribute(index, i2)">{{ value }}</span>
                    </template>
                  </div>
                  
                  <div v-for="(att, index) in attributes" :key="index">
                    <h6><strong>{{ att.name }}</strong></h6>
                    <ul>
                      <li v-for="(value, i) in att.values" v-if="!attributeSelected(attributes[index].id, value)" :key="i" style="cursor:pointer" @click="selectAttribute(index, value)">
                        {{ value }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!--/collapse -->
            </div>
            <!--/filters col-->
          </form>
        </aside>
        <!-- /aside -->

        <div class="col-lg-9">
          <p v-if="products.length === 0">No se encontraron resultados.</p>
          
          <ProductList :products="products" :type="type" :list-name="'Buscar ' + query" size="small" />
          <Pagination :page="page" :total="total" :rpp="rpp" :url="'/buscar?query=' + query" />
          <!-- /row -->
        </div>
        <!-- /col -->
      </div>    
    </div>
    <!-- /container -->
  </div>
</template>

<script>
import Product from '~/components/gigantier/Product';
import ProductList from '~/components/ProductList.vue';
import Pagination from '~/components/Pagination.vue';

const rpp = 12;

export default {
  name: 'Search',
  middleware: 'param-slug',
  components: {
    ProductList, Pagination
  },
  data: () => ({
    query: null,
    products: [],
    manufacturers: [],
    attributes: [],
    minPrice: 0,
    maxPrice: 0,
    minPriceSelected: null,
    maxPriceSelected: null,
    total: 0,
    page: 1,
    rpp: rpp,
    type: 0,

    sort: 'created',
    attributesFilters: {},
    categoriesFilters: [],
    manufacturersFilters: []
  }),
  watch: {
    sort() {
      this.loadProducts();
    },
    attributesFilters() {
      this.loadProducts();
    }
  },
  async asyncData(params) {
    let page = 1;
    
    if (params.query.page) {
      page = parseInt(params.query.page);
    }
    
    const query = params.query.query;
    
    let prods = [];
    let attributes = [];
    let manufacturers = [];
    let total = 0;
    let minPrice = 0;
    let maxPrice = 0;
    
    try {
      prods = await Product.get({ query: query, offset: (page - 1) * rpp, limit: rpp });
      
      attributes = prods.data.attributes;
      manufacturers = prods.data.manufacturers;
      total = prods.data.total;
      minPrice = prods.data.minPrice;
      maxPrice = prods.data.maxPrice;
      prods = prods.data.products;
    } catch (error) {
      console.error(error);
    }
    
    return {
      query: query,
      products: prods,
      attributes: attributes,
      manufacturers: manufacturers,
      total: parseInt(total),
      minPrice: parseInt(minPrice),
      maxPrice: parseInt(maxPrice),
      minPriceSelected: parseInt(minPrice),
      maxPriceSelected: parseInt(maxPrice),
      page: page
    };
  },
  created() {
    this.attributes = this.attributes.map((a) => {
      a.values = Product.sortAttributes(a.values);
      return a;
    });
  },
  mounted() {
    const noUiSlider = require('nouislider');
    const range = document.getElementById('range');
    
    if (range && this.minPrice < this.maxPrice) {
      const slider = noUiSlider.create(document.getElementById('range'), {
        start: [this.minPriceSelected, this.maxPriceSelected],
        connect: true,
        step: 1,
        range: {
          min: this.minPrice,
          max: this.maxPrice
        }
      });
      slider.on('update', (values) => {
        this.minPriceSelected = values[0];
        this.maxPriceSelected = values[1];
      });
      slider.on('end', () => {
        this.loadProducts();
      });
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (to.query.page) {
      this.page = parseInt(to.query.page);
    }

    this.loadProducts();
    next();
  },
  methods: {
    async loadProducts() {
      this.$nuxt.$loading.start();
      
      const params = {
        query: this.query,
        sort: this.sort,
        filters: JSON.stringify(this.categoriesFilters),
        attributes: this.attributesFilters,
        manufacturers: this.manufacturersFilters,
        minPrice: this.minPriceSelected,
        maxPrice: this.maxPriceSelected,
        offset: (this.page - 1) * rpp,
        limit: rpp
      };
      
      const products = await Product.get(params);
      
      this.products = products.data.products;
      this.total = parseInt(products.data.total);

      this.attributesChanged(products.data.attributes);
      
      this.$nuxt.$loading.finish();
      window.scrollTo(0, 0);
    },
    attributesChanged(atts) {
      // Keep selected values
      const keys = Object.keys(this.attributes);

      for (let i = 0; i < keys.length; i += 1) {
        if (this.attributes[keys[i]].selected) {
          atts[keys[i]].selected = this.attributes[keys[i]].selected;
        }
      }
      
      this.attributes = atts.map((a) => {
        a.values = Product.sortAttributes(a.values);
        return a;
      });
    },
    attributeSelected(attId, value) {
      return (this.attributesFilters[attId] && this.attributesFilters[attId].indexOf(value) !== -1);
    },
    selectAttribute(attIndex, value) {
      const attId = this.attributes[attIndex].id;
      let current = this.attributesFilters[attId];

      if (this.attributeSelected(attId, value)) {
        // Remove filter
        const where = current.indexOf(value);
        current.splice(where, 1);  
      } else {
        // Add filter
        if (!current) {
          current = [];
        }
        
        current.push(value);
      }
      
      this.attributesFilters[attId] = current;
      this.attributes[attIndex].selected = current;
      this.loadProducts();
    },
    deselectAttribute(attId, index) {
      const current = this.attributesFilters[attId];
      current.splice(index, 1);
      this.$forceUpdate();
    },
    selectManufacturer(id) {
      const selected = this.manufacturersFilters.indexOf(id);
      if (selected !== -1) {
        // Remove filter
        const where = this.manufacturersFilters.indexOf(id);
        this.manufacturersFilters.splice(where, 1);  
      } else {
        this.manufacturersFilters.push(id);
      }
      this.loadProducts();
    },
    selectCategory(id) {
      const selected = this.categoriesFilters.indexOf(id);
      if (selected !== -1) {
        // Remove filter
        const where = this.categoriesFilters.indexOf(id);
        this.categoriesFilters.splice(where, 1);  
      } else {
        this.categoriesFilters.push(id);
      }
      this.loadProducts();
    }
  }
};

</script>
