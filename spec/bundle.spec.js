(function (exports,m$1,postgrest$1,_$1,moment$1,I18n$1,replaceDiacritics$1) {
  'use strict';

  m$1 = 'default' in m$1 ? m$1['default'] : m$1;
  postgrest$1 = 'default' in postgrest$1 ? postgrest$1['default'] : postgrest$1;
  _$1 = 'default' in _$1 ? _$1['default'] : _$1;
  moment$1 = 'default' in moment$1 ? moment$1['default'] : moment$1;
  I18n$1 = 'default' in I18n$1 ? I18n$1['default'] : I18n$1;
  replaceDiacritics$1 = 'default' in replaceDiacritics$1 ? replaceDiacritics$1['default'] : replaceDiacritics$1;

  var babelHelpers = {};

  babelHelpers.slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  babelHelpers;

  (function(exports,m$1,postgrest$1,_$1,moment$1,I18n$1,replaceDiacritics$1){'use strict';m$1='default' in m$1?m$1['default']:m$1;postgrest$1='default' in postgrest$1?postgrest$1['default']:postgrest$1;_$1='default' in _$1?_$1['default']:_$1;moment$1='default' in moment$1?moment$1['default']:moment$1;I18n$1='default' in I18n$1?I18n$1['default']:I18n$1;replaceDiacritics$1='default' in replaceDiacritics$1?replaceDiacritics$1['default']:replaceDiacritics$1;var babelHelpers={};babelHelpers.slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally {try{if(!_n&&_i["return"])_i["return"]();}finally {if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();babelHelpers;(function(exports,m$1,postgrest$1,_$1,moment$1,I18n$1,replaceDiacritics){'use strict';m$1='default' in m$1?m$1['default']:m$1;postgrest$1='default' in postgrest$1?postgrest$1['default']:postgrest$1;_$1='default' in _$1?_$1['default']:_$1;moment$1='default' in moment$1?moment$1['default']:moment$1;I18n$1='default' in I18n$1?I18n$1['default']:I18n$1;replaceDiacritics='default' in replaceDiacritics?replaceDiacritics['default']:replaceDiacritics;var babelHelpers={};babelHelpers.slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally {try{if(!_n&&_i["return"])_i["return"]();}finally {if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();babelHelpers;(function(exports,m$1,postgrest$1,_$1,moment$1,I18n$1){'use strict';m$1='default' in m$1?m$1['default']:m$1;postgrest$1='default' in postgrest$1?postgrest$1['default']:postgrest$1;_$1='default' in _$1?_$1['default']:_$1;moment$1='default' in moment$1?moment$1['default']:moment$1;I18n$1='default' in I18n$1?I18n$1['default']:I18n$1;var babelHelpers={};babelHelpers.slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally {try{if(!_n&&_i["return"])_i["return"]();}finally {if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();babelHelpers;(function(m,postgrest$1,_$1,moment,I18n){'use strict';m='default' in m?m['default']:m;postgrest$1='default' in postgrest$1?postgrest$1['default']:postgrest$1;_$1='default' in _$1?_$1['default']:_$1;moment='default' in moment?moment['default']:moment;I18n='default' in I18n?I18n['default']:I18n;var models={contributionDetail:postgrest.model('contribution_details'),contributionActivity:postgrest.model('contribution_activities'),projectDetail:postgrest.model('project_details'),userDetail:postgrest.model('user_details'),balance:postgrest.model('balances'),balanceTransaction:postgrest.model('balance_transactions'),balanceTransfer:postgrest.model('balance_transfers'),user:postgrest.model('users'),bankAccount:postgrest.model('bank_accounts'),rewardDetail:postgrest.model('reward_details'),projectReminder:postgrest.model('project_reminders'),contributions:postgrest.model('contributions'),directMessage:postgrest.model('direct_messages'),teamTotal:postgrest.model('team_totals'),projectAccount:postgrest.model('project_accounts'),projectContribution:postgrest.model('project_contributions'),projectPostDetail:postgrest.model('project_posts_details'),projectContributionsPerDay:postgrest.model('project_contributions_per_day'),projectContributionsPerLocation:postgrest.model('project_contributions_per_location'),projectContributionsPerRef:postgrest.model('project_contributions_per_ref'),project:postgrest.model('projects'),projectSearch:postgrest.model('rpc/project_search'),category:postgrest.model('categories'),categoryTotals:postgrest.model('category_totals'),categoryFollower:postgrest.model('category_followers'),teamMember:postgrest.model('team_members'),notification:postgrest.model('notifications'),statistic:postgrest.model('statistics'),successfulProject:postgrest.model('successful_projects')};models.teamMember.pageSize(40);models.rewardDetail.pageSize(false);models.project.pageSize(30);models.category.pageSize(50);models.contributionActivity.pageSize(40);models.successfulProject.pageSize(9);var hashMatch=function hashMatch(str){return window.location.hash===str;};var paramByName=function paramByName(name){var normalName=name.replace(/[\[]/,'\\[').replace(/[\]]/,'\\]'),regex=new RegExp('[\\?&]'+normalName+'=([^&#]*)'),results=regex.exec(location.search);return results===null?'':decodeURIComponent(results[1].replace(/\+/g,' '));};var selfOrEmpty=function selfOrEmpty(obj){var emptyState=arguments.length<=1||arguments[1]===undefined?'':arguments[1];return obj?obj:emptyState;};var setMomentifyLocale=function setMomentifyLocale(){moment.locale('pt',{monthsShort:'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')});};var existy=function existy(x){return x!=null;};var momentify=function momentify(date,format){format=format||'DD/MM/YYYY';return date?moment(date).locale('pt').format(format):'no date';};var storeAction=function storeAction(action){if(!sessionStorage.getItem(action)){return sessionStorage.setItem(action,action);}};var callStoredAction=function callStoredAction(action,func){if(sessionStorage.getItem(action)){func.call();return sessionStorage.removeItem(action);}};var discuss=function discuss(page,identifier){var d=document,s=d.createElement('script');window.disqus_config=function(){this.page.url=page;this.page.identifier=identifier;};s.src='//catarseflex.disqus.com/embed.js';s.setAttribute('data-timestamp',+new Date());(d.head||d.body).appendChild(s);return m('');};var momentFromString=function momentFromString(date,format){var european=moment(date,format||'DD/MM/YYYY');return european.isValid()?european:moment(date);};var translatedTimeUnits={days:'dias',minutes:'minutos',hours:'horas',seconds:'segundos'};var translatedTime=function translatedTime(time){var translatedTime=translatedTimeUnits,unit=function unit(){var projUnit=translatedTime[time.unit||'seconds'];return time.total<=1?projUnit.slice(0,-1):projUnit;};return {unit:unit(),total:time.total};};var generateFormatNumber=function generateFormatNumber(s,c){return function(number,n,x){if(!_.isNumber(number)){return null;}var re='\\d(?=(\\d{'+(x||3)+'})+'+(n>0?'\\D':'$')+')',num=number.toFixed(Math.max(0,~ ~n));return (c?num.replace('.',c):num).replace(new RegExp(re,'g'),'$&'+(s||','));};};var formatNumber=generateFormatNumber('.',',');var toggleProp=function toggleProp(defaultState,alternateState){var p=m.prop(defaultState);p.toggle=function(){return p(p()===alternateState?defaultState:alternateState);};return p;};var idVM=postgrest.filtersVM({id:'eq'});var getCurrentProject=function getCurrentProject(){var root=document.getElementById('project-show-root'),data=root.getAttribute('data-parameters');if(data){return JSON.parse(data);}else {return false;}};var getRdToken=function getRdToken(){var meta=_.first(document.querySelectorAll('[name=rd-token]'));return meta?meta.content:undefined;};var getUser=function getUser(){var body=document.getElementsByTagName('body'),data=_.first(body).getAttribute('data-user');if(data){return JSON.parse(data);}else {return false;}};var locationActionMatch=function locationActionMatch(action){var act=window.location.pathname.split('/').slice(-1)[0];return action===act;};var useAvatarOrDefault=function useAvatarOrDefault(avatarPath){return avatarPath||'/assets/catarse_bootstrap/user.jpg';};var loader=function loader(){return m('.u-text-center.u-margintop-30 u-marginbottom-30',[m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);};var newFeatureBadge=function newFeatureBadge(){return m('span.badge.badge-success.margin-side-5',I18n.t('projects.new_feature_badge'));};var fbParse=function fbParse(){var tryParse=function tryParse(){try{window.FB.XFBML.parse();}catch(e){console.log(e);}};return window.setTimeout(tryParse,500); //use timeout to wait async of facebook
  };var pluralize=function pluralize(count,s,p){return count>1?count+p:count+s;};var simpleFormat=function simpleFormat(){var str=arguments.length<=0||arguments[0]===undefined?'':arguments[0];str=str.replace(/\r\n?/,'\n');if(str.length>0){str=str.replace(/\n\n+/g,'</p><p>');str=str.replace(/\n/g,'<br />');str='<p>'+str+'</p>';}return str;};var rewardSouldOut=function rewardSouldOut(reward){return reward.maximum_contributions>0?reward.paid_count+reward.waiting_payment_count>=reward.maximum_contributions:false;};var rewardRemaning=function rewardRemaning(reward){return reward.maximum_contributions-(reward.paid_count+reward.waiting_payment_count);};var parseUrl=function parseUrl(href){var l=document.createElement('a');l.href=href;return l;};var UIHelper=function UIHelper(){return function(el,isInitialized){if(!isInitialized&&$){window.UIHelper.setupResponsiveIframes($(el));}};};var toAnchor=function toAnchor(){return function(el,isInitialized){if(!isInitialized){var hash=window.location.hash.substr(1);if(hash===el.id){window.location.hash='';setTimeout(function(){window.location.hash=el.id;});}}};};var validateEmail=function validateEmail(email){var re=/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;return re.test(email);};var navigateToDevise=function navigateToDevise(){window.location.href='/pt/login';return false;};var cumulativeOffset=function cumulativeOffset(element){var top=0,left=0;do {top+=element.offsetTop||0;left+=element.offsetLeft||0;element=element.offsetParent;}while(element);return {top:top,left:left};};var closeModal=function closeModal(){var el=document.getElementsByClassName('modal-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();document.getElementsByClassName('modal-backdrop')[0].style.display='none';};};};var closeFlash=function closeFlash(){var el=document.getElementsByClassName('icon-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();el.parentElement.remove();};};};var i18nScope=function i18nScope(scope,obj){obj=obj||{};return _.extend({},obj,{scope:scope});};var redrawHashChange=function redrawHashChange(before){var callback=_.isFunction(before)?function(){before();m.redraw();}:m.redraw;window.addEventListener('hashchange',callback,false);};var authenticityToken=function authenticityToken(){var meta=_.first(document.querySelectorAll('[name=csrf-token]'));return meta?meta.content:undefined;};var animateScrollTo=function animateScrollTo(el){var scrolled=window.scrollY;var offset=cumulativeOffset(el).top,duration=300,dFrame=(offset-scrolled)/duration, //EaseInOutCubic easing function. We'll abstract all animation funs later.
  eased=function eased(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1;},animation=setInterval(function(){var pos=eased(scrolled/offset)*scrolled;window.scrollTo(0,pos);if(scrolled>=offset){clearInterval(animation);}scrolled=scrolled+dFrame;},1);};var scrollTo=function scrollTo(){var setTrigger=function setTrigger(el,anchorId){el.onclick=function(){var anchorEl=document.getElementById(anchorId);if(_.isElement(anchorEl)){animateScrollTo(anchorEl);}return false;};};return function(el,isInitialized){if(!isInitialized){setTrigger(el,el.hash.slice(1));}};};var RDTracker=function RDTracker(eventId){return function(el,isInitialized){if(!isInitialized){var integrationScript=document.createElement('script');integrationScript.type='text/javascript';integrationScript.id='RDIntegration';if(!document.getElementById(integrationScript.id)){document.body.appendChild(integrationScript);integrationScript.onload=function(){return RdIntegration.integrate(getRdToken(),eventId);};integrationScript.src='https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';}return false;}};};setMomentifyLocale();closeFlash();closeModal();var h={authenticityToken:authenticityToken,cumulativeOffset:cumulativeOffset,discuss:discuss,existy:existy,validateEmail:validateEmail,momentify:momentify,momentFromString:momentFromString,formatNumber:formatNumber,idVM:idVM,getUser:getUser,getCurrentProject:getCurrentProject,toggleProp:toggleProp,loader:loader,newFeatureBadge:newFeatureBadge,fbParse:fbParse,pluralize:pluralize,simpleFormat:simpleFormat,translatedTime:translatedTime,rewardSouldOut:rewardSouldOut,rewardRemaning:rewardRemaning,parseUrl:parseUrl,hashMatch:hashMatch,redrawHashChange:redrawHashChange,useAvatarOrDefault:useAvatarOrDefault,locationActionMatch:locationActionMatch,navigateToDevise:navigateToDevise,storeAction:storeAction,callStoredAction:callStoredAction,UIHelper:UIHelper,toAnchor:toAnchor,paramByName:paramByName,i18nScope:i18nScope,RDTracker:RDTracker,selfOrEmpty:selfOrEmpty,scrollTo:scrollTo};var adminExternalAction={controller:function controller(args){var builder=args.data,complete=m.prop(false),error=m.prop(false),fail=m.prop(false),data={},item=args.item;builder.requestOptions.config=function(xhr){if(h.authenticityToken()){xhr.setRequestHeader('X-CSRF-Token',h.authenticityToken());}};var reload=_$1.compose(builder.model.getRowWithToken,h.idVM.id(item[builder.updateKey]).parameters),l=m.prop(false);var reloadItem=function reloadItem(){return reload().then(updateItem);};var requestError=function requestError(err){l(false);complete(true);error(true);};var updateItem=function updateItem(res){_$1.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){l(true);m.request(builder.requestOptions).then(reloadItem,requestError);return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);};};return {l:l,complete:complete,error:error,submit:submit,toggler:h.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m('.w-col.w-col-2',[m('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m('label',data.innerLabel),m('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m('.w-form-done[style="display:block;"]',[m('p','Requisição feita com sucesso.')])]:[m('.w-form-error[style="display:block;"]',[m('p','Houve um problema na requisição.')])])]):'']);}};describe('adminExternalAction',function(){var testModel=postgrest$1.model('reloadAction'),item={testKey:'foo'},ctrl,$output;var args={updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',model:testModel,requestOptions:{url:'http://external_api'}};describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({'responseText':JSON.stringify([])});});beforeEach(function(){$output=mq(adminExternalAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});});describe('on form submit',function(){beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');});});});});})(m,postgrest,_,moment,I18n);var models={contributionDetail:postgrest.model('contribution_details'),contributionActivity:postgrest.model('contribution_activities'),projectDetail:postgrest.model('project_details'),userDetail:postgrest.model('user_details'),balance:postgrest.model('balances'),balanceTransaction:postgrest.model('balance_transactions'),balanceTransfer:postgrest.model('balance_transfers'),user:postgrest.model('users'),bankAccount:postgrest.model('bank_accounts'),rewardDetail:postgrest.model('reward_details'),projectReminder:postgrest.model('project_reminders'),contributions:postgrest.model('contributions'),directMessage:postgrest.model('direct_messages'),teamTotal:postgrest.model('team_totals'),projectAccount:postgrest.model('project_accounts'),projectContribution:postgrest.model('project_contributions'),projectPostDetail:postgrest.model('project_posts_details'),projectContributionsPerDay:postgrest.model('project_contributions_per_day'),projectContributionsPerLocation:postgrest.model('project_contributions_per_location'),projectContributionsPerRef:postgrest.model('project_contributions_per_ref'),project:postgrest.model('projects'),projectSearch:postgrest.model('rpc/project_search'),category:postgrest.model('categories'),categoryTotals:postgrest.model('category_totals'),categoryFollower:postgrest.model('category_followers'),teamMember:postgrest.model('team_members'),notification:postgrest.model('notifications'),statistic:postgrest.model('statistics'),successfulProject:postgrest.model('successful_projects')};models.teamMember.pageSize(40);models.rewardDetail.pageSize(false);models.project.pageSize(30);models.category.pageSize(50);models.contributionActivity.pageSize(40);models.successfulProject.pageSize(9);var hashMatch=function hashMatch(str){return window.location.hash===str;};var paramByName=function paramByName(name){var normalName=name.replace(/[\[]/,'\\[').replace(/[\]]/,'\\]'),regex=new RegExp('[\\?&]'+normalName+'=([^&#]*)'),results=regex.exec(location.search);return results===null?'':decodeURIComponent(results[1].replace(/\+/g,' '));};var selfOrEmpty=function selfOrEmpty(obj){var emptyState=arguments.length<=1||arguments[1]===undefined?'':arguments[1];return obj?obj:emptyState;};var setMomentifyLocale=function setMomentifyLocale(){moment$1.locale('pt',{monthsShort:'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')});};var existy=function existy(x){return x!=null;};var momentify=function momentify(date,format){format=format||'DD/MM/YYYY';return date?moment$1(date).locale('pt').format(format):'no date';};var storeAction=function storeAction(action){if(!sessionStorage.getItem(action)){return sessionStorage.setItem(action,action);}};var callStoredAction=function callStoredAction(action,func){if(sessionStorage.getItem(action)){func.call();return sessionStorage.removeItem(action);}};var discuss=function discuss(page,identifier){var d=document,s=d.createElement('script');window.disqus_config=function(){this.page.url=page;this.page.identifier=identifier;};s.src='//catarseflex.disqus.com/embed.js';s.setAttribute('data-timestamp',+new Date());(d.head||d.body).appendChild(s);return m$1('');};var momentFromString=function momentFromString(date,format){var european=moment$1(date,format||'DD/MM/YYYY');return european.isValid()?european:moment$1(date);};var translatedTimeUnits={days:'dias',minutes:'minutos',hours:'horas',seconds:'segundos'};var translatedTime=function translatedTime(time){var translatedTime=translatedTimeUnits,unit=function unit(){var projUnit=translatedTime[time.unit||'seconds'];return time.total<=1?projUnit.slice(0,-1):projUnit;};return {unit:unit(),total:time.total};};var generateFormatNumber=function generateFormatNumber(s,c){return function(number,n,x){if(!_.isNumber(number)){return null;}var re='\\d(?=(\\d{'+(x||3)+'})+'+(n>0?'\\D':'$')+')',num=number.toFixed(Math.max(0,~ ~n));return (c?num.replace('.',c):num).replace(new RegExp(re,'g'),'$&'+(s||','));};};var formatNumber=generateFormatNumber('.',',');var toggleProp=function toggleProp(defaultState,alternateState){var p=m$1.prop(defaultState);p.toggle=function(){return p(p()===alternateState?defaultState:alternateState);};return p;};var idVM=postgrest.filtersVM({id:'eq'});var getCurrentProject=function getCurrentProject(){var root=document.getElementById('project-show-root'),data=root.getAttribute('data-parameters');if(data){return JSON.parse(data);}else {return false;}};var getRdToken=function getRdToken(){var meta=_.first(document.querySelectorAll('[name=rd-token]'));return meta?meta.content:undefined;};var getUser=function getUser(){var body=document.getElementsByTagName('body'),data=_.first(body).getAttribute('data-user');if(data){return JSON.parse(data);}else {return false;}};var locationActionMatch=function locationActionMatch(action){var act=window.location.pathname.split('/').slice(-1)[0];return action===act;};var useAvatarOrDefault=function useAvatarOrDefault(avatarPath){return avatarPath||'/assets/catarse_bootstrap/user.jpg';};var loader=function loader(){return m$1('.u-text-center.u-margintop-30 u-marginbottom-30',[m$1('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);};var newFeatureBadge=function newFeatureBadge(){return m$1('span.badge.badge-success.margin-side-5',I18n$1.t('projects.new_feature_badge'));};var fbParse=function fbParse(){var tryParse=function tryParse(){try{window.FB.XFBML.parse();}catch(e){console.log(e);}};return window.setTimeout(tryParse,500); //use timeout to wait async of facebook
  };var pluralize=function pluralize(count,s,p){return count>1?count+p:count+s;};var simpleFormat=function simpleFormat(){var str=arguments.length<=0||arguments[0]===undefined?'':arguments[0];str=str.replace(/\r\n?/,'\n');if(str.length>0){str=str.replace(/\n\n+/g,'</p><p>');str=str.replace(/\n/g,'<br />');str='<p>'+str+'</p>';}return str;};var rewardSouldOut=function rewardSouldOut(reward){return reward.maximum_contributions>0?reward.paid_count+reward.waiting_payment_count>=reward.maximum_contributions:false;};var rewardRemaning=function rewardRemaning(reward){return reward.maximum_contributions-(reward.paid_count+reward.waiting_payment_count);};var parseUrl=function parseUrl(href){var l=document.createElement('a');l.href=href;return l;};var UIHelper=function UIHelper(){return function(el,isInitialized){if(!isInitialized&&$){window.UIHelper.setupResponsiveIframes($(el));}};};var toAnchor=function toAnchor(){return function(el,isInitialized){if(!isInitialized){var hash=window.location.hash.substr(1);if(hash===el.id){window.location.hash='';setTimeout(function(){window.location.hash=el.id;});}}};};var validateEmail=function validateEmail(email){var re=/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;return re.test(email);};var navigateToDevise=function navigateToDevise(){window.location.href='/pt/login';return false;};var cumulativeOffset=function cumulativeOffset(element){var top=0,left=0;do {top+=element.offsetTop||0;left+=element.offsetLeft||0;element=element.offsetParent;}while(element);return {top:top,left:left};};var closeModal=function closeModal(){var el=document.getElementsByClassName('modal-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();document.getElementsByClassName('modal-backdrop')[0].style.display='none';};};};var closeFlash=function closeFlash(){var el=document.getElementsByClassName('icon-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();el.parentElement.remove();};};};var i18nScope=function i18nScope(scope,obj){obj=obj||{};return _.extend({},obj,{scope:scope});};var redrawHashChange=function redrawHashChange(before){var callback=_.isFunction(before)?function(){before();m$1.redraw();}:m$1.redraw;window.addEventListener('hashchange',callback,false);};var authenticityToken=function authenticityToken(){var meta=_.first(document.querySelectorAll('[name=csrf-token]'));return meta?meta.content:undefined;};var animateScrollTo=function animateScrollTo(el){var scrolled=window.scrollY;var offset=cumulativeOffset(el).top,duration=300,dFrame=(offset-scrolled)/duration, //EaseInOutCubic easing function. We'll abstract all animation funs later.
  eased=function eased(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1;},animation=setInterval(function(){var pos=eased(scrolled/offset)*scrolled;window.scrollTo(0,pos);if(scrolled>=offset){clearInterval(animation);}scrolled=scrolled+dFrame;},1);};var scrollTo=function scrollTo(){var setTrigger=function setTrigger(el,anchorId){el.onclick=function(){var anchorEl=document.getElementById(anchorId);if(_.isElement(anchorEl)){animateScrollTo(anchorEl);}return false;};};return function(el,isInitialized){if(!isInitialized){setTrigger(el,el.hash.slice(1));}};};var RDTracker=function RDTracker(eventId){return function(el,isInitialized){if(!isInitialized){var integrationScript=document.createElement('script');integrationScript.type='text/javascript';integrationScript.id='RDIntegration';if(!document.getElementById(integrationScript.id)){document.body.appendChild(integrationScript);integrationScript.onload=function(){return RdIntegration.integrate(getRdToken(),eventId);};integrationScript.src='https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';}return false;}};};setMomentifyLocale();closeFlash();closeModal();var h={authenticityToken:authenticityToken,cumulativeOffset:cumulativeOffset,discuss:discuss,existy:existy,validateEmail:validateEmail,momentify:momentify,momentFromString:momentFromString,formatNumber:formatNumber,idVM:idVM,getUser:getUser,getCurrentProject:getCurrentProject,toggleProp:toggleProp,loader:loader,newFeatureBadge:newFeatureBadge,fbParse:fbParse,pluralize:pluralize,simpleFormat:simpleFormat,translatedTime:translatedTime,rewardSouldOut:rewardSouldOut,rewardRemaning:rewardRemaning,parseUrl:parseUrl,hashMatch:hashMatch,redrawHashChange:redrawHashChange,useAvatarOrDefault:useAvatarOrDefault,locationActionMatch:locationActionMatch,navigateToDevise:navigateToDevise,storeAction:storeAction,callStoredAction:callStoredAction,UIHelper:UIHelper,toAnchor:toAnchor,paramByName:paramByName,i18nScope:i18nScope,RDTracker:RDTracker,selfOrEmpty:selfOrEmpty,scrollTo:scrollTo};var adminExternalAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),data={},item=args.item;builder.requestOptions.config=function(xhr){if(h.authenticityToken()){xhr.setRequestHeader('X-CSRF-Token',h.authenticityToken());}};var reload=_$1.compose(builder.model.getRowWithToken,h.idVM.id(item[builder.updateKey]).parameters),l=m$1.prop(false);var reloadItem=function reloadItem(){return reload().then(updateItem);};var requestError=function requestError(err){l(false);complete(true);error(true);};var updateItem=function updateItem(res){_$1.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){l(true);m$1.request(builder.requestOptions).then(reloadItem,requestError);return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);};};return {l:l,complete:complete,error:error,submit:submit,toggler:h.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Requisição feita com sucesso.')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p','Houve um problema na requisição.')])])]):'']);}};describe('adminExternalAction',function(){var testModel=postgrest$1.model('reloadAction'),item={testKey:'foo'},ctrl,$output;var args={updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',model:testModel,requestOptions:{url:'http://external_api'}};describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({'responseText':JSON.stringify([])});});beforeEach(function(){$output=mq(adminExternalAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});});describe('on form submit',function(){beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');});});});});describe('AdminFilter',function(){var ctrl=void 0,submit=void 0,fakeForm=void 0,formDesc=void 0,filterDescriber=void 0,$output=void 0,c=window.c,vm=c.admin.contributionFilterVM,AdminFilter=c.AdminFilter;describe('controller',function(){beforeAll(function(){ctrl=AdminFilter.controller();});it('should instantiate a toggler',function(){expect(ctrl.toggler).toBeDefined();});});describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();submit=jasmine.createSpy('submit');filterDescriber=FilterDescriberMock();$output=mq(AdminFilter,{filterBuilder:filterDescriber,data:{label:'foo'},submit:submit});});it('should render the main filter on render',function(){expect(m.component).toHaveBeenCalledWith(c.FilterMain,filterDescriber[0].data);});it('should build a form from a FormDescriber when clicking the advanced filter',function(){$output.click('button'); //mithril.query calls component one time to build it, so calls.count = length + 1.
  expect(m.component.calls.count()).toEqual(filterDescriber.length+1);});it('should trigger a submit function when submitting the form',function(){$output.trigger('form','submit');expect(submit).toHaveBeenCalled();});});});describe('AdminInputAction',function(){var c=window.c,m=window.m,models=window.c.models,AdminInputAction=c.AdminInputAction,testModel=m.postgrest.model('test'),item={testKey:'foo'},forced=null,ctrl,$output;var args={property:'testKey',updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',placeholder:'place',model:testModel};describe('controller',function(){beforeAll(function(){ctrl=AdminInputAction.controller({data:args,item:item});});it('should instantiate a submit function',function(){expect(ctrl.submit).toBeFunction();});it('should return a toggler prop',function(){expect(ctrl.toggler).toBeFunction();});it('should return a value property to bind to',function(){expect(ctrl.newValue).toBeFunction();});describe('when forceValue is set',function(){beforeAll(function(){args.forceValue=forced;ctrl=AdminInputAction.controller({data:args,item:item});});it('should initialize newValue with forced value',function(){expect(ctrl.newValue()).toEqual(forced);});afterAll(function(){delete args.forceValue;});});});describe('view',function(){beforeEach(function(){$output=mq(AdminInputAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a placeholder',function(){expect($output.has('input[placeholder="'+args.placeholder+'"]')).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});describe('when forceValue is set',function(){beforeAll(function(){args.forceValue=forced;ctrl=AdminInputAction.controller({data:args,item:item});});it('should initialize newValue with forced value',function(){expect(ctrl.newValue()).toEqual(forced);});afterAll(function(){delete args.forceValue;});});});describe('on form submit',function(){beforeAll(function(){spyOn(m,'request').and.returnValue({then:function then(callback){callback([{test:true}]);}});});beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');expect(m.request).toHaveBeenCalled();});});});});describe('AdminItem',function(){var c=window.c,AdminItem=c.AdminItem,item,$output,ListItemMock,ListDetailMock;beforeAll(function(){ListItemMock={view:function view(ctrl,args){return m('.list-item-mock');}};ListDetailMock={view:function view(ctrl,args){return m('.list-detail-mock');}};});describe('view',function(){beforeEach(function(){$output=mq(AdminItem,{listItem:ListItemMock,listDetail:ListDetailMock,item:item});});it('should render list item',function(){$output.should.have('.list-item-mock');});it('should render list detail when toggle details is true',function(){$output.click('button');$output.should.have('.list-detail-mock');});it('should not render list detail when toggle details is false',function(){$output.should.not.have('.list-detail-mock');});});});describe('AdminList',function(){var c=window.c,AdminList=c.AdminList,$output=void 0,model=void 0,vm=void 0,ListItemMock=void 0,ListDetailMock=void 0,results=[{id:1}],listParameters=void 0,endpoint=void 0;beforeAll(function(){endpoint=mockEndpoint('items',results);ListItemMock={view:function view(ctrl,args){return m('.list-item-mock');}};ListDetailMock={view:function view(ctrl,args){return m('');}};model=m.postgrest.model('items');vm={list:m.postgrest.paginationVM(model),error:m.prop()};listParameters={vm:vm,listItem:ListItemMock,listDetail:ListDetailMock};});describe('view',function(){describe('when not loading',function(){beforeEach(function(){spyOn(vm.list,"isLoading").and.returnValue(false);$output=mq(AdminList,listParameters);});it('should render fetched items',function(){expect($output.find('.card').length).toEqual(results.length);});it('should not show a loading icon',function(){$output.should.not.have('img[alt="Loader"]');});});describe('when loading',function(){beforeEach(function(){spyOn(vm.list,"isLoading").and.returnValue(true);$output=mq(AdminList,listParameters);});it('should render fetched items',function(){expect($output.find('.card').length).toEqual(results.length);});it('should show a loading icon',function(){$output.should.have('img[alt="Loader"]');});});describe('when error',function(){beforeEach(function(){vm.error('endpoint error');$output=mq(AdminList,listParameters);});it('should show an error info',function(){expect($output.has('.card-error')).toBeTrue();});});});});describe('AdminNotificationHistory',function(){var c=window.c,user=void 0,historyBox=void 0,ctrl=void 0,view=void 0,$output=void 0;beforeAll(function(){user=m.prop(UserDetailMockery(1));$output=mq(c.AdminNotificationHistory,{user:user()[0]});});describe('view',function(){it('should render fetched notifications',function(){expect($output.find('.date-event').length).toEqual(1);});});});describe('AdminProjectDetailsCard',function(){var AdminProjectDetailsCard=window.c.AdminProjectDetailsCard,generateController=void 0,ctrl=void 0,projectDetail=void 0,component=void 0,view=void 0,$output=void 0;describe('controller',function(){beforeAll(function(){generateController=function generateController(attrs){projectDetail=ProjectDetailsMockery(attrs)[0];component=m.component(AdminProjectDetailsCard,{resource:projectDetail});return component.controller();};});describe('project status text',function(){it('when project is online',function(){ctrl=generateController({state:'online'});expect(ctrl.statusTextObj().text).toEqual('NO AR');expect(ctrl.statusTextObj().cssClass).toEqual('text-success');});it('when project is failed',function(){ctrl=generateController({state:'failed'});expect(ctrl.statusTextObj().text).toEqual('NÃO FINANCIADO');expect(ctrl.statusTextObj().cssClass).toEqual('text-error');});});describe('project remaining time',function(){it('when remaining time is in days',function(){ctrl=generateController({remaining_time:{total:10,unit:'days'}});expect(ctrl.remainingTextObj.total).toEqual(10);expect(ctrl.remainingTextObj.unit).toEqual('dias');});it('when remaining time is in seconds',function(){ctrl=generateController({remaining_time:{total:12,unit:'seconds'}});expect(ctrl.remainingTextObj.total).toEqual(12);expect(ctrl.remainingTextObj.unit).toEqual('segundos');});it('when remaining time is in hours',function(){ctrl=generateController({remaining_time:{total:2,unit:'hours'}});expect(ctrl.remainingTextObj.total).toEqual(2);expect(ctrl.remainingTextObj.unit).toEqual('horas');});});});describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];component=m.component(AdminProjectDetailsCard,{resource:projectDetail});ctrl=component.controller();view=component.view(ctrl,{resource:projectDetail});$output=mq(view);});it('should render details of the project in card',function(){var remaningTimeObj=ctrl.remainingTextObj,statusTextObj=ctrl.statusTextObj();expect($output.find('.project-details-card').length).toEqual(1);expect($output.contains(projectDetail.total_contributions)).toEqual(true);expect($output.contains('R$ '+window.c.h.formatNumber(projectDetail.pledged,2))).toEqual(true);});});});describe('AdminRadioAction',function(){var c=window.c,m=window.m,models=window.c.models,AdminRadioAction=c.AdminRadioAction,testModel=m.postgrest.model('reward_details'),testStr='updated',errorStr='error!';var error=false,item=void 0,fakeData={},$output=void 0;var args={getKey:'project_id',updateKey:'contribution_id',selectKey:'reward_id',radios:'rewards',callToAction:'Alterar Recompensa',outerLabel:'Recompensa',getModel:testModel,updateModel:testModel,validate:function validate(){return undefined;}};var errorArgs=_.extend({},args,{validate:function validate(){return errorStr;}});describe('view',function(){beforeAll(function(){item=_.first(RewardDetailsMockery());args.selectedItem=m.prop(item);$output=mq(AdminRadioAction,{data:args,item:m.prop(item)});});it('shoud only render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.callToAction)).toBeFalse();});describe('on action button click',function(){beforeAll(function(){$output.click('button');});it('should render a row of radio inputs',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect($output.find('input[type="radio"]').length).toEqual(JSON.parse(lastRequest.responseText).length);});it('should render the description of the default selected radio',function(){$output.should.contain(item.description);});it('should send an patch request on form submit',function(){$output.click('#r-0');$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent(); // Should make a patch request to update item
  expect(lastRequest.method).toEqual('PATCH');});describe('when new value is not valid',function(){beforeAll(function(){$output=mq(AdminRadioAction,{data:errorArgs,item:m.prop(item)});$output.click('button');$output.click('#r-0');});it('should present an error message when new value is invalid',function(){$output.trigger('form','submit');$output.should.contain(errorStr);});});});});});describe('AdminReward',function(){var ctrl=void 0,$output=void 0,c=window.c,AdminReward=c.AdminReward;describe('view',function(){var reward=void 0,ctrl=void 0;describe("when contribution has no reward",function(){beforeAll(function(){$output=mq(AdminReward.view(undefined,{reward:m.prop({})}));});it('should render "no reward" text when reward_id is null',function(){$output.should.contain('Apoio sem recompensa');});});describe("when contribution has reward",function(){var reward=void 0;beforeAll(function(){reward=m.prop(RewardDetailsMockery()[0]);$output=mq(AdminReward.view(undefined,{reward:reward}));});it("should render reward description when we have a reward_id",function(){$output.should.contain(reward().description);});});});});describe('AdminTransactionHistory',function(){var c=window.c,contribution=void 0,historyBox=void 0,ctrl=void 0,view=void 0,$output=void 0;beforeAll(function(){contribution=m.prop(ContributionDetailMockery(1));historyBox=m.component(c.AdminTransactionHistory,{contribution:contribution()[0]});ctrl=historyBox.controller();view=historyBox.view(ctrl,{contribution:contribution});$output=mq(view);});describe('controller',function(){it('should have orderedEvents',function(){expect(ctrl.orderedEvents.length).toEqual(2);});it('should have formated the date on orderedEvents',function(){expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');});});describe('view',function(){it('should render fetched orderedEvents',function(){expect($output.find('.date-event').length).toEqual(2);});});});describe('AdminTransaction',function(){var c=window.c,contribution=void 0,detailedBox=void 0,view=void 0,$output=void 0;beforeAll(function(){contribution=m.prop(ContributionDetailMockery(1,{gateway_data:null}));detailedBox=m.component(c.AdminTransaction,{contribution:contribution()[0]});view=detailedBox.view(null,{contribution:contribution});$output=mq(view);});describe('view',function(){it('should render details about contribution',function(){expect($output.contains('Valor: R$50,00')).toBeTrue();expect($output.contains('Meio: MoIP')).toBeTrue();});});});describe('AdminUser',function(){var c=window.c,AdminUser=c.AdminUser,item,$output;describe('view',function(){beforeAll(function(){item=ContributionDetailMockery(1)[0];$output=mq(AdminUser.view(null,{item:item}));});it('should build an item from an item describer',function(){expect($output.has('.user-avatar')).toBeTrue();expect($output.contains(item.email)).toBeTrue();});});});describe('admin.Contributions',function(){var AdminContributions=null,Contributions=window.c.admin.Contributions,ctrl=null,$output;beforeAll(function(){AdminContributions=m.component(Contributions);ctrl=AdminContributions.controller();});describe('controller',function(){it('should instantiate a list view-model',function(){expect(ctrl.listVM).toBeDefined();});it('should instantiate a filter view-model',function(){expect(ctrl.filterVM).toBeDefined();});});describe('view',function(){beforeAll(function(){$output=mq(Contributions);});it('should render AdminFilter nested component',function(){expect($output.has('#admin-contributions-filter')).toBeTrue();});it('should render AdminList nested component',function(){expect($output.has('#admin-contributions-list')).toBeTrue();});});});describe('admin.contributionFilterVM',function(){var adminApp=window.c.admin,vm=adminApp.contributionFilterVM,momentFromString=window.c.h.momentFromString;describe("created_at.lte.toFilter",function(){it("should use end of the day timestamp to send filter",function(){vm.created_at.lte('21/12/1999');expect(vm.created_at.lte.toFilter()).toEqual(momentFromString(vm.created_at.lte()).endOf('day').format());});});describe("full_text_index.toFilter",function(){it("should remove all diacritics to send filter",function(){vm.full_text_index('rémoção dos acêntüs');expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');});});});describe('admin.Users',function(){var AdminUsers=null,Users=window.c.admin.Users,ctrl=null,$output;beforeAll(function(){AdminUsers=m.component(Users);ctrl=AdminUsers.controller();});describe('controller',function(){it('should instantiate a list view-model',function(){expect(ctrl.listVM).toBeDefined();});it('should instantiate a filter view-model',function(){expect(ctrl.filterVM).toBeDefined();});});describe('view',function(){beforeAll(function(){$output=mq(Users);});it('should render AdminFilter nested component',function(){expect($output.has('#admin-contributions-filter')).toBeTrue();});it('should render AdminList nested component',function(){expect($output.has('#admin-contributions-list')).toBeTrue();});});});describe('admin.userFilterVM',function(){var adminApp=window.c.admin,vm=adminApp.userFilterVM;describe("deactivated_at.toFilter",function(){it("should parse string inputs to json objects to send filter",function(){vm.deactivated_at('null');expect(vm.deactivated_at.toFilter()).toEqual(null);});});describe("full_text_index.toFilter",function(){it("should remove all diacritics to send filter",function(){vm.full_text_index('rémoção dos acêntüs');expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');});});});describe('CategoryButton',function(){var $output=void 0,c=window.c;describe('view',function(){beforeAll(function(){$output=mq(m.component(c.CategoryButton,{category:{id:1,name:'cat',online_projects:1}}));});it('should build a link with .btn-category',function(){expect($output.has('a.btn-category')).toBeTrue();});});});describe('FilterButton',function(){var $output=void 0,c=window.c;describe('view',function(){beforeAll(function(){$output=mq(m.component(c.FilterButton,{title:'Test',href:'test'}));});it('should build a link with .filters',function(){expect($output.has('a.filters')).toBeTrue();});});});describe('PaymentStatus',function(){var c=window.c,ctrl,setController=function setController(contribution){var payment={gateway:contribution.gateway,gateway_data:contribution.gateway_data,installments:contribution.installments,state:contribution.state,payment_method:contribution.payment_method};ctrl=m.component(c.PaymentStatus,{item:payment}).controller();};describe('stateClass function',function(){it('should return a success CSS class when contribution state is paid',function(){var contribution=ContributionDetailMockery(1,{state:'paid'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-success');});it('should return a success CSS class when contribution state is refunded',function(){var contribution=ContributionDetailMockery(1,{state:'refunded'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-refunded');});it('should return a warning CSS class when contribution state is pending',function(){var contribution=ContributionDetailMockery(1,{state:'pending'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-waiting');});it('should return an error CSS class when contribution state is refused',function(){var contribution=ContributionDetailMockery(1,{state:'refused'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-error');});it('should return an error CSS class when contribution state is not known',function(){var contribution=ContributionDetailMockery(1,{state:'foo'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-error');});});describe('paymentMethodClass function',function(){var CSSboleto='.fa-barcode',CSScreditcard='.fa-credit-card',CSSerror='.fa-question';it('should return a boleto CSS class when contribution payment method is boleto',function(){var contribution=ContributionDetailMockery(1,{payment_method:'BoletoBancario'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);});it('should return a credit card CSS class when contribution payment method is credit card',function(){var contribution=ContributionDetailMockery(1,{payment_method:'CartaoDeCredito'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);});it('should return an error CSS class when contribution payment method is not known',function(){var contribution=ContributionDetailMockery(1,{payment_method:'foo'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSSerror);});});describe('view',function(){var getOutput=function getOutput(payment_method){var contribution=ContributionDetailMockery(1,{payment_method:payment_method})[0],payment={gateway:contribution.gateway,gateway_data:contribution.gateway_data,installments:contribution.installments,state:contribution.state,payment_method:contribution.payment_method};return mq(m.component(c.PaymentStatus,{item:payment}));};it('should return an HTML element describing a boleto when payment_method is boleto',function(){expect(getOutput('BoletoBancario').has('#boleto-detail')).toBeTrue();});it('should return an HTML element describing a credit card when payment_method is credit card',function(){expect(getOutput('CartaoDeCredito').has('#creditcard-detail')).toBeTrue();});});});describe('ProjectAbout',function(){var $output=void 0,projectDetail=void 0,rewardDetail=void 0,ProjectAbout=window.c.ProjectAbout;describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];rewardDetail=RewardDetailsMockery()[0];var component=m.component(ProjectAbout,{project:m.prop(projectDetail),rewardDetails:m.prop(RewardDetailsMockery())}),view=component.view();$output=mq(view);});it('should render project about and reward list',function(){expect($output.contains(projectDetail.about_html)).toEqual(true);expect($output.contains(rewardDetail.description)).toEqual(true);});});});describe('ProjectCard',function(){var ProjectCard=window.c.ProjectCard,project=void 0,component=void 0,view=void 0,$output=void 0,$customOutput=void 0,remainingTimeObj=void 0;describe('view',function(){beforeAll(function(){project=ProjectMockery()[0];remainingTimeObj=window.c.h.translatedTime(project.remaining_time);$output=function $output(type){return mq(m.component(ProjectCard,{project:project,type:type}));};});it('should render the project card',function(){expect($output().find('.card-project').length).toEqual(1);expect($output().contains(project.owner_name)).toEqual(true);expect($output().contains(remainingTimeObj.unit)).toEqual(true);});it('should render a big project card when type is big',function(){expect($output('big').find('.card-project-thumb.big').length).toEqual(1);expect($output('big').contains(project.owner_name)).toEqual(true);expect($output('big').contains(remainingTimeObj.unit)).toEqual(true);});it('should render a medium project card when type is medium',function(){expect($output('medium').find('.card-project-thumb.medium').length).toEqual(1);expect($output('medium').contains(project.owner_name)).toEqual(true);expect($output('medium').contains(remainingTimeObj.unit)).toEqual(true);});});});describe('ProjectContributions',function(){var $output=void 0,projectContribution=void 0,ProjectContributions=window.c.ProjectContributions;describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(new RegExp('('+apiPrefix+'\/project_contributions)(.*)(waiting_payment)(.*)')).andReturn({'responseText':JSON.stringify(ProjectContributionsMockery())});spyOn(m,'component').and.callThrough();projectContribution=ProjectContributionsMockery()[0];var project=m.prop({id:1231});var component=m.component(ProjectContributions,{project:project}),view=component.view(component.controller({project:project}));$output=mq(view);});it('should render project contributions list',function(){expect($output.contains(projectContribution.user_name)).toEqual(true);});});});describe('ProjectDashboardMenu',function(){var generateContextByNewState=void 0,ProjectDashboardMenu=window.c.ProjectDashboardMenu;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];var body=jasmine.createSpyObj('body',['className']),projectDetail=m.prop(ProjectDetailsMockery(newState)[0]),component=m.component(ProjectDashboardMenu,{project:projectDetail}),ctrl=component.controller({project:projectDetail});spyOn(m,'component').and.callThrough();spyOn(ctrl,'body').and.returnValue(body);return {output:mq(component,{project:projectDetail}),projectDetail:projectDetail};};});it('when project is online',function(){var _generateContextByNew=generateContextByNewState({state:'online'});var output=_generateContextByNew.output;var projectDetail=_generateContextByNew.projectDetail;output.should.contain(projectDetail().name);output.should.have('#info-links');});});});describe('ProjectHeader',function(){var $output=void 0,projectDetail=void 0,ProjectHeader=window.c.ProjectHeader;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectHeader,{project:projectDetail,userDetails:m.prop([])}),view=component.view(null,{project:projectDetail,userDetails:m.prop([])});$output=mq(view);});it('should a project header',function(){expect($output.find('#project-header').length).toEqual(1);expect($output.contains(projectDetail().name)).toEqual(true);});it('should render project-highlight / project-sidebar component area',function(){expect($output.find('.project-highlight').length).toEqual(1);expect($output.find('#project-sidebar').length).toEqual(1);});});});describe('ProjectHighlight',function(){var $output=void 0,projectDetail=void 0,ProjectHighlight=window.c.ProjectHighlight;it('when project video is not filled should render image',function(){projectDetail=m.prop(_.extend({},ProjectDetailsMockery()[0],{original_image:'original_image',video_embed_url:null}));var component=m.component(ProjectHighlight,{project:projectDetail}),view=component.view(component.controller(),{project:projectDetail});$output=mq(view);expect($output.find('.project-image').length).toEqual(1);expect($output.find('iframe.embedly-embed').length).toEqual(0);});describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectHighlight,{project:projectDetail}),view=component.view(component.controller(),{project:projectDetail});$output=mq(ProjectHighlight,{project:projectDetail});});it('should render project video, headline, category and address info',function(){expect($output.find('iframe.embedly-embed').length).toEqual(1);expect($output.find('span.fa.fa-map-marker').length).toEqual(1);expect($output.contains(projectDetail().address.city)).toEqual(true);});it('should render project share box when click on share',function(){$output.click('#share-box');$output.redraw();$output.should.have('.pop-share');});});});describe('ProjectMode',function(){var ProjectCard=window.c.ProjectMode,project=void 0,component=void 0,view=void 0,$output=void 0;describe('view',function(){beforeAll(function(){project=m.prop(ProjectMockery()[0]);});it('should render the project mode',function(){component=m.component(ProjectCard,{project:project});$output=mq(component);expect($output.find('.w-row').length).toEqual(1);});it('should render the project mode when goal is null',function(){component=m.component(ProjectCard,{project:m.prop(_.extend({},project,{goal:null}))});$output=mq(component);expect($output.find('.w-row').length).toEqual(1);});});});describe('ProjectPosts',function(){var $output=void 0,projectPostDetail=void 0,ProjectPosts=window.c.ProjectPosts;describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();projectPostDetail=ProjectPostDetailsMockery()[0];var project=m.prop({id:1231});var component=m.component(ProjectPosts,{project:project}),view=component.view(component.controller({project:project}));$output=mq(view);});it('should render project post list',function(){expect($output.find('.post').length).toEqual(1);expect($output.contains(projectPostDetail.title)).toEqual(true);});});});describe('ProjectReminderCount',function(){var $output=void 0,projectDetail=void 0,ProjectReminderCount=window.c.ProjectReminderCount;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectReminderCount,{resource:projectDetail}),view=component.view(null,{resource:projectDetail});$output=mq(view);});it('should render reminder total count',function(){expect($output.find('#project-reminder-count').length).toEqual(1);});});});describe('ProjectRewardList',function(){var generateContextByNewState=void 0,ProjectRewardList=window.c.ProjectRewardList;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];spyOn(m,'component').and.callThrough();var rewardDetail=RewardDetailsMockery(newState),component=m.component(ProjectRewardList,{project:m.prop({id:1231}),rewardDetails:m.prop(rewardDetail)});return {output:mq(component.view()),rewardDetail:rewardDetail[0]};};});it('should render card-gone when reward sould out',function(){var _generateContextByNew=generateContextByNewState({maximum_contributions:4,paid_count:4});var output=_generateContextByNew.output;var rewardDetail=_generateContextByNew.rewardDetail;expect(output.find('.card-gone').length).toEqual(1);expect(output.contains('Esgotada')).toEqual(true);});it('should render card-reward when reward is not sould out',function(){var _generateContextByNew2=generateContextByNewState({maximum_contributions:null});var output=_generateContextByNew2.output;var rewardDetail=_generateContextByNew2.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Esgotada')).toEqual(false);});it('should render card-reward stats when reward is limited',function(){var _generateContextByNew3=generateContextByNewState({maximum_contributions:10,paid_count:2,waiting_payment_count:5});var output=_generateContextByNew3.output;var rewardDetail=_generateContextByNew3.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Limitada')).toEqual(true);expect(output.contains('(3 de 10 disponíveis)')).toEqual(true);expect(output.contains('2 apoios')).toEqual(true);expect(output.contains('5 apoios em prazo de confirmação')).toEqual(true);});it('should render card-reward details',function(){var _generateContextByNew4=generateContextByNewState({minimum_value:20});var output=_generateContextByNew4.output;var rewardDetail=_generateContextByNew4.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Para R$ 20 ou mais')).toEqual(true);expect(output.contains('Estimativa de Entrega:')).toEqual(true);expect(output.contains(window.c.h.momentify(rewardDetail.deliver_at,'MMM/YYYY'))).toEqual(true);expect(output.contains(rewardDetail.description)).toEqual(true);});});});describe('ProjectRow',function(){var $output,ProjectRow=window.c.ProjectRow;describe('view',function(){var collection={title:'test collection',hash:'testhash',collection:m.prop([]),loader:m.prop(false)};describe('when we have a ref parameter',function(){it('should not render row',function(){var _ProjectMockery=ProjectMockery();var _ProjectMockery2=babelHelpers.slicedToArray(_ProjectMockery,1);var project=_ProjectMockery2[0];collection.collection([project]);var component=m.component(ProjectRow),view=component.view(null,{collection:collection,ref:'ref_test'});$output=mq(view);expect($output.find('.card-project a[href="/'+project.permalink+'?ref=ref_test"]').length).toEqual(3);});});describe('when collection is empty and loader true',function(){beforeAll(function(){collection.collection([]);collection.loader(true);var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render loader',function(){expect($output.find('img[alt="Loader"]').length).toEqual(1);});});describe('when collection is empty and loader false',function(){beforeAll(function(){collection.collection([]);collection.loader(false);var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render nothing',function(){expect($output.find('img[alt="Loader"]').length).toEqual(0);expect($output.find('.w-section').length).toEqual(0);});});describe('when collection has projects',function(){beforeAll(function(){collection.collection(ProjectMockery());var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render projects in row',function(){expect($output.find('.w-section').length).toEqual(1);});});});});describe('ProjectShareBox',function(){var $output=void 0,projectDetail=void 0,ProjectShareBox=window.c.ProjectShareBox;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var args={project:projectDetail,displayShareBox:{toggle:jasmine.any(Function)}},component=m.component(ProjectShareBox,args),view=component.view(component.controller(),args);$output=mq(ProjectShareBox,args);});it('should render project project share pop',function(){$output.should.have('.pop-share');$output.should.have('.w-widget-facebook');$output.should.have('.w-widget-twitter');$output.should.have('.widget-embed');});it('should open embed box when click on embed',function(){$output.click('a.widget-embed');$output.should.have('.embed-expanded');});});});describe('ProjectSidebar',function(){var generateContextByNewState=void 0,ProjectSidebar=window.c.ProjectSidebar;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];spyOn(m,'component').and.callThrough();var projectDetail=m.prop(_.extend({},ProjectDetailsMockery()[0],newState)),component=m.component(ProjectSidebar,{project:projectDetail,userDetails:m.prop([])}),ctrl=component.controller({project:projectDetail,userDetails:m.prop([])}),view=component.view(component.controller(),{project:projectDetail,userDetails:m.prop([])});return {output:mq(view),ctrl:ctrl,projectDetail:projectDetail};};});it('should render project stats',function(){var _generateContextByNew=generateContextByNewState({state:'successful'});var output=_generateContextByNew.output;var projectDetail=_generateContextByNew.projectDetail;expect(output.find('#project-sidebar.aside').length).toEqual(1);expect(output.find('.card-success').length).toEqual(1);});it('should render a all or nothing badge when is aon',function(){var _generateContextByNew2=generateContextByNewState({mode:'aon'});var output=_generateContextByNew2.output;var projectDetail=_generateContextByNew2.projectDetail;expect(output.find('#aon').length).toEqual(1);});it('should render a flex badge when project mode is flexible',function(){var _generateContextByNew3=generateContextByNewState({mode:'flex'});var output=_generateContextByNew3.output;var projectDetail=_generateContextByNew3.projectDetail;expect(output.find('#flex').length).toEqual(1);});describe('reminder',function(){it('should render reminder when project is open_for_contributions and user signed in and is in_reminder',function(){var _generateContextByNew4=generateContextByNewState({open_for_contributions:true,user_signed_in:true,in_reminder:true});var output=_generateContextByNew4.output;var projectDetail=_generateContextByNew4.projectDetail;expect(output.contains('Lembrete ativo')).toEqual(true);expect(output.find('#project-reminder').length).toEqual(1);});it('should render reminder when project is open_for_contributions and user signed in ant not in_reminder',function(){var _generateContextByNew5=generateContextByNewState({open_for_contributions:true,user_signed_in:true,in_reminder:false});var output=_generateContextByNew5.output;var projectDetail=_generateContextByNew5.projectDetail;expect(output.contains('Lembrar-me')).toEqual(true);expect(output.find('#project-reminder').length).toEqual(1);});it('should render reminder when project is open_for_contributions and user not signed in',function(){var _generateContextByNew6=generateContextByNewState({open_for_contributions:true,user_signed_in:false});var output=_generateContextByNew6.output;var projectDetail=_generateContextByNew6.projectDetail;expect(output.find('#project-reminder').length).toEqual(1);});it('should not render reminder when project is not open_for_contributions and user signed in',function(){var _generateContextByNew7=generateContextByNewState({open_for_contributions:false,user_signed_in:true});var output=_generateContextByNew7.output;var projectDetail=_generateContextByNew7.projectDetail;expect(output.find('#project-reminder').length).toEqual(0);});});});});describe('ProjectTabs',function(){var $output=void 0,projectDetail=void 0,ProjectTabs=window.c.ProjectTabs;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectTabs,{project:m.prop(projectDetail),rewardDetails:m.prop([])});$output=mq(component);});it('should render project-tabs',function(){expect($output.find('a.dashboard-nav-link').length).toEqual(5);expect($output.find('a#about-link').length).toEqual(1);});it('should call hashMatch when click on some link',function(){var oldHash=window.location.hash;window.location.hash='posts';$output.redraw();$output.should.have('a#posts-link.selected');window.location.hash=oldHash;});});});describe('ProjectsDashboard',function(){var $output=void 0,projectDetail=void 0,ProjectsDashboard=window.c.root.ProjectsDashboard;describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];var component=m.component(ProjectsDashboard,{project_id:projectDetail.project_id,project_user_id:projectDetail.user.id});$output=mq(component);});it('should render project about and reward list',function(){expect($output.has('.project-nav-wrapper')).toBeTrue();});});});describe('pages.LiveStatistics',function(){var $output=void 0,statistic=void 0,LiveStatistics=window.c.root.LiveStatistics;describe('view',function(){beforeAll(function(){statistic=StatisticMockery()[0];var component=m.component(LiveStatistics);$output=mq(component.view(component.controller(),{}));});it('should render statistics',function(){expect($output.contains(window.c.h.formatNumber(statistic.total_contributed,2,3))).toEqual(true);expect($output.contains(statistic.total_contributors)).toEqual(true);});});});describe('ProjectsExplore',function(){var $output=void 0,project=void 0,component=void 0,ProjectsExplore=window.c.root.ProjectsExplore;beforeAll(function(){window.location.hash='#by_category_id/1';component=m.component(ProjectsExplore);$output=mq(component);});it('should render search container',function(){$output.should.have('.hero-search');});});describe('ProjectShow',function(){var $output=void 0,projectDetail=void 0,ProjectShow=window.c.root.ProjectsShow;beforeAll(function(){window.location.hash='';projectDetail=ProjectDetailsMockery()[0];var component=m.component(ProjectShow,{project_id:123,project_user_id:1231}),view=component.view(component.controller());$output=mq(view);});it('should render project some details',function(){expect($output.contains(projectDetail.name)).toEqual(true);$output.should.have('#project-sidebar');$output.should.have('#project-header');$output.should.have('.project-highlight');$output.should.have('.project-nav');$output.should.have('#rewards');});});describe('UsersBalance',function(){var $output=void 0,component=void 0,UsersBalance=window.c.root.UsersBalance;beforeAll(function(){component=m.component(UsersBalance,{user_id:1});$output=mq(component);});it('should render user balance area',function(){$output.should.have('.user-balance-section');});it('should render user balance transactions area',function(){$output.should.have('.balance-transactions-area');});});describe('Search',function(){var $output=void 0,c=window.c,Search=c.Search,action='/test',method='POST';describe('view',function(){beforeEach(function(){$output=mq(Search.view({},{action:action,method:method}));});it('should render the search form',function(){expect($output.find('form').length).toEqual(1);expect($output.find('input[type="text"]').length).toEqual(1);expect($output.find('button').length).toEqual(1);});it('should set the given action',function(){expect($output.find('form[action="'+action+'"]').length).toEqual(1);});it('should set the given method',function(){expect($output.find('form[method="'+method+'"]').length).toEqual(1);});});});describe('Slider',function(){var $output=void 0,c=window.c,m=window.m,title='TitleSample',defaultDocumentWidth=1600,slides=[m('h1','teste'),m('h1','teste'),m('h1','teste'),m('h1','teste')];describe('view',function(){beforeEach(function(){$output=mq(c.Slider,{title:title,slides:slides});});it('should render all the slides',function(){expect($output.find('.slide').length).toEqual(slides.length);});it('should render one bullet for each slide',function(){expect($output.find('.slide-bullet').length).toEqual(slides.length);});it('should move to next slide on slide next click',function(){$output.click('#slide-next');var firstSlide=$output.first('.slide');expect(firstSlide.attrs.style.indexOf('-'+defaultDocumentWidth+'px')).toBeGreaterThan(-1);});it('should move to previous slide on slide prev click',function(){$output.click('#slide-next');$output.click('#slide-prev');var firstSlide=$output.first('.slide');expect(firstSlide.attrs.style.indexOf('0px')).toBeGreaterThan(-1);});});});describe('TeamMembers',function(){var $output,TeamMembers=window.c.TeamMembers;describe('view',function(){beforeAll(function(){$output=mq(TeamMembers);});it('should render fetched team members',function(){expect($output.has('#team-members-static')).toEqual(true);expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);});});});describe('TeamTotal',function(){var $output=void 0,TeamTotal=window.c.TeamTotal;describe('view',function(){beforeAll(function(){$output=mq(TeamTotal);});it('should render fetched team total info',function(){expect($output.find('#team-total-static').length).toEqual(1);});});});describe('Tooltip',function(){var $output=void 0,c=window.c,m=window.m,element='a#tooltip-trigger[href="#"]',text='tooltipText',tooltip=function tooltip(el){return m.component(c.Tooltip,{el:el,text:text,width:320});};describe('view',function(){beforeEach(function(){$output=mq(tooltip(element));});it('should not render the tooltip at first',function(){expect($output.find('.tooltip').length).toEqual(0);});it('should render the tooltip on element mouseenter',function(){$output.click('#tooltip-trigger');expect($output.find('.tooltip').length).toEqual(1);expect($output.contains(text)).toBeTrue();});it('should hide the tooltip again on element mouseleave',function(){$output.click('#tooltip-trigger');$output.click('#tooltip-trigger');expect($output.find('.tooltip').length).toEqual(0);});});});describe('UserBalanceRequestModalContent',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalanceModal=window.c.UserBalanceRequestModalContent;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalanceModal,_.extend({},parentComponent.controller(),{balance:{amount:205,user_id:1}}));$output=mq(component);});it('should call bank account endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/bank_accounts?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user bank account / amount data',function(){expect($output.contains('R$ 205,00')).toEqual(true);expect($output.contains('Banco XX')).toEqual(true);$output.should.have('.btn-request-fund');});it('should call balance transfer endpoint when click on request fund btn and show success message',function(){$output.click('.btn-request-fund');$output.should.have('.fa-check-circle');var lastRequest=jasmine.Ajax.requests.filter(/balance_transfers/)[0];expect(lastRequest.url).toEqual(apiPrefix+'/balance_transfers');expect(lastRequest.method).toEqual('POST');});});describe('UserBalanceTransactions',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalanceTransactions=window.c.UserBalanceTransactions;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalanceTransactions,_.extend({},parentComponent.controller(),{user_id:1}));$output=mq(component);});it('should call balance transactions endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/balance_transactions?order=created_at.desc&user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user balance transactions',function(){$output.should.have('.card-detailed-open');expect($output.contains('R$ 604,50')).toEqual(true);expect($output.contains('R$ 0,00')).toEqual(true);expect($output.contains('R$ -604,50')).toEqual(true);expect($output.contains('Project x')).toEqual(true);});});describe('UserBalance',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalance=window.c.UserBalance;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalance,_.extend({},parentComponent.controller(),{user_id:1}));$output=mq(component);});it('should call balances endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/balances?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user balance',function(){expect($output.contains('R$ 205,00')).toEqual(true);});it('should render request fund btn',function(){$output.should.have('.r-fund-btn');});it('should call bank_account endpoint when click on request fund btn and show modal',function(){$output.click('.r-fund-btn');$output.should.have('.modal-dialog-inner');expect($output.contains('Banco XX')).toEqual(true);var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/bank_accounts?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});});describe('YoutubeLightbox',function(){var $output=void 0,c=window.c,m=window.m,visibleStyl='display:block',invisibleStyl='display:none';describe('view',function(){beforeEach(function(){$output=mq(c.YoutubeLightbox,{src:'FlFTcDSKnLM'});});it('should not render the lightbox at first',function(){expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);});it('should render the lightbox on play button click',function(){$output.click('#youtube-play');expect($output.find('#lightbox')[0].attrs.style).toEqual(visibleStyl);});it('should close the lightbox on close button click',function(){$output.click('#youtube-play');$output.click('#youtube-close');expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);});});});describe("h.formatNumber",function(){var number=null,formatNumber=window.c.h.formatNumber;it("should format number",function(){number=120.20;expect(formatNumber(number)).toEqual('120');expect(formatNumber(number,2,3)).toEqual('120,20');expect(formatNumber(number,2,2)).toEqual('1.20,20');});});describe('h.rewardSouldOut',function(){var reward=null,rewardSouldOut=window.c.h.rewardSouldOut;it('return true when reward already sould out',function(){reward={maximum_contributions:5,paid_count:3,waiting_payment_count:2};expect(rewardSouldOut(reward)).toEqual(true);});it('return false when reward is not sould out',function(){reward={maximum_contributions:5,paid_count:3,waiting_payment_count:1};expect(rewardSouldOut(reward)).toEqual(false);});it('return false when reward is not defined maximum_contributions',function(){reward={maximum_contributions:null,paid_count:3,waiting_payment_count:1};expect(rewardSouldOut(reward)).toEqual(false);});});describe('h.rewardRemaning',function(){var reward=void 0,rewardRemaning=window.c.h.rewardRemaning;it('should return the total remaning rewards',function(){reward={maximum_contributions:10,paid_count:3,waiting_payment_count:2};expect(rewardRemaning(reward)).toEqual(5);});});describe('h.parseUrl',function(){var url=void 0,parseUrl=window.c.h.parseUrl;it('should create an a element',function(){url='http://google.com';expect(parseUrl(url).hostname).toEqual('google.com');});});describe('h.pluralize',function(){var count=void 0,pluralize=window.c.h.pluralize;it('should use plural when count greater 1',function(){count=3;expect(pluralize(count,' dia',' dias')).toEqual('3 dias');});it('should use singular when count less or equal 1',function(){count=1;expect(pluralize(count,' dia',' dias')).toEqual('1 dia');});});})(this.spec=this.spec||{},m,postgrest,_,moment,I18n);var models={contributionDetail:postgrest.model('contribution_details'),contributionActivity:postgrest.model('contribution_activities'),projectDetail:postgrest.model('project_details'),userDetail:postgrest.model('user_details'),balance:postgrest.model('balances'),balanceTransaction:postgrest.model('balance_transactions'),balanceTransfer:postgrest.model('balance_transfers'),user:postgrest.model('users'),bankAccount:postgrest.model('bank_accounts'),rewardDetail:postgrest.model('reward_details'),projectReminder:postgrest.model('project_reminders'),contributions:postgrest.model('contributions'),directMessage:postgrest.model('direct_messages'),teamTotal:postgrest.model('team_totals'),projectAccount:postgrest.model('project_accounts'),projectContribution:postgrest.model('project_contributions'),projectPostDetail:postgrest.model('project_posts_details'),projectContributionsPerDay:postgrest.model('project_contributions_per_day'),projectContributionsPerLocation:postgrest.model('project_contributions_per_location'),projectContributionsPerRef:postgrest.model('project_contributions_per_ref'),project:postgrest.model('projects'),projectSearch:postgrest.model('rpc/project_search'),category:postgrest.model('categories'),categoryTotals:postgrest.model('category_totals'),categoryFollower:postgrest.model('category_followers'),teamMember:postgrest.model('team_members'),notification:postgrest.model('notifications'),statistic:postgrest.model('statistics'),successfulProject:postgrest.model('successful_projects')};models.teamMember.pageSize(40);models.rewardDetail.pageSize(false);models.project.pageSize(30);models.category.pageSize(50);models.contributionActivity.pageSize(40);models.successfulProject.pageSize(9);var hashMatch=function hashMatch(str){return window.location.hash===str;};var paramByName=function paramByName(name){var normalName=name.replace(/[\[]/,'\\[').replace(/[\]]/,'\\]'),regex=new RegExp('[\\?&]'+normalName+'=([^&#]*)'),results=regex.exec(location.search);return results===null?'':decodeURIComponent(results[1].replace(/\+/g,' '));};var selfOrEmpty=function selfOrEmpty(obj){var emptyState=arguments.length<=1||arguments[1]===undefined?'':arguments[1];return obj?obj:emptyState;};var setMomentifyLocale=function setMomentifyLocale(){moment$1.locale('pt',{monthsShort:'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')});};var existy=function existy(x){return x!=null;};var momentify=function momentify(date,format){format=format||'DD/MM/YYYY';return date?moment$1(date).locale('pt').format(format):'no date';};var storeAction=function storeAction(action){if(!sessionStorage.getItem(action)){return sessionStorage.setItem(action,action);}};var callStoredAction=function callStoredAction(action,func){if(sessionStorage.getItem(action)){func.call();return sessionStorage.removeItem(action);}};var discuss=function discuss(page,identifier){var d=document,s=d.createElement('script');window.disqus_config=function(){this.page.url=page;this.page.identifier=identifier;};s.src='//catarseflex.disqus.com/embed.js';s.setAttribute('data-timestamp',+new Date());(d.head||d.body).appendChild(s);return m$1('');};var momentFromString=function momentFromString(date,format){var european=moment$1(date,format||'DD/MM/YYYY');return european.isValid()?european:moment$1(date);};var translatedTimeUnits={days:'dias',minutes:'minutos',hours:'horas',seconds:'segundos'};var translatedTime=function translatedTime(time){var translatedTime=translatedTimeUnits,unit=function unit(){var projUnit=translatedTime[time.unit||'seconds'];return time.total<=1?projUnit.slice(0,-1):projUnit;};return {unit:unit(),total:time.total};};var generateFormatNumber=function generateFormatNumber(s,c){return function(number,n,x){if(!_.isNumber(number)){return null;}var re='\\d(?=(\\d{'+(x||3)+'})+'+(n>0?'\\D':'$')+')',num=number.toFixed(Math.max(0,~ ~n));return (c?num.replace('.',c):num).replace(new RegExp(re,'g'),'$&'+(s||','));};};var formatNumber=generateFormatNumber('.',',');var toggleProp=function toggleProp(defaultState,alternateState){var p=m$1.prop(defaultState);p.toggle=function(){return p(p()===alternateState?defaultState:alternateState);};return p;};var idVM=postgrest.filtersVM({id:'eq'});var getCurrentProject=function getCurrentProject(){var root=document.getElementById('project-show-root'),data=root.getAttribute('data-parameters');if(data){return JSON.parse(data);}else {return false;}};var getRdToken=function getRdToken(){var meta=_.first(document.querySelectorAll('[name=rd-token]'));return meta?meta.content:undefined;};var getUser=function getUser(){var body=document.getElementsByTagName('body'),data=_.first(body).getAttribute('data-user');if(data){return JSON.parse(data);}else {return false;}};var locationActionMatch=function locationActionMatch(action){var act=window.location.pathname.split('/').slice(-1)[0];return action===act;};var useAvatarOrDefault=function useAvatarOrDefault(avatarPath){return avatarPath||'/assets/catarse_bootstrap/user.jpg';};var loader=function loader(){return m$1('.u-text-center.u-margintop-30 u-marginbottom-30',[m$1('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);};var newFeatureBadge=function newFeatureBadge(){return m$1('span.badge.badge-success.margin-side-5',I18n$1.t('projects.new_feature_badge'));};var fbParse=function fbParse(){var tryParse=function tryParse(){try{window.FB.XFBML.parse();}catch(e){console.log(e);}};return window.setTimeout(tryParse,500); //use timeout to wait async of facebook
  };var pluralize=function pluralize(count,s,p){return count>1?count+p:count+s;};var simpleFormat=function simpleFormat(){var str=arguments.length<=0||arguments[0]===undefined?'':arguments[0];str=str.replace(/\r\n?/,'\n');if(str.length>0){str=str.replace(/\n\n+/g,'</p><p>');str=str.replace(/\n/g,'<br />');str='<p>'+str+'</p>';}return str;};var rewardSouldOut=function rewardSouldOut(reward){return reward.maximum_contributions>0?reward.paid_count+reward.waiting_payment_count>=reward.maximum_contributions:false;};var rewardRemaning=function rewardRemaning(reward){return reward.maximum_contributions-(reward.paid_count+reward.waiting_payment_count);};var parseUrl=function parseUrl(href){var l=document.createElement('a');l.href=href;return l;};var UIHelper=function UIHelper(){return function(el,isInitialized){if(!isInitialized&&$){window.UIHelper.setupResponsiveIframes($(el));}};};var toAnchor=function toAnchor(){return function(el,isInitialized){if(!isInitialized){var hash=window.location.hash.substr(1);if(hash===el.id){window.location.hash='';setTimeout(function(){window.location.hash=el.id;});}}};};var validateEmail=function validateEmail(email){var re=/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;return re.test(email);};var navigateToDevise=function navigateToDevise(){window.location.href='/pt/login';return false;};var cumulativeOffset=function cumulativeOffset(element){var top=0,left=0;do {top+=element.offsetTop||0;left+=element.offsetLeft||0;element=element.offsetParent;}while(element);return {top:top,left:left};};var closeModal=function closeModal(){var el=document.getElementsByClassName('modal-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();document.getElementsByClassName('modal-backdrop')[0].style.display='none';};};};var closeFlash=function closeFlash(){var el=document.getElementsByClassName('icon-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();el.parentElement.remove();};};};var i18nScope=function i18nScope(scope,obj){obj=obj||{};return _.extend({},obj,{scope:scope});};var redrawHashChange=function redrawHashChange(before){var callback=_.isFunction(before)?function(){before();m$1.redraw();}:m$1.redraw;window.addEventListener('hashchange',callback,false);};var authenticityToken=function authenticityToken(){var meta=_.first(document.querySelectorAll('[name=csrf-token]'));return meta?meta.content:undefined;};var animateScrollTo=function animateScrollTo(el){var scrolled=window.scrollY;var offset=cumulativeOffset(el).top,duration=300,dFrame=(offset-scrolled)/duration, //EaseInOutCubic easing function. We'll abstract all animation funs later.
  eased=function eased(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1;},animation=setInterval(function(){var pos=eased(scrolled/offset)*scrolled;window.scrollTo(0,pos);if(scrolled>=offset){clearInterval(animation);}scrolled=scrolled+dFrame;},1);};var scrollTo=function scrollTo(){var setTrigger=function setTrigger(el,anchorId){el.onclick=function(){var anchorEl=document.getElementById(anchorId);if(_.isElement(anchorEl)){animateScrollTo(anchorEl);}return false;};};return function(el,isInitialized){if(!isInitialized){setTrigger(el,el.hash.slice(1));}};};var RDTracker=function RDTracker(eventId){return function(el,isInitialized){if(!isInitialized){var integrationScript=document.createElement('script');integrationScript.type='text/javascript';integrationScript.id='RDIntegration';if(!document.getElementById(integrationScript.id)){document.body.appendChild(integrationScript);integrationScript.onload=function(){return RdIntegration.integrate(getRdToken(),eventId);};integrationScript.src='https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';}return false;}};};setMomentifyLocale();closeFlash();closeModal();var h$1={authenticityToken:authenticityToken,cumulativeOffset:cumulativeOffset,discuss:discuss,existy:existy,validateEmail:validateEmail,momentify:momentify,momentFromString:momentFromString,formatNumber:formatNumber,idVM:idVM,getUser:getUser,getCurrentProject:getCurrentProject,toggleProp:toggleProp,loader:loader,newFeatureBadge:newFeatureBadge,fbParse:fbParse,pluralize:pluralize,simpleFormat:simpleFormat,translatedTime:translatedTime,rewardSouldOut:rewardSouldOut,rewardRemaning:rewardRemaning,parseUrl:parseUrl,hashMatch:hashMatch,redrawHashChange:redrawHashChange,useAvatarOrDefault:useAvatarOrDefault,locationActionMatch:locationActionMatch,navigateToDevise:navigateToDevise,storeAction:storeAction,callStoredAction:callStoredAction,UIHelper:UIHelper,toAnchor:toAnchor,paramByName:paramByName,i18nScope:i18nScope,RDTracker:RDTracker,selfOrEmpty:selfOrEmpty,scrollTo:scrollTo};var adminExternalAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),data={},item=args.item;builder.requestOptions.config=function(xhr){if(h$1.authenticityToken()){xhr.setRequestHeader('X-CSRF-Token',h$1.authenticityToken());}};var reload=_$1.compose(builder.model.getRowWithToken,h$1.idVM.id(item[builder.updateKey]).parameters),l=m$1.prop(false);var reloadItem=function reloadItem(){return reload().then(updateItem);};var requestError=function requestError(err){l(false);complete(true);error(true);};var updateItem=function updateItem(res){_$1.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){l(true);m$1.request(builder.requestOptions).then(reloadItem,requestError);return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);};};return {l:l,complete:complete,error:error,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Requisição feita com sucesso.')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p','Houve um problema na requisição.')])])]):'']);}};describe('adminExternalAction',function(){var testModel=postgrest$1.model('reloadAction'),item={testKey:'foo'},ctrl,$output;var args={updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',model:testModel,requestOptions:{url:'http://external_api'}};describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({'responseText':JSON.stringify([])});});beforeEach(function(){$output=mq(adminExternalAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});});describe('on form submit',function(){beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');});});});});describe('AdminFilter',function(){var ctrl=void 0,submit=void 0,fakeForm=void 0,formDesc=void 0,filterDescriber=void 0,$output=void 0,c=window.c,vm=c.admin.contributionFilterVM,AdminFilter=c.AdminFilter;describe('controller',function(){beforeAll(function(){ctrl=AdminFilter.controller();});it('should instantiate a toggler',function(){expect(ctrl.toggler).toBeDefined();});});describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();submit=jasmine.createSpy('submit');filterDescriber=FilterDescriberMock();$output=mq(AdminFilter,{filterBuilder:filterDescriber,data:{label:'foo'},submit:submit});});it('should render the main filter on render',function(){expect(m.component).toHaveBeenCalledWith(c.FilterMain,filterDescriber[0].data);});it('should build a form from a FormDescriber when clicking the advanced filter',function(){$output.click('button'); //mithril.query calls component one time to build it, so calls.count = length + 1.
  expect(m.component.calls.count()).toEqual(filterDescriber.length+1);});it('should trigger a submit function when submitting the form',function(){$output.trigger('form','submit');expect(submit).toHaveBeenCalled();});});});describe('AdminInputAction',function(){var c=window.c,m=window.m,models=window.c.models,AdminInputAction=c.AdminInputAction,testModel=m.postgrest.model('test'),item={testKey:'foo'},forced=null,ctrl,$output;var args={property:'testKey',updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',placeholder:'place',model:testModel};describe('controller',function(){beforeAll(function(){ctrl=AdminInputAction.controller({data:args,item:item});});it('should instantiate a submit function',function(){expect(ctrl.submit).toBeFunction();});it('should return a toggler prop',function(){expect(ctrl.toggler).toBeFunction();});it('should return a value property to bind to',function(){expect(ctrl.newValue).toBeFunction();});describe('when forceValue is set',function(){beforeAll(function(){args.forceValue=forced;ctrl=AdminInputAction.controller({data:args,item:item});});it('should initialize newValue with forced value',function(){expect(ctrl.newValue()).toEqual(forced);});afterAll(function(){delete args.forceValue;});});});describe('view',function(){beforeEach(function(){$output=mq(AdminInputAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a placeholder',function(){expect($output.has('input[placeholder="'+args.placeholder+'"]')).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});describe('when forceValue is set',function(){beforeAll(function(){args.forceValue=forced;ctrl=AdminInputAction.controller({data:args,item:item});});it('should initialize newValue with forced value',function(){expect(ctrl.newValue()).toEqual(forced);});afterAll(function(){delete args.forceValue;});});});describe('on form submit',function(){beforeAll(function(){spyOn(m,'request').and.returnValue({then:function then(callback){callback([{test:true}]);}});});beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');expect(m.request).toHaveBeenCalled();});});});});describe('AdminItem',function(){var c=window.c,AdminItem=c.AdminItem,item,$output,ListItemMock,ListDetailMock;beforeAll(function(){ListItemMock={view:function view(ctrl,args){return m('.list-item-mock');}};ListDetailMock={view:function view(ctrl,args){return m('.list-detail-mock');}};});describe('view',function(){beforeEach(function(){$output=mq(AdminItem,{listItem:ListItemMock,listDetail:ListDetailMock,item:item});});it('should render list item',function(){$output.should.have('.list-item-mock');});it('should render list detail when toggle details is true',function(){$output.click('button');$output.should.have('.list-detail-mock');});it('should not render list detail when toggle details is false',function(){$output.should.not.have('.list-detail-mock');});});});describe('AdminList',function(){var c=window.c,AdminList=c.AdminList,$output=void 0,model=void 0,vm=void 0,ListItemMock=void 0,ListDetailMock=void 0,results=[{id:1}],listParameters=void 0,endpoint=void 0;beforeAll(function(){endpoint=mockEndpoint('items',results);ListItemMock={view:function view(ctrl,args){return m('.list-item-mock');}};ListDetailMock={view:function view(ctrl,args){return m('');}};model=m.postgrest.model('items');vm={list:m.postgrest.paginationVM(model),error:m.prop()};listParameters={vm:vm,listItem:ListItemMock,listDetail:ListDetailMock};});describe('view',function(){describe('when not loading',function(){beforeEach(function(){spyOn(vm.list,"isLoading").and.returnValue(false);$output=mq(AdminList,listParameters);});it('should render fetched items',function(){expect($output.find('.card').length).toEqual(results.length);});it('should not show a loading icon',function(){$output.should.not.have('img[alt="Loader"]');});});describe('when loading',function(){beforeEach(function(){spyOn(vm.list,"isLoading").and.returnValue(true);$output=mq(AdminList,listParameters);});it('should render fetched items',function(){expect($output.find('.card').length).toEqual(results.length);});it('should show a loading icon',function(){$output.should.have('img[alt="Loader"]');});});describe('when error',function(){beforeEach(function(){vm.error('endpoint error');$output=mq(AdminList,listParameters);});it('should show an error info',function(){expect($output.has('.card-error')).toBeTrue();});});});});describe('AdminNotificationHistory',function(){var c=window.c,user=void 0,historyBox=void 0,ctrl=void 0,view=void 0,$output=void 0;beforeAll(function(){user=m.prop(UserDetailMockery(1));$output=mq(c.AdminNotificationHistory,{user:user()[0]});});describe('view',function(){it('should render fetched notifications',function(){expect($output.find('.date-event').length).toEqual(1);});});});describe('AdminProjectDetailsCard',function(){var AdminProjectDetailsCard=window.c.AdminProjectDetailsCard,generateController=void 0,ctrl=void 0,projectDetail=void 0,component=void 0,view=void 0,$output=void 0;describe('controller',function(){beforeAll(function(){generateController=function generateController(attrs){projectDetail=ProjectDetailsMockery(attrs)[0];component=m.component(AdminProjectDetailsCard,{resource:projectDetail});return component.controller();};});describe('project status text',function(){it('when project is online',function(){ctrl=generateController({state:'online'});expect(ctrl.statusTextObj().text).toEqual('NO AR');expect(ctrl.statusTextObj().cssClass).toEqual('text-success');});it('when project is failed',function(){ctrl=generateController({state:'failed'});expect(ctrl.statusTextObj().text).toEqual('NÃO FINANCIADO');expect(ctrl.statusTextObj().cssClass).toEqual('text-error');});});describe('project remaining time',function(){it('when remaining time is in days',function(){ctrl=generateController({remaining_time:{total:10,unit:'days'}});expect(ctrl.remainingTextObj.total).toEqual(10);expect(ctrl.remainingTextObj.unit).toEqual('dias');});it('when remaining time is in seconds',function(){ctrl=generateController({remaining_time:{total:12,unit:'seconds'}});expect(ctrl.remainingTextObj.total).toEqual(12);expect(ctrl.remainingTextObj.unit).toEqual('segundos');});it('when remaining time is in hours',function(){ctrl=generateController({remaining_time:{total:2,unit:'hours'}});expect(ctrl.remainingTextObj.total).toEqual(2);expect(ctrl.remainingTextObj.unit).toEqual('horas');});});});describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];component=m.component(AdminProjectDetailsCard,{resource:projectDetail});ctrl=component.controller();view=component.view(ctrl,{resource:projectDetail});$output=mq(view);});it('should render details of the project in card',function(){var remaningTimeObj=ctrl.remainingTextObj,statusTextObj=ctrl.statusTextObj();expect($output.find('.project-details-card').length).toEqual(1);expect($output.contains(projectDetail.total_contributions)).toEqual(true);expect($output.contains('R$ '+window.c.h.formatNumber(projectDetail.pledged,2))).toEqual(true);});});});describe('AdminRadioAction',function(){var c=window.c,m=window.m,models=window.c.models,AdminRadioAction=c.AdminRadioAction,testModel=m.postgrest.model('reward_details'),testStr='updated',errorStr='error!';var error=false,item=void 0,fakeData={},$output=void 0;var args={getKey:'project_id',updateKey:'contribution_id',selectKey:'reward_id',radios:'rewards',callToAction:'Alterar Recompensa',outerLabel:'Recompensa',getModel:testModel,updateModel:testModel,validate:function validate(){return undefined;}};var errorArgs=_.extend({},args,{validate:function validate(){return errorStr;}});describe('view',function(){beforeAll(function(){item=_.first(RewardDetailsMockery());args.selectedItem=m.prop(item);$output=mq(AdminRadioAction,{data:args,item:m.prop(item)});});it('shoud only render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.callToAction)).toBeFalse();});describe('on action button click',function(){beforeAll(function(){$output.click('button');});it('should render a row of radio inputs',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect($output.find('input[type="radio"]').length).toEqual(JSON.parse(lastRequest.responseText).length);});it('should render the description of the default selected radio',function(){$output.should.contain(item.description);});it('should send an patch request on form submit',function(){$output.click('#r-0');$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent(); // Should make a patch request to update item
  expect(lastRequest.method).toEqual('PATCH');});describe('when new value is not valid',function(){beforeAll(function(){$output=mq(AdminRadioAction,{data:errorArgs,item:m.prop(item)});$output.click('button');$output.click('#r-0');});it('should present an error message when new value is invalid',function(){$output.trigger('form','submit');$output.should.contain(errorStr);});});});});});describe('AdminReward',function(){var ctrl=void 0,$output=void 0,c=window.c,AdminReward=c.AdminReward;describe('view',function(){var reward=void 0,ctrl=void 0;describe("when contribution has no reward",function(){beforeAll(function(){$output=mq(AdminReward.view(undefined,{reward:m.prop({})}));});it('should render "no reward" text when reward_id is null',function(){$output.should.contain('Apoio sem recompensa');});});describe("when contribution has reward",function(){var reward=void 0;beforeAll(function(){reward=m.prop(RewardDetailsMockery()[0]);$output=mq(AdminReward.view(undefined,{reward:reward}));});it("should render reward description when we have a reward_id",function(){$output.should.contain(reward().description);});});});});describe('AdminTransactionHistory',function(){var c=window.c,contribution=void 0,historyBox=void 0,ctrl=void 0,view=void 0,$output=void 0;beforeAll(function(){contribution=m.prop(ContributionDetailMockery(1));historyBox=m.component(c.AdminTransactionHistory,{contribution:contribution()[0]});ctrl=historyBox.controller();view=historyBox.view(ctrl,{contribution:contribution});$output=mq(view);});describe('controller',function(){it('should have orderedEvents',function(){expect(ctrl.orderedEvents.length).toEqual(2);});it('should have formated the date on orderedEvents',function(){expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');});});describe('view',function(){it('should render fetched orderedEvents',function(){expect($output.find('.date-event').length).toEqual(2);});});});describe('AdminTransaction',function(){var c=window.c,contribution=void 0,detailedBox=void 0,view=void 0,$output=void 0;beforeAll(function(){contribution=m.prop(ContributionDetailMockery(1,{gateway_data:null}));detailedBox=m.component(c.AdminTransaction,{contribution:contribution()[0]});view=detailedBox.view(null,{contribution:contribution});$output=mq(view);});describe('view',function(){it('should render details about contribution',function(){expect($output.contains('Valor: R$50,00')).toBeTrue();expect($output.contains('Meio: MoIP')).toBeTrue();});});});describe('AdminUser',function(){var c=window.c,AdminUser=c.AdminUser,item,$output;describe('view',function(){beforeAll(function(){item=ContributionDetailMockery(1)[0];$output=mq(AdminUser.view(null,{item:item}));});it('should build an item from an item describer',function(){expect($output.has('.user-avatar')).toBeTrue();expect($output.contains(item.email)).toBeTrue();});});});describe('CategoryButton',function(){var $output=void 0,c=window.c;describe('view',function(){beforeAll(function(){$output=mq(m.component(c.CategoryButton,{category:{id:1,name:'cat',online_projects:1}}));});it('should build a link with .btn-category',function(){expect($output.has('a.btn-category')).toBeTrue();});});});describe('FilterButton',function(){var $output=void 0,c=window.c;describe('view',function(){beforeAll(function(){$output=mq(m.component(c.FilterButton,{title:'Test',href:'test'}));});it('should build a link with .filters',function(){expect($output.has('a.filters')).toBeTrue();});});});describe('PaymentStatus',function(){var c=window.c,ctrl,setController=function setController(contribution){var payment={gateway:contribution.gateway,gateway_data:contribution.gateway_data,installments:contribution.installments,state:contribution.state,payment_method:contribution.payment_method};ctrl=m.component(c.PaymentStatus,{item:payment}).controller();};describe('stateClass function',function(){it('should return a success CSS class when contribution state is paid',function(){var contribution=ContributionDetailMockery(1,{state:'paid'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-success');});it('should return a success CSS class when contribution state is refunded',function(){var contribution=ContributionDetailMockery(1,{state:'refunded'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-refunded');});it('should return a warning CSS class when contribution state is pending',function(){var contribution=ContributionDetailMockery(1,{state:'pending'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-waiting');});it('should return an error CSS class when contribution state is refused',function(){var contribution=ContributionDetailMockery(1,{state:'refused'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-error');});it('should return an error CSS class when contribution state is not known',function(){var contribution=ContributionDetailMockery(1,{state:'foo'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-error');});});describe('paymentMethodClass function',function(){var CSSboleto='.fa-barcode',CSScreditcard='.fa-credit-card',CSSerror='.fa-question';it('should return a boleto CSS class when contribution payment method is boleto',function(){var contribution=ContributionDetailMockery(1,{payment_method:'BoletoBancario'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);});it('should return a credit card CSS class when contribution payment method is credit card',function(){var contribution=ContributionDetailMockery(1,{payment_method:'CartaoDeCredito'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);});it('should return an error CSS class when contribution payment method is not known',function(){var contribution=ContributionDetailMockery(1,{payment_method:'foo'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSSerror);});});describe('view',function(){var getOutput=function getOutput(payment_method){var contribution=ContributionDetailMockery(1,{payment_method:payment_method})[0],payment={gateway:contribution.gateway,gateway_data:contribution.gateway_data,installments:contribution.installments,state:contribution.state,payment_method:contribution.payment_method};return mq(m.component(c.PaymentStatus,{item:payment}));};it('should return an HTML element describing a boleto when payment_method is boleto',function(){expect(getOutput('BoletoBancario').has('#boleto-detail')).toBeTrue();});it('should return an HTML element describing a credit card when payment_method is credit card',function(){expect(getOutput('CartaoDeCredito').has('#creditcard-detail')).toBeTrue();});});});describe('ProjectAbout',function(){var $output=void 0,projectDetail=void 0,rewardDetail=void 0,ProjectAbout=window.c.ProjectAbout;describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];rewardDetail=RewardDetailsMockery()[0];var component=m.component(ProjectAbout,{project:m.prop(projectDetail),rewardDetails:m.prop(RewardDetailsMockery())}),view=component.view();$output=mq(view);});it('should render project about and reward list',function(){expect($output.contains(projectDetail.about_html)).toEqual(true);expect($output.contains(rewardDetail.description)).toEqual(true);});});});describe('ProjectCard',function(){var ProjectCard=window.c.ProjectCard,project=void 0,component=void 0,view=void 0,$output=void 0,$customOutput=void 0,remainingTimeObj=void 0;describe('view',function(){beforeAll(function(){project=ProjectMockery()[0];remainingTimeObj=window.c.h.translatedTime(project.remaining_time);$output=function $output(type){return mq(m.component(ProjectCard,{project:project,type:type}));};});it('should render the project card',function(){expect($output().find('.card-project').length).toEqual(1);expect($output().contains(project.owner_name)).toEqual(true);expect($output().contains(remainingTimeObj.unit)).toEqual(true);});it('should render a big project card when type is big',function(){expect($output('big').find('.card-project-thumb.big').length).toEqual(1);expect($output('big').contains(project.owner_name)).toEqual(true);expect($output('big').contains(remainingTimeObj.unit)).toEqual(true);});it('should render a medium project card when type is medium',function(){expect($output('medium').find('.card-project-thumb.medium').length).toEqual(1);expect($output('medium').contains(project.owner_name)).toEqual(true);expect($output('medium').contains(remainingTimeObj.unit)).toEqual(true);});});});describe('ProjectContributions',function(){var $output=void 0,projectContribution=void 0,ProjectContributions=window.c.ProjectContributions;describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(new RegExp('('+apiPrefix+'\/project_contributions)(.*)(waiting_payment)(.*)')).andReturn({'responseText':JSON.stringify(ProjectContributionsMockery())});spyOn(m,'component').and.callThrough();projectContribution=ProjectContributionsMockery()[0];var project=m.prop({id:1231});var component=m.component(ProjectContributions,{project:project}),view=component.view(component.controller({project:project}));$output=mq(view);});it('should render project contributions list',function(){expect($output.contains(projectContribution.user_name)).toEqual(true);});});});describe('ProjectDashboardMenu',function(){var generateContextByNewState=void 0,ProjectDashboardMenu=window.c.ProjectDashboardMenu;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];var body=jasmine.createSpyObj('body',['className']),projectDetail=m.prop(ProjectDetailsMockery(newState)[0]),component=m.component(ProjectDashboardMenu,{project:projectDetail}),ctrl=component.controller({project:projectDetail});spyOn(m,'component').and.callThrough();spyOn(ctrl,'body').and.returnValue(body);return {output:mq(component,{project:projectDetail}),projectDetail:projectDetail};};});it('when project is online',function(){var _generateContextByNew=generateContextByNewState({state:'online'});var output=_generateContextByNew.output;var projectDetail=_generateContextByNew.projectDetail;output.should.contain(projectDetail().name);output.should.have('#info-links');});});});describe('ProjectHeader',function(){var $output=void 0,projectDetail=void 0,ProjectHeader=window.c.ProjectHeader;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectHeader,{project:projectDetail,userDetails:m.prop([])}),view=component.view(null,{project:projectDetail,userDetails:m.prop([])});$output=mq(view);});it('should a project header',function(){expect($output.find('#project-header').length).toEqual(1);expect($output.contains(projectDetail().name)).toEqual(true);});it('should render project-highlight / project-sidebar component area',function(){expect($output.find('.project-highlight').length).toEqual(1);expect($output.find('#project-sidebar').length).toEqual(1);});});});describe('ProjectHighlight',function(){var $output=void 0,projectDetail=void 0,ProjectHighlight=window.c.ProjectHighlight;it('when project video is not filled should render image',function(){projectDetail=m.prop(_.extend({},ProjectDetailsMockery()[0],{original_image:'original_image',video_embed_url:null}));var component=m.component(ProjectHighlight,{project:projectDetail}),view=component.view(component.controller(),{project:projectDetail});$output=mq(view);expect($output.find('.project-image').length).toEqual(1);expect($output.find('iframe.embedly-embed').length).toEqual(0);});describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectHighlight,{project:projectDetail}),view=component.view(component.controller(),{project:projectDetail});$output=mq(ProjectHighlight,{project:projectDetail});});it('should render project video, headline, category and address info',function(){expect($output.find('iframe.embedly-embed').length).toEqual(1);expect($output.find('span.fa.fa-map-marker').length).toEqual(1);expect($output.contains(projectDetail().address.city)).toEqual(true);});it('should render project share box when click on share',function(){$output.click('#share-box');$output.redraw();$output.should.have('.pop-share');});});});describe('ProjectMode',function(){var ProjectCard=window.c.ProjectMode,project=void 0,component=void 0,view=void 0,$output=void 0;describe('view',function(){beforeAll(function(){project=m.prop(ProjectMockery()[0]);});it('should render the project mode',function(){component=m.component(ProjectCard,{project:project});$output=mq(component);expect($output.find('.w-row').length).toEqual(1);});it('should render the project mode when goal is null',function(){component=m.component(ProjectCard,{project:m.prop(_.extend({},project,{goal:null}))});$output=mq(component);expect($output.find('.w-row').length).toEqual(1);});});});describe('ProjectPosts',function(){var $output=void 0,projectPostDetail=void 0,ProjectPosts=window.c.ProjectPosts;describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();projectPostDetail=ProjectPostDetailsMockery()[0];var project=m.prop({id:1231});var component=m.component(ProjectPosts,{project:project}),view=component.view(component.controller({project:project}));$output=mq(view);});it('should render project post list',function(){expect($output.find('.post').length).toEqual(1);expect($output.contains(projectPostDetail.title)).toEqual(true);});});});describe('ProjectReminderCount',function(){var $output=void 0,projectDetail=void 0,ProjectReminderCount=window.c.ProjectReminderCount;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectReminderCount,{resource:projectDetail}),view=component.view(null,{resource:projectDetail});$output=mq(view);});it('should render reminder total count',function(){expect($output.find('#project-reminder-count').length).toEqual(1);});});});describe('ProjectRewardList',function(){var generateContextByNewState=void 0,ProjectRewardList=window.c.ProjectRewardList;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];spyOn(m,'component').and.callThrough();var rewardDetail=RewardDetailsMockery(newState),component=m.component(ProjectRewardList,{project:m.prop({id:1231}),rewardDetails:m.prop(rewardDetail)});return {output:mq(component.view()),rewardDetail:rewardDetail[0]};};});it('should render card-gone when reward sould out',function(){var _generateContextByNew=generateContextByNewState({maximum_contributions:4,paid_count:4});var output=_generateContextByNew.output;var rewardDetail=_generateContextByNew.rewardDetail;expect(output.find('.card-gone').length).toEqual(1);expect(output.contains('Esgotada')).toEqual(true);});it('should render card-reward when reward is not sould out',function(){var _generateContextByNew2=generateContextByNewState({maximum_contributions:null});var output=_generateContextByNew2.output;var rewardDetail=_generateContextByNew2.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Esgotada')).toEqual(false);});it('should render card-reward stats when reward is limited',function(){var _generateContextByNew3=generateContextByNewState({maximum_contributions:10,paid_count:2,waiting_payment_count:5});var output=_generateContextByNew3.output;var rewardDetail=_generateContextByNew3.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Limitada')).toEqual(true);expect(output.contains('(3 de 10 disponíveis)')).toEqual(true);expect(output.contains('2 apoios')).toEqual(true);expect(output.contains('5 apoios em prazo de confirmação')).toEqual(true);});it('should render card-reward details',function(){var _generateContextByNew4=generateContextByNewState({minimum_value:20});var output=_generateContextByNew4.output;var rewardDetail=_generateContextByNew4.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Para R$ 20 ou mais')).toEqual(true);expect(output.contains('Estimativa de Entrega:')).toEqual(true);expect(output.contains(window.c.h.momentify(rewardDetail.deliver_at,'MMM/YYYY'))).toEqual(true);expect(output.contains(rewardDetail.description)).toEqual(true);});});});describe('ProjectRow',function(){var $output,ProjectRow=window.c.ProjectRow;describe('view',function(){var collection={title:'test collection',hash:'testhash',collection:m.prop([]),loader:m.prop(false)};describe('when we have a ref parameter',function(){it('should not render row',function(){var _ProjectMockery=ProjectMockery();var _ProjectMockery2=babelHelpers.slicedToArray(_ProjectMockery,1);var project=_ProjectMockery2[0];collection.collection([project]);var component=m.component(ProjectRow),view=component.view(null,{collection:collection,ref:'ref_test'});$output=mq(view);expect($output.find('.card-project a[href="/'+project.permalink+'?ref=ref_test"]').length).toEqual(3);});});describe('when collection is empty and loader true',function(){beforeAll(function(){collection.collection([]);collection.loader(true);var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render loader',function(){expect($output.find('img[alt="Loader"]').length).toEqual(1);});});describe('when collection is empty and loader false',function(){beforeAll(function(){collection.collection([]);collection.loader(false);var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render nothing',function(){expect($output.find('img[alt="Loader"]').length).toEqual(0);expect($output.find('.w-section').length).toEqual(0);});});describe('when collection has projects',function(){beforeAll(function(){collection.collection(ProjectMockery());var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render projects in row',function(){expect($output.find('.w-section').length).toEqual(1);});});});});describe('ProjectShareBox',function(){var $output=void 0,projectDetail=void 0,ProjectShareBox=window.c.ProjectShareBox;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var args={project:projectDetail,displayShareBox:{toggle:jasmine.any(Function)}},component=m.component(ProjectShareBox,args),view=component.view(component.controller(),args);$output=mq(ProjectShareBox,args);});it('should render project project share pop',function(){$output.should.have('.pop-share');$output.should.have('.w-widget-facebook');$output.should.have('.w-widget-twitter');$output.should.have('.widget-embed');});it('should open embed box when click on embed',function(){$output.click('a.widget-embed');$output.should.have('.embed-expanded');});});});describe('ProjectSidebar',function(){var generateContextByNewState=void 0,ProjectSidebar=window.c.ProjectSidebar;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];spyOn(m,'component').and.callThrough();var projectDetail=m.prop(_.extend({},ProjectDetailsMockery()[0],newState)),component=m.component(ProjectSidebar,{project:projectDetail,userDetails:m.prop([])}),ctrl=component.controller({project:projectDetail,userDetails:m.prop([])}),view=component.view(component.controller(),{project:projectDetail,userDetails:m.prop([])});return {output:mq(view),ctrl:ctrl,projectDetail:projectDetail};};});it('should render project stats',function(){var _generateContextByNew=generateContextByNewState({state:'successful'});var output=_generateContextByNew.output;var projectDetail=_generateContextByNew.projectDetail;expect(output.find('#project-sidebar.aside').length).toEqual(1);expect(output.find('.card-success').length).toEqual(1);});it('should render a all or nothing badge when is aon',function(){var _generateContextByNew2=generateContextByNewState({mode:'aon'});var output=_generateContextByNew2.output;var projectDetail=_generateContextByNew2.projectDetail;expect(output.find('#aon').length).toEqual(1);});it('should render a flex badge when project mode is flexible',function(){var _generateContextByNew3=generateContextByNewState({mode:'flex'});var output=_generateContextByNew3.output;var projectDetail=_generateContextByNew3.projectDetail;expect(output.find('#flex').length).toEqual(1);});describe('reminder',function(){it('should render reminder when project is open_for_contributions and user signed in and is in_reminder',function(){var _generateContextByNew4=generateContextByNewState({open_for_contributions:true,user_signed_in:true,in_reminder:true});var output=_generateContextByNew4.output;var projectDetail=_generateContextByNew4.projectDetail;expect(output.contains('Lembrete ativo')).toEqual(true);expect(output.find('#project-reminder').length).toEqual(1);});it('should render reminder when project is open_for_contributions and user signed in ant not in_reminder',function(){var _generateContextByNew5=generateContextByNewState({open_for_contributions:true,user_signed_in:true,in_reminder:false});var output=_generateContextByNew5.output;var projectDetail=_generateContextByNew5.projectDetail;expect(output.contains('Lembrar-me')).toEqual(true);expect(output.find('#project-reminder').length).toEqual(1);});it('should render reminder when project is open_for_contributions and user not signed in',function(){var _generateContextByNew6=generateContextByNewState({open_for_contributions:true,user_signed_in:false});var output=_generateContextByNew6.output;var projectDetail=_generateContextByNew6.projectDetail;expect(output.find('#project-reminder').length).toEqual(1);});it('should not render reminder when project is not open_for_contributions and user signed in',function(){var _generateContextByNew7=generateContextByNewState({open_for_contributions:false,user_signed_in:true});var output=_generateContextByNew7.output;var projectDetail=_generateContextByNew7.projectDetail;expect(output.find('#project-reminder').length).toEqual(0);});});});});describe('ProjectTabs',function(){var $output=void 0,projectDetail=void 0,ProjectTabs=window.c.ProjectTabs;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectTabs,{project:m.prop(projectDetail),rewardDetails:m.prop([])});$output=mq(component);});it('should render project-tabs',function(){expect($output.find('a.dashboard-nav-link').length).toEqual(5);expect($output.find('a#about-link').length).toEqual(1);});it('should call hashMatch when click on some link',function(){var oldHash=window.location.hash;window.location.hash='posts';$output.redraw();$output.should.have('a#posts-link.selected');window.location.hash=oldHash;});});});describe('ProjectsDashboard',function(){var $output=void 0,projectDetail=void 0,ProjectsDashboard=window.c.root.ProjectsDashboard;describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];var component=m.component(ProjectsDashboard,{project_id:projectDetail.project_id,project_user_id:projectDetail.user.id});$output=mq(component);});it('should render project about and reward list',function(){expect($output.has('.project-nav-wrapper')).toBeTrue();});});});var contributionListVM=postgrest.paginationVM(models.contributionDetail,'id.desc',{'Prefer':'count=exact'});var vm=postgrest$1.filtersVM({full_text_index:'@@',state:'eq',gateway:'eq',value:'between',created_at:'between'});var paramToString=function paramToString(p){return (p||'').toString().trim();}; // Set default values
  vm.state('');vm.gateway('');vm.order({id:'desc'});vm.created_at.lte.toFilter=function(){var filter=paramToString(vm.created_at.lte());return filter&&h$1.momentFromString(filter).endOf('day').format('');};vm.created_at.gte.toFilter=function(){var filter=paramToString(vm.created_at.gte());return filter&&h$1.momentFromString(filter).format();};vm.full_text_index.toFilter=function(){var filter=paramToString(vm.full_text_index());return filter&&replaceDiacritics(filter)||undefined;};var adminItem={controller:function controller(args){return {displayDetailBox:h$1.toggleProp(false,true)};},view:function view(ctrl,args){var item=args.item;return m$1('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items',[m$1.component(args.listItem,{item:item,key:args.key}),m$1('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary',{onclick:ctrl.displayDetailBox.toggle}),ctrl.displayDetailBox()?m$1.component(args.listDetail,{item:item,key:args.key}):'']);}};var adminList={controller:function controller(args){var list=args.vm.list;if(!list.collection().length&&list.firstPage){list.firstPage().then(null,function(serverError){args.vm.error(serverError.message);});}},view:function view(ctrl,args){var list=args.vm.list,error=args.vm.error,label=args.label||'';return m$1('.w-section.section',[m$1('.w-container',error()?m$1('.card.card-error.u-radius.fontweight-bold',error()):[m$1('.w-row.u-marginbottom-20',[m$1('.w-col.w-col-9',[m$1('.fontsize-base',list.isLoading()?'Carregando '+label.toLowerCase()+'...':[m$1('span.fontweight-semibold',list.total()),' '+label.toLowerCase()+' encontrados'])])]),m$1('#admin-contributions-list.w-container',[list.collection().map(function(item){return m$1.component(adminItem,{listItem:args.listItem,listDetail:args.listDetail,item:item,key:item.id});}),m$1('.w-section.section',[m$1('.w-container',[m$1('.w-row',[m$1('.w-col.w-col-2.w-col-push-5',[list.isLoading()?h$1.loader():m$1('button#load-more.btn.btn-medium.btn-terciary',{onclick:list.nextPage},'Carregar mais')])])])])])])]);}};var filterMain={view:function view(ctrl,args){var inputWrapperClass=args.inputWrapperClass||'.w-input.text-field.positive.medium',btnClass=args.btnClass||'.btn.btn-large.u-marginbottom-10';return m$1('.w-row',[m$1('.w-col.w-col-10',[m$1('input'+inputWrapperClass+'[placeholder="'+args.placeholder+'"][type="text"]',{onchange:m$1.withAttr('value',args.vm),value:args.vm()})]),m$1('.w-col.w-col-2',[m$1('input#filter-btn'+btnClass+'[type="submit"][value="Buscar"]')])]);}};var adminFilter={controller:function controller(){return {toggler:h.toggleProp(false,true)};},view:function view(ctrl,args){var filterBuilder=args.filterBuilder,data=args.data,label=args.label||'',main=_$1.findWhere(filterBuilder,{component:filterMain});return m$1('#admin-contributions-filter.w-section.page-header',[m$1('.w-container',[m$1('.fontsize-larger.u-text-center.u-marginbottom-30',label),m$1('.w-form',[m$1('form',{onsubmit:args.submit},[main?m$1.component(main.component,main.data):'',m$1('.u-marginbottom-20.w-row',m$1('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]',{onclick:ctrl.toggler.toggle},'Filtros avançados  >')),ctrl.toggler()?m$1('#advanced-search.w-row.admin-filters',[_$1.map(filterBuilder,function(f){return f.component!==filterMain?m$1.component(f.component,f.data):'';})]):''])])])]);}};var adminProject={view:function view(ctrl,args){var project=args.item;return m$1('.w-row.admin-project',[m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[m$1('img.thumb-project.u-radius[src='+project.project_img+'][width=50]')]),m$1('.w-col.w-col-9.w-col-small-9',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10',[m$1('a.alt-link[target="_blank"][href="/'+project.permalink+'"]',project.project_name)]),m$1('.fontsize-smallest.fontweight-semibold',project.project_state),m$1('.fontsize-smallest.fontcolor-secondary',h$1.momentify(project.project_online_date)+' a '+h$1.momentify(project.project_expires_at))])]);}};var adminContribution={view:function view(ctrl,args){var contribution=args.item;return m$1('.w-row.admin-contribution',[m$1('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small','R$'+contribution.value),m$1('.fontsize-smallest.fontcolor-secondary',h$1.momentify(contribution.created_at,'DD/MM/YYYY HH:mm[h]')),m$1('.fontsize-smallest',['ID do Gateway: ',m$1('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/'+contribution.gateway_id+'"]',contribution.gateway_id)])]);}};var adminUser={view:function view(ctrl,args){var user=args.item;return m$1('.w-row.admin-user',[m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[m$1('img.user-avatar[src="'+h.useAvatarOrDefault(user.profile_img_thumbnail)+'"]')]),m$1('.w-col.w-col-9.w-col-small-9',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10',[m$1('a.alt-link[target="_blank"][href="/users/'+user.id+'/edit"]',user.name||user.email)]),m$1('.fontsize-smallest','Usuário: '+user.id),m$1('.fontsize-smallest.fontcolor-secondary','Email: '+user.email),args.additional_data])]);}};var adminContributionUser={view:function view(ctrl,args){var item=args.item,user={profile_img_thumbnail:item.user_profile_img,id:item.user_id,name:item.user_name,email:item.email};var additionalData=m$1('.fontsize-smallest.fontcolor-secondary','Gateway: '+item.payer_email);return m$1.component(adminUser,{item:user,additional_data:additionalData});}};var paymentStatus={controller:function controller(args){var payment=args.item,card=null,displayPaymentMethod=void 0,paymentMethodClass=void 0,stateClass=void 0;card=function card(){if(payment.gateway_data){switch(payment.gateway.toLowerCase()){case 'moip':return {first_digits:payment.gateway_data.cartao_bin,last_digits:payment.gateway_data.cartao_final,brand:payment.gateway_data.cartao_bandeira};case 'pagarme':return {first_digits:payment.gateway_data.card_first_digits,last_digits:payment.gateway_data.card_last_digits,brand:payment.gateway_data.card_brand};}}};displayPaymentMethod=function displayPaymentMethod(){switch(payment.payment_method.toLowerCase()){case 'boletobancario':return m$1('span#boleto-detail','');case 'cartaodecredito':var cardData=card();if(cardData){return m$1('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight',[cardData.first_digits+'******'+cardData.last_digits,m$1('br'),cardData.brand+' '+payment.installments+'x']);}return '';}};paymentMethodClass=function paymentMethodClass(){switch(payment.payment_method.toLowerCase()){case 'boletobancario':return '.fa-barcode';case 'cartaodecredito':return '.fa-credit-card';default:return '.fa-question';}};stateClass=function stateClass(){switch(payment.state){case 'paid':return '.text-success';case 'refunded':return '.text-refunded';case 'pending':case 'pending_refund':return '.text-waiting';default:return '.text-error';}};return {displayPaymentMethod:displayPaymentMethod,paymentMethodClass:paymentMethodClass,stateClass:stateClass};},view:function view(ctrl,args){var payment=args.item;return m$1('.w-row.payment-status',[m$1('.fontsize-smallest.lineheight-looser.fontweight-semibold',[m$1('span.fa.fa-circle'+ctrl.stateClass()),' '+payment.state]),m$1('.fontsize-smallest.fontweight-semibold',[m$1('span.fa'+ctrl.paymentMethodClass()),' ',m$1('a.link-hidden[href="#"]',payment.payment_method)]),m$1('.fontsize-smallest.fontcolor-secondary.lineheight-tight',[ctrl.displayPaymentMethod()])]);}};var adminContributionItem={controller:function controller(){return {itemBuilder:[{component:adminContributionUser,wrapperClass:'.w-col.w-col-4'},{component:adminProject,wrapperClass:'.w-col.w-col-4'},{component:adminContribution,wrapperClass:'.w-col.w-col-2'},{component:paymentStatus,wrapperClass:'.w-col.w-col-2'}]};},view:function view(ctrl,args){return m$1('.w-row',_.map(ctrl.itemBuilder,function(panel){return m$1(panel.wrapperClass,[m$1.component(panel.component,{item:args.item,key:args.key})]);}));}};var adminInputAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),data={},item=args.item,key=builder.property,forceValue=builder.forceValue||null,newValue=m$1.prop(forceValue);h$1.idVM.id(item[builder.updateKey]);var l=postgrest.loaderWithToken(builder.model.patchOptions(h$1.idVM.parameters(),data));var updateItem=function updateItem(res){_.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){data[key]=newValue();l.load().then(updateItem,function(){complete(true);error(true);});return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);newValue(forceValue);};};return {complete:complete,error:error,l:l,newValue:newValue,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),data.forceValue===undefined?m$1('input.w-input.text-field[type="text"][placeholder="'+data.placeholder+'"]',{onchange:m$1.withAttr('value',ctrl.newValue),value:ctrl.newValue()}):'',m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p',data.successMessage)])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p','Houve um problema na requisição. '+data.errorMessage)])])]):'']);}};var adminRadioAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),data={},error=m$1.prop(false),fail=m$1.prop(false),item=args.item(),description=m$1.prop(item.description||''),key=builder.getKey,newID=m$1.prop(''),getFilter={},setFilter={},radios=m$1.prop(),getAttr=builder.radios,getKey=builder.getKey,getKeyValue=args.getKeyValue,updateKey=builder.updateKey,updateKeyValue=args.updateKeyValue,validate=builder.validate,selectedItem=builder.selectedItem||m$1.prop();setFilter[updateKey]='eq';var setVM=postgrest.filtersVM(setFilter);setVM[updateKey](updateKeyValue);getFilter[getKey]='eq';var getVM=postgrest.filtersVM(getFilter);getVM[getKey](getKeyValue);var getLoader=postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));var setLoader=postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(),data));var updateItem=function updateItem(data){if(data.length>0){var newItem=_$1.findWhere(radios(),{id:data[0][builder.selectKey]});selectedItem(newItem);}else {error({message:'Nenhum item atualizado'});}complete(true);};var fetch=function fetch(){getLoader.load().then(radios,error);};var submit=function submit(){if(newID()){var validation=validate(radios(),newID());if(_$1.isUndefined(validation)){data[builder.selectKey]=newID();setLoader.load().then(updateItem,error);}else {complete(true);error({message:validation});}}return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);newID('');};};var setDescription=function setDescription(text){description(text);m$1.redraw();};fetch();return {complete:complete,description:description,setDescription:setDescription,error:error,setLoader:setLoader,getLoader:getLoader,newID:newID,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload,radios:radios};},view:function view(ctrl,args){var data=args.data,item=args.item(),btnValue=ctrl.setLoader()||ctrl.getLoader()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[ctrl.radios()?_$1.map(ctrl.radios(),function(radio,index){var set=function set(){ctrl.newID(radio.id);ctrl.setDescription(radio.description);};var selected=radio.id===(item[data.selectKey]||item.id)?true:false;return m$1('.w-radio',[m$1('input#r-'+index+'.w-radio-input[type=radio][name="admin-radio"][value="'+radio.id+'"]'+(selected?'[checked]':''),{onclick:set}),m$1('label.w-form-label[for="r-'+index+'"]','R$'+radio.minimum_value)]);}):h$1.loader(),m$1('strong','Descrição'),m$1('p',ctrl.description()),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Recompensa alterada com sucesso!')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p',ctrl.error().message)])])]):'']);}};var adminTransaction={view:function view(ctrl,args){var contribution=args.contribution;return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Detalhes do apoio'),m$1('.fontsize-smallest.lineheight-looser',['Valor: R$'+_$1.formatNumber(contribution.value,2,3),m$1('br'),'Taxa: R$'+_$1.formatNumber(contribution.gateway_fee,2,3),m$1('br'),'Aguardando Confirmação: '+(contribution.waiting_payment?'Sim':'Não'),m$1('br'),'Anônimo: '+(contribution.anonymous?'Sim':'Não'),m$1('br'),'Id pagamento: '+contribution.gateway_id,m$1('br'),'Apoio: '+contribution.contribution_id,m$1('br'),'Chave: \n',m$1('br'),contribution.key,m$1('br'),'Meio: '+contribution.gateway,m$1('br'),'Operadora: '+(contribution.gateway_data&&contribution.gateway_data.acquirer_name),m$1('br'),contribution.is_second_slip?[m$1('a.link-hidden[href="#"]','Boleto bancário'),' ',m$1('span.badge','2a via')]:''])]);}};var adminTransactionHistory={controller:function controller(args){var contribution=args.contribution,mapEvents=_$1.reduce([{date:contribution.paid_at,name:'Apoio confirmado'},{date:contribution.pending_refund_at,name:'Reembolso solicitado'},{date:contribution.refunded_at,name:'Estorno realizado'},{date:contribution.created_at,name:'Apoio criado'},{date:contribution.refused_at,name:'Apoio cancelado'},{date:contribution.deleted_at,name:'Apoio excluído'},{date:contribution.chargeback_at,name:'Chargeback'}],function(memo,item){if(item.date!==null&&item.date!==undefined){item.originalDate=item.date;item.date=h$1.momentify(item.date,'DD/MM/YYYY, HH:mm');return memo.concat(item);}return memo;},[]);return {orderedEvents:_$1.sortBy(mapEvents,'originalDate')};},view:function view(ctrl){return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Histórico da transação'),ctrl.orderedEvents.map(function(cEvent){return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event',[m$1('.w-col.w-col-6',[m$1('.fontcolor-secondary',cEvent.date)]),m$1('.w-col.w-col-6',[m$1('div',cEvent.name)])]);})]);}};var adminReward={view:function view(ctrl,args){var reward=args.reward(),available=parseInt(reward.paid_count)+parseInt(reward.waiting_payment_count);return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Recompensa'),m$1('.fontsize-smallest.lineheight-looser',reward.id?['ID: '+reward.id,m$1('br'),'Valor mínimo: R$'+h$1.formatNumber(reward.minimum_value,2,3),m$1('br'),m$1.trust('Disponíveis: '+available+' / '+(reward.maximum_contributions||'&infin;')),m$1('br'),'Aguardando confirmação: '+reward.waiting_payment_count,m$1('br'),'Descrição: '+reward.description]:'Apoio sem recompensa')]);}};var adminContributionDetail={controller:function controller(args){var l=void 0;var loadReward=function loadReward(){var model=models.rewardDetail,reward_id=args.item.reward_id,opts=model.getRowOptions(h$1.idVM.id(reward_id).parameters()),reward=m$1.prop({});l=postgrest.loaderWithToken(opts);if(reward_id){l.load().then(_$1.compose(reward,_$1.first));}return reward;};return {reward:loadReward(),actions:{transfer:{property:'user_id',updateKey:'id',callToAction:'Transferir',innerLabel:'Id do novo apoiador:',outerLabel:'Transferir Apoio',placeholder:'ex: 129908',successMessage:'Apoio transferido com sucesso!',errorMessage:'O apoio não foi transferido!',model:models.contributionDetail},reward:{getKey:'project_id',updateKey:'contribution_id',selectKey:'reward_id',radios:'rewards',callToAction:'Alterar Recompensa',outerLabel:'Recompensa',getModel:models.rewardDetail,updateModel:models.contributionDetail,selectedItem:loadReward(),validate:function validate(rewards,newRewardID){var reward=_$1.findWhere(rewards,{id:newRewardID});return args.item.value>=reward.minimum_value?undefined:'Valor mínimo da recompensa é maior do que o valor da contribuição.';}},refund:{updateKey:'id',callToAction:'Reembolso direto',innerLabel:'Tem certeza que deseja reembolsar esse apoio?',outerLabel:'Reembolsar Apoio',model:models.contributionDetail},remove:{property:'state',updateKey:'id',callToAction:'Apagar',innerLabel:'Tem certeza que deseja apagar esse apoio?',outerLabel:'Apagar Apoio',forceValue:'deleted',successMessage:'Apoio removido com sucesso!',errorMessage:'O apoio não foi removido!',model:models.contributionDetail}},l:l};},view:function view(ctrl,args){var actions=ctrl.actions,item=args.item,reward=ctrl.reward;var addOptions=function addOptions(builder,id){return _$1.extend({},builder,{requestOptions:{url:'/admin/contributions/'+id+'/gateway_refund',method:'PUT'}});};return m$1('#admin-contribution-detail-box',[m$1('.divider.u-margintop-20.u-marginbottom-20'),m$1('.w-row.u-marginbottom-30',[m$1.component(adminInputAction,{data:actions.transfer,item:item}),ctrl.l()?h$1.loader:m$1.component(adminRadioAction,{data:actions.reward,item:reward,getKeyValue:item.project_id,updateKeyValue:item.contribution_id}),m$1.component(adminExternalAction,{data:addOptions(actions.refund,item.id),item:item}),m$1.component(adminInputAction,{data:actions.remove,item:item})]),m$1('.w-row.card.card-terciary.u-radius',[m$1.component(adminTransaction,{contribution:item}),m$1.component(adminTransactionHistory,{contribution:item}),ctrl.l()?h$1.loader:m$1.component(adminReward,{reward:reward,key:item.key})])]);}};var adminConstributions={controller:function controller(){var listVM=contributionListVM,filterVM=vm,error=m$1.prop(''),filterBuilder=[{ //full_text_index
  component:'FilterMain',data:{vm:filterVM.full_text_index,placeholder:'Busque por projeto, email, Ids do usuário e do apoio...'}},{ //state
  component:'FilterDropdown',data:{label:'Com o estado',name:'state',vm:filterVM.state,options:[{value:'',option:'Qualquer um'},{value:'paid',option:'paid'},{value:'refused',option:'refused'},{value:'pending',option:'pending'},{value:'pending_refund',option:'pending_refund'},{value:'refunded',option:'refunded'},{value:'chargeback',option:'chargeback'},{value:'deleted',option:'deleted'}]}},{ //gateway
  component:'FilterDropdown',data:{label:'gateway',name:'gateway',vm:filterVM.gateway,options:[{value:'',option:'Qualquer um'},{value:'Pagarme',option:'Pagarme'},{value:'MoIP',option:'MoIP'},{value:'PayPal',option:'PayPal'},{value:'Credits',option:'Créditos'}]}},{ //value
  component:'FilterNumberRange',data:{label:'Valores entre',first:filterVM.value.gte,last:filterVM.value.lte}},{ //created_at
  component:'FilterDateRange',data:{label:'Período do apoio',first:filterVM.created_at.gte,last:filterVM.created_at.lte}}],submit=function submit(){error(false);listVM.firstPage(filterVM.parameters()).then(null,function(serverError){error(serverError.message);});return false;};return {filterVM:filterVM,filterBuilder:filterBuilder,listVM:{list:listVM,error:error},data:{label:'Apoios'},submit:submit};},view:function view(ctrl){return [m$1.component(adminFilter,{form:ctrl.filterVM.formDescriber,filterBuilder:ctrl.filterBuilder,submit:ctrl.submit}),m$1.component(adminList,{vm:ctrl.listVM,listItem:adminContributionItem,listDetail:adminContributionDetail})];}};var adminContributions$1=adminContributions;fdescribe('adminContributions',function(){var ctrl,$output;beforeAll(function(){AdminContributions=m.component(adminContributions$1);ctrl=AdminContributions.controller();});describe('controller',function(){it('should instantiate a list view-model',function(){expect(ctrl.listVM).toBeDefined();});it('should instantiate a filter view-model',function(){expect(ctrl.filterVM).toBeDefined();});});describe('view',function(){beforeAll(function(){$output=mq(Contributions);});it('should render AdminFilter nested component',function(){expect($output.has('#admin-contributions-filter')).toBeTrue();});it('should render AdminList nested component',function(){expect($output.has('#admin-contributions-list')).toBeTrue();});});});var userListVM=postgrest.paginationVM(models.user,'id.desc',{'Prefer':'count=exact'});var vm$1=postgrest.filtersVM({full_text_index:'@@',deactivated_at:'is.null'});var paramToString$1=function paramToString(p){return (p||'').toString().trim();}; // Set default values
  vm$1.deactivated_at(null).order({id:'desc'});vm$1.deactivated_at.toFilter=function(){var filter=JSON.parse(vm$1.deactivated_at());return filter;};vm$1.full_text_index.toFilter=function(){var filter=paramToString$1(vm$1.full_text_index());return filter&&replaceDiacritics(filter)||undefined;};var adminUserItem={view:function view(ctrl,args){return m$1('.w-row',[m$1('.w-col.w-col-4',[m$1.component(adminUser,args)])]);}};var adminResetPassword={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),key=builder.property,data={},item=args.item;builder.requestOptions.config=function(xhr){if(h$1.authenticityToken()){xhr.setRequestHeader('X-CSRF-Token',h$1.authenticityToken());}};var l=m$1.prop(false),load=function load(){return m$1.request(_$1.extend({},{data:data},builder.requestOptions));},newPassword=m$1.prop(''),error_message=m$1.prop('');var requestError=function requestError(err){l(false);error_message(err.errors[0]);complete(true);error(true);};var updateItem=function updateItem(res){l(false);_$1.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){l(true);data[key]=newPassword();load().then(updateItem,requestError);return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);};};return {complete:complete,error:error,error_message:error_message,l:l,newPassword:newPassword,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),m$1('input.w-input.text-field[type="text"][name="'+data.property+'"][placeholder="'+data.placeholder+'"]',{onchange:m$1.withAttr('value',ctrl.newPassword),value:ctrl.newPassword()}),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Senha alterada com sucesso.')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p',ctrl.error_message())])])]):'']);}};var adminNotificationHistory={controller:function controller(args){var notifications=m$1.prop([]),getNotifications=function getNotifications(user){var notification=models.notification;notification.getPageWithToken(postgrest.filtersVM({user_id:'eq',sent_at:'is.null'}).user_id(user.id).sent_at(!null).order({sent_at:'desc'}).parameters()).then(notifications);};getNotifications(args.user);return {notifications:notifications};},view:function view(ctrl){return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Histórico de notificações'),ctrl.notifications().map(function(cEvent){return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event',[m$1('.w-col.w-col-24',[m$1('.fontcolor-secondary',h$1.momentify(cEvent.sent_at,'DD/MM/YYYY, HH:mm'),' - ',cEvent.template_name,cEvent.origin?' - '+cEvent.origin:'')])]);})]);}};var adminUserDetail={controller:function controller(){return {actions:{reset:{property:'password',callToAction:'Redefinir',innerLabel:'Nova senha de Usuário:',outerLabel:'Redefinir senha',placeholder:'ex: 123mud@r',model:c.models.user},reactivate:{property:'deactivated_at',updateKey:'id',callToAction:'Reativar',innerLabel:'Tem certeza que deseja reativar esse usuário?',successMessage:'Usuário reativado com sucesso!',errorMessage:'O usuário não pôde ser reativado!',outerLabel:'Reativar usuário',forceValue:null,model:c.models.user}}};},view:function view(ctrl,args){var actions=ctrl.actions,item=args.item,details=args.details,addOptions=function addOptions(builder,id){return _$1.extend({},builder,{requestOptions:{url:'/users/'+id+'/new_password',method:'POST'}});};return m$1('#admin-contribution-detail-box',[m$1('.divider.u-margintop-20.u-marginbottom-20'),m$1('.w-row.u-marginbottom-30',[m$1.component(adminResetPassword,{data:addOptions(actions.reset,item.id),item:item}),item.deactivated_at?m$1.component(adminInputAction,{data:actions.reactivate,item:item}):'']),m$1('.w-row.card.card-terciary.u-radius',[m$1.component(adminNotificationHistory,{user:item})])]);}};var adminUsers={controller:function controller(){var listVM=userListVM,filterVM=vm$1,error=m$1.prop(''),itemBuilder=[{component:'AdminUser',wrapperClass:'.w-col.w-col-4'}],filterBuilder=[{ //name
  component:'FilterMain',data:{vm:filterVM.full_text_index,placeholder:'Busque por nome, e-mail, Ids do usuário...'}},{ //status
  component:'FilterDropdown',data:{label:'Com o estado',index:'status',name:'deactivated_at',vm:filterVM.deactivated_at,options:[{value:'',option:'Qualquer um'},{value:null,option:'ativo'},{value:!null,option:'desativado'}]}}],submit=function submit(){listVM.firstPage(filterVM.parameters()).then(null,function(serverError){error(serverError.message);});return false;};return {filterVM:filterVM,filterBuilder:filterBuilder,listVM:{list:listVM,error:error},submit:submit};},view:function view(ctrl){var label='Usuários';return [m$1.component(adminFilter,{form:ctrl.filterVM.formDescriber,filterBuilder:ctrl.filterBuilder,label:label,submit:ctrl.submit}),m$1.component(adminList,{vm:ctrl.listVM,label:label,listItem:adminUserItem,listDetail:adminUserDetail})];}};describe('adminUsers',function(){var ctrl,$output;beforeAll(function(){AdminUsers=m.component(adminUsers);ctrl=AdminUsers.controller();});describe('controller',function(){it('should instantiate a list view-model',function(){expect(ctrl.listVM).toBeDefined();});it('should instantiate a filter view-model',function(){expect(ctrl.filterVM).toBeDefined();});});describe('view',function(){beforeAll(function(){$output=mq(Users);});it('should render AdminFilter nested component',function(){expect($output.has('#admin-contributions-filter')).toBeTrue();});it('should render AdminList nested component',function(){expect($output.has('#admin-contributions-list')).toBeTrue();});});});describe('pages.LiveStatistics',function(){var $output=void 0,statistic=void 0,LiveStatistics=window.c.root.LiveStatistics;describe('view',function(){beforeAll(function(){statistic=StatisticMockery()[0];var component=m.component(LiveStatistics);$output=mq(component.view(component.controller(),{}));});it('should render statistics',function(){expect($output.contains(window.c.h.formatNumber(statistic.total_contributed,2,3))).toEqual(true);expect($output.contains(statistic.total_contributors)).toEqual(true);});});});describe('ProjectsExplore',function(){var $output=void 0,project=void 0,component=void 0,ProjectsExplore=window.c.root.ProjectsExplore;beforeAll(function(){window.location.hash='#by_category_id/1';component=m.component(ProjectsExplore);$output=mq(component);});it('should render search container',function(){$output.should.have('.hero-search');});});describe('ProjectShow',function(){var $output=void 0,projectDetail=void 0,ProjectShow=window.c.root.ProjectsShow;beforeAll(function(){window.location.hash='';projectDetail=ProjectDetailsMockery()[0];var component=m.component(ProjectShow,{project_id:123,project_user_id:1231}),view=component.view(component.controller());$output=mq(view);});it('should render project some details',function(){expect($output.contains(projectDetail.name)).toEqual(true);$output.should.have('#project-sidebar');$output.should.have('#project-header');$output.should.have('.project-highlight');$output.should.have('.project-nav');$output.should.have('#rewards');});});describe('UsersBalance',function(){var $output=void 0,component=void 0,UsersBalance=window.c.root.UsersBalance;beforeAll(function(){component=m.component(UsersBalance,{user_id:1});$output=mq(component);});it('should render user balance area',function(){$output.should.have('.user-balance-section');});it('should render user balance transactions area',function(){$output.should.have('.balance-transactions-area');});});describe('Search',function(){var $output=void 0,c=window.c,Search=c.Search,action='/test',method='POST';describe('view',function(){beforeEach(function(){$output=mq(Search.view({},{action:action,method:method}));});it('should render the search form',function(){expect($output.find('form').length).toEqual(1);expect($output.find('input[type="text"]').length).toEqual(1);expect($output.find('button').length).toEqual(1);});it('should set the given action',function(){expect($output.find('form[action="'+action+'"]').length).toEqual(1);});it('should set the given method',function(){expect($output.find('form[method="'+method+'"]').length).toEqual(1);});});});describe('Slider',function(){var $output=void 0,c=window.c,m=window.m,title='TitleSample',defaultDocumentWidth=1600,slides=[m('h1','teste'),m('h1','teste'),m('h1','teste'),m('h1','teste')];describe('view',function(){beforeEach(function(){$output=mq(c.Slider,{title:title,slides:slides});});it('should render all the slides',function(){expect($output.find('.slide').length).toEqual(slides.length);});it('should render one bullet for each slide',function(){expect($output.find('.slide-bullet').length).toEqual(slides.length);});it('should move to next slide on slide next click',function(){$output.click('#slide-next');var firstSlide=$output.first('.slide');expect(firstSlide.attrs.style.indexOf('-'+defaultDocumentWidth+'px')).toBeGreaterThan(-1);});it('should move to previous slide on slide prev click',function(){$output.click('#slide-next');$output.click('#slide-prev');var firstSlide=$output.first('.slide');expect(firstSlide.attrs.style.indexOf('0px')).toBeGreaterThan(-1);});});});describe('TeamMembers',function(){var $output,TeamMembers=window.c.TeamMembers;describe('view',function(){beforeAll(function(){$output=mq(TeamMembers);});it('should render fetched team members',function(){expect($output.has('#team-members-static')).toEqual(true);expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);});});});describe('TeamTotal',function(){var $output=void 0,TeamTotal=window.c.TeamTotal;describe('view',function(){beforeAll(function(){$output=mq(TeamTotal);});it('should render fetched team total info',function(){expect($output.find('#team-total-static').length).toEqual(1);});});});describe('Tooltip',function(){var $output=void 0,c=window.c,m=window.m,element='a#tooltip-trigger[href="#"]',text='tooltipText',tooltip=function tooltip(el){return m.component(c.Tooltip,{el:el,text:text,width:320});};describe('view',function(){beforeEach(function(){$output=mq(tooltip(element));});it('should not render the tooltip at first',function(){expect($output.find('.tooltip').length).toEqual(0);});it('should render the tooltip on element mouseenter',function(){$output.click('#tooltip-trigger');expect($output.find('.tooltip').length).toEqual(1);expect($output.contains(text)).toBeTrue();});it('should hide the tooltip again on element mouseleave',function(){$output.click('#tooltip-trigger');$output.click('#tooltip-trigger');expect($output.find('.tooltip').length).toEqual(0);});});});describe('UserBalanceRequestModalContent',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalanceModal=window.c.UserBalanceRequestModalContent;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalanceModal,_.extend({},parentComponent.controller(),{balance:{amount:205,user_id:1}}));$output=mq(component);});it('should call bank account endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/bank_accounts?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user bank account / amount data',function(){expect($output.contains('R$ 205,00')).toEqual(true);expect($output.contains('Banco XX')).toEqual(true);$output.should.have('.btn-request-fund');});it('should call balance transfer endpoint when click on request fund btn and show success message',function(){$output.click('.btn-request-fund');$output.should.have('.fa-check-circle');var lastRequest=jasmine.Ajax.requests.filter(/balance_transfers/)[0];expect(lastRequest.url).toEqual(apiPrefix+'/balance_transfers');expect(lastRequest.method).toEqual('POST');});});describe('UserBalanceTransactions',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalanceTransactions=window.c.UserBalanceTransactions;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalanceTransactions,_.extend({},parentComponent.controller(),{user_id:1}));$output=mq(component);});it('should call balance transactions endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/balance_transactions?order=created_at.desc&user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user balance transactions',function(){$output.should.have('.card-detailed-open');expect($output.contains('R$ 604,50')).toEqual(true);expect($output.contains('R$ 0,00')).toEqual(true);expect($output.contains('R$ -604,50')).toEqual(true);expect($output.contains('Project x')).toEqual(true);});});describe('UserBalance',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalance=window.c.UserBalance;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalance,_.extend({},parentComponent.controller(),{user_id:1}));$output=mq(component);});it('should call balances endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/balances?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user balance',function(){expect($output.contains('R$ 205,00')).toEqual(true);});it('should render request fund btn',function(){$output.should.have('.r-fund-btn');});it('should call bank_account endpoint when click on request fund btn and show modal',function(){$output.click('.r-fund-btn');$output.should.have('.modal-dialog-inner');expect($output.contains('Banco XX')).toEqual(true);var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/bank_accounts?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});});describe('admin.contributionFilterVM',function(){var adminApp=window.c.admin,vm=adminApp.contributionFilterVM,momentFromString=window.c.h.momentFromString;describe("created_at.lte.toFilter",function(){it("should use end of the day timestamp to send filter",function(){vm.created_at.lte('21/12/1999');expect(vm.created_at.lte.toFilter()).toEqual(momentFromString(vm.created_at.lte()).endOf('day').format());});});describe("full_text_index.toFilter",function(){it("should remove all diacritics to send filter",function(){vm.full_text_index('rémoção dos acêntüs');expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');});});});describe('admin.userFilterVM',function(){var adminApp=window.c.admin,vm=adminApp.userFilterVM;describe("deactivated_at.toFilter",function(){it("should parse string inputs to json objects to send filter",function(){vm.deactivated_at('null');expect(vm.deactivated_at.toFilter()).toEqual(null);});});describe("full_text_index.toFilter",function(){it("should remove all diacritics to send filter",function(){vm.full_text_index('rémoção dos acêntüs');expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');});});});describe('YoutubeLightbox',function(){var $output=void 0,c=window.c,m=window.m,visibleStyl='display:block',invisibleStyl='display:none';describe('view',function(){beforeEach(function(){$output=mq(c.YoutubeLightbox,{src:'FlFTcDSKnLM'});});it('should not render the lightbox at first',function(){expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);});it('should render the lightbox on play button click',function(){$output.click('#youtube-play');expect($output.find('#lightbox')[0].attrs.style).toEqual(visibleStyl);});it('should close the lightbox on close button click',function(){$output.click('#youtube-play');$output.click('#youtube-close');expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);});});});describe("h.formatNumber",function(){var number=null,formatNumber=window.c.h.formatNumber;it("should format number",function(){number=120.20;expect(formatNumber(number)).toEqual('120');expect(formatNumber(number,2,3)).toEqual('120,20');expect(formatNumber(number,2,2)).toEqual('1.20,20');});});describe('h.rewardSouldOut',function(){var reward=null,rewardSouldOut=window.c.h.rewardSouldOut;it('return true when reward already sould out',function(){reward={maximum_contributions:5,paid_count:3,waiting_payment_count:2};expect(rewardSouldOut(reward)).toEqual(true);});it('return false when reward is not sould out',function(){reward={maximum_contributions:5,paid_count:3,waiting_payment_count:1};expect(rewardSouldOut(reward)).toEqual(false);});it('return false when reward is not defined maximum_contributions',function(){reward={maximum_contributions:null,paid_count:3,waiting_payment_count:1};expect(rewardSouldOut(reward)).toEqual(false);});});describe('h.rewardRemaning',function(){var reward=void 0,rewardRemaning=window.c.h.rewardRemaning;it('should return the total remaning rewards',function(){reward={maximum_contributions:10,paid_count:3,waiting_payment_count:2};expect(rewardRemaning(reward)).toEqual(5);});});describe('h.parseUrl',function(){var url=void 0,parseUrl=window.c.h.parseUrl;it('should create an a element',function(){url='http://google.com';expect(parseUrl(url).hostname).toEqual('google.com');});});describe('h.pluralize',function(){var count=void 0,pluralize=window.c.h.pluralize;it('should use plural when count greater 1',function(){count=3;expect(pluralize(count,' dia',' dias')).toEqual('3 dias');});it('should use singular when count less or equal 1',function(){count=1;expect(pluralize(count,' dia',' dias')).toEqual('1 dia');});});})(this.spec=this.spec||{},m,postgrest,_,moment,I18n,replaceDiacritics);var models={contributionDetail:postgrest.model('contribution_details'),contributionActivity:postgrest.model('contribution_activities'),projectDetail:postgrest.model('project_details'),userDetail:postgrest.model('user_details'),balance:postgrest.model('balances'),balanceTransaction:postgrest.model('balance_transactions'),balanceTransfer:postgrest.model('balance_transfers'),user:postgrest.model('users'),bankAccount:postgrest.model('bank_accounts'),rewardDetail:postgrest.model('reward_details'),projectReminder:postgrest.model('project_reminders'),contributions:postgrest.model('contributions'),directMessage:postgrest.model('direct_messages'),teamTotal:postgrest.model('team_totals'),projectAccount:postgrest.model('project_accounts'),projectContribution:postgrest.model('project_contributions'),projectPostDetail:postgrest.model('project_posts_details'),projectContributionsPerDay:postgrest.model('project_contributions_per_day'),projectContributionsPerLocation:postgrest.model('project_contributions_per_location'),projectContributionsPerRef:postgrest.model('project_contributions_per_ref'),project:postgrest.model('projects'),projectSearch:postgrest.model('rpc/project_search'),category:postgrest.model('categories'),categoryTotals:postgrest.model('category_totals'),categoryFollower:postgrest.model('category_followers'),teamMember:postgrest.model('team_members'),notification:postgrest.model('notifications'),statistic:postgrest.model('statistics'),successfulProject:postgrest.model('successful_projects')};models.teamMember.pageSize(40);models.rewardDetail.pageSize(false);models.project.pageSize(30);models.category.pageSize(50);models.contributionActivity.pageSize(40);models.successfulProject.pageSize(9);var hashMatch=function hashMatch(str){return window.location.hash===str;};var paramByName=function paramByName(name){var normalName=name.replace(/[\[]/,'\\[').replace(/[\]]/,'\\]'),regex=new RegExp('[\\?&]'+normalName+'=([^&#]*)'),results=regex.exec(location.search);return results===null?'':decodeURIComponent(results[1].replace(/\+/g,' '));};var selfOrEmpty=function selfOrEmpty(obj){var emptyState=arguments.length<=1||arguments[1]===undefined?'':arguments[1];return obj?obj:emptyState;};var setMomentifyLocale=function setMomentifyLocale(){moment$1.locale('pt',{monthsShort:'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')});};var existy=function existy(x){return x!=null;};var momentify=function momentify(date,format){format=format||'DD/MM/YYYY';return date?moment$1(date).locale('pt').format(format):'no date';};var storeAction=function storeAction(action){if(!sessionStorage.getItem(action)){return sessionStorage.setItem(action,action);}};var callStoredAction=function callStoredAction(action,func){if(sessionStorage.getItem(action)){func.call();return sessionStorage.removeItem(action);}};var discuss=function discuss(page,identifier){var d=document,s=d.createElement('script');window.disqus_config=function(){this.page.url=page;this.page.identifier=identifier;};s.src='//catarseflex.disqus.com/embed.js';s.setAttribute('data-timestamp',+new Date());(d.head||d.body).appendChild(s);return m$1('');};var momentFromString=function momentFromString(date,format){var european=moment$1(date,format||'DD/MM/YYYY');return european.isValid()?european:moment$1(date);};var translatedTimeUnits={days:'dias',minutes:'minutos',hours:'horas',seconds:'segundos'};var translatedTime=function translatedTime(time){var translatedTime=translatedTimeUnits,unit=function unit(){var projUnit=translatedTime[time.unit||'seconds'];return time.total<=1?projUnit.slice(0,-1):projUnit;};return {unit:unit(),total:time.total};};var generateFormatNumber=function generateFormatNumber(s,c){return function(number,n,x){if(!_.isNumber(number)){return null;}var re='\\d(?=(\\d{'+(x||3)+'})+'+(n>0?'\\D':'$')+')',num=number.toFixed(Math.max(0,~ ~n));return (c?num.replace('.',c):num).replace(new RegExp(re,'g'),'$&'+(s||','));};};var formatNumber=generateFormatNumber('.',',');var toggleProp=function toggleProp(defaultState,alternateState){var p=m$1.prop(defaultState);p.toggle=function(){return p(p()===alternateState?defaultState:alternateState);};return p;};var idVM=postgrest.filtersVM({id:'eq'});var getCurrentProject=function getCurrentProject(){var root=document.getElementById('project-show-root'),data=root.getAttribute('data-parameters');if(data){return JSON.parse(data);}else {return false;}};var getRdToken=function getRdToken(){var meta=_.first(document.querySelectorAll('[name=rd-token]'));return meta?meta.content:undefined;};var getUser=function getUser(){var body=document.getElementsByTagName('body'),data=_.first(body).getAttribute('data-user');if(data){return JSON.parse(data);}else {return false;}};var locationActionMatch=function locationActionMatch(action){var act=window.location.pathname.split('/').slice(-1)[0];return action===act;};var useAvatarOrDefault=function useAvatarOrDefault(avatarPath){return avatarPath||'/assets/catarse_bootstrap/user.jpg';};var loader=function loader(){return m$1('.u-text-center.u-margintop-30 u-marginbottom-30',[m$1('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);};var newFeatureBadge=function newFeatureBadge(){return m$1('span.badge.badge-success.margin-side-5',I18n$1.t('projects.new_feature_badge'));};var fbParse=function fbParse(){var tryParse=function tryParse(){try{window.FB.XFBML.parse();}catch(e){console.log(e);}};return window.setTimeout(tryParse,500); //use timeout to wait async of facebook
  };var pluralize=function pluralize(count,s,p){return count>1?count+p:count+s;};var simpleFormat=function simpleFormat(){var str=arguments.length<=0||arguments[0]===undefined?'':arguments[0];str=str.replace(/\r\n?/,'\n');if(str.length>0){str=str.replace(/\n\n+/g,'</p><p>');str=str.replace(/\n/g,'<br />');str='<p>'+str+'</p>';}return str;};var rewardSouldOut=function rewardSouldOut(reward){return reward.maximum_contributions>0?reward.paid_count+reward.waiting_payment_count>=reward.maximum_contributions:false;};var rewardRemaning=function rewardRemaning(reward){return reward.maximum_contributions-(reward.paid_count+reward.waiting_payment_count);};var parseUrl=function parseUrl(href){var l=document.createElement('a');l.href=href;return l;};var UIHelper=function UIHelper(){return function(el,isInitialized){if(!isInitialized&&$){window.UIHelper.setupResponsiveIframes($(el));}};};var toAnchor=function toAnchor(){return function(el,isInitialized){if(!isInitialized){var hash=window.location.hash.substr(1);if(hash===el.id){window.location.hash='';setTimeout(function(){window.location.hash=el.id;});}}};};var validateEmail=function validateEmail(email){var re=/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;return re.test(email);};var navigateToDevise=function navigateToDevise(){window.location.href='/pt/login';return false;};var cumulativeOffset=function cumulativeOffset(element){var top=0,left=0;do {top+=element.offsetTop||0;left+=element.offsetLeft||0;element=element.offsetParent;}while(element);return {top:top,left:left};};var closeModal=function closeModal(){var el=document.getElementsByClassName('modal-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();document.getElementsByClassName('modal-backdrop')[0].style.display='none';};};};var closeFlash=function closeFlash(){var el=document.getElementsByClassName('icon-close')[0];if(_.isElement(el)){el.onclick=function(event){event.preventDefault();el.parentElement.remove();};};};var i18nScope=function i18nScope(scope,obj){obj=obj||{};return _.extend({},obj,{scope:scope});};var redrawHashChange=function redrawHashChange(before){var callback=_.isFunction(before)?function(){before();m$1.redraw();}:m$1.redraw;window.addEventListener('hashchange',callback,false);};var authenticityToken=function authenticityToken(){var meta=_.first(document.querySelectorAll('[name=csrf-token]'));return meta?meta.content:undefined;};var animateScrollTo=function animateScrollTo(el){var scrolled=window.scrollY;var offset=cumulativeOffset(el).top,duration=300,dFrame=(offset-scrolled)/duration, //EaseInOutCubic easing function. We'll abstract all animation funs later.
  eased=function eased(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1;},animation=setInterval(function(){var pos=eased(scrolled/offset)*scrolled;window.scrollTo(0,pos);if(scrolled>=offset){clearInterval(animation);}scrolled=scrolled+dFrame;},1);};var scrollTo=function scrollTo(){var setTrigger=function setTrigger(el,anchorId){el.onclick=function(){var anchorEl=document.getElementById(anchorId);if(_.isElement(anchorEl)){animateScrollTo(anchorEl);}return false;};};return function(el,isInitialized){if(!isInitialized){setTrigger(el,el.hash.slice(1));}};};var RDTracker=function RDTracker(eventId){return function(el,isInitialized){if(!isInitialized){var integrationScript=document.createElement('script');integrationScript.type='text/javascript';integrationScript.id='RDIntegration';if(!document.getElementById(integrationScript.id)){document.body.appendChild(integrationScript);integrationScript.onload=function(){return RdIntegration.integrate(getRdToken(),eventId);};integrationScript.src='https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';}return false;}};};setMomentifyLocale();closeFlash();closeModal();var h$1={authenticityToken:authenticityToken,cumulativeOffset:cumulativeOffset,discuss:discuss,existy:existy,validateEmail:validateEmail,momentify:momentify,momentFromString:momentFromString,formatNumber:formatNumber,idVM:idVM,getUser:getUser,getCurrentProject:getCurrentProject,toggleProp:toggleProp,loader:loader,newFeatureBadge:newFeatureBadge,fbParse:fbParse,pluralize:pluralize,simpleFormat:simpleFormat,translatedTime:translatedTime,rewardSouldOut:rewardSouldOut,rewardRemaning:rewardRemaning,parseUrl:parseUrl,hashMatch:hashMatch,redrawHashChange:redrawHashChange,useAvatarOrDefault:useAvatarOrDefault,locationActionMatch:locationActionMatch,navigateToDevise:navigateToDevise,storeAction:storeAction,callStoredAction:callStoredAction,UIHelper:UIHelper,toAnchor:toAnchor,paramByName:paramByName,i18nScope:i18nScope,RDTracker:RDTracker,selfOrEmpty:selfOrEmpty,scrollTo:scrollTo};var adminExternalAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),data={},item=args.item;builder.requestOptions.config=function(xhr){if(h$1.authenticityToken()){xhr.setRequestHeader('X-CSRF-Token',h$1.authenticityToken());}};var reload=_$1.compose(builder.model.getRowWithToken,h$1.idVM.id(item[builder.updateKey]).parameters),l=m$1.prop(false);var reloadItem=function reloadItem(){return reload().then(updateItem);};var requestError=function requestError(err){l(false);complete(true);error(true);};var updateItem=function updateItem(res){_$1.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){l(true);m$1.request(builder.requestOptions).then(reloadItem,requestError);return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);};};return {l:l,complete:complete,error:error,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Requisição feita com sucesso.')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p','Houve um problema na requisição.')])])]):'']);}};describe('adminExternalAction',function(){var testModel=postgrest$1.model('reloadAction'),item={testKey:'foo'},ctrl,$output;var args={updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',model:testModel,requestOptions:{url:'http://external_api'}};describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({'responseText':JSON.stringify([])});});beforeEach(function(){$output=mq(adminExternalAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});});describe('on form submit',function(){beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');});});});});describe('AdminFilter',function(){var ctrl=void 0,submit=void 0,fakeForm=void 0,formDesc=void 0,filterDescriber=void 0,$output=void 0,c=window.c,vm=c.admin.contributionFilterVM,AdminFilter=c.AdminFilter;describe('controller',function(){beforeAll(function(){ctrl=AdminFilter.controller();});it('should instantiate a toggler',function(){expect(ctrl.toggler).toBeDefined();});});describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();submit=jasmine.createSpy('submit');filterDescriber=FilterDescriberMock();$output=mq(AdminFilter,{filterBuilder:filterDescriber,data:{label:'foo'},submit:submit});});it('should render the main filter on render',function(){expect(m.component).toHaveBeenCalledWith(c.FilterMain,filterDescriber[0].data);});it('should build a form from a FormDescriber when clicking the advanced filter',function(){$output.click('button'); //mithril.query calls component one time to build it, so calls.count = length + 1.
  expect(m.component.calls.count()).toEqual(filterDescriber.length+1);});it('should trigger a submit function when submitting the form',function(){$output.trigger('form','submit');expect(submit).toHaveBeenCalled();});});});describe('AdminInputAction',function(){var c=window.c,m=window.m,models=window.c.models,AdminInputAction=c.AdminInputAction,testModel=m.postgrest.model('test'),item={testKey:'foo'},forced=null,ctrl,$output;var args={property:'testKey',updateKey:'updateKey',callToAction:'cta',innerLabel:'inner',outerLabel:'outer',placeholder:'place',model:testModel};describe('controller',function(){beforeAll(function(){ctrl=AdminInputAction.controller({data:args,item:item});});it('should instantiate a submit function',function(){expect(ctrl.submit).toBeFunction();});it('should return a toggler prop',function(){expect(ctrl.toggler).toBeFunction();});it('should return a value property to bind to',function(){expect(ctrl.newValue).toBeFunction();});describe('when forceValue is set',function(){beforeAll(function(){args.forceValue=forced;ctrl=AdminInputAction.controller({data:args,item:item});});it('should initialize newValue with forced value',function(){expect(ctrl.newValue()).toEqual(forced);});afterAll(function(){delete args.forceValue;});});});describe('view',function(){beforeEach(function(){$output=mq(AdminInputAction,{data:args,item:item});});it('shoud render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.innerLabel)).toBeFalse();expect($output.contains(args.placeholder)).toBeFalse();expect($output.contains(args.callToAction)).toBeFalse();});describe('on button click',function(){beforeEach(function(){$output.click('button');});it('should render an inner label',function(){expect($output.contains(args.innerLabel)).toBeTrue();});it('should render a placeholder',function(){expect($output.has('input[placeholder="'+args.placeholder+'"]')).toBeTrue();});it('should render a call to action',function(){expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);});describe('when forceValue is set',function(){beforeAll(function(){args.forceValue=forced;ctrl=AdminInputAction.controller({data:args,item:item});});it('should initialize newValue with forced value',function(){expect(ctrl.newValue()).toEqual(forced);});afterAll(function(){delete args.forceValue;});});});describe('on form submit',function(){beforeAll(function(){spyOn(m,'request').and.returnValue({then:function then(callback){callback([{test:true}]);}});});beforeEach(function(){$output.click('button');});it('should call a submit function on form submit',function(){$output.trigger('form','submit');expect(m.request).toHaveBeenCalled();});});});});describe('AdminItem',function(){var c=window.c,AdminItem=c.AdminItem,item,$output,ListItemMock,ListDetailMock;beforeAll(function(){ListItemMock={view:function view(ctrl,args){return m('.list-item-mock');}};ListDetailMock={view:function view(ctrl,args){return m('.list-detail-mock');}};});describe('view',function(){beforeEach(function(){$output=mq(AdminItem,{listItem:ListItemMock,listDetail:ListDetailMock,item:item});});it('should render list item',function(){$output.should.have('.list-item-mock');});it('should render list detail when toggle details is true',function(){$output.click('button');$output.should.have('.list-detail-mock');});it('should not render list detail when toggle details is false',function(){$output.should.not.have('.list-detail-mock');});});});describe('AdminList',function(){var c=window.c,AdminList=c.AdminList,$output=void 0,model=void 0,vm=void 0,ListItemMock=void 0,ListDetailMock=void 0,results=[{id:1}],listParameters=void 0,endpoint=void 0;beforeAll(function(){endpoint=mockEndpoint('items',results);ListItemMock={view:function view(ctrl,args){return m('.list-item-mock');}};ListDetailMock={view:function view(ctrl,args){return m('');}};model=m.postgrest.model('items');vm={list:m.postgrest.paginationVM(model),error:m.prop()};listParameters={vm:vm,listItem:ListItemMock,listDetail:ListDetailMock};});describe('view',function(){describe('when not loading',function(){beforeEach(function(){spyOn(vm.list,"isLoading").and.returnValue(false);$output=mq(AdminList,listParameters);});it('should render fetched items',function(){expect($output.find('.card').length).toEqual(results.length);});it('should not show a loading icon',function(){$output.should.not.have('img[alt="Loader"]');});});describe('when loading',function(){beforeEach(function(){spyOn(vm.list,"isLoading").and.returnValue(true);$output=mq(AdminList,listParameters);});it('should render fetched items',function(){expect($output.find('.card').length).toEqual(results.length);});it('should show a loading icon',function(){$output.should.have('img[alt="Loader"]');});});describe('when error',function(){beforeEach(function(){vm.error('endpoint error');$output=mq(AdminList,listParameters);});it('should show an error info',function(){expect($output.has('.card-error')).toBeTrue();});});});});describe('AdminNotificationHistory',function(){var c=window.c,user=void 0,historyBox=void 0,ctrl=void 0,view=void 0,$output=void 0;beforeAll(function(){user=m.prop(UserDetailMockery(1));$output=mq(c.AdminNotificationHistory,{user:user()[0]});});describe('view',function(){it('should render fetched notifications',function(){expect($output.find('.date-event').length).toEqual(1);});});});describe('AdminProjectDetailsCard',function(){var AdminProjectDetailsCard=window.c.AdminProjectDetailsCard,generateController=void 0,ctrl=void 0,projectDetail=void 0,component=void 0,view=void 0,$output=void 0;describe('controller',function(){beforeAll(function(){generateController=function generateController(attrs){projectDetail=ProjectDetailsMockery(attrs)[0];component=m.component(AdminProjectDetailsCard,{resource:projectDetail});return component.controller();};});describe('project status text',function(){it('when project is online',function(){ctrl=generateController({state:'online'});expect(ctrl.statusTextObj().text).toEqual('NO AR');expect(ctrl.statusTextObj().cssClass).toEqual('text-success');});it('when project is failed',function(){ctrl=generateController({state:'failed'});expect(ctrl.statusTextObj().text).toEqual('NÃO FINANCIADO');expect(ctrl.statusTextObj().cssClass).toEqual('text-error');});});describe('project remaining time',function(){it('when remaining time is in days',function(){ctrl=generateController({remaining_time:{total:10,unit:'days'}});expect(ctrl.remainingTextObj.total).toEqual(10);expect(ctrl.remainingTextObj.unit).toEqual('dias');});it('when remaining time is in seconds',function(){ctrl=generateController({remaining_time:{total:12,unit:'seconds'}});expect(ctrl.remainingTextObj.total).toEqual(12);expect(ctrl.remainingTextObj.unit).toEqual('segundos');});it('when remaining time is in hours',function(){ctrl=generateController({remaining_time:{total:2,unit:'hours'}});expect(ctrl.remainingTextObj.total).toEqual(2);expect(ctrl.remainingTextObj.unit).toEqual('horas');});});});describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];component=m.component(AdminProjectDetailsCard,{resource:projectDetail});ctrl=component.controller();view=component.view(ctrl,{resource:projectDetail});$output=mq(view);});it('should render details of the project in card',function(){var remaningTimeObj=ctrl.remainingTextObj,statusTextObj=ctrl.statusTextObj();expect($output.find('.project-details-card').length).toEqual(1);expect($output.contains(projectDetail.total_contributions)).toEqual(true);expect($output.contains('R$ '+window.c.h.formatNumber(projectDetail.pledged,2))).toEqual(true);});});});describe('AdminRadioAction',function(){var c=window.c,m=window.m,models=window.c.models,AdminRadioAction=c.AdminRadioAction,testModel=m.postgrest.model('reward_details'),testStr='updated',errorStr='error!';var error=false,item=void 0,fakeData={},$output=void 0;var args={getKey:'project_id',updateKey:'contribution_id',selectKey:'reward_id',radios:'rewards',callToAction:'Alterar Recompensa',outerLabel:'Recompensa',getModel:testModel,updateModel:testModel,validate:function validate(){return undefined;}};var errorArgs=_.extend({},args,{validate:function validate(){return errorStr;}});describe('view',function(){beforeAll(function(){item=_.first(RewardDetailsMockery());args.selectedItem=m.prop(item);$output=mq(AdminRadioAction,{data:args,item:m.prop(item)});});it('shoud only render the outerLabel on first render',function(){expect($output.contains(args.outerLabel)).toBeTrue();expect($output.contains(args.callToAction)).toBeFalse();});describe('on action button click',function(){beforeAll(function(){$output.click('button');});it('should render a row of radio inputs',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect($output.find('input[type="radio"]').length).toEqual(JSON.parse(lastRequest.responseText).length);});it('should render the description of the default selected radio',function(){$output.should.contain(item.description);});it('should send an patch request on form submit',function(){$output.click('#r-0');$output.trigger('form','submit');var lastRequest=jasmine.Ajax.requests.mostRecent(); // Should make a patch request to update item
  expect(lastRequest.method).toEqual('PATCH');});describe('when new value is not valid',function(){beforeAll(function(){$output=mq(AdminRadioAction,{data:errorArgs,item:m.prop(item)});$output.click('button');$output.click('#r-0');});it('should present an error message when new value is invalid',function(){$output.trigger('form','submit');$output.should.contain(errorStr);});});});});});describe('AdminReward',function(){var ctrl=void 0,$output=void 0,c=window.c,AdminReward=c.AdminReward;describe('view',function(){var reward=void 0,ctrl=void 0;describe("when contribution has no reward",function(){beforeAll(function(){$output=mq(AdminReward.view(undefined,{reward:m.prop({})}));});it('should render "no reward" text when reward_id is null',function(){$output.should.contain('Apoio sem recompensa');});});describe("when contribution has reward",function(){var reward=void 0;beforeAll(function(){reward=m.prop(RewardDetailsMockery()[0]);$output=mq(AdminReward.view(undefined,{reward:reward}));});it("should render reward description when we have a reward_id",function(){$output.should.contain(reward().description);});});});});describe('AdminTransactionHistory',function(){var c=window.c,contribution=void 0,historyBox=void 0,ctrl=void 0,view=void 0,$output=void 0;beforeAll(function(){contribution=m.prop(ContributionDetailMockery(1));historyBox=m.component(c.AdminTransactionHistory,{contribution:contribution()[0]});ctrl=historyBox.controller();view=historyBox.view(ctrl,{contribution:contribution});$output=mq(view);});describe('controller',function(){it('should have orderedEvents',function(){expect(ctrl.orderedEvents.length).toEqual(2);});it('should have formated the date on orderedEvents',function(){expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');});});describe('view',function(){it('should render fetched orderedEvents',function(){expect($output.find('.date-event').length).toEqual(2);});});});describe('AdminTransaction',function(){var c=window.c,contribution=void 0,detailedBox=void 0,view=void 0,$output=void 0;beforeAll(function(){contribution=m.prop(ContributionDetailMockery(1,{gateway_data:null}));detailedBox=m.component(c.AdminTransaction,{contribution:contribution()[0]});view=detailedBox.view(null,{contribution:contribution});$output=mq(view);});describe('view',function(){it('should render details about contribution',function(){expect($output.contains('Valor: R$50,00')).toBeTrue();expect($output.contains('Meio: MoIP')).toBeTrue();});});});describe('AdminUser',function(){var c=window.c,AdminUser=c.AdminUser,item,$output;describe('view',function(){beforeAll(function(){item=ContributionDetailMockery(1)[0];$output=mq(AdminUser.view(null,{item:item}));});it('should build an item from an item describer',function(){expect($output.has('.user-avatar')).toBeTrue();expect($output.contains(item.email)).toBeTrue();});});});describe('CategoryButton',function(){var $output=void 0,c=window.c;describe('view',function(){beforeAll(function(){$output=mq(m.component(c.CategoryButton,{category:{id:1,name:'cat',online_projects:1}}));});it('should build a link with .btn-category',function(){expect($output.has('a.btn-category')).toBeTrue();});});});describe('FilterButton',function(){var $output=void 0,c=window.c;describe('view',function(){beforeAll(function(){$output=mq(m.component(c.FilterButton,{title:'Test',href:'test'}));});it('should build a link with .filters',function(){expect($output.has('a.filters')).toBeTrue();});});});describe('PaymentStatus',function(){var c=window.c,ctrl,setController=function setController(contribution){var payment={gateway:contribution.gateway,gateway_data:contribution.gateway_data,installments:contribution.installments,state:contribution.state,payment_method:contribution.payment_method};ctrl=m.component(c.PaymentStatus,{item:payment}).controller();};describe('stateClass function',function(){it('should return a success CSS class when contribution state is paid',function(){var contribution=ContributionDetailMockery(1,{state:'paid'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-success');});it('should return a success CSS class when contribution state is refunded',function(){var contribution=ContributionDetailMockery(1,{state:'refunded'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-refunded');});it('should return a warning CSS class when contribution state is pending',function(){var contribution=ContributionDetailMockery(1,{state:'pending'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-waiting');});it('should return an error CSS class when contribution state is refused',function(){var contribution=ContributionDetailMockery(1,{state:'refused'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-error');});it('should return an error CSS class when contribution state is not known',function(){var contribution=ContributionDetailMockery(1,{state:'foo'})[0];setController(contribution);expect(ctrl.stateClass()).toEqual('.text-error');});});describe('paymentMethodClass function',function(){var CSSboleto='.fa-barcode',CSScreditcard='.fa-credit-card',CSSerror='.fa-question';it('should return a boleto CSS class when contribution payment method is boleto',function(){var contribution=ContributionDetailMockery(1,{payment_method:'BoletoBancario'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);});it('should return a credit card CSS class when contribution payment method is credit card',function(){var contribution=ContributionDetailMockery(1,{payment_method:'CartaoDeCredito'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);});it('should return an error CSS class when contribution payment method is not known',function(){var contribution=ContributionDetailMockery(1,{payment_method:'foo'})[0];setController(contribution);expect(ctrl.paymentMethodClass()).toEqual(CSSerror);});});describe('view',function(){var getOutput=function getOutput(payment_method){var contribution=ContributionDetailMockery(1,{payment_method:payment_method})[0],payment={gateway:contribution.gateway,gateway_data:contribution.gateway_data,installments:contribution.installments,state:contribution.state,payment_method:contribution.payment_method};return mq(m.component(c.PaymentStatus,{item:payment}));};it('should return an HTML element describing a boleto when payment_method is boleto',function(){expect(getOutput('BoletoBancario').has('#boleto-detail')).toBeTrue();});it('should return an HTML element describing a credit card when payment_method is credit card',function(){expect(getOutput('CartaoDeCredito').has('#creditcard-detail')).toBeTrue();});});});describe('ProjectAbout',function(){var $output=void 0,projectDetail=void 0,rewardDetail=void 0,ProjectAbout=window.c.ProjectAbout;describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];rewardDetail=RewardDetailsMockery()[0];var component=m.component(ProjectAbout,{project:m.prop(projectDetail),rewardDetails:m.prop(RewardDetailsMockery())}),view=component.view();$output=mq(view);});it('should render project about and reward list',function(){expect($output.contains(projectDetail.about_html)).toEqual(true);expect($output.contains(rewardDetail.description)).toEqual(true);});});});describe('ProjectCard',function(){var ProjectCard=window.c.ProjectCard,project=void 0,component=void 0,view=void 0,$output=void 0,$customOutput=void 0,remainingTimeObj=void 0;describe('view',function(){beforeAll(function(){project=ProjectMockery()[0];remainingTimeObj=window.c.h.translatedTime(project.remaining_time);$output=function $output(type){return mq(m.component(ProjectCard,{project:project,type:type}));};});it('should render the project card',function(){expect($output().find('.card-project').length).toEqual(1);expect($output().contains(project.owner_name)).toEqual(true);expect($output().contains(remainingTimeObj.unit)).toEqual(true);});it('should render a big project card when type is big',function(){expect($output('big').find('.card-project-thumb.big').length).toEqual(1);expect($output('big').contains(project.owner_name)).toEqual(true);expect($output('big').contains(remainingTimeObj.unit)).toEqual(true);});it('should render a medium project card when type is medium',function(){expect($output('medium').find('.card-project-thumb.medium').length).toEqual(1);expect($output('medium').contains(project.owner_name)).toEqual(true);expect($output('medium').contains(remainingTimeObj.unit)).toEqual(true);});});});describe('ProjectContributions',function(){var $output=void 0,projectContribution=void 0,ProjectContributions=window.c.ProjectContributions;describe('view',function(){beforeAll(function(){jasmine.Ajax.stubRequest(new RegExp('('+apiPrefix+'\/project_contributions)(.*)(waiting_payment)(.*)')).andReturn({'responseText':JSON.stringify(ProjectContributionsMockery())});spyOn(m,'component').and.callThrough();projectContribution=ProjectContributionsMockery()[0];var project=m.prop({id:1231});var component=m.component(ProjectContributions,{project:project}),view=component.view(component.controller({project:project}));$output=mq(view);});it('should render project contributions list',function(){expect($output.contains(projectContribution.user_name)).toEqual(true);});});});describe('ProjectDashboardMenu',function(){var generateContextByNewState=void 0,ProjectDashboardMenu=window.c.ProjectDashboardMenu;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];var body=jasmine.createSpyObj('body',['className']),projectDetail=m.prop(ProjectDetailsMockery(newState)[0]),component=m.component(ProjectDashboardMenu,{project:projectDetail}),ctrl=component.controller({project:projectDetail});spyOn(m,'component').and.callThrough();spyOn(ctrl,'body').and.returnValue(body);return {output:mq(component,{project:projectDetail}),projectDetail:projectDetail};};});it('when project is online',function(){var _generateContextByNew=generateContextByNewState({state:'online'});var output=_generateContextByNew.output;var projectDetail=_generateContextByNew.projectDetail;output.should.contain(projectDetail().name);output.should.have('#info-links');});});});describe('ProjectHeader',function(){var $output=void 0,projectDetail=void 0,ProjectHeader=window.c.ProjectHeader;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectHeader,{project:projectDetail,userDetails:m.prop([])}),view=component.view(null,{project:projectDetail,userDetails:m.prop([])});$output=mq(view);});it('should a project header',function(){expect($output.find('#project-header').length).toEqual(1);expect($output.contains(projectDetail().name)).toEqual(true);});it('should render project-highlight / project-sidebar component area',function(){expect($output.find('.project-highlight').length).toEqual(1);expect($output.find('#project-sidebar').length).toEqual(1);});});});describe('ProjectHighlight',function(){var $output=void 0,projectDetail=void 0,ProjectHighlight=window.c.ProjectHighlight;it('when project video is not filled should render image',function(){projectDetail=m.prop(_.extend({},ProjectDetailsMockery()[0],{original_image:'original_image',video_embed_url:null}));var component=m.component(ProjectHighlight,{project:projectDetail}),view=component.view(component.controller(),{project:projectDetail});$output=mq(view);expect($output.find('.project-image').length).toEqual(1);expect($output.find('iframe.embedly-embed').length).toEqual(0);});describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectHighlight,{project:projectDetail}),view=component.view(component.controller(),{project:projectDetail});$output=mq(ProjectHighlight,{project:projectDetail});});it('should render project video, headline, category and address info',function(){expect($output.find('iframe.embedly-embed').length).toEqual(1);expect($output.find('span.fa.fa-map-marker').length).toEqual(1);expect($output.contains(projectDetail().address.city)).toEqual(true);});it('should render project share box when click on share',function(){$output.click('#share-box');$output.redraw();$output.should.have('.pop-share');});});});describe('ProjectMode',function(){var ProjectCard=window.c.ProjectMode,project=void 0,component=void 0,view=void 0,$output=void 0;describe('view',function(){beforeAll(function(){project=m.prop(ProjectMockery()[0]);});it('should render the project mode',function(){component=m.component(ProjectCard,{project:project});$output=mq(component);expect($output.find('.w-row').length).toEqual(1);});it('should render the project mode when goal is null',function(){component=m.component(ProjectCard,{project:m.prop(_.extend({},project,{goal:null}))});$output=mq(component);expect($output.find('.w-row').length).toEqual(1);});});});describe('ProjectPosts',function(){var $output=void 0,projectPostDetail=void 0,ProjectPosts=window.c.ProjectPosts;describe('view',function(){beforeAll(function(){spyOn(m,'component').and.callThrough();projectPostDetail=ProjectPostDetailsMockery()[0];var project=m.prop({id:1231});var component=m.component(ProjectPosts,{project:project}),view=component.view(component.controller({project:project}));$output=mq(view);});it('should render project post list',function(){expect($output.find('.post').length).toEqual(1);expect($output.contains(projectPostDetail.title)).toEqual(true);});});});describe('ProjectReminderCount',function(){var $output=void 0,projectDetail=void 0,ProjectReminderCount=window.c.ProjectReminderCount;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectReminderCount,{resource:projectDetail}),view=component.view(null,{resource:projectDetail});$output=mq(view);});it('should render reminder total count',function(){expect($output.find('#project-reminder-count').length).toEqual(1);});});});describe('ProjectRewardList',function(){var generateContextByNewState=void 0,ProjectRewardList=window.c.ProjectRewardList;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];spyOn(m,'component').and.callThrough();var rewardDetail=RewardDetailsMockery(newState),component=m.component(ProjectRewardList,{project:m.prop({id:1231}),rewardDetails:m.prop(rewardDetail)});return {output:mq(component.view()),rewardDetail:rewardDetail[0]};};});it('should render card-gone when reward sould out',function(){var _generateContextByNew=generateContextByNewState({maximum_contributions:4,paid_count:4});var output=_generateContextByNew.output;var rewardDetail=_generateContextByNew.rewardDetail;expect(output.find('.card-gone').length).toEqual(1);expect(output.contains('Esgotada')).toEqual(true);});it('should render card-reward when reward is not sould out',function(){var _generateContextByNew2=generateContextByNewState({maximum_contributions:null});var output=_generateContextByNew2.output;var rewardDetail=_generateContextByNew2.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Esgotada')).toEqual(false);});it('should render card-reward stats when reward is limited',function(){var _generateContextByNew3=generateContextByNewState({maximum_contributions:10,paid_count:2,waiting_payment_count:5});var output=_generateContextByNew3.output;var rewardDetail=_generateContextByNew3.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Limitada')).toEqual(true);expect(output.contains('(3 de 10 disponíveis)')).toEqual(true);expect(output.contains('2 apoios')).toEqual(true);expect(output.contains('5 apoios em prazo de confirmação')).toEqual(true);});it('should render card-reward details',function(){var _generateContextByNew4=generateContextByNewState({minimum_value:20});var output=_generateContextByNew4.output;var rewardDetail=_generateContextByNew4.rewardDetail;expect(output.find('.card-reward').length).toEqual(1);expect(output.contains('Para R$ 20 ou mais')).toEqual(true);expect(output.contains('Estimativa de Entrega:')).toEqual(true);expect(output.contains(window.c.h.momentify(rewardDetail.deliver_at,'MMM/YYYY'))).toEqual(true);expect(output.contains(rewardDetail.description)).toEqual(true);});});});describe('ProjectRow',function(){var $output,ProjectRow=window.c.ProjectRow;describe('view',function(){var collection={title:'test collection',hash:'testhash',collection:m.prop([]),loader:m.prop(false)};describe('when we have a ref parameter',function(){it('should not render row',function(){var _ProjectMockery=ProjectMockery();var _ProjectMockery2=babelHelpers.slicedToArray(_ProjectMockery,1);var project=_ProjectMockery2[0];collection.collection([project]);var component=m.component(ProjectRow),view=component.view(null,{collection:collection,ref:'ref_test'});$output=mq(view);expect($output.find('.card-project a[href="/'+project.permalink+'?ref=ref_test"]').length).toEqual(3);});});describe('when collection is empty and loader true',function(){beforeAll(function(){collection.collection([]);collection.loader(true);var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render loader',function(){expect($output.find('img[alt="Loader"]').length).toEqual(1);});});describe('when collection is empty and loader false',function(){beforeAll(function(){collection.collection([]);collection.loader(false);var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render nothing',function(){expect($output.find('img[alt="Loader"]').length).toEqual(0);expect($output.find('.w-section').length).toEqual(0);});});describe('when collection has projects',function(){beforeAll(function(){collection.collection(ProjectMockery());var component=m.component(ProjectRow),view=component.view(null,{collection:collection});$output=mq(view);});it('should render projects in row',function(){expect($output.find('.w-section').length).toEqual(1);});});});});describe('ProjectShareBox',function(){var $output=void 0,projectDetail=void 0,ProjectShareBox=window.c.ProjectShareBox;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var args={project:projectDetail,displayShareBox:{toggle:jasmine.any(Function)}},component=m.component(ProjectShareBox,args),view=component.view(component.controller(),args);$output=mq(ProjectShareBox,args);});it('should render project project share pop',function(){$output.should.have('.pop-share');$output.should.have('.w-widget-facebook');$output.should.have('.w-widget-twitter');$output.should.have('.widget-embed');});it('should open embed box when click on embed',function(){$output.click('a.widget-embed');$output.should.have('.embed-expanded');});});});describe('ProjectSidebar',function(){var generateContextByNewState=void 0,ProjectSidebar=window.c.ProjectSidebar;describe('view',function(){beforeAll(function(){generateContextByNewState=function generateContextByNewState(){var newState=arguments.length<=0||arguments[0]===undefined?{}:arguments[0];spyOn(m,'component').and.callThrough();var projectDetail=m.prop(_.extend({},ProjectDetailsMockery()[0],newState)),component=m.component(ProjectSidebar,{project:projectDetail,userDetails:m.prop([])}),ctrl=component.controller({project:projectDetail,userDetails:m.prop([])}),view=component.view(component.controller(),{project:projectDetail,userDetails:m.prop([])});return {output:mq(view),ctrl:ctrl,projectDetail:projectDetail};};});it('should render project stats',function(){var _generateContextByNew=generateContextByNewState({state:'successful'});var output=_generateContextByNew.output;var projectDetail=_generateContextByNew.projectDetail;expect(output.find('#project-sidebar.aside').length).toEqual(1);expect(output.find('.card-success').length).toEqual(1);});it('should render a all or nothing badge when is aon',function(){var _generateContextByNew2=generateContextByNewState({mode:'aon'});var output=_generateContextByNew2.output;var projectDetail=_generateContextByNew2.projectDetail;expect(output.find('#aon').length).toEqual(1);});it('should render a flex badge when project mode is flexible',function(){var _generateContextByNew3=generateContextByNewState({mode:'flex'});var output=_generateContextByNew3.output;var projectDetail=_generateContextByNew3.projectDetail;expect(output.find('#flex').length).toEqual(1);});describe('reminder',function(){it('should render reminder when project is open_for_contributions and user signed in and is in_reminder',function(){var _generateContextByNew4=generateContextByNewState({open_for_contributions:true,user_signed_in:true,in_reminder:true});var output=_generateContextByNew4.output;var projectDetail=_generateContextByNew4.projectDetail;expect(output.contains('Lembrete ativo')).toEqual(true);expect(output.find('#project-reminder').length).toEqual(1);});it('should render reminder when project is open_for_contributions and user signed in ant not in_reminder',function(){var _generateContextByNew5=generateContextByNewState({open_for_contributions:true,user_signed_in:true,in_reminder:false});var output=_generateContextByNew5.output;var projectDetail=_generateContextByNew5.projectDetail;expect(output.contains('Lembrar-me')).toEqual(true);expect(output.find('#project-reminder').length).toEqual(1);});it('should render reminder when project is open_for_contributions and user not signed in',function(){var _generateContextByNew6=generateContextByNewState({open_for_contributions:true,user_signed_in:false});var output=_generateContextByNew6.output;var projectDetail=_generateContextByNew6.projectDetail;expect(output.find('#project-reminder').length).toEqual(1);});it('should not render reminder when project is not open_for_contributions and user signed in',function(){var _generateContextByNew7=generateContextByNewState({open_for_contributions:false,user_signed_in:true});var output=_generateContextByNew7.output;var projectDetail=_generateContextByNew7.projectDetail;expect(output.find('#project-reminder').length).toEqual(0);});});});});describe('ProjectTabs',function(){var $output=void 0,projectDetail=void 0,ProjectTabs=window.c.ProjectTabs;describe('view',function(){beforeAll(function(){projectDetail=m.prop(ProjectDetailsMockery()[0]);var component=m.component(ProjectTabs,{project:m.prop(projectDetail),rewardDetails:m.prop([])});$output=mq(component);});it('should render project-tabs',function(){expect($output.find('a.dashboard-nav-link').length).toEqual(5);expect($output.find('a#about-link').length).toEqual(1);});it('should call hashMatch when click on some link',function(){var oldHash=window.location.hash;window.location.hash='posts';$output.redraw();$output.should.have('a#posts-link.selected');window.location.hash=oldHash;});});});describe('ProjectsDashboard',function(){var $output=void 0,projectDetail=void 0,ProjectsDashboard=window.c.root.ProjectsDashboard;describe('view',function(){beforeAll(function(){projectDetail=ProjectDetailsMockery()[0];var component=m.component(ProjectsDashboard,{project_id:projectDetail.project_id,project_user_id:projectDetail.user.id});$output=mq(component);});it('should render project about and reward list',function(){expect($output.has('.project-nav-wrapper')).toBeTrue();});});});var contributionListVM=postgrest.paginationVM(models.contributionDetail,'id.desc',{'Prefer':'count=exact'});var vm=postgrest$1.filtersVM({full_text_index:'@@',state:'eq',gateway:'eq',value:'between',created_at:'between'});var paramToString=function paramToString(p){return (p||'').toString().trim();}; // Set default values
  vm.state('');vm.gateway('');vm.order({id:'desc'});vm.created_at.lte.toFilter=function(){var filter=paramToString(vm.created_at.lte());return filter&&h$1.momentFromString(filter).endOf('day').format('');};vm.created_at.gte.toFilter=function(){var filter=paramToString(vm.created_at.gte());return filter&&h$1.momentFromString(filter).format();};vm.full_text_index.toFilter=function(){var filter=paramToString(vm.full_text_index());return filter&&replaceDiacritics$1(filter)||undefined;};var adminItem={controller:function controller(args){return {displayDetailBox:h$1.toggleProp(false,true)};},view:function view(ctrl,args){var item=args.item;return m$1('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items',[m$1.component(args.listItem,{item:item,key:args.key}),m$1('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary',{onclick:ctrl.displayDetailBox.toggle}),ctrl.displayDetailBox()?m$1.component(args.listDetail,{item:item,key:args.key}):'']);}};var adminList={controller:function controller(args){var list=args.vm.list;if(!list.collection().length&&list.firstPage){list.firstPage().then(null,function(serverError){args.vm.error(serverError.message);});}},view:function view(ctrl,args){var list=args.vm.list,error=args.vm.error,label=args.label||'';return m$1('.w-section.section',[m$1('.w-container',error()?m$1('.card.card-error.u-radius.fontweight-bold',error()):[m$1('.w-row.u-marginbottom-20',[m$1('.w-col.w-col-9',[m$1('.fontsize-base',list.isLoading()?'Carregando '+label.toLowerCase()+'...':[m$1('span.fontweight-semibold',list.total()),' '+label.toLowerCase()+' encontrados'])])]),m$1('#admin-contributions-list.w-container',[list.collection().map(function(item){return m$1.component(adminItem,{listItem:args.listItem,listDetail:args.listDetail,item:item,key:item.id});}),m$1('.w-section.section',[m$1('.w-container',[m$1('.w-row',[m$1('.w-col.w-col-2.w-col-push-5',[list.isLoading()?h$1.loader():m$1('button#load-more.btn.btn-medium.btn-terciary',{onclick:list.nextPage},'Carregar mais')])])])])])])]);}};var filterMain={view:function view(ctrl,args){var inputWrapperClass=args.inputWrapperClass||'.w-input.text-field.positive.medium',btnClass=args.btnClass||'.btn.btn-large.u-marginbottom-10';return m$1('.w-row',[m$1('.w-col.w-col-10',[m$1('input'+inputWrapperClass+'[placeholder="'+args.placeholder+'"][type="text"]',{onchange:m$1.withAttr('value',args.vm),value:args.vm()})]),m$1('.w-col.w-col-2',[m$1('input#filter-btn'+btnClass+'[type="submit"][value="Buscar"]')])]);}};var adminFilter={controller:function controller(){return {toggler:h.toggleProp(false,true)};},view:function view(ctrl,args){var filterBuilder=args.filterBuilder,data=args.data,label=args.label||'',main=_$1.findWhere(filterBuilder,{component:filterMain});return m$1('#admin-contributions-filter.w-section.page-header',[m$1('.w-container',[m$1('.fontsize-larger.u-text-center.u-marginbottom-30',label),m$1('.w-form',[m$1('form',{onsubmit:args.submit},[main?m$1.component(main.component,main.data):'',m$1('.u-marginbottom-20.w-row',m$1('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]',{onclick:ctrl.toggler.toggle},'Filtros avançados  >')),ctrl.toggler()?m$1('#advanced-search.w-row.admin-filters',[_$1.map(filterBuilder,function(f){return f.component!==filterMain?m$1.component(f.component,f.data):'';})]):''])])])]);}};var adminProject={view:function view(ctrl,args){var project=args.item;return m$1('.w-row.admin-project',[m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[m$1('img.thumb-project.u-radius[src='+project.project_img+'][width=50]')]),m$1('.w-col.w-col-9.w-col-small-9',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10',[m$1('a.alt-link[target="_blank"][href="/'+project.permalink+'"]',project.project_name)]),m$1('.fontsize-smallest.fontweight-semibold',project.project_state),m$1('.fontsize-smallest.fontcolor-secondary',h$1.momentify(project.project_online_date)+' a '+h$1.momentify(project.project_expires_at))])]);}};var adminContribution={view:function view(ctrl,args){var contribution=args.item;return m$1('.w-row.admin-contribution',[m$1('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small','R$'+contribution.value),m$1('.fontsize-smallest.fontcolor-secondary',h$1.momentify(contribution.created_at,'DD/MM/YYYY HH:mm[h]')),m$1('.fontsize-smallest',['ID do Gateway: ',m$1('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/'+contribution.gateway_id+'"]',contribution.gateway_id)])]);}};var adminUser={view:function view(ctrl,args){var user=args.item;return m$1('.w-row.admin-user',[m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10',[m$1('img.user-avatar[src="'+h.useAvatarOrDefault(user.profile_img_thumbnail)+'"]')]),m$1('.w-col.w-col-9.w-col-small-9',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10',[m$1('a.alt-link[target="_blank"][href="/users/'+user.id+'/edit"]',user.name||user.email)]),m$1('.fontsize-smallest','Usuário: '+user.id),m$1('.fontsize-smallest.fontcolor-secondary','Email: '+user.email),args.additional_data])]);}};var adminContributionUser={view:function view(ctrl,args){var item=args.item,user={profile_img_thumbnail:item.user_profile_img,id:item.user_id,name:item.user_name,email:item.email};var additionalData=m$1('.fontsize-smallest.fontcolor-secondary','Gateway: '+item.payer_email);return m$1.component(adminUser,{item:user,additional_data:additionalData});}};var paymentStatus={controller:function controller(args){var payment=args.item,card=null,displayPaymentMethod=void 0,paymentMethodClass=void 0,stateClass=void 0;card=function card(){if(payment.gateway_data){switch(payment.gateway.toLowerCase()){case 'moip':return {first_digits:payment.gateway_data.cartao_bin,last_digits:payment.gateway_data.cartao_final,brand:payment.gateway_data.cartao_bandeira};case 'pagarme':return {first_digits:payment.gateway_data.card_first_digits,last_digits:payment.gateway_data.card_last_digits,brand:payment.gateway_data.card_brand};}}};displayPaymentMethod=function displayPaymentMethod(){switch(payment.payment_method.toLowerCase()){case 'boletobancario':return m$1('span#boleto-detail','');case 'cartaodecredito':var cardData=card();if(cardData){return m$1('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight',[cardData.first_digits+'******'+cardData.last_digits,m$1('br'),cardData.brand+' '+payment.installments+'x']);}return '';}};paymentMethodClass=function paymentMethodClass(){switch(payment.payment_method.toLowerCase()){case 'boletobancario':return '.fa-barcode';case 'cartaodecredito':return '.fa-credit-card';default:return '.fa-question';}};stateClass=function stateClass(){switch(payment.state){case 'paid':return '.text-success';case 'refunded':return '.text-refunded';case 'pending':case 'pending_refund':return '.text-waiting';default:return '.text-error';}};return {displayPaymentMethod:displayPaymentMethod,paymentMethodClass:paymentMethodClass,stateClass:stateClass};},view:function view(ctrl,args){var payment=args.item;return m$1('.w-row.payment-status',[m$1('.fontsize-smallest.lineheight-looser.fontweight-semibold',[m$1('span.fa.fa-circle'+ctrl.stateClass()),' '+payment.state]),m$1('.fontsize-smallest.fontweight-semibold',[m$1('span.fa'+ctrl.paymentMethodClass()),' ',m$1('a.link-hidden[href="#"]',payment.payment_method)]),m$1('.fontsize-smallest.fontcolor-secondary.lineheight-tight',[ctrl.displayPaymentMethod()])]);}};var adminContributionItem={controller:function controller(){return {itemBuilder:[{component:adminContributionUser,wrapperClass:'.w-col.w-col-4'},{component:adminProject,wrapperClass:'.w-col.w-col-4'},{component:adminContribution,wrapperClass:'.w-col.w-col-2'},{component:paymentStatus,wrapperClass:'.w-col.w-col-2'}]};},view:function view(ctrl,args){return m$1('.w-row',_.map(ctrl.itemBuilder,function(panel){return m$1(panel.wrapperClass,[m$1.component(panel.component,{item:args.item,key:args.key})]);}));}};var adminInputAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),data={},item=args.item,key=builder.property,forceValue=builder.forceValue||null,newValue=m$1.prop(forceValue);h$1.idVM.id(item[builder.updateKey]);var l=postgrest.loaderWithToken(builder.model.patchOptions(h$1.idVM.parameters(),data));var updateItem=function updateItem(res){_.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){data[key]=newValue();l.load().then(updateItem,function(){complete(true);error(true);});return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);newValue(forceValue);};};return {complete:complete,error:error,l:l,newValue:newValue,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),data.forceValue===undefined?m$1('input.w-input.text-field[type="text"][placeholder="'+data.placeholder+'"]',{onchange:m$1.withAttr('value',ctrl.newValue),value:ctrl.newValue()}):'',m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p',data.successMessage)])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p','Houve um problema na requisição. '+data.errorMessage)])])]):'']);}};var adminRadioAction={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),data={},error=m$1.prop(false),fail=m$1.prop(false),item=args.item(),description=m$1.prop(item.description||''),key=builder.getKey,newID=m$1.prop(''),getFilter={},setFilter={},radios=m$1.prop(),getAttr=builder.radios,getKey=builder.getKey,getKeyValue=args.getKeyValue,updateKey=builder.updateKey,updateKeyValue=args.updateKeyValue,validate=builder.validate,selectedItem=builder.selectedItem||m$1.prop();setFilter[updateKey]='eq';var setVM=postgrest.filtersVM(setFilter);setVM[updateKey](updateKeyValue);getFilter[getKey]='eq';var getVM=postgrest.filtersVM(getFilter);getVM[getKey](getKeyValue);var getLoader=postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));var setLoader=postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(),data));var updateItem=function updateItem(data){if(data.length>0){var newItem=_$1.findWhere(radios(),{id:data[0][builder.selectKey]});selectedItem(newItem);}else {error({message:'Nenhum item atualizado'});}complete(true);};var fetch=function fetch(){getLoader.load().then(radios,error);};var submit=function submit(){if(newID()){var validation=validate(radios(),newID());if(_$1.isUndefined(validation)){data[builder.selectKey]=newID();setLoader.load().then(updateItem,error);}else {complete(true);error({message:validation});}}return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);newID('');};};var setDescription=function setDescription(text){description(text);m$1.redraw();};fetch();return {complete:complete,description:description,setDescription:setDescription,error:error,setLoader:setLoader,getLoader:getLoader,newID:newID,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload,radios:radios};},view:function view(ctrl,args){var data=args.data,item=args.item(),btnValue=ctrl.setLoader()||ctrl.getLoader()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[ctrl.radios()?_$1.map(ctrl.radios(),function(radio,index){var set=function set(){ctrl.newID(radio.id);ctrl.setDescription(radio.description);};var selected=radio.id===(item[data.selectKey]||item.id)?true:false;return m$1('.w-radio',[m$1('input#r-'+index+'.w-radio-input[type=radio][name="admin-radio"][value="'+radio.id+'"]'+(selected?'[checked]':''),{onclick:set}),m$1('label.w-form-label[for="r-'+index+'"]','R$'+radio.minimum_value)]);}):h$1.loader(),m$1('strong','Descrição'),m$1('p',ctrl.description()),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Recompensa alterada com sucesso!')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p',ctrl.error().message)])])]):'']);}};var adminTransaction={view:function view(ctrl,args){var contribution=args.contribution;return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Detalhes do apoio'),m$1('.fontsize-smallest.lineheight-looser',['Valor: R$'+_$1.formatNumber(contribution.value,2,3),m$1('br'),'Taxa: R$'+_$1.formatNumber(contribution.gateway_fee,2,3),m$1('br'),'Aguardando Confirmação: '+(contribution.waiting_payment?'Sim':'Não'),m$1('br'),'Anônimo: '+(contribution.anonymous?'Sim':'Não'),m$1('br'),'Id pagamento: '+contribution.gateway_id,m$1('br'),'Apoio: '+contribution.contribution_id,m$1('br'),'Chave: \n',m$1('br'),contribution.key,m$1('br'),'Meio: '+contribution.gateway,m$1('br'),'Operadora: '+(contribution.gateway_data&&contribution.gateway_data.acquirer_name),m$1('br'),contribution.is_second_slip?[m$1('a.link-hidden[href="#"]','Boleto bancário'),' ',m$1('span.badge','2a via')]:''])]);}};var adminTransactionHistory={controller:function controller(args){var contribution=args.contribution,mapEvents=_$1.reduce([{date:contribution.paid_at,name:'Apoio confirmado'},{date:contribution.pending_refund_at,name:'Reembolso solicitado'},{date:contribution.refunded_at,name:'Estorno realizado'},{date:contribution.created_at,name:'Apoio criado'},{date:contribution.refused_at,name:'Apoio cancelado'},{date:contribution.deleted_at,name:'Apoio excluído'},{date:contribution.chargeback_at,name:'Chargeback'}],function(memo,item){if(item.date!==null&&item.date!==undefined){item.originalDate=item.date;item.date=h$1.momentify(item.date,'DD/MM/YYYY, HH:mm');return memo.concat(item);}return memo;},[]);return {orderedEvents:_$1.sortBy(mapEvents,'originalDate')};},view:function view(ctrl){return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Histórico da transação'),ctrl.orderedEvents.map(function(cEvent){return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event',[m$1('.w-col.w-col-6',[m$1('.fontcolor-secondary',cEvent.date)]),m$1('.w-col.w-col-6',[m$1('div',cEvent.name)])]);})]);}};var adminReward={view:function view(ctrl,args){var reward=args.reward(),available=parseInt(reward.paid_count)+parseInt(reward.waiting_payment_count);return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Recompensa'),m$1('.fontsize-smallest.lineheight-looser',reward.id?['ID: '+reward.id,m$1('br'),'Valor mínimo: R$'+h$1.formatNumber(reward.minimum_value,2,3),m$1('br'),m$1.trust('Disponíveis: '+available+' / '+(reward.maximum_contributions||'&infin;')),m$1('br'),'Aguardando confirmação: '+reward.waiting_payment_count,m$1('br'),'Descrição: '+reward.description]:'Apoio sem recompensa')]);}};var adminContributionDetail={controller:function controller(args){var l=void 0;var loadReward=function loadReward(){var model=models.rewardDetail,reward_id=args.item.reward_id,opts=model.getRowOptions(h$1.idVM.id(reward_id).parameters()),reward=m$1.prop({});l=postgrest.loaderWithToken(opts);if(reward_id){l.load().then(_$1.compose(reward,_$1.first));}return reward;};return {reward:loadReward(),actions:{transfer:{property:'user_id',updateKey:'id',callToAction:'Transferir',innerLabel:'Id do novo apoiador:',outerLabel:'Transferir Apoio',placeholder:'ex: 129908',successMessage:'Apoio transferido com sucesso!',errorMessage:'O apoio não foi transferido!',model:models.contributionDetail},reward:{getKey:'project_id',updateKey:'contribution_id',selectKey:'reward_id',radios:'rewards',callToAction:'Alterar Recompensa',outerLabel:'Recompensa',getModel:models.rewardDetail,updateModel:models.contributionDetail,selectedItem:loadReward(),validate:function validate(rewards,newRewardID){var reward=_$1.findWhere(rewards,{id:newRewardID});return args.item.value>=reward.minimum_value?undefined:'Valor mínimo da recompensa é maior do que o valor da contribuição.';}},refund:{updateKey:'id',callToAction:'Reembolso direto',innerLabel:'Tem certeza que deseja reembolsar esse apoio?',outerLabel:'Reembolsar Apoio',model:models.contributionDetail},remove:{property:'state',updateKey:'id',callToAction:'Apagar',innerLabel:'Tem certeza que deseja apagar esse apoio?',outerLabel:'Apagar Apoio',forceValue:'deleted',successMessage:'Apoio removido com sucesso!',errorMessage:'O apoio não foi removido!',model:models.contributionDetail}},l:l};},view:function view(ctrl,args){var actions=ctrl.actions,item=args.item,reward=ctrl.reward;var addOptions=function addOptions(builder,id){return _$1.extend({},builder,{requestOptions:{url:'/admin/contributions/'+id+'/gateway_refund',method:'PUT'}});};return m$1('#admin-contribution-detail-box',[m$1('.divider.u-margintop-20.u-marginbottom-20'),m$1('.w-row.u-marginbottom-30',[m$1.component(adminInputAction,{data:actions.transfer,item:item}),ctrl.l()?h$1.loader:m$1.component(adminRadioAction,{data:actions.reward,item:reward,getKeyValue:item.project_id,updateKeyValue:item.contribution_id}),m$1.component(adminExternalAction,{data:addOptions(actions.refund,item.id),item:item}),m$1.component(adminInputAction,{data:actions.remove,item:item})]),m$1('.w-row.card.card-terciary.u-radius',[m$1.component(adminTransaction,{contribution:item}),m$1.component(adminTransactionHistory,{contribution:item}),ctrl.l()?h$1.loader:m$1.component(adminReward,{reward:reward,key:item.key})])]);}};var adminConstributions={controller:function controller(){var listVM=contributionListVM,filterVM=vm,error=m$1.prop(''),filterBuilder=[{ //full_text_index
  component:'FilterMain',data:{vm:filterVM.full_text_index,placeholder:'Busque por projeto, email, Ids do usuário e do apoio...'}},{ //state
  component:'FilterDropdown',data:{label:'Com o estado',name:'state',vm:filterVM.state,options:[{value:'',option:'Qualquer um'},{value:'paid',option:'paid'},{value:'refused',option:'refused'},{value:'pending',option:'pending'},{value:'pending_refund',option:'pending_refund'},{value:'refunded',option:'refunded'},{value:'chargeback',option:'chargeback'},{value:'deleted',option:'deleted'}]}},{ //gateway
  component:'FilterDropdown',data:{label:'gateway',name:'gateway',vm:filterVM.gateway,options:[{value:'',option:'Qualquer um'},{value:'Pagarme',option:'Pagarme'},{value:'MoIP',option:'MoIP'},{value:'PayPal',option:'PayPal'},{value:'Credits',option:'Créditos'}]}},{ //value
  component:'FilterNumberRange',data:{label:'Valores entre',first:filterVM.value.gte,last:filterVM.value.lte}},{ //created_at
  component:'FilterDateRange',data:{label:'Período do apoio',first:filterVM.created_at.gte,last:filterVM.created_at.lte}}],submit=function submit(){error(false);listVM.firstPage(filterVM.parameters()).then(null,function(serverError){error(serverError.message);});return false;};return {filterVM:filterVM,filterBuilder:filterBuilder,listVM:{list:listVM,error:error},data:{label:'Apoios'},submit:submit};},view:function view(ctrl){return [m$1.component(adminFilter,{form:ctrl.filterVM.formDescriber,filterBuilder:ctrl.filterBuilder,submit:ctrl.submit}),m$1.component(adminList,{vm:ctrl.listVM,listItem:adminContributionItem,listDetail:adminContributionDetail})];}};var adminContributions$1=adminContributions;fdescribe('adminContributions',function(){var ctrl,$output;beforeAll(function(){AdminContributions=m.component(adminContributions$1);ctrl=AdminContributions.controller();});describe('controller',function(){it('should instantiate a list view-model',function(){expect(ctrl.listVM).toBeDefined();});it('should instantiate a filter view-model',function(){expect(ctrl.filterVM).toBeDefined();});});describe('view',function(){beforeAll(function(){$output=mq(Contributions);});it('should render AdminFilter nested component',function(){expect($output.has('#admin-contributions-filter')).toBeTrue();});it('should render AdminList nested component',function(){expect($output.has('#admin-contributions-list')).toBeTrue();});});});var userListVM=postgrest.paginationVM(models.user,'id.desc',{'Prefer':'count=exact'});var vm$1=postgrest.filtersVM({full_text_index:'@@',deactivated_at:'is.null'});var paramToString$1=function paramToString(p){return (p||'').toString().trim();}; // Set default values
  vm$1.deactivated_at(null).order({id:'desc'});vm$1.deactivated_at.toFilter=function(){var filter=JSON.parse(vm$1.deactivated_at());return filter;};vm$1.full_text_index.toFilter=function(){var filter=paramToString$1(vm$1.full_text_index());return filter&&replaceDiacritics$1(filter)||undefined;};var adminUserItem={view:function view(ctrl,args){return m$1('.w-row',[m$1('.w-col.w-col-4',[m$1.component(adminUser,args)])]);}};var adminResetPassword={controller:function controller(args){var builder=args.data,complete=m$1.prop(false),error=m$1.prop(false),fail=m$1.prop(false),key=builder.property,data={},item=args.item;builder.requestOptions.config=function(xhr){if(h$1.authenticityToken()){xhr.setRequestHeader('X-CSRF-Token',h$1.authenticityToken());}};var l=m$1.prop(false),load=function load(){return m$1.request(_$1.extend({},{data:data},builder.requestOptions));},newPassword=m$1.prop(''),error_message=m$1.prop('');var requestError=function requestError(err){l(false);error_message(err.errors[0]);complete(true);error(true);};var updateItem=function updateItem(res){l(false);_$1.extend(item,res[0]);complete(true);error(false);};var submit=function submit(){l(true);data[key]=newPassword();load().then(updateItem,requestError);return false;};var unload=function unload(el,isinit,context){context.onunload=function(){complete(false);error(false);};};return {complete:complete,error:error,error_message:error_message,l:l,newPassword:newPassword,submit:submit,toggler:h$1.toggleProp(false,true),unload:unload};},view:function view(ctrl,args){var data=args.data,btnValue=ctrl.l()?'por favor, aguarde...':data.callToAction;return m$1('.w-col.w-col-2',[m$1('button.btn.btn-small.btn-terciary',{onclick:ctrl.toggler.toggle},data.outerLabel),ctrl.toggler()?m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10',{config:ctrl.unload},[m$1('form.w-form',{onsubmit:ctrl.submit},!ctrl.complete()?[m$1('label',data.innerLabel),m$1('input.w-input.text-field[type="text"][name="'+data.property+'"][placeholder="'+data.placeholder+'"]',{onchange:m$1.withAttr('value',ctrl.newPassword),value:ctrl.newPassword()}),m$1('input.w-button.btn.btn-small[type="submit"][value="'+btnValue+'"]')]:!ctrl.error()?[m$1('.w-form-done[style="display:block;"]',[m$1('p','Senha alterada com sucesso.')])]:[m$1('.w-form-error[style="display:block;"]',[m$1('p',ctrl.error_message())])])]):'']);}};var adminNotificationHistory={controller:function controller(args){var notifications=m$1.prop([]),getNotifications=function getNotifications(user){var notification=models.notification;notification.getPageWithToken(postgrest.filtersVM({user_id:'eq',sent_at:'is.null'}).user_id(user.id).sent_at(!null).order({sent_at:'desc'}).parameters()).then(notifications);};getNotifications(args.user);return {notifications:notifications};},view:function view(ctrl){return m$1('.w-col.w-col-4',[m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20','Histórico de notificações'),ctrl.notifications().map(function(cEvent){return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event',[m$1('.w-col.w-col-24',[m$1('.fontcolor-secondary',h$1.momentify(cEvent.sent_at,'DD/MM/YYYY, HH:mm'),' - ',cEvent.template_name,cEvent.origin?' - '+cEvent.origin:'')])]);})]);}};var adminUserDetail={controller:function controller(){return {actions:{reset:{property:'password',callToAction:'Redefinir',innerLabel:'Nova senha de Usuário:',outerLabel:'Redefinir senha',placeholder:'ex: 123mud@r',model:c.models.user},reactivate:{property:'deactivated_at',updateKey:'id',callToAction:'Reativar',innerLabel:'Tem certeza que deseja reativar esse usuário?',successMessage:'Usuário reativado com sucesso!',errorMessage:'O usuário não pôde ser reativado!',outerLabel:'Reativar usuário',forceValue:null,model:c.models.user}}};},view:function view(ctrl,args){var actions=ctrl.actions,item=args.item,details=args.details,addOptions=function addOptions(builder,id){return _$1.extend({},builder,{requestOptions:{url:'/users/'+id+'/new_password',method:'POST'}});};return m$1('#admin-contribution-detail-box',[m$1('.divider.u-margintop-20.u-marginbottom-20'),m$1('.w-row.u-marginbottom-30',[m$1.component(adminResetPassword,{data:addOptions(actions.reset,item.id),item:item}),item.deactivated_at?m$1.component(adminInputAction,{data:actions.reactivate,item:item}):'']),m$1('.w-row.card.card-terciary.u-radius',[m$1.component(adminNotificationHistory,{user:item})])]);}};var adminUsers={controller:function controller(){var listVM=userListVM,filterVM=vm$1,error=m$1.prop(''),itemBuilder=[{component:'AdminUser',wrapperClass:'.w-col.w-col-4'}],filterBuilder=[{ //name
  component:'FilterMain',data:{vm:filterVM.full_text_index,placeholder:'Busque por nome, e-mail, Ids do usuário...'}},{ //status
  component:'FilterDropdown',data:{label:'Com o estado',index:'status',name:'deactivated_at',vm:filterVM.deactivated_at,options:[{value:'',option:'Qualquer um'},{value:null,option:'ativo'},{value:!null,option:'desativado'}]}}],submit=function submit(){listVM.firstPage(filterVM.parameters()).then(null,function(serverError){error(serverError.message);});return false;};return {filterVM:filterVM,filterBuilder:filterBuilder,listVM:{list:listVM,error:error},submit:submit};},view:function view(ctrl){var label='Usuários';return [m$1.component(adminFilter,{form:ctrl.filterVM.formDescriber,filterBuilder:ctrl.filterBuilder,label:label,submit:ctrl.submit}),m$1.component(adminList,{vm:ctrl.listVM,label:label,listItem:adminUserItem,listDetail:adminUserDetail})];}};describe('adminUsers',function(){var ctrl,$output;beforeAll(function(){AdminUsers=m.component(adminUsers);ctrl=AdminUsers.controller();});describe('controller',function(){it('should instantiate a list view-model',function(){expect(ctrl.listVM).toBeDefined();});it('should instantiate a filter view-model',function(){expect(ctrl.filterVM).toBeDefined();});});describe('view',function(){beforeAll(function(){$output=mq(Users);});it('should render AdminFilter nested component',function(){expect($output.has('#admin-contributions-filter')).toBeTrue();});it('should render AdminList nested component',function(){expect($output.has('#admin-contributions-list')).toBeTrue();});});});describe('pages.LiveStatistics',function(){var $output=void 0,statistic=void 0,LiveStatistics=window.c.root.LiveStatistics;describe('view',function(){beforeAll(function(){statistic=StatisticMockery()[0];var component=m.component(LiveStatistics);$output=mq(component.view(component.controller(),{}));});it('should render statistics',function(){expect($output.contains(window.c.h.formatNumber(statistic.total_contributed,2,3))).toEqual(true);expect($output.contains(statistic.total_contributors)).toEqual(true);});});});describe('ProjectsExplore',function(){var $output=void 0,project=void 0,component=void 0,ProjectsExplore=window.c.root.ProjectsExplore;beforeAll(function(){window.location.hash='#by_category_id/1';component=m.component(ProjectsExplore);$output=mq(component);});it('should render search container',function(){$output.should.have('.hero-search');});});describe('ProjectShow',function(){var $output=void 0,projectDetail=void 0,ProjectShow=window.c.root.ProjectsShow;beforeAll(function(){window.location.hash='';projectDetail=ProjectDetailsMockery()[0];var component=m.component(ProjectShow,{project_id:123,project_user_id:1231}),view=component.view(component.controller());$output=mq(view);});it('should render project some details',function(){expect($output.contains(projectDetail.name)).toEqual(true);$output.should.have('#project-sidebar');$output.should.have('#project-header');$output.should.have('.project-highlight');$output.should.have('.project-nav');$output.should.have('#rewards');});});describe('UsersBalance',function(){var $output=void 0,component=void 0,UsersBalance=window.c.root.UsersBalance;beforeAll(function(){component=m.component(UsersBalance,{user_id:1});$output=mq(component);});it('should render user balance area',function(){$output.should.have('.user-balance-section');});it('should render user balance transactions area',function(){$output.should.have('.balance-transactions-area');});});describe('Search',function(){var $output=void 0,c=window.c,Search=c.Search,action='/test',method='POST';describe('view',function(){beforeEach(function(){$output=mq(Search.view({},{action:action,method:method}));});it('should render the search form',function(){expect($output.find('form').length).toEqual(1);expect($output.find('input[type="text"]').length).toEqual(1);expect($output.find('button').length).toEqual(1);});it('should set the given action',function(){expect($output.find('form[action="'+action+'"]').length).toEqual(1);});it('should set the given method',function(){expect($output.find('form[method="'+method+'"]').length).toEqual(1);});});});describe('Slider',function(){var $output=void 0,c=window.c,m=window.m,title='TitleSample',defaultDocumentWidth=1600,slides=[m('h1','teste'),m('h1','teste'),m('h1','teste'),m('h1','teste')];describe('view',function(){beforeEach(function(){$output=mq(c.Slider,{title:title,slides:slides});});it('should render all the slides',function(){expect($output.find('.slide').length).toEqual(slides.length);});it('should render one bullet for each slide',function(){expect($output.find('.slide-bullet').length).toEqual(slides.length);});it('should move to next slide on slide next click',function(){$output.click('#slide-next');var firstSlide=$output.first('.slide');expect(firstSlide.attrs.style.indexOf('-'+defaultDocumentWidth+'px')).toBeGreaterThan(-1);});it('should move to previous slide on slide prev click',function(){$output.click('#slide-next');$output.click('#slide-prev');var firstSlide=$output.first('.slide');expect(firstSlide.attrs.style.indexOf('0px')).toBeGreaterThan(-1);});});});describe('TeamMembers',function(){var $output,TeamMembers=window.c.TeamMembers;describe('view',function(){beforeAll(function(){$output=mq(TeamMembers);});it('should render fetched team members',function(){expect($output.has('#team-members-static')).toEqual(true);expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);});});});describe('TeamTotal',function(){var $output=void 0,TeamTotal=window.c.TeamTotal;describe('view',function(){beforeAll(function(){$output=mq(TeamTotal);});it('should render fetched team total info',function(){expect($output.find('#team-total-static').length).toEqual(1);});});});describe('Tooltip',function(){var $output=void 0,c=window.c,m=window.m,element='a#tooltip-trigger[href="#"]',text='tooltipText',tooltip=function tooltip(el){return m.component(c.Tooltip,{el:el,text:text,width:320});};describe('view',function(){beforeEach(function(){$output=mq(tooltip(element));});it('should not render the tooltip at first',function(){expect($output.find('.tooltip').length).toEqual(0);});it('should render the tooltip on element mouseenter',function(){$output.click('#tooltip-trigger');expect($output.find('.tooltip').length).toEqual(1);expect($output.contains(text)).toBeTrue();});it('should hide the tooltip again on element mouseleave',function(){$output.click('#tooltip-trigger');$output.click('#tooltip-trigger');expect($output.find('.tooltip').length).toEqual(0);});});});describe('UserBalanceRequestModalContent',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalanceModal=window.c.UserBalanceRequestModalContent;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalanceModal,_.extend({},parentComponent.controller(),{balance:{amount:205,user_id:1}}));$output=mq(component);});it('should call bank account endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/bank_accounts?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user bank account / amount data',function(){expect($output.contains('R$ 205,00')).toEqual(true);expect($output.contains('Banco XX')).toEqual(true);$output.should.have('.btn-request-fund');});it('should call balance transfer endpoint when click on request fund btn and show success message',function(){$output.click('.btn-request-fund');$output.should.have('.fa-check-circle');var lastRequest=jasmine.Ajax.requests.filter(/balance_transfers/)[0];expect(lastRequest.url).toEqual(apiPrefix+'/balance_transfers');expect(lastRequest.method).toEqual('POST');});});describe('UserBalanceTransactions',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalanceTransactions=window.c.UserBalanceTransactions;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalanceTransactions,_.extend({},parentComponent.controller(),{user_id:1}));$output=mq(component);});it('should call balance transactions endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/balance_transactions?order=created_at.desc&user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user balance transactions',function(){$output.should.have('.card-detailed-open');expect($output.contains('R$ 604,50')).toEqual(true);expect($output.contains('R$ 0,00')).toEqual(true);expect($output.contains('R$ -604,50')).toEqual(true);expect($output.contains('Project x')).toEqual(true);});});describe('UserBalance',function(){var $output=void 0,component=void 0,parentComponent=void 0,UsersBalance=window.c.root.UsersBalance,UserBalance=window.c.UserBalance;beforeAll(function(){parentComponent=m.component(UsersBalance,{user_id:1});component=m.component(UserBalance,_.extend({},parentComponent.controller(),{user_id:1}));$output=mq(component);});it('should call balances endpoint',function(){var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/balances?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});it('should render user balance',function(){expect($output.contains('R$ 205,00')).toEqual(true);});it('should render request fund btn',function(){$output.should.have('.r-fund-btn');});it('should call bank_account endpoint when click on request fund btn and show modal',function(){$output.click('.r-fund-btn');$output.should.have('.modal-dialog-inner');expect($output.contains('Banco XX')).toEqual(true);var lastRequest=jasmine.Ajax.requests.mostRecent();expect(lastRequest.url).toEqual(apiPrefix+'/bank_accounts?user_id=eq.1');expect(lastRequest.method).toEqual('GET');});});describe('admin.contributionFilterVM',function(){var adminApp=window.c.admin,vm=adminApp.contributionFilterVM,momentFromString=window.c.h.momentFromString;describe("created_at.lte.toFilter",function(){it("should use end of the day timestamp to send filter",function(){vm.created_at.lte('21/12/1999');expect(vm.created_at.lte.toFilter()).toEqual(momentFromString(vm.created_at.lte()).endOf('day').format());});});describe("full_text_index.toFilter",function(){it("should remove all diacritics to send filter",function(){vm.full_text_index('rémoção dos acêntüs');expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');});});});describe('admin.userFilterVM',function(){var adminApp=window.c.admin,vm=adminApp.userFilterVM;describe("deactivated_at.toFilter",function(){it("should parse string inputs to json objects to send filter",function(){vm.deactivated_at('null');expect(vm.deactivated_at.toFilter()).toEqual(null);});});describe("full_text_index.toFilter",function(){it("should remove all diacritics to send filter",function(){vm.full_text_index('rémoção dos acêntüs');expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');});});});describe('YoutubeLightbox',function(){var $output=void 0,c=window.c,m=window.m,visibleStyl='display:block',invisibleStyl='display:none';describe('view',function(){beforeEach(function(){$output=mq(c.YoutubeLightbox,{src:'FlFTcDSKnLM'});});it('should not render the lightbox at first',function(){expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);});it('should render the lightbox on play button click',function(){$output.click('#youtube-play');expect($output.find('#lightbox')[0].attrs.style).toEqual(visibleStyl);});it('should close the lightbox on close button click',function(){$output.click('#youtube-play');$output.click('#youtube-close');expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);});});});describe("h.formatNumber",function(){var number=null,formatNumber=window.c.h.formatNumber;it("should format number",function(){number=120.20;expect(formatNumber(number)).toEqual('120');expect(formatNumber(number,2,3)).toEqual('120,20');expect(formatNumber(number,2,2)).toEqual('1.20,20');});});describe('h.rewardSouldOut',function(){var reward=null,rewardSouldOut=window.c.h.rewardSouldOut;it('return true when reward already sould out',function(){reward={maximum_contributions:5,paid_count:3,waiting_payment_count:2};expect(rewardSouldOut(reward)).toEqual(true);});it('return false when reward is not sould out',function(){reward={maximum_contributions:5,paid_count:3,waiting_payment_count:1};expect(rewardSouldOut(reward)).toEqual(false);});it('return false when reward is not defined maximum_contributions',function(){reward={maximum_contributions:null,paid_count:3,waiting_payment_count:1};expect(rewardSouldOut(reward)).toEqual(false);});});describe('h.rewardRemaning',function(){var reward=void 0,rewardRemaning=window.c.h.rewardRemaning;it('should return the total remaning rewards',function(){reward={maximum_contributions:10,paid_count:3,waiting_payment_count:2};expect(rewardRemaning(reward)).toEqual(5);});});describe('h.parseUrl',function(){var url=void 0,parseUrl=window.c.h.parseUrl;it('should create an a element',function(){url='http://google.com';expect(parseUrl(url).hostname).toEqual('google.com');});});describe('h.pluralize',function(){var count=void 0,pluralize=window.c.h.pluralize;it('should use plural when count greater 1',function(){count=3;expect(pluralize(count,' dia',' dias')).toEqual('3 dias');});it('should use singular when count less or equal 1',function(){count=1;expect(pluralize(count,' dia',' dias')).toEqual('1 dia');});});})(this.spec=this.spec||{},m,postgrest,_,moment,I18n,replaceDiacritics);

  var models = {
      contributionDetail: postgrest.model('contribution_details'),
      contributionActivity: postgrest.model('contribution_activities'),
      projectDetail: postgrest.model('project_details'),
      userDetail: postgrest.model('user_details'),
      balance: postgrest.model('balances'),
      balanceTransaction: postgrest.model('balance_transactions'),
      balanceTransfer: postgrest.model('balance_transfers'),
      user: postgrest.model('users'),
      bankAccount: postgrest.model('bank_accounts'),
      rewardDetail: postgrest.model('reward_details'),
      projectReminder: postgrest.model('project_reminders'),
      contributions: postgrest.model('contributions'),
      directMessage: postgrest.model('direct_messages'),
      teamTotal: postgrest.model('team_totals'),
      projectAccount: postgrest.model('project_accounts'),
      projectContribution: postgrest.model('project_contributions'),
      projectPostDetail: postgrest.model('project_posts_details'),
      projectContributionsPerDay: postgrest.model('project_contributions_per_day'),
      projectContributionsPerLocation: postgrest.model('project_contributions_per_location'),
      projectContributionsPerRef: postgrest.model('project_contributions_per_ref'),
      project: postgrest.model('projects'),
      projectSearch: postgrest.model('rpc/project_search'),
      category: postgrest.model('categories'),
      categoryTotals: postgrest.model('category_totals'),
      categoryFollower: postgrest.model('category_followers'),
      teamMember: postgrest.model('team_members'),
      notification: postgrest.model('notifications'),
      statistic: postgrest.model('statistics'),
      successfulProject: postgrest.model('successful_projects')
  };

  models.teamMember.pageSize(40);
  models.rewardDetail.pageSize(false);
  models.project.pageSize(30);
  models.category.pageSize(50);
  models.contributionActivity.pageSize(40);
  models.successfulProject.pageSize(9);

  var hashMatch = function hashMatch(str) {
      return window.location.hash === str;
  };
  var paramByName = function paramByName(name) {
      var normalName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
          regex = new RegExp('[\\?&]' + normalName + '=([^&#]*)'),
          results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };
  var selfOrEmpty = function selfOrEmpty(obj) {
      var emptyState = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      return obj ? obj : emptyState;
  };
  var setMomentifyLocale = function setMomentifyLocale() {
      moment$1.locale('pt', {
          monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
      });
  };
  var existy = function existy(x) {
      return x != null;
  };
  var momentify = function momentify(date, format) {
      format = format || 'DD/MM/YYYY';
      return date ? moment$1(date).locale('pt').format(format) : 'no date';
  };
  var storeAction = function storeAction(action) {
      if (!sessionStorage.getItem(action)) {
          return sessionStorage.setItem(action, action);
      }
  };
  var callStoredAction = function callStoredAction(action, func) {
      if (sessionStorage.getItem(action)) {
          func.call();
          return sessionStorage.removeItem(action);
      }
  };
  var discuss = function discuss(page, identifier) {
      var d = document,
          s = d.createElement('script');
      window.disqus_config = function () {
          this.page.url = page;
          this.page.identifier = identifier;
      };
      s.src = '//catarseflex.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
      return m$1('');
  };
  var momentFromString = function momentFromString(date, format) {
      var european = moment$1(date, format || 'DD/MM/YYYY');
      return european.isValid() ? european : moment$1(date);
  };
  var translatedTimeUnits = {
      days: 'dias',
      minutes: 'minutos',
      hours: 'horas',
      seconds: 'segundos'
  };
  var translatedTime = function translatedTime(time) {
      var translatedTime = translatedTimeUnits,
          unit = function unit() {
          var projUnit = translatedTime[time.unit || 'seconds'];

          return time.total <= 1 ? projUnit.slice(0, -1) : projUnit;
      };

      return {
          unit: unit(),
          total: time.total
      };
  };
  var generateFormatNumber = function generateFormatNumber(s, c) {
      return function (number, n, x) {
          if (!_.isNumber(number)) {
              return null;
          }

          var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
              num = number.toFixed(Math.max(0, ~ ~n));
          return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
      };
  };
  var formatNumber = generateFormatNumber('.', ',');
  var toggleProp = function toggleProp(defaultState, alternateState) {
      var p = m$1.prop(defaultState);
      p.toggle = function () {
          return p(p() === alternateState ? defaultState : alternateState);
      };

      return p;
  };
  var idVM = postgrest.filtersVM({
      id: 'eq'
  });
  var getCurrentProject = function getCurrentProject() {
      var root = document.getElementById('project-show-root'),
          data = root.getAttribute('data-parameters');
      if (data) {
          return JSON.parse(data);
      } else {
          return false;
      }
  };
  var getRdToken = function getRdToken() {
      var meta = _.first(document.querySelectorAll('[name=rd-token]'));

      return meta ? meta.content : undefined;
  };
  var getUser = function getUser() {
      var body = document.getElementsByTagName('body'),
          data = _.first(body).getAttribute('data-user');
      if (data) {
          return JSON.parse(data);
      } else {
          return false;
      }
  };
  var locationActionMatch = function locationActionMatch(action) {
      var act = window.location.pathname.split('/').slice(-1)[0];
      return action === act;
  };
  var useAvatarOrDefault = function useAvatarOrDefault(avatarPath) {
      return avatarPath || '/assets/catarse_bootstrap/user.jpg';
  };
  var loader = function loader() {
      return m$1('.u-text-center.u-margintop-30 u-marginbottom-30', [m$1('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
  };
  var newFeatureBadge = function newFeatureBadge() {
      return m$1('span.badge.badge-success.margin-side-5', I18n$1.t('projects.new_feature_badge'));
  };
  var fbParse = function fbParse() {
      var tryParse = function tryParse() {
          try {
              window.FB.XFBML.parse();
          } catch (e) {
              console.log(e);
          }
      };

      return window.setTimeout(tryParse, 500); //use timeout to wait async of facebook
  };
  var pluralize = function pluralize(count, s, p) {
      return count > 1 ? count + p : count + s;
  };
  var simpleFormat = function simpleFormat() {
      var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      str = str.replace(/\r\n?/, '\n');
      if (str.length > 0) {
          str = str.replace(/\n\n+/g, '</p><p>');
          str = str.replace(/\n/g, '<br />');
          str = '<p>' + str + '</p>';
      }
      return str;
  };
  var rewardSouldOut = function rewardSouldOut(reward) {
      return reward.maximum_contributions > 0 ? reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions : false;
  };
  var rewardRemaning = function rewardRemaning(reward) {
      return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
  };
  var parseUrl = function parseUrl(href) {
      var l = document.createElement('a');
      l.href = href;
      return l;
  };
  var UIHelper = function UIHelper() {
      return function (el, isInitialized) {
          if (!isInitialized && $) {
              window.UIHelper.setupResponsiveIframes($(el));
          }
      };
  };
  var toAnchor = function toAnchor() {
      return function (el, isInitialized) {
          if (!isInitialized) {
              var hash = window.location.hash.substr(1);
              if (hash === el.id) {
                  window.location.hash = '';
                  setTimeout(function () {
                      window.location.hash = el.id;
                  });
              }
          }
      };
  };
  var validateEmail = function validateEmail(email) {
      var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return re.test(email);
  };
  var navigateToDevise = function navigateToDevise() {
      window.location.href = '/pt/login';
      return false;
  };
  var cumulativeOffset = function cumulativeOffset(element) {
      var top = 0,
          left = 0;
      do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
      } while (element);

      return {
          top: top,
          left: left
      };
  };
  var closeModal = function closeModal() {
      var el = document.getElementsByClassName('modal-close')[0];
      if (_.isElement(el)) {
          el.onclick = function (event) {
              event.preventDefault();

              document.getElementsByClassName('modal-backdrop')[0].style.display = 'none';
          };
      };
  };
  var closeFlash = function closeFlash() {
      var el = document.getElementsByClassName('icon-close')[0];
      if (_.isElement(el)) {
          el.onclick = function (event) {
              event.preventDefault();

              el.parentElement.remove();
          };
      };
  };
  var i18nScope = function i18nScope(scope, obj) {
      obj = obj || {};
      return _.extend({}, obj, { scope: scope });
  };
  var redrawHashChange = function redrawHashChange(before) {
      var callback = _.isFunction(before) ? function () {
          before();
          m$1.redraw();
      } : m$1.redraw;

      window.addEventListener('hashchange', callback, false);
  };
  var authenticityToken = function authenticityToken() {
      var meta = _.first(document.querySelectorAll('[name=csrf-token]'));
      return meta ? meta.content : undefined;
  };
  var animateScrollTo = function animateScrollTo(el) {
      var scrolled = window.scrollY;

      var offset = cumulativeOffset(el).top,
          duration = 300,
          dFrame = (offset - scrolled) / duration,

      //EaseInOutCubic easing function. We'll abstract all animation funs later.
      eased = function eased(t) {
          return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
          animation = setInterval(function () {
          var pos = eased(scrolled / offset) * scrolled;

          window.scrollTo(0, pos);

          if (scrolled >= offset) {
              clearInterval(animation);
          }

          scrolled = scrolled + dFrame;
      }, 1);
  };
  var scrollTo = function scrollTo() {
      var setTrigger = function setTrigger(el, anchorId) {
          el.onclick = function () {
              var anchorEl = document.getElementById(anchorId);

              if (_.isElement(anchorEl)) {
                  animateScrollTo(anchorEl);
              }

              return false;
          };
      };

      return function (el, isInitialized) {
          if (!isInitialized) {
              setTrigger(el, el.hash.slice(1));
          }
      };
  };
  var RDTracker = function RDTracker(eventId) {
      return function (el, isInitialized) {
          if (!isInitialized) {
              var integrationScript = document.createElement('script');
              integrationScript.type = 'text/javascript';
              integrationScript.id = 'RDIntegration';

              if (!document.getElementById(integrationScript.id)) {
                  document.body.appendChild(integrationScript);
                  integrationScript.onload = function () {
                      return RdIntegration.integrate(getRdToken(), eventId);
                  };
                  integrationScript.src = 'https://d335luupugsy2.cloudfront.net/js/integration/stable/rd-js-integration.min.js';
              }

              return false;
          }
      };
  };
  setMomentifyLocale();
  closeFlash();
  closeModal();

  var h$1 = {
      authenticityToken: authenticityToken,
      cumulativeOffset: cumulativeOffset,
      discuss: discuss,
      existy: existy,
      validateEmail: validateEmail,
      momentify: momentify,
      momentFromString: momentFromString,
      formatNumber: formatNumber,
      idVM: idVM,
      getUser: getUser,
      getCurrentProject: getCurrentProject,
      toggleProp: toggleProp,
      loader: loader,
      newFeatureBadge: newFeatureBadge,
      fbParse: fbParse,
      pluralize: pluralize,
      simpleFormat: simpleFormat,
      translatedTime: translatedTime,
      rewardSouldOut: rewardSouldOut,
      rewardRemaning: rewardRemaning,
      parseUrl: parseUrl,
      hashMatch: hashMatch,
      redrawHashChange: redrawHashChange,
      useAvatarOrDefault: useAvatarOrDefault,
      locationActionMatch: locationActionMatch,
      navigateToDevise: navigateToDevise,
      storeAction: storeAction,
      callStoredAction: callStoredAction,
      UIHelper: UIHelper,
      toAnchor: toAnchor,
      paramByName: paramByName,
      i18nScope: i18nScope,
      RDTracker: RDTracker,
      selfOrEmpty: selfOrEmpty,
      scrollTo: scrollTo
  };

  var adminExternalAction = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              error = m$1.prop(false),
              fail = m$1.prop(false),
              data = {},
              item = args.item;

          builder.requestOptions.config = function (xhr) {
              if (h$1.authenticityToken()) {
                  xhr.setRequestHeader('X-CSRF-Token', h$1.authenticityToken());
              }
          };

          var reload = _$1.compose(builder.model.getRowWithToken, h$1.idVM.id(item[builder.updateKey]).parameters),
              l = m$1.prop(false);

          var reloadItem = function reloadItem() {
              return reload().then(updateItem);
          };

          var requestError = function requestError(err) {
              l(false);
              complete(true);
              error(true);
          };

          var updateItem = function updateItem(res) {
              _$1.extend(item, res[0]);
              complete(true);
              error(false);
          };

          var submit = function submit() {
              l(true);
              m$1.request(builder.requestOptions).then(reloadItem, requestError);
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
              };
          };

          return {
              l: l,
              complete: complete,
              error: error,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [m$1('label', data.innerLabel), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Requisição feita com sucesso.')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', 'Houve um problema na requisição.')])])]) : '']);
      }
  };

  describe('adminExternalAction', function () {
      var testModel = postgrest$1.model('reloadAction'),
          item = {
          testKey: 'foo'
      },
          ctrl,
          $output;

      var args = {
          updateKey: 'updateKey',
          callToAction: 'cta',
          innerLabel: 'inner',
          outerLabel: 'outer',
          model: testModel,
          requestOptions: {
              url: 'http://external_api'
          }
      };

      describe('view', function () {
          beforeAll(function () {
              jasmine.Ajax.stubRequest(args.requestOptions.url).andReturn({
                  'responseText': JSON.stringify([])
              });
          });

          beforeEach(function () {
              $output = mq(adminExternalAction, {
                  data: args,
                  item: item
              });
          });

          it('shoud render the outerLabel on first render', function () {
              expect($output.contains(args.outerLabel)).toBeTrue();
              expect($output.contains(args.innerLabel)).toBeFalse();
              expect($output.contains(args.placeholder)).toBeFalse();
              expect($output.contains(args.callToAction)).toBeFalse();
          });

          describe('on button click', function () {
              beforeEach(function () {
                  $output.click('button');
              });

              it('should render an inner label', function () {
                  expect($output.contains(args.innerLabel)).toBeTrue();
              });

              it('should render a call to action', function () {
                  expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
              });
          });

          describe('on form submit', function () {
              beforeEach(function () {
                  $output.click('button');
              });

              it('should call a submit function on form submit', function () {
                  $output.trigger('form', 'submit');
                  var lastRequest = jasmine.Ajax.requests.mostRecent();
                  expect(lastRequest.url).toEqual('https://api.catarse.me/reloadAction');
              });
          });
      });
  });

  describe('AdminFilter', function () {
      var ctrl = void 0,
          submit = void 0,
          fakeForm = void 0,
          formDesc = void 0,
          filterDescriber = void 0,
          $output = void 0,
          c = window.c,
          vm = c.admin.contributionFilterVM,
          AdminFilter = c.AdminFilter;

      describe('controller', function () {
          beforeAll(function () {
              ctrl = AdminFilter.controller();
          });

          it('should instantiate a toggler', function () {
              expect(ctrl.toggler).toBeDefined();
          });
      });

      describe('view', function () {
          beforeAll(function () {
              spyOn(m, 'component').and.callThrough();
              submit = jasmine.createSpy('submit');
              filterDescriber = FilterDescriberMock();
              $output = mq(AdminFilter, {
                  filterBuilder: filterDescriber,
                  data: {
                      label: 'foo'
                  },
                  submit: submit
              });
          });

          it('should render the main filter on render', function () {
              expect(m.component).toHaveBeenCalledWith(c.FilterMain, filterDescriber[0].data);
          });

          it('should build a form from a FormDescriber when clicking the advanced filter', function () {
              $output.click('button');
              //mithril.query calls component one time to build it, so calls.count = length + 1.
              expect(m.component.calls.count()).toEqual(filterDescriber.length + 1);
          });

          it('should trigger a submit function when submitting the form', function () {
              $output.trigger('form', 'submit');
              expect(submit).toHaveBeenCalled();
          });
      });
  });

  describe('AdminInputAction', function () {
      var c = window.c,
          m = window.m,
          models = window.c.models,
          AdminInputAction = c.AdminInputAction,
          testModel = m.postgrest.model('test'),
          item = {
          testKey: 'foo'
      },
          forced = null,
          ctrl,
          $output;

      var args = {
          property: 'testKey',
          updateKey: 'updateKey',
          callToAction: 'cta',
          innerLabel: 'inner',
          outerLabel: 'outer',
          placeholder: 'place',
          model: testModel
      };

      describe('controller', function () {
          beforeAll(function () {
              ctrl = AdminInputAction.controller({
                  data: args,
                  item: item
              });
          });

          it('should instantiate a submit function', function () {
              expect(ctrl.submit).toBeFunction();
          });
          it('should return a toggler prop', function () {
              expect(ctrl.toggler).toBeFunction();
          });
          it('should return a value property to bind to', function () {
              expect(ctrl.newValue).toBeFunction();
          });

          describe('when forceValue is set', function () {
              beforeAll(function () {
                  args.forceValue = forced;
                  ctrl = AdminInputAction.controller({
                      data: args,
                      item: item
                  });
              });

              it('should initialize newValue with forced value', function () {
                  expect(ctrl.newValue()).toEqual(forced);
              });

              afterAll(function () {
                  delete args.forceValue;
              });
          });
      });

      describe('view', function () {
          beforeEach(function () {
              $output = mq(AdminInputAction, {
                  data: args,
                  item: item
              });
          });

          it('shoud render the outerLabel on first render', function () {
              expect($output.contains(args.outerLabel)).toBeTrue();
              expect($output.contains(args.innerLabel)).toBeFalse();
              expect($output.contains(args.placeholder)).toBeFalse();
              expect($output.contains(args.callToAction)).toBeFalse();
          });

          describe('on button click', function () {
              beforeEach(function () {
                  $output.click('button');
              });

              it('should render an inner label', function () {
                  expect($output.contains(args.innerLabel)).toBeTrue();
              });
              it('should render a placeholder', function () {
                  expect($output.has('input[placeholder="' + args.placeholder + '"]')).toBeTrue();
              });
              it('should render a call to action', function () {
                  expect($output.first('input[type="submit"]').attrs.value).toEqual(args.callToAction);
              });

              describe('when forceValue is set', function () {
                  beforeAll(function () {
                      args.forceValue = forced;
                      ctrl = AdminInputAction.controller({
                          data: args,
                          item: item
                      });
                  });

                  it('should initialize newValue with forced value', function () {
                      expect(ctrl.newValue()).toEqual(forced);
                  });

                  afterAll(function () {
                      delete args.forceValue;
                  });
              });
          });

          describe('on form submit', function () {
              beforeAll(function () {
                  spyOn(m, 'request').and.returnValue({
                      then: function then(callback) {
                          callback([{
                              test: true
                          }]);
                      }
                  });
              });
              beforeEach(function () {
                  $output.click('button');
              });

              it('should call a submit function on form submit', function () {
                  $output.trigger('form', 'submit');
                  expect(m.request).toHaveBeenCalled();
              });
          });
      });
  });

  describe('AdminItem', function () {
      var c = window.c,
          AdminItem = c.AdminItem,
          item,
          $output,
          ListItemMock,
          ListDetailMock;

      beforeAll(function () {
          ListItemMock = {
              view: function view(ctrl, args) {
                  return m('.list-item-mock');
              }
          };
          ListDetailMock = {
              view: function view(ctrl, args) {
                  return m('.list-detail-mock');
              }
          };
      });

      describe('view', function () {
          beforeEach(function () {
              $output = mq(AdminItem, {
                  listItem: ListItemMock,
                  listDetail: ListDetailMock,
                  item: item
              });
          });

          it('should render list item', function () {
              $output.should.have('.list-item-mock');
          });

          it('should render list detail when toggle details is true', function () {
              $output.click('button');
              $output.should.have('.list-detail-mock');
          });

          it('should not render list detail when toggle details is false', function () {
              $output.should.not.have('.list-detail-mock');
          });
      });
  });

  describe('AdminList', function () {
      var c = window.c,
          AdminList = c.AdminList,
          $output = void 0,
          model = void 0,
          vm = void 0,
          ListItemMock = void 0,
          ListDetailMock = void 0,
          results = [{
          id: 1
      }],
          listParameters = void 0,
          endpoint = void 0;

      beforeAll(function () {
          endpoint = mockEndpoint('items', results);

          ListItemMock = {
              view: function view(ctrl, args) {
                  return m('.list-item-mock');
              }
          };
          ListDetailMock = {
              view: function view(ctrl, args) {
                  return m('');
              }
          };
          model = m.postgrest.model('items');
          vm = {
              list: m.postgrest.paginationVM(model),
              error: m.prop()
          };
          listParameters = {
              vm: vm,
              listItem: ListItemMock,
              listDetail: ListDetailMock
          };
      });

      describe('view', function () {
          describe('when not loading', function () {
              beforeEach(function () {
                  spyOn(vm.list, "isLoading").and.returnValue(false);
                  $output = mq(AdminList, listParameters);
              });

              it('should render fetched items', function () {
                  expect($output.find('.card').length).toEqual(results.length);
              });

              it('should not show a loading icon', function () {
                  $output.should.not.have('img[alt="Loader"]');
              });
          });

          describe('when loading', function () {
              beforeEach(function () {
                  spyOn(vm.list, "isLoading").and.returnValue(true);
                  $output = mq(AdminList, listParameters);
              });

              it('should render fetched items', function () {
                  expect($output.find('.card').length).toEqual(results.length);
              });

              it('should show a loading icon', function () {
                  $output.should.have('img[alt="Loader"]');
              });
          });

          describe('when error', function () {
              beforeEach(function () {
                  vm.error('endpoint error');
                  $output = mq(AdminList, listParameters);
              });

              it('should show an error info', function () {
                  expect($output.has('.card-error')).toBeTrue();
              });
          });
      });
  });

  describe('AdminNotificationHistory', function () {
      var c = window.c,
          user = void 0,
          historyBox = void 0,
          ctrl = void 0,
          view = void 0,
          $output = void 0;

      beforeAll(function () {
          user = m.prop(UserDetailMockery(1));
          $output = mq(c.AdminNotificationHistory, { user: user()[0] });
      });

      describe('view', function () {
          it('should render fetched notifications', function () {
              expect($output.find('.date-event').length).toEqual(1);
          });
      });
  });

  describe('AdminProjectDetailsCard', function () {
      var AdminProjectDetailsCard = window.c.AdminProjectDetailsCard,
          generateController = void 0,
          ctrl = void 0,
          projectDetail = void 0,
          component = void 0,
          view = void 0,
          $output = void 0;

      describe('controller', function () {
          beforeAll(function () {
              generateController = function generateController(attrs) {
                  projectDetail = ProjectDetailsMockery(attrs)[0];
                  component = m.component(AdminProjectDetailsCard, {
                      resource: projectDetail
                  });
                  return component.controller();
              };
          });

          describe('project status text', function () {
              it('when project is online', function () {
                  ctrl = generateController({
                      state: 'online'
                  });
                  expect(ctrl.statusTextObj().text).toEqual('NO AR');
                  expect(ctrl.statusTextObj().cssClass).toEqual('text-success');
              });

              it('when project is failed', function () {
                  ctrl = generateController({
                      state: 'failed'
                  });
                  expect(ctrl.statusTextObj().text).toEqual('NÃO FINANCIADO');
                  expect(ctrl.statusTextObj().cssClass).toEqual('text-error');
              });
          });

          describe('project remaining time', function () {
              it('when remaining time is in days', function () {
                  ctrl = generateController({
                      remaining_time: {
                          total: 10,
                          unit: 'days'
                      }
                  });
                  expect(ctrl.remainingTextObj.total).toEqual(10);
                  expect(ctrl.remainingTextObj.unit).toEqual('dias');
              });

              it('when remaining time is in seconds', function () {
                  ctrl = generateController({
                      remaining_time: {
                          total: 12,
                          unit: 'seconds'
                      }
                  });
                  expect(ctrl.remainingTextObj.total).toEqual(12);
                  expect(ctrl.remainingTextObj.unit).toEqual('segundos');
              });

              it('when remaining time is in hours', function () {
                  ctrl = generateController({
                      remaining_time: {
                          total: 2,
                          unit: 'hours'
                      }
                  });
                  expect(ctrl.remainingTextObj.total).toEqual(2);
                  expect(ctrl.remainingTextObj.unit).toEqual('horas');
              });
          });
      });

      describe('view', function () {
          beforeAll(function () {
              projectDetail = ProjectDetailsMockery()[0];
              component = m.component(AdminProjectDetailsCard, {
                  resource: projectDetail
              });
              ctrl = component.controller();
              view = component.view(ctrl, {
                  resource: projectDetail
              });
              $output = mq(view);
          });

          it('should render details of the project in card', function () {
              var remaningTimeObj = ctrl.remainingTextObj,
                  statusTextObj = ctrl.statusTextObj();

              expect($output.find('.project-details-card').length).toEqual(1);
              expect($output.contains(projectDetail.total_contributions)).toEqual(true);
              expect($output.contains('R$ ' + window.c.h.formatNumber(projectDetail.pledged, 2))).toEqual(true);
          });
      });
  });

  describe('AdminRadioAction', function () {
      var c = window.c,
          m = window.m,
          models = window.c.models,
          AdminRadioAction = c.AdminRadioAction,
          testModel = m.postgrest.model('reward_details'),
          testStr = 'updated',
          errorStr = 'error!';

      var error = false,
          item = void 0,
          fakeData = {},
          $output = void 0;

      var args = {
          getKey: 'project_id',
          updateKey: 'contribution_id',
          selectKey: 'reward_id',
          radios: 'rewards',
          callToAction: 'Alterar Recompensa',
          outerLabel: 'Recompensa',
          getModel: testModel,
          updateModel: testModel,
          validate: function validate() {
              return undefined;
          }
      };

      var errorArgs = _.extend({}, args, {
          validate: function validate() {
              return errorStr;
          }
      });

      describe('view', function () {
          beforeAll(function () {
              item = _.first(RewardDetailsMockery());
              args.selectedItem = m.prop(item);
              $output = mq(AdminRadioAction, {
                  data: args,
                  item: m.prop(item)
              });
          });

          it('shoud only render the outerLabel on first render', function () {
              expect($output.contains(args.outerLabel)).toBeTrue();
              expect($output.contains(args.callToAction)).toBeFalse();
          });

          describe('on action button click', function () {
              beforeAll(function () {
                  $output.click('button');
              });

              it('should render a row of radio inputs', function () {
                  var lastRequest = jasmine.Ajax.requests.mostRecent();
                  expect($output.find('input[type="radio"]').length).toEqual(JSON.parse(lastRequest.responseText).length);
              });

              it('should render the description of the default selected radio', function () {
                  $output.should.contain(item.description);
              });

              it('should send an patch request on form submit', function () {
                  $output.click('#r-0');
                  $output.trigger('form', 'submit');
                  var lastRequest = jasmine.Ajax.requests.mostRecent();
                  // Should make a patch request to update item
                  expect(lastRequest.method).toEqual('PATCH');
              });

              describe('when new value is not valid', function () {
                  beforeAll(function () {
                      $output = mq(AdminRadioAction, {
                          data: errorArgs,
                          item: m.prop(item)
                      });
                      $output.click('button');
                      $output.click('#r-0');
                  });

                  it('should present an error message when new value is invalid', function () {
                      $output.trigger('form', 'submit');
                      $output.should.contain(errorStr);
                  });
              });
          });
      });
  });

  describe('AdminReward', function () {
      var ctrl = void 0,
          $output = void 0,
          c = window.c,
          AdminReward = c.AdminReward;

      describe('view', function () {
          var reward = void 0,
              ctrl = void 0;

          describe("when contribution has no reward", function () {
              beforeAll(function () {
                  $output = mq(AdminReward.view(undefined, {
                      reward: m.prop({})
                  }));
              });

              it('should render "no reward" text when reward_id is null', function () {
                  $output.should.contain('Apoio sem recompensa');
              });
          });

          describe("when contribution has reward", function () {
              var reward = void 0;

              beforeAll(function () {
                  reward = m.prop(RewardDetailsMockery()[0]);
                  $output = mq(AdminReward.view(undefined, {
                      reward: reward
                  }));
              });

              it("should render reward description when we have a reward_id", function () {
                  $output.should.contain(reward().description);
              });
          });
      });
  });

  describe('AdminTransactionHistory', function () {
      var c = window.c,
          contribution = void 0,
          historyBox = void 0,
          ctrl = void 0,
          view = void 0,
          $output = void 0;

      beforeAll(function () {
          contribution = m.prop(ContributionDetailMockery(1));
          historyBox = m.component(c.AdminTransactionHistory, {
              contribution: contribution()[0]
          });
          ctrl = historyBox.controller();
          view = historyBox.view(ctrl, {
              contribution: contribution
          });
          $output = mq(view);
      });

      describe('controller', function () {
          it('should have orderedEvents', function () {
              expect(ctrl.orderedEvents.length).toEqual(2);
          });

          it('should have formated the date on orderedEvents', function () {
              expect(ctrl.orderedEvents[0].date).toEqual('15/01/2015, 17:25');
          });
      });

      describe('view', function () {
          it('should render fetched orderedEvents', function () {
              expect($output.find('.date-event').length).toEqual(2);
          });
      });
  });

  describe('AdminTransaction', function () {
      var c = window.c,
          contribution = void 0,
          detailedBox = void 0,
          view = void 0,
          $output = void 0;

      beforeAll(function () {
          contribution = m.prop(ContributionDetailMockery(1, {
              gateway_data: null
          }));
          detailedBox = m.component(c.AdminTransaction, {
              contribution: contribution()[0]
          });
          view = detailedBox.view(null, {
              contribution: contribution
          });
          $output = mq(view);
      });

      describe('view', function () {
          it('should render details about contribution', function () {
              expect($output.contains('Valor: R$50,00')).toBeTrue();
              expect($output.contains('Meio: MoIP')).toBeTrue();
          });
      });
  });

  describe('AdminUser', function () {
      var c = window.c,
          AdminUser = c.AdminUser,
          item,
          $output;

      describe('view', function () {
          beforeAll(function () {
              item = ContributionDetailMockery(1)[0];
              $output = mq(AdminUser.view(null, {
                  item: item
              }));
          });

          it('should build an item from an item describer', function () {
              expect($output.has('.user-avatar')).toBeTrue();
              expect($output.contains(item.email)).toBeTrue();
          });
      });
  });

  describe('CategoryButton', function () {
      var $output = void 0,
          c = window.c;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(m.component(c.CategoryButton, {
                  category: {
                      id: 1,
                      name: 'cat',
                      online_projects: 1
                  }
              }));
          });

          it('should build a link with .btn-category', function () {
              expect($output.has('a.btn-category')).toBeTrue();
          });
      });
  });

  describe('FilterButton', function () {
      var $output = void 0,
          c = window.c;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(m.component(c.FilterButton, {
                  title: 'Test',
                  href: 'test'
              }));
          });

          it('should build a link with .filters', function () {
              expect($output.has('a.filters')).toBeTrue();
          });
      });
  });

  describe('PaymentStatus', function () {
      var c = window.c,
          ctrl,
          setController = function setController(contribution) {
          var payment = {
              gateway: contribution.gateway,
              gateway_data: contribution.gateway_data,
              installments: contribution.installments,
              state: contribution.state,
              payment_method: contribution.payment_method
          };
          ctrl = m.component(c.PaymentStatus, {
              item: payment
          }).controller();
      };

      describe('stateClass function', function () {
          it('should return a success CSS class when contribution state is paid', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'paid'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-success');
          });
          it('should return a success CSS class when contribution state is refunded', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'refunded'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-refunded');
          });
          it('should return a warning CSS class when contribution state is pending', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'pending'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-waiting');
          });
          it('should return an error CSS class when contribution state is refused', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'refused'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-error');
          });
          it('should return an error CSS class when contribution state is not known', function () {
              var contribution = ContributionDetailMockery(1, {
                  state: 'foo'
              })[0];
              setController(contribution);
              expect(ctrl.stateClass()).toEqual('.text-error');
          });
      });

      describe('paymentMethodClass function', function () {
          var CSSboleto = '.fa-barcode',
              CSScreditcard = '.fa-credit-card',
              CSSerror = '.fa-question';

          it('should return a boleto CSS class when contribution payment method is boleto', function () {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: 'BoletoBancario'
              })[0];
              setController(contribution);
              expect(ctrl.paymentMethodClass()).toEqual(CSSboleto);
          });
          it('should return a credit card CSS class when contribution payment method is credit card', function () {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: 'CartaoDeCredito'
              })[0];
              setController(contribution);
              expect(ctrl.paymentMethodClass()).toEqual(CSScreditcard);
          });
          it('should return an error CSS class when contribution payment method is not known', function () {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: 'foo'
              })[0];
              setController(contribution);
              expect(ctrl.paymentMethodClass()).toEqual(CSSerror);
          });
      });

      describe('view', function () {
          var getOutput = function getOutput(payment_method) {
              var contribution = ContributionDetailMockery(1, {
                  payment_method: payment_method
              })[0],
                  payment = {
                  gateway: contribution.gateway,
                  gateway_data: contribution.gateway_data,
                  installments: contribution.installments,
                  state: contribution.state,
                  payment_method: contribution.payment_method
              };
              return mq(m.component(c.PaymentStatus, {
                  item: payment
              }));
          };

          it('should return an HTML element describing a boleto when payment_method is boleto', function () {
              expect(getOutput('BoletoBancario').has('#boleto-detail')).toBeTrue();
          });
          it('should return an HTML element describing a credit card when payment_method is credit card', function () {
              expect(getOutput('CartaoDeCredito').has('#creditcard-detail')).toBeTrue();
          });
      });
  });

  describe('ProjectAbout', function () {
      var $output = void 0,
          projectDetail = void 0,
          rewardDetail = void 0,
          ProjectAbout = window.c.ProjectAbout;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = ProjectDetailsMockery()[0];
              rewardDetail = RewardDetailsMockery()[0];
              var component = m.component(ProjectAbout, {
                  project: m.prop(projectDetail),
                  rewardDetails: m.prop(RewardDetailsMockery())
              }),
                  view = component.view();
              $output = mq(view);
          });

          it('should render project about and reward list', function () {
              expect($output.contains(projectDetail.about_html)).toEqual(true);
              expect($output.contains(rewardDetail.description)).toEqual(true);
          });
      });
  });

  describe('ProjectCard', function () {
      var ProjectCard = window.c.ProjectCard,
          project = void 0,
          component = void 0,
          view = void 0,
          $output = void 0,
          $customOutput = void 0,
          remainingTimeObj = void 0;

      describe('view', function () {
          beforeAll(function () {
              project = ProjectMockery()[0];
              remainingTimeObj = window.c.h.translatedTime(project.remaining_time);
              $output = function $output(type) {
                  return mq(m.component(ProjectCard, {
                      project: project, type: type
                  }));
              };
          });

          it('should render the project card', function () {
              expect($output().find('.card-project').length).toEqual(1);
              expect($output().contains(project.owner_name)).toEqual(true);
              expect($output().contains(remainingTimeObj.unit)).toEqual(true);
          });

          it('should render a big project card when type is big', function () {
              expect($output('big').find('.card-project-thumb.big').length).toEqual(1);
              expect($output('big').contains(project.owner_name)).toEqual(true);
              expect($output('big').contains(remainingTimeObj.unit)).toEqual(true);
          });

          it('should render a medium project card when type is medium', function () {
              expect($output('medium').find('.card-project-thumb.medium').length).toEqual(1);
              expect($output('medium').contains(project.owner_name)).toEqual(true);
              expect($output('medium').contains(remainingTimeObj.unit)).toEqual(true);
          });
      });
  });

  describe('ProjectContributions', function () {
      var $output = void 0,
          projectContribution = void 0,
          ProjectContributions = window.c.ProjectContributions;

      describe('view', function () {
          beforeAll(function () {
              jasmine.Ajax.stubRequest(new RegExp('(' + apiPrefix + '\/project_contributions)(.*)(waiting_payment)(.*)')).andReturn({
                  'responseText': JSON.stringify(ProjectContributionsMockery())
              });

              spyOn(m, 'component').and.callThrough();
              projectContribution = ProjectContributionsMockery()[0];
              var project = m.prop({
                  id: 1231
              });
              var component = m.component(ProjectContributions, {
                  project: project
              }),
                  view = component.view(component.controller({
                  project: project
              }));

              $output = mq(view);
          });

          it('should render project contributions list', function () {
              expect($output.contains(projectContribution.user_name)).toEqual(true);
          });
      });
  });

  describe('ProjectDashboardMenu', function () {
      var generateContextByNewState = void 0,
          ProjectDashboardMenu = window.c.ProjectDashboardMenu;

      describe('view', function () {
          beforeAll(function () {
              generateContextByNewState = function generateContextByNewState() {
                  var newState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                  var body = jasmine.createSpyObj('body', ['className']),
                      projectDetail = m.prop(ProjectDetailsMockery(newState)[0]),
                      component = m.component(ProjectDashboardMenu, {
                      project: projectDetail
                  }),
                      ctrl = component.controller({
                      project: projectDetail
                  });

                  spyOn(m, 'component').and.callThrough();
                  spyOn(ctrl, 'body').and.returnValue(body);

                  return {
                      output: mq(component, {
                          project: projectDetail
                      }),
                      projectDetail: projectDetail
                  };
              };
          });

          it('when project is online', function () {
              var _generateContextByNew = generateContextByNewState({
                  state: 'online'
              });

              var output = _generateContextByNew.output;
              var projectDetail = _generateContextByNew.projectDetail;


              output.should.contain(projectDetail().name);
              output.should.have('#info-links');
          });
      });
  });

  describe('ProjectHeader', function () {
      var $output = void 0,
          projectDetail = void 0,
          ProjectHeader = window.c.ProjectHeader;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m.prop(ProjectDetailsMockery()[0]);
              var component = m.component(ProjectHeader, {
                  project: projectDetail,
                  userDetails: m.prop([])
              }),
                  view = component.view(null, {
                  project: projectDetail,
                  userDetails: m.prop([])
              });
              $output = mq(view);
          });

          it('should a project header', function () {
              expect($output.find('#project-header').length).toEqual(1);
              expect($output.contains(projectDetail().name)).toEqual(true);
          });

          it('should render project-highlight / project-sidebar component area', function () {
              expect($output.find('.project-highlight').length).toEqual(1);
              expect($output.find('#project-sidebar').length).toEqual(1);
          });
      });
  });

  describe('ProjectHighlight', function () {
      var $output = void 0,
          projectDetail = void 0,
          ProjectHighlight = window.c.ProjectHighlight;

      it('when project video is not filled should render image', function () {
          projectDetail = m.prop(_.extend({}, ProjectDetailsMockery()[0], {
              original_image: 'original_image',
              video_embed_url: null
          }));
          var component = m.component(ProjectHighlight, {
              project: projectDetail
          }),
              view = component.view(component.controller(), {
              project: projectDetail
          });
          $output = mq(view);

          expect($output.find('.project-image').length).toEqual(1);
          expect($output.find('iframe.embedly-embed').length).toEqual(0);
      });

      describe('view', function () {
          beforeAll(function () {
              spyOn(m, 'component').and.callThrough();
              projectDetail = m.prop(ProjectDetailsMockery()[0]);
              var component = m.component(ProjectHighlight, {
                  project: projectDetail
              }),
                  view = component.view(component.controller(), {
                  project: projectDetail
              });
              $output = mq(ProjectHighlight, {
                  project: projectDetail
              });
          });

          it('should render project video, headline, category and address info', function () {
              expect($output.find('iframe.embedly-embed').length).toEqual(1);
              expect($output.find('span.fa.fa-map-marker').length).toEqual(1);
              expect($output.contains(projectDetail().address.city)).toEqual(true);
          });

          it('should render project share box when click on share', function () {
              $output.click('#share-box');
              $output.redraw();
              $output.should.have('.pop-share');
          });
      });
  });

  describe('ProjectMode', function () {
      var ProjectCard = window.c.ProjectMode,
          project = void 0,
          component = void 0,
          view = void 0,
          $output = void 0;

      describe('view', function () {
          beforeAll(function () {
              project = m.prop(ProjectMockery()[0]);
          });

          it('should render the project mode', function () {
              component = m.component(ProjectCard, {
                  project: project
              });
              $output = mq(component);
              expect($output.find('.w-row').length).toEqual(1);
          });

          it('should render the project mode when goal is null', function () {
              component = m.component(ProjectCard, {
                  project: m.prop(_.extend({}, project, { goal: null }))
              });
              $output = mq(component);
              expect($output.find('.w-row').length).toEqual(1);
          });
      });
  });

  describe('ProjectPosts', function () {
      var $output = void 0,
          projectPostDetail = void 0,
          ProjectPosts = window.c.ProjectPosts;

      describe('view', function () {
          beforeAll(function () {
              spyOn(m, 'component').and.callThrough();
              projectPostDetail = ProjectPostDetailsMockery()[0];
              var project = m.prop({ id: 1231 });
              var component = m.component(ProjectPosts, {
                  project: project
              }),
                  view = component.view(component.controller({
                  project: project
              }));

              $output = mq(view);
          });

          it('should render project post list', function () {
              expect($output.find('.post').length).toEqual(1);
              expect($output.contains(projectPostDetail.title)).toEqual(true);
          });
      });
  });

  describe('ProjectReminderCount', function () {
      var $output = void 0,
          projectDetail = void 0,
          ProjectReminderCount = window.c.ProjectReminderCount;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m.prop(ProjectDetailsMockery()[0]);
              var component = m.component(ProjectReminderCount, {
                  resource: projectDetail
              }),
                  view = component.view(null, {
                  resource: projectDetail
              });
              $output = mq(view);
          });

          it('should render reminder total count', function () {
              expect($output.find('#project-reminder-count').length).toEqual(1);
          });
      });
  });

  describe('ProjectRewardList', function () {
      var generateContextByNewState = void 0,
          ProjectRewardList = window.c.ProjectRewardList;

      describe('view', function () {
          beforeAll(function () {
              generateContextByNewState = function generateContextByNewState() {
                  var newState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                  spyOn(m, 'component').and.callThrough();
                  var rewardDetail = RewardDetailsMockery(newState),
                      component = m.component(ProjectRewardList, {
                      project: m.prop({
                          id: 1231
                      }),
                      rewardDetails: m.prop(rewardDetail)
                  });

                  return {
                      output: mq(component.view()),
                      rewardDetail: rewardDetail[0]
                  };
              };
          });

          it('should render card-gone when reward sould out', function () {
              var _generateContextByNew = generateContextByNewState({
                  maximum_contributions: 4,
                  paid_count: 4
              });

              var output = _generateContextByNew.output;
              var rewardDetail = _generateContextByNew.rewardDetail;


              expect(output.find('.card-gone').length).toEqual(1);
              expect(output.contains('Esgotada')).toEqual(true);
          });

          it('should render card-reward when reward is not sould out', function () {
              var _generateContextByNew2 = generateContextByNewState({
                  maximum_contributions: null
              });

              var output = _generateContextByNew2.output;
              var rewardDetail = _generateContextByNew2.rewardDetail;


              expect(output.find('.card-reward').length).toEqual(1);
              expect(output.contains('Esgotada')).toEqual(false);
          });

          it('should render card-reward stats when reward is limited', function () {
              var _generateContextByNew3 = generateContextByNewState({
                  maximum_contributions: 10,
                  paid_count: 2,
                  waiting_payment_count: 5
              });

              var output = _generateContextByNew3.output;
              var rewardDetail = _generateContextByNew3.rewardDetail;


              expect(output.find('.card-reward').length).toEqual(1);
              expect(output.contains('Limitada')).toEqual(true);
              expect(output.contains('(3 de 10 disponíveis)')).toEqual(true);
              expect(output.contains('2 apoios')).toEqual(true);
              expect(output.contains('5 apoios em prazo de confirmação')).toEqual(true);
          });

          it('should render card-reward details', function () {
              var _generateContextByNew4 = generateContextByNewState({
                  minimum_value: 20
              });

              var output = _generateContextByNew4.output;
              var rewardDetail = _generateContextByNew4.rewardDetail;


              expect(output.find('.card-reward').length).toEqual(1);
              expect(output.contains('Para R$ 20 ou mais')).toEqual(true);
              expect(output.contains('Estimativa de Entrega:')).toEqual(true);
              expect(output.contains(window.c.h.momentify(rewardDetail.deliver_at, 'MMM/YYYY'))).toEqual(true);
              expect(output.contains(rewardDetail.description)).toEqual(true);
          });
      });
  });

  describe('ProjectRow', function () {
      var $output,
          ProjectRow = window.c.ProjectRow;

      describe('view', function () {
          var collection = {
              title: 'test collection',
              hash: 'testhash',
              collection: m.prop([]),
              loader: m.prop(false)
          };

          describe('when we have a ref parameter', function () {
              it('should not render row', function () {
                  var _ProjectMockery = ProjectMockery();

                  var _ProjectMockery2 = babelHelpers.slicedToArray(_ProjectMockery, 1);

                  var project = _ProjectMockery2[0];

                  collection.collection([project]);
                  var component = m.component(ProjectRow),
                      view = component.view(null, {
                      collection: collection,
                      ref: 'ref_test'
                  });
                  $output = mq(view);
                  expect($output.find('.card-project a[href="/' + project.permalink + '?ref=ref_test"]').length).toEqual(3);
              });
          });

          describe('when collection is empty and loader true', function () {
              beforeAll(function () {
                  collection.collection([]);
                  collection.loader(true);
                  var component = m.component(ProjectRow),
                      view = component.view(null, {
                      collection: collection
                  });
                  $output = mq(view);
              });

              it('should render loader', function () {
                  expect($output.find('img[alt="Loader"]').length).toEqual(1);
              });
          });

          describe('when collection is empty and loader false', function () {
              beforeAll(function () {
                  collection.collection([]);
                  collection.loader(false);
                  var component = m.component(ProjectRow),
                      view = component.view(null, {
                      collection: collection
                  });
                  $output = mq(view);
              });

              it('should render nothing', function () {
                  expect($output.find('img[alt="Loader"]').length).toEqual(0);
                  expect($output.find('.w-section').length).toEqual(0);
              });
          });

          describe('when collection has projects', function () {
              beforeAll(function () {
                  collection.collection(ProjectMockery());
                  var component = m.component(ProjectRow),
                      view = component.view(null, {
                      collection: collection
                  });
                  $output = mq(view);
              });

              it('should render projects in row', function () {
                  expect($output.find('.w-section').length).toEqual(1);
              });
          });
      });
  });

  describe('ProjectShareBox', function () {
      var $output = void 0,
          projectDetail = void 0,
          ProjectShareBox = window.c.ProjectShareBox;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m.prop(ProjectDetailsMockery()[0]);
              var args = {
                  project: projectDetail,
                  displayShareBox: {
                      toggle: jasmine.any(Function)
                  }
              },
                  component = m.component(ProjectShareBox, args),
                  view = component.view(component.controller(), args);
              $output = mq(ProjectShareBox, args);
          });

          it('should render project project share pop', function () {
              $output.should.have('.pop-share');
              $output.should.have('.w-widget-facebook');
              $output.should.have('.w-widget-twitter');
              $output.should.have('.widget-embed');
          });

          it('should open embed box when click on embed', function () {
              $output.click('a.widget-embed');
              $output.should.have('.embed-expanded');
          });
      });
  });

  describe('ProjectSidebar', function () {
      var generateContextByNewState = void 0,
          ProjectSidebar = window.c.ProjectSidebar;

      describe('view', function () {
          beforeAll(function () {
              generateContextByNewState = function generateContextByNewState() {
                  var newState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                  spyOn(m, 'component').and.callThrough();
                  var projectDetail = m.prop(_.extend({}, ProjectDetailsMockery()[0], newState)),
                      component = m.component(ProjectSidebar, {
                      project: projectDetail,
                      userDetails: m.prop([])
                  }),
                      ctrl = component.controller({
                      project: projectDetail,
                      userDetails: m.prop([])
                  }),
                      view = component.view(component.controller(), {
                      project: projectDetail,
                      userDetails: m.prop([])
                  });

                  return {
                      output: mq(view),
                      ctrl: ctrl,
                      projectDetail: projectDetail
                  };
              };
          });

          it('should render project stats', function () {
              var _generateContextByNew = generateContextByNewState({
                  state: 'successful'
              });

              var output = _generateContextByNew.output;
              var projectDetail = _generateContextByNew.projectDetail;


              expect(output.find('#project-sidebar.aside').length).toEqual(1);
              expect(output.find('.card-success').length).toEqual(1);
          });

          it('should render a all or nothing badge when is aon', function () {
              var _generateContextByNew2 = generateContextByNewState({
                  mode: 'aon'
              });

              var output = _generateContextByNew2.output;
              var projectDetail = _generateContextByNew2.projectDetail;


              expect(output.find('#aon').length).toEqual(1);
          });

          it('should render a flex badge when project mode is flexible', function () {
              var _generateContextByNew3 = generateContextByNewState({
                  mode: 'flex'
              });

              var output = _generateContextByNew3.output;
              var projectDetail = _generateContextByNew3.projectDetail;


              expect(output.find('#flex').length).toEqual(1);
          });

          describe('reminder', function () {
              it('should render reminder when project is open_for_contributions and user signed in and is in_reminder', function () {
                  var _generateContextByNew4 = generateContextByNewState({
                      open_for_contributions: true,
                      user_signed_in: true,
                      in_reminder: true
                  });

                  var output = _generateContextByNew4.output;
                  var projectDetail = _generateContextByNew4.projectDetail;


                  expect(output.contains('Lembrete ativo')).toEqual(true);
                  expect(output.find('#project-reminder').length).toEqual(1);
              });

              it('should render reminder when project is open_for_contributions and user signed in ant not in_reminder', function () {
                  var _generateContextByNew5 = generateContextByNewState({
                      open_for_contributions: true,
                      user_signed_in: true,
                      in_reminder: false
                  });

                  var output = _generateContextByNew5.output;
                  var projectDetail = _generateContextByNew5.projectDetail;


                  expect(output.contains('Lembrar-me')).toEqual(true);
                  expect(output.find('#project-reminder').length).toEqual(1);
              });

              it('should render reminder when project is open_for_contributions and user not signed in', function () {
                  var _generateContextByNew6 = generateContextByNewState({
                      open_for_contributions: true,
                      user_signed_in: false
                  });

                  var output = _generateContextByNew6.output;
                  var projectDetail = _generateContextByNew6.projectDetail;


                  expect(output.find('#project-reminder').length).toEqual(1);
              });

              it('should not render reminder when project is not open_for_contributions and user signed in', function () {
                  var _generateContextByNew7 = generateContextByNewState({
                      open_for_contributions: false,
                      user_signed_in: true
                  });

                  var output = _generateContextByNew7.output;
                  var projectDetail = _generateContextByNew7.projectDetail;


                  expect(output.find('#project-reminder').length).toEqual(0);
              });
          });
      });
  });

  describe('ProjectTabs', function () {
      var $output = void 0,
          projectDetail = void 0,
          ProjectTabs = window.c.ProjectTabs;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = m.prop(ProjectDetailsMockery()[0]);
              var component = m.component(ProjectTabs, {
                  project: m.prop(projectDetail),
                  rewardDetails: m.prop([])
              });
              $output = mq(component);
          });

          it('should render project-tabs', function () {
              expect($output.find('a.dashboard-nav-link').length).toEqual(5);
              expect($output.find('a#about-link').length).toEqual(1);
          });

          it('should call hashMatch when click on some link', function () {
              var oldHash = window.location.hash;
              window.location.hash = 'posts';
              $output.redraw();
              $output.should.have('a#posts-link.selected');
              window.location.hash = oldHash;
          });
      });
  });

  describe('ProjectsDashboard', function () {
      var $output = void 0,
          projectDetail = void 0,
          ProjectsDashboard = window.c.root.ProjectsDashboard;

      describe('view', function () {
          beforeAll(function () {
              projectDetail = ProjectDetailsMockery()[0];
              var component = m.component(ProjectsDashboard, {
                  project_id: projectDetail.project_id,
                  project_user_id: projectDetail.user.id
              });
              $output = mq(component);
          });

          it('should render project about and reward list', function () {
              expect($output.has('.project-nav-wrapper')).toBeTrue();
          });
      });
  });

  var contributionListVM = postgrest.paginationVM(models.contributionDetail, 'id.desc', { 'Prefer': 'count=exact' });

  var vm = postgrest$1.filtersVM({
      full_text_index: '@@',
      state: 'eq',
      gateway: 'eq',
      value: 'between',
      created_at: 'between'
  });
  var paramToString = function paramToString(p) {
      return (p || '').toString().trim();
  };
  // Set default values
  vm.state('');
  vm.gateway('');
  vm.order({
      id: 'desc'
  });

  vm.created_at.lte.toFilter = function () {
      var filter = paramToString(vm.created_at.lte());
      return filter && h$1.momentFromString(filter).endOf('day').format('');
  };

  vm.created_at.gte.toFilter = function () {
      var filter = paramToString(vm.created_at.gte());
      return filter && h$1.momentFromString(filter).format();
  };

  vm.full_text_index.toFilter = function () {
      var filter = paramToString(vm.full_text_index());
      return filter && replaceDiacritics$1(filter) || undefined;
  };

  var adminItem = {
      controller: function controller(args) {
          return {
              displayDetailBox: h$1.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var item = args.item;

          return m$1('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', [m$1.component(args.listItem, {
              item: item,
              key: args.key
          }), m$1('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
              onclick: ctrl.displayDetailBox.toggle
          }), ctrl.displayDetailBox() ? m$1.component(args.listDetail, {
              item: item,
              key: args.key
          }) : '']);
      }
  };

  var adminList = {
      controller: function controller(args) {
          var list = args.vm.list;

          if (!list.collection().length && list.firstPage) {
              list.firstPage().then(null, function (serverError) {
                  args.vm.error(serverError.message);
              });
          }
      },
      view: function view(ctrl, args) {
          var list = args.vm.list,
              error = args.vm.error,
              label = args.label || '';

          return m$1('.w-section.section', [m$1('.w-container', error() ? m$1('.card.card-error.u-radius.fontweight-bold', error()) : [m$1('.w-row.u-marginbottom-20', [m$1('.w-col.w-col-9', [m$1('.fontsize-base', list.isLoading() ? 'Carregando ' + label.toLowerCase() + '...' : [m$1('span.fontweight-semibold', list.total()), ' ' + label.toLowerCase() + ' encontrados'])])]), m$1('#admin-contributions-list.w-container', [list.collection().map(function (item) {
              return m$1.component(adminItem, {
                  listItem: args.listItem,
                  listDetail: args.listDetail,
                  item: item,
                  key: item.id
              });
          }), m$1('.w-section.section', [m$1('.w-container', [m$1('.w-row', [m$1('.w-col.w-col-2.w-col-push-5', [list.isLoading() ? h$1.loader() : m$1('button#load-more.btn.btn-medium.btn-terciary', {
              onclick: list.nextPage
          }, 'Carregar mais')])])])])])])]);
      }
  };

  var filterMain = {
      view: function view(ctrl, args) {
          var inputWrapperClass = args.inputWrapperClass || '.w-input.text-field.positive.medium',
              btnClass = args.btnClass || '.btn.btn-large.u-marginbottom-10';

          return m$1('.w-row', [m$1('.w-col.w-col-10', [m$1('input' + inputWrapperClass + '[placeholder="' + args.placeholder + '"][type="text"]', {
              onchange: m$1.withAttr('value', args.vm),
              value: args.vm()
          })]), m$1('.w-col.w-col-2', [m$1('input#filter-btn' + btnClass + '[type="submit"][value="Buscar"]')])]);
      }
  };

  var adminFilter = {
      controller: function controller() {
          return {
              toggler: h.toggleProp(false, true)
          };
      },
      view: function view(ctrl, args) {
          var filterBuilder = args.filterBuilder,
              data = args.data,
              label = args.label || '',
              main = _$1.findWhere(filterBuilder, {
              component: filterMain
          });

          return m$1('#admin-contributions-filter.w-section.page-header', [m$1('.w-container', [m$1('.fontsize-larger.u-text-center.u-marginbottom-30', label), m$1('.w-form', [m$1('form', {
              onsubmit: args.submit
          }, [main ? m$1.component(main.component, main.data) : '', m$1('.u-marginbottom-20.w-row', m$1('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
              onclick: ctrl.toggler.toggle
          }, 'Filtros avançados  >')), ctrl.toggler() ? m$1('#advanced-search.w-row.admin-filters', [_$1.map(filterBuilder, function (f) {
              return f.component !== filterMain ? m$1.component(f.component, f.data) : '';
          })]) : ''])])])]);
      }
  };

  var adminProject = {
      view: function view(ctrl, args) {
          var project = args.item;
          return m$1('.w-row.admin-project', [m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m$1('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), m$1('.w-col.w-col-9.w-col-small-9', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m$1('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), m$1('.fontsize-smallest.fontweight-semibold', project.project_state), m$1('.fontsize-smallest.fontcolor-secondary', h$1.momentify(project.project_online_date) + ' a ' + h$1.momentify(project.project_expires_at))])]);
      }
  };

  var adminContribution = {
      view: function view(ctrl, args) {
          var contribution = args.item;
          return m$1('.w-row.admin-contribution', [m$1('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value), m$1('.fontsize-smallest.fontcolor-secondary', h$1.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), m$1('.fontsize-smallest', ['ID do Gateway: ', m$1('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
      }
  };

  var adminUser = {
      view: function view(ctrl, args) {
          var user = args.item;

          return m$1('.w-row.admin-user', [m$1('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m$1('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m$1('.w-col.w-col-9.w-col-small-9', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m$1('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m$1('.fontsize-smallest', 'Usuário: ' + user.id), m$1('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
      }
  };

  var adminContributionUser = {
      view: function view(ctrl, args) {
          var item = args.item,
              user = {
              profile_img_thumbnail: item.user_profile_img,
              id: item.user_id,
              name: item.user_name,
              email: item.email
          };

          var additionalData = m$1('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
          return m$1.component(adminUser, { item: user, additional_data: additionalData });
      }
  };

  var paymentStatus = {
      controller: function controller(args) {
          var payment = args.item,
              card = null,
              displayPaymentMethod = void 0,
              paymentMethodClass = void 0,
              stateClass = void 0;

          card = function card() {
              if (payment.gateway_data) {
                  switch (payment.gateway.toLowerCase()) {
                      case 'moip':
                          return {
                              first_digits: payment.gateway_data.cartao_bin,
                              last_digits: payment.gateway_data.cartao_final,
                              brand: payment.gateway_data.cartao_bandeira
                          };
                      case 'pagarme':
                          return {
                              first_digits: payment.gateway_data.card_first_digits,
                              last_digits: payment.gateway_data.card_last_digits,
                              brand: payment.gateway_data.card_brand
                          };
                  }
              }
          };

          displayPaymentMethod = function displayPaymentMethod() {
              switch (payment.payment_method.toLowerCase()) {
                  case 'boletobancario':
                      return m$1('span#boleto-detail', '');
                  case 'cartaodecredito':
                      var cardData = card();
                      if (cardData) {
                          return m$1('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [cardData.first_digits + '******' + cardData.last_digits, m$1('br'), cardData.brand + ' ' + payment.installments + 'x']);
                      }
                      return '';
              }
          };

          paymentMethodClass = function paymentMethodClass() {
              switch (payment.payment_method.toLowerCase()) {
                  case 'boletobancario':
                      return '.fa-barcode';
                  case 'cartaodecredito':
                      return '.fa-credit-card';
                  default:
                      return '.fa-question';
              }
          };

          stateClass = function stateClass() {
              switch (payment.state) {
                  case 'paid':
                      return '.text-success';
                  case 'refunded':
                      return '.text-refunded';
                  case 'pending':
                  case 'pending_refund':
                      return '.text-waiting';
                  default:
                      return '.text-error';
              }
          };

          return {
              displayPaymentMethod: displayPaymentMethod,
              paymentMethodClass: paymentMethodClass,
              stateClass: stateClass
          };
      },
      view: function view(ctrl, args) {
          var payment = args.item;

          return m$1('.w-row.payment-status', [m$1('.fontsize-smallest.lineheight-looser.fontweight-semibold', [m$1('span.fa.fa-circle' + ctrl.stateClass()), ' ' + payment.state]), m$1('.fontsize-smallest.fontweight-semibold', [m$1('span.fa' + ctrl.paymentMethodClass()), ' ', m$1('a.link-hidden[href="#"]', payment.payment_method)]), m$1('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [ctrl.displayPaymentMethod()])]);
      }
  };

  var adminContributionItem = {
      controller: function controller() {
          return {
              itemBuilder: [{
                  component: adminContributionUser,
                  wrapperClass: '.w-col.w-col-4'
              }, {
                  component: adminProject,
                  wrapperClass: '.w-col.w-col-4'
              }, {
                  component: adminContribution,
                  wrapperClass: '.w-col.w-col-2'
              }, {
                  component: paymentStatus,
                  wrapperClass: '.w-col.w-col-2'
              }]
          };
      },
      view: function view(ctrl, args) {
          return m$1('.w-row', _.map(ctrl.itemBuilder, function (panel) {
              return m$1(panel.wrapperClass, [m$1.component(panel.component, {
                  item: args.item,
                  key: args.key
              })]);
          }));
      }
  };

  var adminInputAction = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              error = m$1.prop(false),
              fail = m$1.prop(false),
              data = {},
              item = args.item,
              key = builder.property,
              forceValue = builder.forceValue || null,
              newValue = m$1.prop(forceValue);

          h$1.idVM.id(item[builder.updateKey]);

          var l = postgrest.loaderWithToken(builder.model.patchOptions(h$1.idVM.parameters(), data));

          var updateItem = function updateItem(res) {
              _.extend(item, res[0]);
              complete(true);
              error(false);
          };

          var submit = function submit() {
              data[key] = newValue();
              l.load().then(updateItem, function () {
                  complete(true);
                  error(true);
              });
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
                  newValue(forceValue);
              };
          };

          return {
              complete: complete,
              error: error,
              l: l,
              newValue: newValue,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [m$1('label', data.innerLabel), data.forceValue === undefined ? m$1('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', {
              onchange: m$1.withAttr('value', ctrl.newValue),
              value: ctrl.newValue()
          }) : '', m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', data.successMessage)])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', 'Houve um problema na requisição. ' + data.errorMessage)])])]) : '']);
      }
  };

  var adminRadioAction = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              data = {},
              error = m$1.prop(false),
              fail = m$1.prop(false),
              item = args.item(),
              description = m$1.prop(item.description || ''),
              key = builder.getKey,
              newID = m$1.prop(''),
              getFilter = {},
              setFilter = {},
              radios = m$1.prop(),
              getAttr = builder.radios,
              getKey = builder.getKey,
              getKeyValue = args.getKeyValue,
              updateKey = builder.updateKey,
              updateKeyValue = args.updateKeyValue,
              validate = builder.validate,
              selectedItem = builder.selectedItem || m$1.prop();

          setFilter[updateKey] = 'eq';
          var setVM = postgrest.filtersVM(setFilter);
          setVM[updateKey](updateKeyValue);

          getFilter[getKey] = 'eq';
          var getVM = postgrest.filtersVM(getFilter);
          getVM[getKey](getKeyValue);

          var getLoader = postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));

          var setLoader = postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

          var updateItem = function updateItem(data) {
              if (data.length > 0) {
                  var newItem = _$1.findWhere(radios(), {
                      id: data[0][builder.selectKey]
                  });
                  selectedItem(newItem);
              } else {
                  error({
                      message: 'Nenhum item atualizado'
                  });
              }
              complete(true);
          };

          var fetch = function fetch() {
              getLoader.load().then(radios, error);
          };

          var submit = function submit() {
              if (newID()) {
                  var validation = validate(radios(), newID());
                  if (_$1.isUndefined(validation)) {
                      data[builder.selectKey] = newID();
                      setLoader.load().then(updateItem, error);
                  } else {
                      complete(true);
                      error({
                          message: validation
                      });
                  }
              }
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
                  newID('');
              };
          };

          var setDescription = function setDescription(text) {
              description(text);
              m$1.redraw();
          };

          fetch();

          return {
              complete: complete,
              description: description,
              setDescription: setDescription,
              error: error,
              setLoader: setLoader,
              getLoader: getLoader,
              newID: newID,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload,
              radios: radios
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              item = args.item(),
              btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [ctrl.radios() ? _$1.map(ctrl.radios(), function (radio, index) {
              var set = function set() {
                  ctrl.newID(radio.id);
                  ctrl.setDescription(radio.description);
              };
              var selected = radio.id === (item[data.selectKey] || item.id) ? true : false;

              return m$1('.w-radio', [m$1('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + (selected ? '[checked]' : ''), {
                  onclick: set
              }), m$1('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
          }) : h$1.loader(), m$1('strong', 'Descrição'), m$1('p', ctrl.description()), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Recompensa alterada com sucesso!')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', ctrl.error().message)])])]) : '']);
      }
  };

  var adminTransaction = {
      view: function view(ctrl, args) {
          var contribution = args.contribution;
          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), m$1('.fontsize-smallest.lineheight-looser', ['Valor: R$' + _$1.formatNumber(contribution.value, 2, 3), m$1('br'), 'Taxa: R$' + _$1.formatNumber(contribution.gateway_fee, 2, 3), m$1('br'), 'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'), m$1('br'), 'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'), m$1('br'), 'Id pagamento: ' + contribution.gateway_id, m$1('br'), 'Apoio: ' + contribution.contribution_id, m$1('br'), 'Chave: \n', m$1('br'), contribution.key, m$1('br'), 'Meio: ' + contribution.gateway, m$1('br'), 'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m$1('br'), contribution.is_second_slip ? [m$1('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m$1('span.badge', '2a via')] : ''])]);
      }
  };

  var adminTransactionHistory = {
      controller: function controller(args) {
          var contribution = args.contribution,
              mapEvents = _$1.reduce([{
              date: contribution.paid_at,
              name: 'Apoio confirmado'
          }, {
              date: contribution.pending_refund_at,
              name: 'Reembolso solicitado'
          }, {
              date: contribution.refunded_at,
              name: 'Estorno realizado'
          }, {
              date: contribution.created_at,
              name: 'Apoio criado'
          }, {
              date: contribution.refused_at,
              name: 'Apoio cancelado'
          }, {
              date: contribution.deleted_at,
              name: 'Apoio excluído'
          }, {
              date: contribution.chargeback_at,
              name: 'Chargeback'
          }], function (memo, item) {
              if (item.date !== null && item.date !== undefined) {
                  item.originalDate = item.date;
                  item.date = h$1.momentify(item.date, 'DD/MM/YYYY, HH:mm');
                  return memo.concat(item);
              }

              return memo;
          }, []);

          return {
              orderedEvents: _$1.sortBy(mapEvents, 'originalDate')
          };
      },
      view: function view(ctrl) {
          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico da transação'), ctrl.orderedEvents.map(function (cEvent) {
              return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event', [m$1('.w-col.w-col-6', [m$1('.fontcolor-secondary', cEvent.date)]), m$1('.w-col.w-col-6', [m$1('div', cEvent.name)])]);
          })]);
      }
  };

  var adminReward = {
      view: function view(ctrl, args) {
          var reward = args.reward(),
              available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), m$1('.fontsize-smallest.lineheight-looser', reward.id ? ['ID: ' + reward.id, m$1('br'), 'Valor mínimo: R$' + h$1.formatNumber(reward.minimum_value, 2, 3), m$1('br'), m$1.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m$1('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, m$1('br'), 'Descrição: ' + reward.description] : 'Apoio sem recompensa')]);
      }
  };

  var adminContributionDetail = {
      controller: function controller(args) {
          var l = void 0;
          var loadReward = function loadReward() {
              var model = models.rewardDetail,
                  reward_id = args.item.reward_id,
                  opts = model.getRowOptions(h$1.idVM.id(reward_id).parameters()),
                  reward = m$1.prop({});

              l = postgrest.loaderWithToken(opts);

              if (reward_id) {
                  l.load().then(_$1.compose(reward, _$1.first));
              }

              return reward;
          };

          return {
              reward: loadReward(),
              actions: {
                  transfer: {
                      property: 'user_id',
                      updateKey: 'id',
                      callToAction: 'Transferir',
                      innerLabel: 'Id do novo apoiador:',
                      outerLabel: 'Transferir Apoio',
                      placeholder: 'ex: 129908',
                      successMessage: 'Apoio transferido com sucesso!',
                      errorMessage: 'O apoio não foi transferido!',
                      model: models.contributionDetail
                  },
                  reward: {
                      getKey: 'project_id',
                      updateKey: 'contribution_id',
                      selectKey: 'reward_id',
                      radios: 'rewards',
                      callToAction: 'Alterar Recompensa',
                      outerLabel: 'Recompensa',
                      getModel: models.rewardDetail,
                      updateModel: models.contributionDetail,
                      selectedItem: loadReward(),
                      validate: function validate(rewards, newRewardID) {
                          var reward = _$1.findWhere(rewards, { id: newRewardID });
                          return args.item.value >= reward.minimum_value ? undefined : 'Valor mínimo da recompensa é maior do que o valor da contribuição.';
                      }
                  },
                  refund: {
                      updateKey: 'id',
                      callToAction: 'Reembolso direto',
                      innerLabel: 'Tem certeza que deseja reembolsar esse apoio?',
                      outerLabel: 'Reembolsar Apoio',
                      model: models.contributionDetail
                  },
                  remove: {
                      property: 'state',
                      updateKey: 'id',
                      callToAction: 'Apagar',
                      innerLabel: 'Tem certeza que deseja apagar esse apoio?',
                      outerLabel: 'Apagar Apoio',
                      forceValue: 'deleted',
                      successMessage: 'Apoio removido com sucesso!',
                      errorMessage: 'O apoio não foi removido!',
                      model: models.contributionDetail
                  }
              },
              l: l
          };
      },
      view: function view(ctrl, args) {
          var actions = ctrl.actions,
              item = args.item,
              reward = ctrl.reward;

          var addOptions = function addOptions(builder, id) {
              return _$1.extend({}, builder, {
                  requestOptions: {
                      url: '/admin/contributions/' + id + '/gateway_refund',
                      method: 'PUT'
                  }
              });
          };

          return m$1('#admin-contribution-detail-box', [m$1('.divider.u-margintop-20.u-marginbottom-20'), m$1('.w-row.u-marginbottom-30', [m$1.component(adminInputAction, {
              data: actions.transfer,
              item: item
          }), ctrl.l() ? h$1.loader : m$1.component(adminRadioAction, {
              data: actions.reward,
              item: reward,
              getKeyValue: item.project_id,
              updateKeyValue: item.contribution_id
          }), m$1.component(adminExternalAction, {
              data: addOptions(actions.refund, item.id),
              item: item
          }), m$1.component(adminInputAction, {
              data: actions.remove,
              item: item
          })]), m$1('.w-row.card.card-terciary.u-radius', [m$1.component(adminTransaction, {
              contribution: item
          }), m$1.component(adminTransactionHistory, {
              contribution: item
          }), ctrl.l() ? h$1.loader : m$1.component(adminReward, {
              reward: reward,
              key: item.key
          })])]);
      }
  };

  var adminConstributions = {
      controller: function controller() {
          var listVM = contributionListVM,
              filterVM = vm,
              error = m$1.prop(''),
              filterBuilder = [{ //full_text_index
              component: 'FilterMain',
              data: {
                  vm: filterVM.full_text_index,
                  placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
              }
          }, { //state
              component: 'FilterDropdown',
              data: {
                  label: 'Com o estado',
                  name: 'state',
                  vm: filterVM.state,
                  options: [{
                      value: '',
                      option: 'Qualquer um'
                  }, {
                      value: 'paid',
                      option: 'paid'
                  }, {
                      value: 'refused',
                      option: 'refused'
                  }, {
                      value: 'pending',
                      option: 'pending'
                  }, {
                      value: 'pending_refund',
                      option: 'pending_refund'
                  }, {
                      value: 'refunded',
                      option: 'refunded'
                  }, {
                      value: 'chargeback',
                      option: 'chargeback'
                  }, {
                      value: 'deleted',
                      option: 'deleted'
                  }]
              }
          }, { //gateway
              component: 'FilterDropdown',
              data: {
                  label: 'gateway',
                  name: 'gateway',
                  vm: filterVM.gateway,
                  options: [{
                      value: '',
                      option: 'Qualquer um'
                  }, {
                      value: 'Pagarme',
                      option: 'Pagarme'
                  }, {
                      value: 'MoIP',
                      option: 'MoIP'
                  }, {
                      value: 'PayPal',
                      option: 'PayPal'
                  }, {
                      value: 'Credits',
                      option: 'Créditos'
                  }]
              }
          }, { //value
              component: 'FilterNumberRange',
              data: {
                  label: 'Valores entre',
                  first: filterVM.value.gte,
                  last: filterVM.value.lte
              }
          }, { //created_at
              component: 'FilterDateRange',
              data: {
                  label: 'Período do apoio',
                  first: filterVM.created_at.gte,
                  last: filterVM.created_at.lte
              }
          }],
              submit = function submit() {
              error(false);
              listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
                  error(serverError.message);
              });
              return false;
          };

          return {
              filterVM: filterVM,
              filterBuilder: filterBuilder,
              listVM: {
                  list: listVM,
                  error: error
              },
              data: {
                  label: 'Apoios'
              },
              submit: submit
          };
      },
      view: function view(ctrl) {
          return [m$1.component(adminFilter, {
              form: ctrl.filterVM.formDescriber,
              filterBuilder: ctrl.filterBuilder,
              submit: ctrl.submit
          }), m$1.component(adminList, {
              vm: ctrl.listVM,
              listItem: adminContributionItem,
              listDetail: adminContributionDetail
          })];
      }
  };

  var adminContributions$1 = adminContributions;

  fdescribe('adminContributions', function () {
    var ctrl, $output;

    beforeAll(function () {
      AdminContributions = m.component(adminContributions$1);
      ctrl = AdminContributions.controller();
    });

    describe('controller', function () {
      it('should instantiate a list view-model', function () {
        expect(ctrl.listVM).toBeDefined();
      });

      it('should instantiate a filter view-model', function () {
        expect(ctrl.filterVM).toBeDefined();
      });
    });

    describe('view', function () {
      beforeAll(function () {
        $output = mq(Contributions);
      });

      it('should render AdminFilter nested component', function () {
        expect($output.has('#admin-contributions-filter')).toBeTrue();
      });
      it('should render AdminList nested component', function () {
        expect($output.has('#admin-contributions-list')).toBeTrue();
      });
    });
  });

  var userListVM = postgrest.paginationVM(models.user, 'id.desc', { 'Prefer': 'count=exact' });

  var vm$1 = postgrest.filtersVM({
      full_text_index: '@@',
      deactivated_at: 'is.null'
  });
  var paramToString$1 = function paramToString(p) {
      return (p || '').toString().trim();
  };
  // Set default values
  vm$1.deactivated_at(null).order({
      id: 'desc'
  });

  vm$1.deactivated_at.toFilter = function () {
      var filter = JSON.parse(vm$1.deactivated_at());
      return filter;
  };

  vm$1.full_text_index.toFilter = function () {
      var filter = paramToString$1(vm$1.full_text_index());
      return filter && replaceDiacritics$1(filter) || undefined;
  };

  var adminUserItem = {
      view: function view(ctrl, args) {
          return m$1('.w-row', [m$1('.w-col.w-col-4', [m$1.component(adminUser, args)])]);
      }
  };

  var adminResetPassword = {
      controller: function controller(args) {
          var builder = args.data,
              complete = m$1.prop(false),
              error = m$1.prop(false),
              fail = m$1.prop(false),
              key = builder.property,
              data = {},
              item = args.item;

          builder.requestOptions.config = function (xhr) {
              if (h$1.authenticityToken()) {
                  xhr.setRequestHeader('X-CSRF-Token', h$1.authenticityToken());
              }
          };

          var l = m$1.prop(false),
              load = function load() {
              return m$1.request(_$1.extend({}, { data: data }, builder.requestOptions));
          },
              newPassword = m$1.prop(''),
              error_message = m$1.prop('');

          var requestError = function requestError(err) {
              l(false);
              error_message(err.errors[0]);
              complete(true);
              error(true);
          };
          var updateItem = function updateItem(res) {
              l(false);
              _$1.extend(item, res[0]);
              complete(true);
              error(false);
          };

          var submit = function submit() {
              l(true);
              data[key] = newPassword();
              load().then(updateItem, requestError);
              return false;
          };

          var unload = function unload(el, isinit, context) {
              context.onunload = function () {
                  complete(false);
                  error(false);
              };
          };

          return {
              complete: complete,
              error: error,
              error_message: error_message,
              l: l,
              newPassword: newPassword,
              submit: submit,
              toggler: h$1.toggleProp(false, true),
              unload: unload
          };
      },
      view: function view(ctrl, args) {
          var data = args.data,
              btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

          return m$1('.w-col.w-col-2', [m$1('button.btn.btn-small.btn-terciary', {
              onclick: ctrl.toggler.toggle
          }, data.outerLabel), ctrl.toggler() ? m$1('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
              config: ctrl.unload
          }, [m$1('form.w-form', {
              onsubmit: ctrl.submit
          }, !ctrl.complete() ? [m$1('label', data.innerLabel), m$1('input.w-input.text-field[type="text"][name="' + data.property + '"][placeholder="' + data.placeholder + '"]', {
              onchange: m$1.withAttr('value', ctrl.newPassword),
              value: ctrl.newPassword()
          }), m$1('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m$1('.w-form-done[style="display:block;"]', [m$1('p', 'Senha alterada com sucesso.')])] : [m$1('.w-form-error[style="display:block;"]', [m$1('p', ctrl.error_message())])])]) : '']);
      }
  };

  var adminNotificationHistory = {
      controller: function controller(args) {
          var notifications = m$1.prop([]),
              getNotifications = function getNotifications(user) {
              var notification = models.notification;
              notification.getPageWithToken(postgrest.filtersVM({
                  user_id: 'eq',
                  sent_at: 'is.null'
              }).user_id(user.id).sent_at(!null).order({
                  sent_at: 'desc'
              }).parameters()).then(notifications);
          };

          getNotifications(args.user);

          return {
              notifications: notifications
          };
      },
      view: function view(ctrl) {
          return m$1('.w-col.w-col-4', [m$1('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico de notificações'), ctrl.notifications().map(function (cEvent) {
              return m$1('.w-row.fontsize-smallest.lineheight-looser.date-event', [m$1('.w-col.w-col-24', [m$1('.fontcolor-secondary', h$1.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'), ' - ', cEvent.template_name, cEvent.origin ? ' - ' + cEvent.origin : '')])]);
          })]);
      }
  };

  var adminUserDetail = {
      controller: function controller() {
          return {
              actions: {
                  reset: {
                      property: 'password',
                      callToAction: 'Redefinir',
                      innerLabel: 'Nova senha de Usuário:',
                      outerLabel: 'Redefinir senha',
                      placeholder: 'ex: 123mud@r',
                      model: c.models.user
                  },
                  reactivate: {
                      property: 'deactivated_at',
                      updateKey: 'id',
                      callToAction: 'Reativar',
                      innerLabel: 'Tem certeza que deseja reativar esse usuário?',
                      successMessage: 'Usuário reativado com sucesso!',
                      errorMessage: 'O usuário não pôde ser reativado!',
                      outerLabel: 'Reativar usuário',
                      forceValue: null,
                      model: c.models.user
                  }
              }
          };
      },
      view: function view(ctrl, args) {
          var actions = ctrl.actions,
              item = args.item,
              details = args.details,
              addOptions = function addOptions(builder, id) {
              return _$1.extend({}, builder, {
                  requestOptions: {
                      url: '/users/' + id + '/new_password',
                      method: 'POST'
                  }
              });
          };

          return m$1('#admin-contribution-detail-box', [m$1('.divider.u-margintop-20.u-marginbottom-20'), m$1('.w-row.u-marginbottom-30', [m$1.component(adminResetPassword, {
              data: addOptions(actions.reset, item.id),
              item: item
          }), item.deactivated_at ? m$1.component(adminInputAction, { data: actions.reactivate, item: item }) : '']), m$1('.w-row.card.card-terciary.u-radius', [m$1.component(adminNotificationHistory, {
              user: item
          })])]);
      }
  };

  var adminUsers = {
      controller: function controller() {
          var listVM = userListVM,
              filterVM = vm$1,
              error = m$1.prop(''),
              itemBuilder = [{
              component: 'AdminUser',
              wrapperClass: '.w-col.w-col-4'
          }],
              filterBuilder = [{ //name
              component: 'FilterMain',
              data: {
                  vm: filterVM.full_text_index,
                  placeholder: 'Busque por nome, e-mail, Ids do usuário...'
              }
          }, { //status
              component: 'FilterDropdown',
              data: {
                  label: 'Com o estado',
                  index: 'status',
                  name: 'deactivated_at',
                  vm: filterVM.deactivated_at,
                  options: [{
                      value: '',
                      option: 'Qualquer um'
                  }, {
                      value: null,
                      option: 'ativo'
                  }, {
                      value: !null,
                      option: 'desativado'
                  }]
              }
          }],
              submit = function submit() {
              listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
                  error(serverError.message);
              });
              return false;
          };

          return {
              filterVM: filterVM,
              filterBuilder: filterBuilder,
              listVM: {
                  list: listVM,
                  error: error
              },
              submit: submit
          };
      },
      view: function view(ctrl) {
          var label = 'Usuários';

          return [m$1.component(adminFilter, {
              form: ctrl.filterVM.formDescriber,
              filterBuilder: ctrl.filterBuilder,
              label: label,
              submit: ctrl.submit
          }), m$1.component(adminList, {
              vm: ctrl.listVM,
              label: label,
              listItem: adminUserItem,
              listDetail: adminUserDetail
          })];
      }
  };

  describe('adminUsers', function () {
    var ctrl, $output;

    beforeAll(function () {
      AdminUsers = m.component(adminUsers);
      ctrl = AdminUsers.controller();
    });

    describe('controller', function () {
      it('should instantiate a list view-model', function () {
        expect(ctrl.listVM).toBeDefined();
      });

      it('should instantiate a filter view-model', function () {
        expect(ctrl.filterVM).toBeDefined();
      });
    });

    describe('view', function () {
      beforeAll(function () {
        $output = mq(Users);
      });

      it('should render AdminFilter nested component', function () {
        expect($output.has('#admin-contributions-filter')).toBeTrue();
      });
      it('should render AdminList nested component', function () {
        expect($output.has('#admin-contributions-list')).toBeTrue();
      });
    });
  });

  describe('pages.LiveStatistics', function () {
    var $output = void 0,
        statistic = void 0,
        LiveStatistics = window.c.root.LiveStatistics;

    describe('view', function () {
      beforeAll(function () {
        statistic = StatisticMockery()[0];
        var component = m.component(LiveStatistics);
        $output = mq(component.view(component.controller(), {}));
      });

      it('should render statistics', function () {
        expect($output.contains(window.c.h.formatNumber(statistic.total_contributed, 2, 3))).toEqual(true);
        expect($output.contains(statistic.total_contributors)).toEqual(true);
      });
    });
  });

  describe('ProjectsExplore', function () {
      var $output = void 0,
          project = void 0,
          component = void 0,
          ProjectsExplore = window.c.root.ProjectsExplore;

      beforeAll(function () {
          window.location.hash = '#by_category_id/1';

          component = m.component(ProjectsExplore);
          $output = mq(component);
      });

      it('should render search container', function () {
          $output.should.have('.hero-search');
      });
  });

  describe('ProjectShow', function () {
    var $output = void 0,
        projectDetail = void 0,
        ProjectShow = window.c.root.ProjectsShow;

    beforeAll(function () {
      window.location.hash = '';
      projectDetail = ProjectDetailsMockery()[0];
      var component = m.component(ProjectShow, { project_id: 123, project_user_id: 1231 }),
          view = component.view(component.controller());
      $output = mq(view);
    });

    it('should render project some details', function () {
      expect($output.contains(projectDetail.name)).toEqual(true);
      $output.should.have('#project-sidebar');
      $output.should.have('#project-header');
      $output.should.have('.project-highlight');
      $output.should.have('.project-nav');
      $output.should.have('#rewards');
    });
  });

  describe('UsersBalance', function () {
      var $output = void 0,
          component = void 0,
          UsersBalance = window.c.root.UsersBalance;

      beforeAll(function () {
          component = m.component(UsersBalance, { user_id: 1 });
          $output = mq(component);
      });

      it('should render user balance area', function () {
          $output.should.have('.user-balance-section');
      });

      it('should render user balance transactions area', function () {
          $output.should.have('.balance-transactions-area');
      });
  });

  describe('Search', function () {
      var $output = void 0,
          c = window.c,
          Search = c.Search,
          action = '/test',
          method = 'POST';

      describe('view', function () {
          beforeEach(function () {
              $output = mq(Search.view({}, { action: action, method: method }));
          });

          it('should render the search form', function () {
              expect($output.find('form').length).toEqual(1);
              expect($output.find('input[type="text"]').length).toEqual(1);
              expect($output.find('button').length).toEqual(1);
          });
          it('should set the given action', function () {
              expect($output.find('form[action="' + action + '"]').length).toEqual(1);
          });
          it('should set the given method', function () {
              expect($output.find('form[method="' + method + '"]').length).toEqual(1);
          });
      });
  });

  describe('Slider', function () {
      var $output = void 0,
          c = window.c,
          m = window.m,
          title = 'TitleSample',
          defaultDocumentWidth = 1600,
          slides = [m('h1', 'teste'), m('h1', 'teste'), m('h1', 'teste'), m('h1', 'teste')];

      describe('view', function () {
          beforeEach(function () {
              $output = mq(c.Slider, { title: title, slides: slides });
          });

          it('should render all the slides', function () {
              expect($output.find('.slide').length).toEqual(slides.length);
          });
          it('should render one bullet for each slide', function () {
              expect($output.find('.slide-bullet').length).toEqual(slides.length);
          });
          it('should move to next slide on slide next click', function () {
              $output.click('#slide-next');
              var firstSlide = $output.first('.slide');
              expect(firstSlide.attrs.style.indexOf('-' + defaultDocumentWidth + 'px')).toBeGreaterThan(-1);
          });
          it('should move to previous slide on slide prev click', function () {
              $output.click('#slide-next');
              $output.click('#slide-prev');
              var firstSlide = $output.first('.slide');
              expect(firstSlide.attrs.style.indexOf('0px')).toBeGreaterThan(-1);
          });
      });
  });

  describe('TeamMembers', function () {
      var $output,
          TeamMembers = window.c.TeamMembers;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(TeamMembers);
          });

          it('should render fetched team members', function () {
              expect($output.has('#team-members-static')).toEqual(true);
              expect($output.find('.team-member').length).toEqual(TeamMembersMockery(10).length);
          });
      });
  });

  describe('TeamTotal', function () {
      var $output = void 0,
          TeamTotal = window.c.TeamTotal;

      describe('view', function () {
          beforeAll(function () {
              $output = mq(TeamTotal);
          });

          it('should render fetched team total info', function () {
              expect($output.find('#team-total-static').length).toEqual(1);
          });
      });
  });

  describe('Tooltip', function () {
      var $output = void 0,
          c = window.c,
          m = window.m,
          element = 'a#tooltip-trigger[href="#"]',
          text = 'tooltipText',
          tooltip = function tooltip(el) {
          return m.component(c.Tooltip, {
              el: el,
              text: text,
              width: 320
          });
      };

      describe('view', function () {
          beforeEach(function () {
              $output = mq(tooltip(element));
          });

          it('should not render the tooltip at first', function () {
              expect($output.find('.tooltip').length).toEqual(0);
          });
          it('should render the tooltip on element mouseenter', function () {
              $output.click('#tooltip-trigger');
              expect($output.find('.tooltip').length).toEqual(1);
              expect($output.contains(text)).toBeTrue();
          });
          it('should hide the tooltip again on element mouseleave', function () {
              $output.click('#tooltip-trigger');
              $output.click('#tooltip-trigger');
              expect($output.find('.tooltip').length).toEqual(0);
          });
      });
  });

  describe('UserBalanceRequestModalContent', function () {
      var $output = void 0,
          component = void 0,
          parentComponent = void 0,
          UsersBalance = window.c.root.UsersBalance,
          UserBalanceModal = window.c.UserBalanceRequestModalContent;

      beforeAll(function () {
          parentComponent = m.component(UsersBalance, { user_id: 1 });
          component = m.component(UserBalanceModal, _.extend({}, parentComponent.controller(), {
              balance: {
                  amount: 205,
                  user_id: 1
              }
          }));
          $output = mq(component);
      });

      it('should call bank account endpoint', function () {
          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/bank_accounts?user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });

      it('should render user bank account / amount data', function () {
          expect($output.contains('R$ 205,00')).toEqual(true);
          expect($output.contains('Banco XX')).toEqual(true);
          $output.should.have('.btn-request-fund');
      });

      it('should call balance transfer endpoint when click on request fund btn and show success message', function () {
          $output.click('.btn-request-fund');
          $output.should.have('.fa-check-circle');

          var lastRequest = jasmine.Ajax.requests.filter(/balance_transfers/)[0];
          expect(lastRequest.url).toEqual(apiPrefix + '/balance_transfers');
          expect(lastRequest.method).toEqual('POST');
      });
  });

  describe('UserBalanceTransactions', function () {
      var $output = void 0,
          component = void 0,
          parentComponent = void 0,
          UsersBalance = window.c.root.UsersBalance,
          UserBalanceTransactions = window.c.UserBalanceTransactions;

      beforeAll(function () {
          parentComponent = m.component(UsersBalance, { user_id: 1 });
          component = m.component(UserBalanceTransactions, _.extend({}, parentComponent.controller(), { user_id: 1 }));
          $output = mq(component);
      });

      it('should call balance transactions endpoint', function () {
          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/balance_transactions?order=created_at.desc&user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });

      it('should render user balance transactions', function () {
          $output.should.have('.card-detailed-open');
          expect($output.contains('R$ 604,50')).toEqual(true);
          expect($output.contains('R$ 0,00')).toEqual(true);
          expect($output.contains('R$ -604,50')).toEqual(true);
          expect($output.contains('Project x')).toEqual(true);
      });
  });

  describe('UserBalance', function () {
      var $output = void 0,
          component = void 0,
          parentComponent = void 0,
          UsersBalance = window.c.root.UsersBalance,
          UserBalance = window.c.UserBalance;

      beforeAll(function () {
          parentComponent = m.component(UsersBalance, { user_id: 1 });
          component = m.component(UserBalance, _.extend({}, parentComponent.controller(), { user_id: 1 }));
          $output = mq(component);
      });

      it('should call balances endpoint', function () {
          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/balances?user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });

      it('should render user balance', function () {
          expect($output.contains('R$ 205,00')).toEqual(true);
      });

      it('should render request fund btn', function () {
          $output.should.have('.r-fund-btn');
      });

      it('should call bank_account endpoint when click on request fund btn and show modal', function () {
          $output.click('.r-fund-btn');
          $output.should.have('.modal-dialog-inner');
          expect($output.contains('Banco XX')).toEqual(true);

          var lastRequest = jasmine.Ajax.requests.mostRecent();
          expect(lastRequest.url).toEqual(apiPrefix + '/bank_accounts?user_id=eq.1');
          expect(lastRequest.method).toEqual('GET');
      });
  });

  describe('admin.contributionFilterVM', function () {
    var adminApp = window.c.admin,
        vm = adminApp.contributionFilterVM,
        momentFromString = window.c.h.momentFromString;

    describe("created_at.lte.toFilter", function () {
      it("should use end of the day timestamp to send filter", function () {
        vm.created_at.lte('21/12/1999');
        expect(vm.created_at.lte.toFilter()).toEqual(momentFromString(vm.created_at.lte()).endOf('day').format());
      });
    });

    describe("full_text_index.toFilter", function () {
      it("should remove all diacritics to send filter", function () {
        vm.full_text_index('rémoção dos acêntüs');
        expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');
      });
    });
  });

  describe('admin.userFilterVM', function () {
    var adminApp = window.c.admin,
        vm = adminApp.userFilterVM;

    describe("deactivated_at.toFilter", function () {
      it("should parse string inputs to json objects to send filter", function () {
        vm.deactivated_at('null');
        expect(vm.deactivated_at.toFilter()).toEqual(null);
      });
    });

    describe("full_text_index.toFilter", function () {
      it("should remove all diacritics to send filter", function () {
        vm.full_text_index('rémoção dos acêntüs');
        expect(vm.full_text_index.toFilter()).toEqual('remocao dos acentus');
      });
    });
  });

  describe('YoutubeLightbox', function () {
      var $output = void 0,
          c = window.c,
          m = window.m,
          visibleStyl = 'display:block',
          invisibleStyl = 'display:none';

      describe('view', function () {
          beforeEach(function () {
              $output = mq(c.YoutubeLightbox, { src: 'FlFTcDSKnLM' });
          });

          it('should not render the lightbox at first', function () {
              expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);
          });
          it('should render the lightbox on play button click', function () {
              $output.click('#youtube-play');
              expect($output.find('#lightbox')[0].attrs.style).toEqual(visibleStyl);
          });
          it('should close the lightbox on close button click', function () {
              $output.click('#youtube-play');
              $output.click('#youtube-close');
              expect($output.find('#lightbox')[0].attrs.style).toEqual(invisibleStyl);
          });
      });
  });

  describe("h.formatNumber", function () {
      var number = null,
          formatNumber = window.c.h.formatNumber;

      it("should format number", function () {
          number = 120.20;
          expect(formatNumber(number)).toEqual('120');
          expect(formatNumber(number, 2, 3)).toEqual('120,20');
          expect(formatNumber(number, 2, 2)).toEqual('1.20,20');
      });
  });

  describe('h.rewardSouldOut', function () {
      var reward = null,
          rewardSouldOut = window.c.h.rewardSouldOut;

      it('return true when reward already sould out', function () {
          reward = {
              maximum_contributions: 5,
              paid_count: 3,
              waiting_payment_count: 2
          };

          expect(rewardSouldOut(reward)).toEqual(true);
      });

      it('return false when reward is not sould out', function () {
          reward = {
              maximum_contributions: 5,
              paid_count: 3,
              waiting_payment_count: 1
          };

          expect(rewardSouldOut(reward)).toEqual(false);
      });

      it('return false when reward is not defined maximum_contributions', function () {
          reward = {
              maximum_contributions: null,
              paid_count: 3,
              waiting_payment_count: 1
          };

          expect(rewardSouldOut(reward)).toEqual(false);
      });
  });

  describe('h.rewardRemaning', function () {
      var reward = void 0,
          rewardRemaning = window.c.h.rewardRemaning;

      it('should return the total remaning rewards', function () {
          reward = {
              maximum_contributions: 10,
              paid_count: 3,
              waiting_payment_count: 2
          };

          expect(rewardRemaning(reward)).toEqual(5);
      });
  });

  describe('h.parseUrl', function () {
      var url = void 0,
          parseUrl = window.c.h.parseUrl;

      it('should create an a element', function () {
          url = 'http://google.com';
          expect(parseUrl(url).hostname).toEqual('google.com');
      });
  });

  describe('h.pluralize', function () {
      var count = void 0,
          pluralize = window.c.h.pluralize;

      it('should use plural when count greater 1', function () {
          count = 3;
          expect(pluralize(count, ' dia', ' dias')).toEqual('3 dias');
      });

      it('should use singular when count less or equal 1', function () {
          count = 1;
          expect(pluralize(count, ' dia', ' dias')).toEqual('1 dia');
      });
  });

}((this.tests = this.tests || {}),m,postgrest,_,moment,I18n,replaceDiacritics));
//# sourceMappingURL=bundle.spec.js.map