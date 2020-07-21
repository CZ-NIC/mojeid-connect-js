import MojeidConnect, {defaultClientIdName} from './client'

/**
 * @function createMojeidConnect
 * @returns {Object} MojeidConnect instance
 */
export function createMojeidConnect(options) {
    const clientIdName = options['clientIdName'] || defaultClientIdName
    if (!options['clientId'] && sessionStorage.getItem(clientIdName)) {
        options['clientId'] = sessionStorage.getItem(clientIdName)
        console.log('clientId("' + clientIdName + '") is ' + options['clientId'])
    }
    return new MojeidConnect(options)
}

export {fillFormQuerySelectorAllInputName} from './utils'
