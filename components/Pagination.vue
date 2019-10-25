<template>
  <div v-if="totalPages > 1" class="row justify-content-between">
    <div class="col">
      <router-link v-if="page > 1" :to="pageLink((page > 1 ? page - 1 : page))" class="btn_1 rounded">Anterior</router-link>
    </div>
    <div class="col text-right">
      <router-link v-if="page < totalPages" :to="pageLink((page < totalPages ? page + 1 : page))" class="btn_1 rounded">Siguiente</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    page: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    rpp: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  data: () => ({
    totalPages: 0,
    pages: []
  }),
  watch: {
    page() {
      this.generatePages();
    },
    total() {
      this.generatePages();
    }
  },
  mounted() {
    this.generatePages();
  },
  methods: {
    pageLink(page) {
      return this.url + (this.url.indexOf('?') === -1 ? '?' : '&') + 'page=' + page;
    },
    generatePages() {
      this.totalPages = Math.ceil(this.total / this.rpp);
      
      let startAt = this.page - 5;
      let end = this.page + 5;
      
      if (startAt < 1) startAt = 1;
      if (end > this.totalPages) end = this.totalPages;
      
      this.pages = [];
      for (let i = startAt; i <= end; i++) {
        this.pages.push(i);
      }
    }
  }
};
</script>
