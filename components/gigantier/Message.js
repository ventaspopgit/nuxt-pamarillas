import Repository from './Repository';
const querystring = require('querystring');

const resource = '/Message';

export default {
  get(params) {
    const getParams = querystring.stringify(params);
    return Repository.get(`${resource}?${getParams}`);
  },
  create(data) {
    return Repository.post(`${resource}`, data);
  },
  getMessage(id, params) {
    const getParams = querystring.stringify(params);
    return Repository.get(`${resource}/${id}?${getParams}`);
  },
  getSubjects(id) {
    return Repository.get(`${resource}/subjects`);
  }
};
