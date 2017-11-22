import Postgrest from 'mithril-postgrest';

const catarse = new Postgrest();
const catarseApiMeta = document.querySelector('[name="api-host"]');
catarse.init(catarseApiMeta.getAttribute('content'), { method: 'GET', url: '/api_token' });

const commonPayment = new Postgrest();
const commonPaymentApiMeta = document.querySelector('[name="common-payment-api-host"]');
commonPayment.init(commonPaymentApiMeta.getAttribute('content'), { method: 'GET', url: '/api_token/common' });

const commonProject = new Postgrest();
const commonProjectApiMeta = document.querySelector('[name="common-project-api-host"]');
commonProject.init(commonProjectApiMeta.getAttribute('content'), { method: 'GET', url: '/api_token/common' });

const commonAnalytics = new Postgrest();
const commonAnalyticsApiMeta = document.querySelector('[name="common-analytics-api-host"]');
commonAnalytics.init(commonAnalyticsApiMeta.getAttribute('content'), { method: 'GET', url: '/api_token/common' });

export { catarse, commonPayment, commonProject, commonAnalytics };
