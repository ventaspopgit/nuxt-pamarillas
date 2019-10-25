import Repository from './Repository';
const querystring = require('querystring');

const resource = '/Category';

export default {
  async get(params) {
    const getParams = querystring.stringify(params);
    const categories = await Repository.get(`${resource}?${getParams}`);
    categories.data = categories.data.filter((c) => {
      return (parseInt(c.id) !== 12840 && c.name !== '');
    })
    categories.data = this.processCategories(categories.data);
    return categories;
  },
  processCategories(categories) {
    for (let i = 0; i < categories.length; i++) {
      categories[i].url = this.url(categories[i]);
      categories[i].children = this.processCategories(categories[i].children);
    }
    return categories;
  },
  async getCategory(id) {
    const category = await Repository.get(`${resource}/${id}`);
    category.data.url = this.url(category.data);
    return category;
  },
  url(category) {
    const path = (category.metaURL ? category.metaURL : category.name.toLowerCase().trim().replace(/[ //]/g, '-'));
    return encodeURI(`/categorias/${category.id}-${path}`);
  }
};
