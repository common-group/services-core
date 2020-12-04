import userVM from '../vms/user-vm'
import h from '../h'
import { UserDropdownProfileMenu } from './user-dropdown-profile-menu'
import { CurrencyFormat } from '../shared/components/currency-format'
import { UserDetails } from '../entities'
import { useCallback, useEffect, useState, withHooks } from 'mithril-hooks'

export const UserProfileMenu = withHooks<UserProfileMenuProp>(_UserProfileMenu)

type UserProfileMenuProp = {
    user: UserDetails
}

function _UserProfileMenu({ user } : UserProfileMenuProp) {

    const [ balance, setBalance ] = useState(0)
    const [ showDropdownMenu, setShowDropdownMenuState ] = useState(false)
    const userAvatar = h.useAvatarOrDefault(user.profile_img_thumbnail)

    useEffect(() => {
        userVM
            .getUserBalance(user.id)
            .then((result : { amount: number }[]) => {
                const balanceData = result[0] || { amount: 0 };
                setBalance(balanceData.amount);
            })
    }, [])

    const userName = userVM.firstDisplayName(user)

    const toggleMenuDropdown = () => setShowDropdownMenuState(!showDropdownMenu)

    return (
        <div class="w-dropdown user-profile">
            <div onclick={toggleMenuDropdown} class="w-dropdown-toggle dropdown-toggle w-clearfix" id="user-menu">
                <div class="user-name-menu">
                    <div class="fontsize-smaller lineheight-tightest text-align-right">
                        {userName}
                    </div>
                    {
                        balance > 0 &&
                        <div class="fontsize-smallest fontweight-semibold text-success">
                            <CurrencyFormat label='R$' value={balance} />
                        </div>
                    }
                </div>
                <img src={userAvatar} alt={`Thumbnail - ${user.name}`} class="user-avatar" height="40" width="40" />
            </div>
            {
                showDropdownMenu &&
                <UserDropdownProfileMenu balance={balance} user={user} />
            }
        </div>
    )
}
