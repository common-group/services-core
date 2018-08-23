
import m from 'mithril';

const dashboardSubscriptionCardDetailUserAddress = {
    controller: function(args)
    {
        return {};
    },
    view: function(ctrl, args)
    {
        return (args.user && args.user.address) ?
            m('.u-marginbottom-20.card.card-secondary.u-radius', [
                m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                    'Endereço'
                ),
                m('.fontsize-smaller', [
                    m('div', [args.user.address.street, args.user.address.street_number, args.user.address.complementary].join(', ')),
                    m('div', [args.user.address.city, args.user.address.state].join(' - ')),
                    m('div', `CEP: ${args.user.address.zipcode}`),
                    m('div', `${args.user.address.country}`)
                ])
            ]) : m('span', '');       
    }
};

export default dashboardSubscriptionCardDetailUserAddress;