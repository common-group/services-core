import Postgrest from 'mithril-postgrest';

const platformTokenMeta = document.querySelector('[name="common-platform-token"]');
const platformToken = platformTokenMeta ? platformTokenMeta.getAttribute('content') : null;
const commonRequestHeader = { 'Platform-Code': platformToken };

const apiInit = (api, apiMeta, authUrl, globalHeader) => {
    api.init(apiMeta.getAttribute('content'), { method: 'GET', url: authUrl }, globalHeader);
};

const catarse = new Postgrest();
const catarseApiMeta = document.querySelector('[name="api-host"]');
apiInit(catarse, catarseApiMeta, '/api_token');

const catarseMoments = new Postgrest();
const catarseApiMomentsMeta = document.querySelector('[name="api-moments-host"]');
apiInit(catarseMoments, catarseApiMomentsMeta, '/api_token');

const commonPayment = new Postgrest();
const commonPaymentApiMeta = document.querySelector('[name="common-payment-api-host"]');
apiInit(commonPayment, commonPaymentApiMeta, '/api_token/common', commonRequestHeader);

const commonProject = new Postgrest();
const commonProjectApiMeta = document.querySelector('[name="common-project-api-host"]');
apiInit(commonProject, commonProjectApiMeta, '/api_token/common', commonRequestHeader);

const commonAnalytics = new Postgrest();
const commonAnalyticsApiMeta = document.querySelector('[name="common-analytics-api-host"]');
apiInit(commonAnalytics, commonAnalyticsApiMeta, '/api_token/common', commonRequestHeader);

const commonNotification = new Postgrest();
const commonNotificationApiMeta = document.querySelector('[name="common-notification-api-host"]');
apiInit(commonNotification, commonNotificationApiMeta, '/api_token/common', commonRequestHeader);

// not a postgrest instance, but pretend it is to get free pagination
const commonRecommender = new Postgrest();
const commonRecommenderApiMeta = document.querySelector('[name="common-recommender-api-host"]');
apiInit(commonRecommender, commonRecommenderApiMeta, '/api_token/common', commonRequestHeader);

const commonCommunity = new Postgrest();
const commonCommunityApiMeta = document.querySelector('[name="common-community-api-host"]');
apiInit(commonCommunity, commonCommunityApiMeta, '/api_token/common', commonRequestHeader);

const commonProxy = new Postgrest();
const commonProxyApiMeta = document.querySelector('[name="common-proxy-api-host"]');
apiInit(commonProxy, commonProxyApiMeta, '/api_token/common_proxy', commonRequestHeader);


export {
    catarse, 
    catarseMoments, 
    commonPayment, 
    commonProject, 
    commonAnalytics, 
    commonNotification, 
    commonRecommender, 
    commonCommunity, 
    commonProxy 
};
