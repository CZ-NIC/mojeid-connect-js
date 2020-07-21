/**
 * Reads url hash fragment and parse it into object.
 *
 * @param {String} Hash fragment
 * @returns {Object} Parsed hash fragment values.
 */
export function getHashParams(opt_hash) {

    const hashParams = {}
    const regex = /([^&;=]+)=?([^&;]*)/g
    let hash = opt_hash || window.location.hash

    if (hash.charAt(0) === '#') {
        hash = hash.substring(1)
    }
    let e = regex.exec(hash)
    while (e) {
        hashParams[decodeURIComponent(e[1])] = decodeURIComponent(e[2])
        e = regex.exec(hash)
    }
    return hashParams
}

/**
 * Generate nonce
 *
 * @returns {String}
 */
export function generateNonce() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
    let randomString = 'n-'
    for (let i = 0; i < 16; i++) {
        const num = Math.floor(Math.random() * chars.length)
        randomString += chars[num]
    }
    return randomString
}

/**
 * Return list of claims.
 *
 * @param {Object} clientClaims
 */
export function parseClaims(clientClaims) {
    const claims = {}
    for (const cl in clientClaims) {
        claims[clientClaims[cl]] = {'essential': true}
    }
    return claims
}

const addressKeys = [
    "mojeid_address_def",
    "mojeid_address_bill",
    "mojeid_address_ship",
    "mojeid_address_ship2",
    "mojeid_address_ship3",
]

/**
 *
 * Temporary fix:
 * Class IdToken on https://github.com/OpenIDC/pyoidc/blob/master/src/oic/oic/message.py#L704-L705
 * has only attributes OpenIDSchema which causes the MojeID addresses are in json instead of being
 * parsed to the object.
 *
 * @param {String} key
 * @param {String|Object} value
 */
export function temporaryFixAddress(key, value) {
    if (addressKeys.includes(key) && typeof(value) !== "object") {
        value = JSON.parse(value)
    }
    return value
}

/**
 * Fills the form using the UserInfo and mapping between attribute and ElementId
 *
 * @param {Dict} UserInfo
 */
export function fillFormElementById(userInfo) {
    for (const fieldName in userInfo) {
        const input = document.getElementById(this.attrDict[fieldName] || fieldName)
        if (input) {
            this.setValueToElements([input], this.decodeValue(temporaryFixAddress(fieldName, userInfo[fieldName])))
        }
    }
}

/**
 * Fills the form using the UserInfo and mapping between attribute and input attribute name
 *
 * @param {Dict} UserInfo
 */
export function fillFormQuerySelectorAllInputName(userInfo) {
    for (const fieldName in userInfo) {
        const key = this.attrDict[fieldName] || fieldName
        const nodes = document.querySelectorAll(`input[name=${key}], select[name=${key}], textarea[name=${key}]`)
        if (nodes.length) {
            this.setValueToElements(nodes, this.decodeValue(temporaryFixAddress(fieldName, userInfo[fieldName])))
        }
    }
}

/**
 *
 * @param {Object} message event
 */
export function incomingMessage(message) {
    if (message.origin === location.origin) {
        if (message.data === "#error=access_denied") {
            this.callbacks.formAccessDenidedCallback.call(this)
        } else {
            try {
                const data = this.parseToken(message.data)
                this.callbacks.formCallback.call(this, data)
                this.callbacks.formSuccessCallback.call(this)
            } catch (err) {
                this.callbacks.formFailureCallback.call(this, err)
            }
        }
    }
}
