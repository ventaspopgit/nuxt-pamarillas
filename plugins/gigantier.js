import Vue from 'vue'
import moment from 'moment';
moment.locale('es');

Vue.prototype.$price = function (price) {
  return `$${Number(Math.round(price)).toLocaleString('it')}`;
}

Vue.prototype.$truncate = function (text, length, clamp) {
  clamp = clamp || '...';
  return text.length > length ? text.slice(0, length) + clamp : text;
};

Vue.prototype.$dateDiff = function (date, today) {
  today = moment(today);
  const m = moment(date);
  const diff = m.diff(today);
  const duration = moment.duration(diff);
  
  if (duration.days() < 1) {
    return 'en ' + duration.hours() + 'h ' + duration.minutes() + 'm ' + duration.seconds() + 's'; 
  } else {
    return m.fromNow();
  }
};

Vue.prototype.$statusTitle = function (order) {
  const status = parseInt(order.statusId);
  switch (status) {
    case 2:
      return `El pago de tu pedido #${order.id} ha sido aceptado`;
    case 14:
      return `La oferta ha terminado`;
    case 8:
      return `Tu pedido #${order.id} está en proceso`;
    case 6:
      return `Tu pedido #${order.id} ha sido enviado`;
    case 4:
      return `Tu pedido #${order.id} fue entregado`;
  }
}

Vue.prototype.$statusDescription = function (order) {
  const status = parseInt(order.statusId);
  switch (status) {
    case 2:
      return `Si quieres volver a comprar, puedes hacerlo. Esta oferta aún se encuentra disponible.`;
    case 14:
      return `Todas nuestras ofertas tienen tiempo limitado y pocas unidades, pero en esta oportunidad pudiste aprovecharla.`;
    case 8:
      return `En este momento estamos solicitando los productos con el proveedor. Después de que los tengamos, haremos un control de calidad los empacaremos y lo enviaremos en las 24 horas siguientes a tu dirección.`;
    case 6:
      return `Tus productos van en camino a tu domicilio. Recuerda que podrás hacer seguimiento de tu pedido en la página de Servientrega.`;
    case 4:
      return `Servientrega reportó la entrega de tu pedido. Si tienes algún inconveniente, comunícate con nosotros a través de nuestra sección de ayuda. ¡Qué lo disfrutes!`;
  }
}
