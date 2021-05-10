import m from 'mithril'
import { withHooks } from 'mithril-hooks'

export type MenuLinkProps = {
    label: string;
    href: string;
    isNew?: boolean;
    selectedClasses?: string;
    iconClasses?: string;
}

export const MenuLink = withHooks<MenuLinkProps>(_MenuLink);

function _MenuLink({label, href, isNew, selectedClasses, iconClasses} : MenuLinkProps) {
    const routeTo = (event: Event) => {
        event.preventDefault()
        m.route.set(href)
    }

    return (
        <a href={href} onclick={routeTo} class={`dashboard-nav-link-left ${selectedClasses}`}>
            <span class={`fa-fw fa ${iconClasses}`}></span>
            &nbsp;{label} { isNew && <span class="badge">Novo</span> }
        </a>
    )
}
