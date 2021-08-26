import m from 'mithril'
import { Liquid } from 'liquidjs'
import { useEffect, useState, withHooks } from 'mithril-hooks'
import h from '../../h'

const engine = new Liquid()

export type HTMLRendererProps = {
    html: string;
    variables?: any;
    onRenderWithoutScripts?: (htmlWithoutScripts: string) => void
}

export const HTMLRenderer = withHooks<HTMLRendererProps>(_HTMLRenderer);

function _HTMLRenderer(props: HTMLRendererProps) {
    const { html, variables, onRenderWithoutScripts } = props
    const [ rendered, setRendered ] = useState('')

    useEffect(() => {
        const strippedScriptsHtml = h.stripScripts(html)
        const htmlParsed = engine.parse(strippedScriptsHtml)
        engine
            .render(htmlParsed, variables)
            .then((renderedHtml) => {
                if (onRenderWithoutScripts) {
                    onRenderWithoutScripts(html)
                }
                setRendered(renderedHtml)
            })
            .catch(error => console.log('HTMLRenderer', error))
    }, [html])

    return m.trust(rendered)
}
