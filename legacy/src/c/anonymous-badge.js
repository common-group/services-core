import m from 'mithril';

const anonymousBadge = {

    view: function(ctrl, args) {
        
        if (args.isAnonymous) {
            return m('span.fa.fa-eye-slash.fontcolor-secondary', 
                m('span.fontcolor-secondary[style="font-size:11px;"]', args.text)
            );
        }
        else {
            return m('div');
        }
    }
};

export default anonymousBadge;