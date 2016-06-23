import m from 'mithril';

const inlineError = {
  view(ctrl, args) {
    return  m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle", m('span', ` ${args.message}`));
  }
}

export default inlineError;
