const express = require('express');
const app = express();

const apicache = require('apicache')
const CACHE_TIME = '1 hour';
const cache = apicache.middleware

const gigantier = require('@gigantier/js-sdk');

const bodyParser = require('body-parser')
app.use(bodyParser.json());

const facebook = require('fb');

const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV == 'development')
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const apiClient = gigantier.client({
  clientId: process.env.PAM_API_CLIENT_ID,
  clientSecret: process.env.PAM_API_CLIENT_SECRET,
  scope: process.env.PAM_API_SCOPE,
  host: process.env.PAM_API_HOST,
  protocol: process.env.PAM_API_PROTOCOL
});

app.get('/', function(req, res) {
  res.send('');
});

app.get('/Configuration', cache(CACHE_TIME), function(req, res) {
  const keys = ['NAME', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'MERCADOPAGO_CC_PUBLIC_KEY', 'MULTIPLE_DISCOUNTS', 'ACTIVATE_PIXEL_PAID', 'PIXEL_PAID', 'ACTIVATE_PIXEL_PENDING', 'PIXEL_PENDING', 'HIGHLIGHT_IDS', 'HIGHLIGHT_TITLE', 'HIGHLIGHT_DESCRIPTION', 'HIGHLIGHT_IMAGE', 'HIGHLIGHT_LINK', 'HIGHLIGHT_IMAGE_TEXT', 'HIGHLIGHT_IMAGE_BUTTON'];
  apiClient.call('/Configuration/value', { body: { key: keys.join(',') } }).then((data) => {
    res.json(data.values);
  }).catch((data) => {
    console.log(data);
    res.status(400).json(data);
  });
});

app.get('/Page', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Page/menu').then((data) => {
    res.json(data.pages);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Page/:id', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Page/list/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Category', cache(CACHE_TIME), function(req, res) {
  req.query.active = 1;
  if(!req.query.levels)
    req.query.levels = 4;

  apiClient.call('/Category/list', { body: req.query }).then((data) => {
    res.json(data.categories);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Category/:id', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Category/list/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/login', function(req, res) {
  apiClient.authenticate(req.body.email, req.body.pwd).then((data) => {
    delete data.clientId;

    apiClient.authenticatedCall('/User/me').then((user) => {
      data = { ...data, ...user };
      
      apiClient.authenticatedCall('/User/credits').then((credits) => {
        data.credits = credits.credits;
        data.creditsAmount = credits.creditsAmount;
        res.json(data);
      });
    });
    
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/recover', function(req, res) {
  apiClient.call('/User/recover', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/resetPassword', function(req, res) {
  apiClient.call('/User/resetPassword', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User', function(req, res) {
  apiClient.call('/User', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/me', function(req, res) {
  apiClient.authenticatedCall('/User/me', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/credits', function(req, res) {
  const params = req.body;
  params.history = true;
  
  apiClient.authenticatedCall('/User/credits', { body: params }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/discounts', function(req, res) {
  apiClient.authenticatedCall('/Discount/listForUser', { body: req.body }).then((data) => {
    if(req.body.refererOnly) {
      data.discounts = data.discounts.filter((discount) => {
        return discount.description.indexOf('Primera compra concretada') > -1 || discount.description.indexOf('Registro') > -1;
      });
    }
    
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/discounts/referer', function(req, res) {
  req.body.includeUnavailable = 1;
  apiClient.authenticatedCall('/Discount/listForUser', { body: req.body }).then((data) => {
    data.discounts = data.discounts.filter((discount) => {
      return discount.description.indexOf('Primera compra concretada') > -1 || discount.description.indexOf('Registro') > -1;
    }).map((discount) => {
      const user = discount.description.match(/(\()(.+)(\))/);
      discount.user = (user.length === 4 ? user[2] : discount.code);
      
      if(discount.available) {
        discount.status = 'Disponible';
      } else if(discount.used) {
        discount.status = 'Redimido';
      } else {
        discount.status = 'Vencido';
      }
      
      return discount;
    });
    
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/referees', function(req, res) {
  apiClient.authenticatedCall('/User/referees', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/update', function(req, res) {
  apiClient.authenticatedCall('/User/update', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/User/addresses', function(req, res) {
  apiClient.authenticatedCall('/UserAddress/list', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/addresses', function(req, res) {
  apiClient.authenticatedCall('/UserAddress', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.delete('/User/addresses/:id', function(req, res) {
  apiClient.authenticatedCall('/UserAddress/list/'+req.params.id, { method: 'DELETE', body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/User/fields', function(req, res) {
  apiClient.authenticatedCall('/UserField/list', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/fields', function(req, res) {
  apiClient.authenticatedCall('/UserField', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/fields/delete', function(req, res) {
  apiClient.authenticatedCall('/UserField/deleteAll/', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/User/exists', function(req, res) {
  apiClient.call('/User/exists', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/User/facebook', function(req, res) {  
  const url = facebook.getLoginUrl({
    appId: process.env.GEELBE_FACEBOOK_APP_ID,
    appSecret: process.env.GEELBE_FACEBOOK_APP_SECRET,
    scope: 'email',
    redirect_uri: req.query.redirect
  });
  res.json({ url: url });
});

app.get('/User/facebook/token', function(req, res) {  
  
  facebook.api('oauth/access_token', {
    client_id: process.env.GEELBE_FACEBOOK_APP_ID,
    client_secret: process.env.GEELBE_FACEBOOK_APP_SECRET,
    redirect_uri: req.query.redirect,
    code: req.query.code
  }, (data) => {
    if(!data || data.error) {
      res.status(400).json({ ok: false, error: data.error });
      return;
    }

    res.json({ access_token: data.access_token, expires: (data.expires ? data.expires : 0) });
  });
  
});

app.get('/Banner', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Banner/list', { body: { position: req.query.position, blogPostId: req.query.blogPostId } }).then((data) => {
    res.json(data.banners);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Product', cache(CACHE_TIME), function(req, res) {
  
  let endpoint = '/Product/list';
  
  if(req.query.bestSellers)
    endpoint = '/Product/listBestSellers';
  else if(req.query.campaignId > 0)
    endpoint = '/Product/listForCampaign/'+req.query.campaignId;
  else if(typeof req.query.query != 'undefined' && req.query.query.length > 0)
    endpoint = '/Product/search';
  else if(req.query.categoryId > 0)
    endpoint = '/Product/listForCategory/'+req.query.categoryId;
  else if(req.query.manufacturers)
    endpoint = '/Product/listForCategory';
  
  if(req.query.sort) {
    req.query.sortField = req.query.sort;
    if(req.query.sort == 'created') {
      req.query.sortWay = 'desc';
    }
  }
  
  req.query.simple = 1;

  apiClient.call(endpoint, { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
  
});

app.get('/Product/:id', function(req, res) {
  apiClient.call('/Product/list/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Product/:id/related', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Product/listRelated/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/PaymentMethod', function(req, res) {
  apiClient.call('/PaymentMethod/list').then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Country', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Country/list').then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/State/:countryId', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/State/list', { body: { countryId: req.params.countryId } }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/City/:stateId', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/City/list', { body: { stateId: req.params.stateId } }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Carrier', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Carrier/list', { body: { stateId: req.query.stateId, cityId: (req.query.cityId ? req.query.cityId : null) } }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Order', function(req, res) {
  req.body.products = JSON.stringify(req.body.products);
  
  if(req.body.discounts) {
    req.body.discounts = JSON.stringify(req.body.discounts);
  }
  
  if(req.body.access_token) {
    call = apiClient.authenticatedCall('/Order', { body: req.body });
  } else {
    call = apiClient.call('/Order', { body: req.body });
  }

  call.then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Order/calculateTotal', function(req, res) {
  req.body.products = JSON.stringify(req.body.products);
  
  if(req.body.discounts) {
    req.body.discounts = JSON.stringify(req.body.discounts);
  }
  
  apiClient.authenticatedCall('/Order/calculateTotal', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Order/list', function(req, res) {
  apiClient.authenticatedCall('/Order/list', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Order/:orderId', function(req, res) {
  apiClient.authenticatedCall('/Order/list/'+req.params.orderId, { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Campaign', cache(CACHE_TIME), function(req, res) {
  const data = {};
  if(req.query.open)
  	data.open = 1;
  if(req.query.closed)
  	data.closed = 1;
  if(req.query.upcoming)
  	data.upcoming = 1;
  if(req.query.categoryId)
  	data.categoryId = req.query.categoryId;
  if(req.query.limit)
  	data.limit = req.query.limit;
  	
  let endpoint = '/Campaign/list';
  if(typeof req.query.query != 'undefined' && req.query.query.length > 0) {
    endpoint = '/Campaign/search';
    data.query = req.query.query;
  }
  
  apiClient.call(endpoint, { body: data }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Campaign/:id', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Campaign/list/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Campaign/:id/categories', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Campaign/categories/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/BlogPost', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/BlogPost/list', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/BlogPost/:id', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/BlogPost/list/'+req.params.id).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Manufacturer', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Manufacturer/list', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Manufacturer/:id', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/Manufacturer/list/'+req.params.id, { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/NewsletterListUser', function(req, res) {
  req.body.listId = 1;
 
  apiClient.call('/NewsletterListUser', { body: req.body }).then((data) => {
    if(data.new) {
    
      apiClient.call('/Discount', { body: { type: 1, amount: 10, firstOrderOnly: 1 } }).then((discount) => {
      
        fs.readFile(path.join(__dirname, 'emails/subscribe.html'), { encoding: 'utf-8' }, function(err, template) {
          if (!err) {
          
            template = template.replace('{EMAIL}', req.body.email);
            template = template.replace('{DISCOUNT}', discount.code);
        
            const params = {
              to: req.body.email,
              subject: 'Te regalamos 10% de descuento en tu primera compra',
              body: template
            };

            apiClient.call('/Email/send', { body: params }).then((email) => {
              res.json(data);
            }).catch((data) => {
              res.status(400).json(data);
            });
    
          } else {
            res.status(400).json({ ok: false, error: err });
          }
        });
      
      }).catch((data) => {
        res.status(400).json(data);
      });
    
    } else {
      res.json(data);
    }	
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PayUTarjeta', function(req, res) {
  apiClient.authenticatedCall('/PayUTarjeta', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PayUTarjeta/pay', function(req, res) {
  apiClient.authenticatedCall('/PayUTarjeta/pay', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/PayUTarjeta/types', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/PayUTarjeta/listTypes', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/PayUTarjeta/dniTypes', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/PayUTarjeta/listDNITypes', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PayUTarjeta/cards', function(req, res) {
  apiClient.authenticatedCall('/PayUTarjeta/list', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.delete('/PayUTarjeta/cards/:id', function(req, res) {
  apiClient.authenticatedCall('/PayUTarjeta/list/'+req.params.id, { method: 'DELETE', body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PayUPSE/pay', function(req, res) {
  apiClient.authenticatedCall('/PayUPSE/pay', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/PayUPSE/banks', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/PayUPSE/listBanks', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/PayUPSE/dniTypes', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/PayUPSE/listDNITypes', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/PayUPSE/personTypes', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/PayUPSE/listPersonTypes', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PayUEfecty/pay', function(req, res) {
  apiClient.authenticatedCall('/PayUEfecty/pay', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PayUBaloto/pay', function(req, res) {
  apiClient.authenticatedCall('/PayUBaloto/pay', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/PuntoRed/pay', function(req, res) {
  apiClient.authenticatedCall('/PuntoRed/pay', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/MercadoPagoCreditCard/paymentMethods', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/MercadoPagoCreditCard/listPaymentMethods', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/MercadoPagoCreditCard/pay', function(req, res) {
  apiClient.authenticatedCall('/MercadoPagoCreditCard/pay', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Message', function(req, res) {
  if(req.body.access_token) {
    call = apiClient.authenticatedCall('/Message', { body: req.body });
  } else {
    call = apiClient.call('/Message', { body: req.body });
  }

  call.then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Message', function(req, res) {
  apiClient.authenticatedCall('/Message/list', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Message/subjects', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/MessageSubject/list').then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Message/:id', function(req, res) {
  apiClient.authenticatedCall('/Message/list/'+req.params.id, { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.get('/Search', cache(CACHE_TIME), function(req, res) {
  apiClient.call('/VPElasticsearch/query', { body: req.query }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Recommendation', function(req, res) {
  req.body.products = JSON.stringify(req.body.products);
  apiClient.call('/Recommendation/generate', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.post('/Email/invite', function(req, res) {
  
  apiClient.authenticatedCall('/User/me', { body: { access_token: req.body.access_token } }).then((user) => {
  
    fs.readFile(path.join(__dirname, 'emails/invite.html'), { encoding: 'utf-8' }, function(err, template) {
      if (!err) {
      
        template = template.replace('{NAME}', user.name);
        template = template.replace('{REFERER}', user.myInvitationCode);
    
        const params = {
          to: req.body.to,
          subject: user.name + ' te acaba de regalar $20.000',
          body: template,
          access_token: req.body.access_token
        };

        apiClient.call('/Email/send', { body: params }).then((data) => {
          res.json(data);
        }).catch((data) => {
          res.status(400).json(data);
        });

      } else {
        res.status(400).json({ ok: false, error: err });
      }
    });

  }).catch((data) => {
    res.status(400).json(data);
  });
  
});

app.post('/CartProduct', function(req, res) {
  apiClient.call('/VPElasticsearch/cartProduct', { body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

app.delete('/CartProduct/:id', function(req, res) {
  apiClient.call('/VPElasticsearch/cartProduct/'+req.params.id, { method: 'DELETE', body: req.body }).then((data) => {
    res.json(data);
  }).catch((data) => {
    res.status(400).json(data);
  });
});

module.exports = {
  path: '/backend',
  handler: app
};