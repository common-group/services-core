import m from 'mithril'
import { fromEvent } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import h from '../../../h'

export type InputPermalinkAttrs = {
    currentPermalink: string
    onValidChange(permalink : string): void
    class: string
}

export type InputPermalinkState = {
    currentPermalink: string
    class: string
    checkPermalinkAvailable(inputText : string): void
}

export class InputPermalink implements m.Component {

    oninit({ state, attrs} : m.Vnode<InputPermalinkAttrs, InputPermalinkState>) {
        state.class = attrs.class
        state.currentPermalink = attrs.currentPermalink
        state.checkPermalinkAvailable = async (inputText) => {
            state.currentPermalink = inputText
            try {
                const projectBySlugRequestConfig = {
                    method: 'GET',
                    url: `/${inputText}.html`,
                    config: h.setCsrfToken,
                    deserialize: function(value) { return value }
                }
                
                await m.request(projectBySlugRequestConfig)
                if (state.currentPermalink !== attrs.currentPermalink) {
                    state.class = 'error'
                }
            } catch(e) {
                state.class = ''
                attrs.onValidChange(state.currentPermalink)
            }
        }
    }

    oncreate({ state, attrs, dom} : m.VnodeDOM<InputPermalinkAttrs, InputPermalinkState>) {
        const oninput = fromEvent(dom, 'input')
        const wait1s = oninput.pipe(debounceTime(1000))
        wait1s.subscribe(event => {
            state.checkPermalinkAvailable(event.target.value)
        })
    }

    view({ state, attrs} : m.Vnode<InputPermalinkAttrs, InputPermalinkState>) {
        
        const currentPermalink = state.currentPermalink

        state.class = state.class || attrs.class

        return (
            <input 
                value={currentPermalink}
                type="text" 
                id="project-parmalink-id" 
                maxlength="256" 
                placeholder="tragediacarioca" 
                class={`text-field postfix positive w-input ${state.class}`} />
        )
    }
}