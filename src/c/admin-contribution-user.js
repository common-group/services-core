window.c.AdminContributionUser = (function(m) {
    return {
        view: (ctrl, args) => {
            const item = args.item,
                  user = {
                      profile_img_thumbnail: item.user_profile_img,
                      id: item.user_id,
                      name: item.user_name,
                      email: item.email,
                  };

            const additional_data = m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + item.payer_email);
            return m.component(c.AdminUser, {item: user, additional_data: additional_data});
        }
    };
}(window.m));
