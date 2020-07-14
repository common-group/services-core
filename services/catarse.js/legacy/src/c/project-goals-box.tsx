import m from 'mithril'
import prop from 'mithril/stream'
import _ from 'underscore'
import h from '../h'
import { GoalDetails } from '../@types/goal-details'

export type ProjectGoalsBoxAttrs = {
    subscriptionData: prop<{ amount_paid_for_valid_period : number }>
    goalDetails: prop<GoalDetails[]>
    style: string
}

export type ProjectGoalsBoxState = {
    currentGoalIndex: prop<number>
    goalsDetailsOrOneEmpty() : GoalDetails[]
}

export default class ProjectGoalsBox implements m.Component<ProjectGoalsBoxAttrs> {
    oninit({ attrs : { goalDetails, subscriptionData }, state } : m.Vnode<ProjectGoalsBoxAttrs, ProjectGoalsBoxState>) {
        const currentGoalIndex = prop(0)
        const getCurrentGoalIndex = ({amount_paid_for_valid_period} : {amount_paid_for_valid_period : number}) => {
            if (goalDetails().length > 0) {
                const index = _.findIndex(goalDetails(), goal => goal.value > amount_paid_for_valid_period)
                return index >= 0 ? index : (goalDetails().length - 1)
            } else {
                return 0
            }
        }

        subscriptionData.map(updatedData => {
            currentGoalIndex(getCurrentGoalIndex(updatedData))
        })

        currentGoalIndex.map(() => h.redraw())

        state.currentGoalIndex = currentGoalIndex
    }

    view({ attrs, state } : m.Vnode<ProjectGoalsBoxAttrs, ProjectGoalsBoxState>) {

        const goalsDetailsOrEmpty = () : GoalDetails[] => {
            const hasGoalsDetails = attrs.goalDetails() && attrs.goalDetails().length > 0
            if (hasGoalsDetails) {
                return attrs.goalDetails()
            } else {
                return [{
                    title: 'N/A',
                    value: 0,
                    description: ''
                }] as GoalDetails[]
            }
        }

        const currentGoalIndex = state.currentGoalIndex
        const nextGoal = () => {
            if (currentGoalIndex() < goalsDetailsOrEmpty().length - 1) {
                currentGoalIndex((currentGoalIndex() + 1))
            }
        }

        const previousGoal = () => {
            if (currentGoalIndex() > 0) {
                currentGoalIndex((currentGoalIndex() - 1))
            }
        }

        const subscriptionData = attrs.subscriptionData() || { amount_paid_for_valid_period: 0 }
        const goals = goalsDetailsOrEmpty()
        const viewingGoal = goals[currentGoalIndex()]
        const goalPercentage = (subscriptionData.amount_paid_for_valid_period / viewingGoal.value) * 100
        const viewingValueGoal = `R$${subscriptionData.amount_paid_for_valid_period} de R$${viewingGoal.value} por mês`
        
        return (
            <div>
                <div class={`card u-marginbottom-30 u-radius ${attrs.style ? attrs.style : ''}`}>
                    <div class='w-clearfix'>
                        <div class='u-right'>
                            <button onclick={previousGoal} class={`btn btn-inline btn-small btn-terciary fa fa-angle-left w-button ${currentGoalIndex() === 0 ? 'btn-desactivated' : ''}`}></button>
                            <button onclick={nextGoal} class={`btn btn-inline btn-small btn-terciary fa fa-angle-right w-button ${currentGoalIndex() === goals.length - 1 ? 'btn-desactivated' : ''}`}></button>
                        </div>
                        <div class='fontsize-base fontweight-semibold u-marginbottom-20 w-hidden-small w-hidden-tiny'>
                            <span>Metas</span>
                        </div>
                    </div>
                    <div class='fontsize-small fontweight-semibold'>
                        <span class='fontcolor-secondary fontsize-smallest u-right'>
                            {currentGoalIndex() + 1} de {goals.length}
                        </span>
                        {viewingGoal.title}
                    </div>
                    <div class='u-marginbottom-10'>
                        <div class='meter'>
                            <div class='meter-fill' style={`width: ${h.clamp(goalPercentage, 0, 100)}%`}></div>
                        </div>
                        <div class='fontsize-smaller fontweight-semibold u-margintop-10'>
                            {viewingValueGoal}
                        </div>
                    </div>
                    <div class='fontsize-smaller'>
                        {viewingGoal.description}
                    </div>
                </div>
            </div>
        )
    }
}