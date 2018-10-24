import m from 'mithril';

const postForRewardCheckbox = {
    view: function(ctrl, args) {
        const r = args.reward,
            reward_checkbox = args.reward_checkbox,
            chk_label = `R$${r.data.minimum_value / 100} - ${r.data.title ? r.data.title : `${r.data.description.substring(0, 30)}...`}`,
            sublabel = `${args.contributions_count} ${args.sublabel}`;

        return m('.u-marginbottom-10.w-checkbox', [
            m(`input.w-checkbox-input[type=checkbox]`, {
                onchange: m.withAttr('checked', reward_checkbox),
                checked: reward_checkbox()
            }),
            m('label.fontsize-smaller.fontweight-semibold.lineheight-tighter.w-form-label', {
                onclick: () => reward_checkbox.toggle()
            }, chk_label),
            m('.fontsize-smallest.fontcolor-secondary.lineheight-tightest', sublabel)
        ]);
    }
};

export default postForRewardCheckbox;