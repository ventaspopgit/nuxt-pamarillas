import Repository from './Repository';

const resource = '/Search';

export default {
  query(query) {
    return Repository.get(`${resource}?query=${query}`);
  }
};
