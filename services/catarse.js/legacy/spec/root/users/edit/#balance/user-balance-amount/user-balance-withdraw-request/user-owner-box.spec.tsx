import mq from 'mithril-query'
import { UserOwnerBoxProps, UserOwnerBox } from '../../../../../../../src/root/users/edit/#balance/user-balance-amount/user-balance-withdraw-request/user-owner-box'

describe('UserOwnerBox', () => {
    describe('view', () => {
        it('should display user data', () => {

            // 1. Arrange
            const props : UserOwnerBoxProps = {
                getErrors: (field : string) => [],
                hideAvatar: true,
                user: {
                    id: 1,
                    name: 'User Name',
                    owner_document: '123.456.789-10',
                }
            }

            const component = mq(<UserOwnerBox {...props} />)

            // 2. Act?

            // 3. Assert
            component.should.contain(props.user.name)
            component.should.contain(props.user.owner_document)
        })

        it('should display user name field error message', () => {
            // 1. Arrange
            const userNameError = 'USER NAME FIELD ERROR'
            const props : UserOwnerBoxProps = {
                getErrors: (field : string) => {
                    if (field === 'user_name') {
                        return [userNameError]
                    } else {
                        return []
                    }
                },
                hideAvatar: true,
                user: {
                    id: 1,
                    name: 'User Name',
                    owner_document: '123.456.789-10',
                }
            }

            const component = mq(<UserOwnerBox {...props} />)

            // 2. Act?

            // 3. Assert
            component.should.have('[data-component-name="_BlockError"]')
        })
    })
})