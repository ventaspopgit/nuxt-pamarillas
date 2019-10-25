import Repository from './Repository';

const resource = '/Order';

export default {
  async calculateTotal(data) {
    data.fullDiscounts = 1;
    const res = await Repository.post(`${resource}/calculateTotal`, data);
    
    if (res && res.data && res.data.discounts) {
      res.data.discounts = res.data.discounts.map((discount) => {
        discount.name = discount.code;
        
        if (discount.discountRuleId) {
          const name = discount.description.match(/\((.+)\)/);
          if (name.length === 2) {
            discount.name = 'Regalo de ' + name[1].split(' ')[0];
          }
        }
        return discount;
      })
    }
    
    return res;
  },
  
  create(data) {
    return Repository.post(`${resource}`, data);
  },
  
  async getOrder(data) {
    const order = await Repository.post(`${resource}/${data.id}`, data);
    order.data.statusId = parseInt(order.data.statusId);
    order.data.paymentMethodId = parseInt(order.data.paymentMethodId);
    return order;
  },
  
  async getOrders(data) {
    const orders = await Repository.post(`${resource}/list`, data);
    orders.data.orders = orders.data.orders.map((o) => {
      o.statusId = parseInt(o.statusId);
      return o;
    })
    return orders;
  }  
};
