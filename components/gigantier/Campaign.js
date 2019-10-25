import Repository from './Repository';
const querystring = require('querystring');
const moment = require('moment');
moment.locale('es');

const resource = '/Campaign';

export default {
  async get(params) {
    const getParams = querystring.stringify(params);
    const campaigns = await Repository.get(`${resource}?${getParams}`);
    campaigns.data.campaigns = campaigns.data.campaigns.map((cat) => {
      return this.processCampaign(cat);
    });
    return campaigns;
  },
  async getCampaign(id) {
    const campaign = await Repository.get(`${resource}/${id}`);
    campaign.data = this.processCampaign(campaign.data);
    return campaign;
  },
  async getCampaignCategories(id) {
    const categories = await Repository.get(`${resource}/${id}/categories`);
    return categories;
  },
  processCampaign(campaign) {
    campaign.url = this.url(campaign);
    campaign.upcoming = parseInt(campaign.upcoming);
    return campaign;
  },
  url(category) {
    /* const path = category.name.toLowerCase().trim().replace(/[ //]/g, '-');
    return encodeURI(`/campanias/${category.id}-${path}`); */
    const url = category.url.split('/');
    // Remove domain and protocol
    url.splice(0, 3);    
    return '/' + url.join('/');
  },
  startsToday(campaign) {
    return moment(campaign.start).isSame(new Date(), 'day');
  },
  finishesToday(campaign) {
    return moment(campaign.end).diff(new Date(), 'days') <= 1;
  }
};
