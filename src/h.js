window.c.h = ((m, moment) => {
    //Date Helpers
    const setMomentifyLocale = () => {
        moment.locale('pt', {
            monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_')
        });
    },

          momentify = (date, format) => {
              format = format || 'DD/MM/YYYY';
              return date ? moment(date).locale('pt').format(format) : 'no date';
          },

          momentFromString = (date, format) => {
              const european = moment(date, format || 'DD/MM/YYYY');
              return european.isValid() ? european : moment(date);
          },

          //Object manipulation helpers
          generateRemaingTime = (project) => {
              const remainingTextObj = m.prop({}),
                    translatedTime = {
                        days: 'dias',
                        minutes: 'minutos',
                        hours: 'horas',
                        seconds: 'segundos'
                    };

              remainingTextObj({
                  unit: translatedTime[project.remaining_time.unit || 'seconds'],
                  total: project.remaining_time.total
              });

              return remainingTextObj;
          },

          //Number formatting helpers
          generateFormatNumber = (s, c) => {
              return (number, n, x) => {
                  if (number === null || number === undefined) {
                      return null;
                  }

                  const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
                        num = number.toFixed(Math.max(0, ~~n));
                  return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
              };
          },
          formatNumber = generateFormatNumber('.', ','),

          toggleProp = (defaultState, alternateState) => {
              const p = m.prop(defaultState);
              p.toggle = () => {
                  p(((p() === alternateState) ? defaultState : alternateState));
              };

              return p;
          },

          idVM = m.postgrest.filtersVM({
              id: 'eq'
          }),

          getUser = () => {
            const body = document.getElementsByTagName('body'),
                data = _.first(body).getAttribute('data-user');
            if(data){
                return JSON.parse(data);
            }else{
                return false;
            }
          },

          hashMatch = (str) => {
              return window.location.hash === str;
          },

          locationActionMatch = (action) => {
              const act = window.location.pathname.split('/').slice(-1)[0];
              return action === act;
          },

          useAvatarOrDefault = (avatarPath) => {
              return avatarPath || '/assets/catarse_bootstrap/user.jpg';
          },

          //Templates
          loader = () => {
              return m('.u-text-center.u-margintop-30 u-marginbottom-30', [
                  m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')
              ]);
          },

          fbParse = () => {
              const tryParse = () => {
                  try {
                      window.FB.XFBML.parse();
                  } catch (e) {
                      console.log(e);
                  }
              };

              return window.setTimeout(tryParse, 500); //use timeout to wait async of facebook
          },

          pluralize = (count, s, p) => {
              return (count > 1 ? count + p : count + s);
          },

          simpleFormat = (str = '') => {
              str = str.replace(/\r\n?/, '\n');
              if (str.length > 0) {
                  str = str.replace(/\n\n+/g, '</p><p>');
                  str = str.replace(/\n/g, '<br />');
                  str = '<p>' + str + '</p>';
              }
              return str;
          },

          rewardSouldOut = (reward) => {
              return (reward.maximum_contributions > 0 ?
                      (reward.paid_count + reward.waiting_payment_count >= reward.maximum_contributions) : false);
          },

          rewardRemaning = (reward) => {
              return reward.maximum_contributions - (reward.paid_count + reward.waiting_payment_count);
          },

          parseUrl = (href) => {
              const l = document.createElement('a');
              l.href = href;
              return l;
          },

          mixpanelTrack = () => {
              return (el, isInitialized) => {
                  if (!isInitialized) {
                      window.CatarseMixpanel.activate();
                  }
              };
          },

          UIHelper = () => {
              return (el, isInitialized) => {
                  if (!isInitialized && $) {
                      window.UIHelper.setupResponsiveIframes($(el));
                  }
              };
          },

          navigateToDevise = () => {
              window.location.href = '/pt/login';
              return false;
          };

    setMomentifyLocale();

    return {
        momentify: momentify,
        momentFromString: momentFromString,
        formatNumber: formatNumber,
        idVM: idVM,
        getUser: getUser,
        toggleProp: toggleProp,
        loader: loader,
        fbParse: fbParse,
        pluralize: pluralize,
        simpleFormat: simpleFormat,
        generateRemaingTime: generateRemaingTime,
        rewardSouldOut: rewardSouldOut,
        rewardRemaning: rewardRemaning,
        parseUrl: parseUrl,
        hashMatch: hashMatch,
        useAvatarOrDefault: useAvatarOrDefault,
        locationActionMatch: locationActionMatch,
        mixpanelTrack: mixpanelTrack,
        navigateToDevise: navigateToDevise,
        UIHelper: UIHelper
    };
}(window.m, window.moment));
