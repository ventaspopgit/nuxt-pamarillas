import Repository from './Repository';
const querystring = require('querystring');

const resource = '/Manufacturer';

export default {
  async get(params) {
    const getParams = querystring.stringify(params);
    const mans = await Repository.get(`${resource}?${getParams}`);
    mans.data = this.processManufacturers(mans.data);
    return mans;
  },
  processManufacturers(mans) {
    for (let i = 0; i < mans.length; i++) {
      mans[i].url = this.url(mans[i]);
    }
    return mans;
  },
  async getManufacturer(id) {
    const man = await Repository.get(`${resource}/${id}`);
    man.data.url = this.url(man.data);
    return man;
  },
  url(man) {
    const path = man.name.toLowerCase().trim().replace(/[ //]/g, '-');
    return encodeURI(`/marcas/${man.id}-${path}`);
  }
};
