import Repository from './Repository';

const resource = '/Product';

export default {
  async get(params) {
    params.simple = 1;
    params.versions = 1;
    
    const paramsQuery = this.buildQuery(params);
    const products = await Repository.get(`${resource}?${paramsQuery}`);

    products.data.products = products.data.products.map((product) => {
      product.url = this.url(product);
      product.selectedAttributes = { 1: null, 2: null };

      product.attributes = product.attributes.map((a, i) => {
        a.values = this.sortAttributes(a.values);
        if (a.values.length === 1) {
          product.selectedAttributes[a.id] = a.values[0];
        }
        return a;
      });

      return product;
    });

    products.data.attributes = this.filterAttributes(products.data.attributes);

    return products;
  },
  async getProduct(id) {
    const prod = await Repository.get(`${resource}/${id}`);
    if (prod.data && prod.data.ok) {
      prod.data.selectedAttributes = { 1: null, 2: null };
      prod.data.attributes = prod.data.attributes.map((a, i) => {
        a.values = this.sortAttributes(a.values);
        if (a.values.length === 1) {
          prod.data.selectedAttributes[a.id] = a.values[0];
        }
        return a;
      });
      prod.data.campaigns = prod.data.campaigns.map((a) => {
        a.url = a.campaignId + '-' + a.name.toLowerCase().trim().replace(/[ //]/g, '-');
        return a;
      });
      prod.data.url = this.url(prod.data);
      return prod;
    } else {
      return false;
    }
  },
  async getKit(product) {
    let versionId = null;
    if (product.versions) {
      for (let i = 0; i < product.versions.length; i++) {
        if (product.versions[i].stock) {
          versionId = product.versions[i].id;
          break;
        }
      }
    }
    
    const data = {
      position: 'Kit',
      products: [{
        id: product.id,
        quantity: 1,
        versionId: versionId
      }]
    };
    
    const products = await Repository.post(`Recommendation`, data);

    products.data.products = products.data.products.map((product) => {
      product.url = this.url(product);
      product.selectedAttributes = { 1: null, 2: null };
      return product;
    });
    
    return products;
  },
  async getRelated(id) {
    const products = await Repository.get(`${resource}/${id}/related`);
    products.data.products = products.data.products.map((product) => {
      product.url = this.url(product);
      product.selectedAttributes = { 1: null, 2: null };
      return product;
    });
    return products;
  },
  buildQuery(params) {
    let atts = {};
    let mans = [];
    let cats = [];
    
    if (params.attributes) {
      atts = params.attributes;
      delete params.attributes;
    }
    
    if (params.manufacturers) {
      mans = params.manufacturers;
      delete params.manufacturers;
    }

    if (params.categoryId) {
      cats = params.categoryId;
      delete params.categoryId;
    }

    let paramsQuery = Object.keys(params).map(value => `${value}=${encodeURIComponent(params[value])}`).join('&');
    
    if (atts) {
      paramsQuery += `&attributes=${JSON.stringify(atts)}`;
    }
    
    if (mans) {
      paramsQuery += `&manufacturers=${JSON.stringify(mans)}`;
    }
    
    if (cats) {
      paramsQuery += `&categoryId=${JSON.stringify(cats)}`;
    }
    
    return paramsQuery;
  },
  url(product) {
    /* const path = product.name.toLowerCase().trim().replace(/[ //]/g, '-');
    return encodeURI(`/${product.id}-${path}`); */
    const url = product.url.split('/');
    // Remove domain and protocol
    url.splice(0, 3);
    return '/' + url.join('/');
  },
  sortAttributes(values) {
    return values.sort((a, b) => {
      const numbera = parseInt(a.replace(/[^0-9]/g, ''));
      const numberb = parseInt(b.replace(/[^0-9]/g, ''));
      const sizes = ['U', 'UNICA', 'XXXS', 'XXS', 'XS', 'S', 'S/M', 'M', 'M/L', 'L', 'L/XL', 'XL', 'XXL', 'XXXL'];
      
      if (!isNaN(numbera) && !isNaN(numberb)) {
        // SORT NUMBERS
        if (numbera > numberb) {
          return 1;
        } else if (numbera < numberb) {
          return -1;
        } else {
          return 0;
        }
      } else if (isNaN(numbera) && isNaN(numberb)) {
        // SORT LETTERS
        const indexa = sizes.indexOf(a);
        const indexb = sizes.indexOf(b);
        if (indexa > indexb) {
          return 1;
        } else if (indexa === indexb) {
          return 0;
        } else {
          return -1;
        }
      } else if (isNaN(numbera) && !isNaN(numberb)) {
        return -1;
      } else {
        return 1;
      }
    });
  },
  filterAttributes(attributes) {
    // Filter values
    for (const i in attributes) {
      attributes[i].values = attributes[i].values.filter((v) => { return v !== 'S-A' && v !== 'S--A'; });
      
      if (!attributes[i].values.length) {
        attributes.splice(i, 1);
      }
    }

    return attributes;
  }
};
