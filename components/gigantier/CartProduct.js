import Repository from './Repository';

const resource = '/CartProduct';

export default {
  create(data) {
    return Repository.post(`${resource}`, data);
  },
  delete(id) {
    return Repository.delete(`${resource}/${id}`);
  }
};
