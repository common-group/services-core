export type TranslateParamsScopeFunction = (scope : string, scopeObject? : I18ScopeType) => string
export type ThisWindow = Window & typeof globalThis & {
    I18n: {
        locale: string
        currentLocale(): string
        t: TranslateParamsScopeFunction,
        translations: {
            [locales:string]: {
                projects: {
                    index: {
                        explore_categories: {
                            [category_id:number] : {
                                icon: string
                                title: string
                                link: string
                                cta: string
                            }
                        }
                    }
                }
            }
        }
    }

    onpushstate(): void

    CatarseAnalytics: any
}

export type CatarseAnalyticsType = {
    pageView(param : boolean): void
    origin(): void
    event(eventData: {[key:string]: any}, callback?: Function): void
    oneTimeEvent(eventData: {[key:string]: any}): void
}

export type I18ScopeType = {
    [key:string]: any
    scope: string
}

export declare var window : ThisWindow
