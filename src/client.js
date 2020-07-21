/*
    global KJUR
*/
// Compatibility of function `fetch` with the browser MSIE: https://caniuse.com/#feat=fetch
// https://github.com/github/fetch
import 'whatwg-fetch'
import {
    parseClaims,
    fillFormElementById,
    getHashParams,
    incomingMessage,
    generateNonce,
} from './utils'

export const defaultClientIdName = "clientId"
let windowReadsMessage = false

/**
 * MojeID Connect library interface holder.
 *
 * @class MojeidConnect
 * @lends createMojeidConnect
 * @global
 */
export default class MojeidConnect {

    /**
     * @param {Dict} opt
     */
    constructor(options) {
        if (options === undefined) {
            options = {}
        }
        this.clientId = options['clientId'] || null
        this.callbacks = {
            parseClaimsCallback: options['parseClaimsCallback'] || parseClaims,
            formCallback: options['formCallback'] || fillFormElementById,
            formSuccessCallback: options['formSuccessCallback'] || function() {},
            formFailureCallback: options['formFailureCallback'] || function(err) {
                console.error("Incoming message failure:", err.message)
            },
            formAccessDenidedCallback: options['formAccessDenidedCallback'] || function() {
                console.log("Data hand over was canceled.")
            },
            registrationSuccessCallback: options['registrationSuccessCallback'] || function() {},
            registrationFailureCallback: options['registrationFailureCallback'] || function() {}
        }
        this.attrDict = options['attrDict'] || {}
        this.urlSetup = {
            "registration-endpoint": options['regEndpoint'] || "https://mojeid.cz/oidc/registration/",
            "authorization-endpoint": options['authEndpoint'] || "https://mojeid.cz/oidc/authorization/",
            "client-authorization-redirect-uri": options["redirectUri"] || location.origin + location.pathname,
        }
        this.clientName = options['clientName'] || location.origin
        this.display = options['display'] || 'popup'
        this.scope = options['scope'] || ['openid']
        // Make sure that openid is in scopes
        if (this.scope.indexOf('openid') === -1) {
            this.scope.push('openid')
        }
        this.claims = options['claims'] || undefined
        this.clientIdName = options['clientIdName'] || defaultClientIdName
        this.makeRegistration(options)
    }

    /**
     * Make registration of client if it is not set off by option 'registerClientManualy'.
     * @param {Dict} opt
     */
    makeRegistration(options) {
        if (options['registerClientManualy'] !== true) {
            if (options['runRegisterInsideListener']) {
                const mojeID = this
                document.addEventListener(options['runRegisterInsideListener'], () => {
                    if (mojeID.loadRSALibrary()) {
                        mojeID.registerClient()
                    }
                })
            } else {
                if (this.loadRSALibrary()) {
                    this.registerClient()
                }
            }
        }
    }

    /**
     * Register client to provider. Client need clientID to identify himself.
     */
    register() {
        const postData = {
            "application_type": "web",
            "request_object_signing_alg": "RS256",
            "redirect_uris": [
                this.urlSetup["client-authorization-redirect-uri"]
            ],
            "response_types": [
                "id_token"
            ],
            "client_name": this.clientName
        }
        const mojeID = this

        return fetch(this.urlSetup["registration-endpoint"], {
            method: 'POST',
            body: JSON.stringify(postData)
        }).then(function(response) {
            return response.json()
        }).then(function(data) {
            if (data.client_id) {
                mojeID.clientId = data.client_id
                sessionStorage.setItem(mojeID.clientIdName, mojeID.clientId)
                console.log('Registration of the client succeeded. clientId("' + mojeID.clientIdName + '") is ' +
                    mojeID.clientId + '.')
                mojeID.callbacks.registrationSuccessCallback()
            } else {
                console.log('Registration of the client failed.')
                mojeID.callbacks.registrationFailureCallback()
            }
        }).catch(this.callbacks.registrationFailureCallback)
    }

    /**
     * Start user authorization proccess. Callback return access token if proccess pass.
     *
     * @returns {Boolean} True if function didnt fail and new window with registration is opened.
     */
    requestAuthentication() {
        const responseType = [
            "id_token"
        ]
        const parsedResponseType = responseType.join(" ")
        const parsedScope = this.scope.join(" ")

        const nonce = generateNonce()
        sessionStorage.setItem('nonce', nonce)

        const requestData = {
            "response_type": parsedResponseType,
            "scope": parsedScope,
            "client_id": this.clientId,
            "redirect_uri": this.urlSetup["client-authorization-redirect-uri"],
            "nonce": nonce,
        }

        if (this.claims) {
            const claims = {
                "id_token": {
                }
            }
            claims['id_token'] = this.callbacks.parseClaimsCallback.call(this, this.claims)
            requestData["claims"] = JSON.stringify(claims)
        }

        const params = []
        for (const key in requestData) {
            params.push(encodeURIComponent(key) + "=" + encodeURIComponent(requestData[key]))
        }
        const queryString = this.urlSetup["authorization-endpoint"] + "?" + params.join("&")

        if (this.display === 'popup') {
            if (!windowReadsMessage) {
                window.addEventListener("message", incomingMessage.bind(this), false)
                windowReadsMessage = true
            }
            // window resolution is 850px * 550px
            const w = 850, h = 550
            const l = (screen.width - w) / 2, t = (screen.height - h) / 2
            const popupWindow = window.open(queryString, "mojeID", "width=" + w + ",height=" + h +
                ",toolbar=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,top=" + t + ",left=" +
                l + "")
            popupWindow.focus()
        } else {
            window.top.location.assign(queryString)
        }
        return true
    }

    /**
     * Set value to elements.
     *
     * @param {List} nodes
     * @param {String} value
     */
    setValueToElements(nodes, value) {
        for (const input of nodes) {
            if (input.type === "radio") {
                if (input.value === value) {
                    input.checked = true
                }
            } else {
                input.value = value
            }
        }
    }

    /**
     * Parse formatted value to the string.
     *
     * @param {Object} value
     * @returns {String}
     */
    decodeValue(value) {
        if (typeof(value) === "object") {
            if ('formatted' in value) {
                value = value['formatted']
            } else {
                const content = []
                for (const k in value) {
                    content.push(k + ": " + value[k])
                }
                value = content.join("\n")
            }
        }
        return value
    }

    /**
     * Parse and verify id_token
     *
     * @param {String} hash part of the url
     * @return {Dict} parsed UserInfo
     */
    parseToken(opt_hash) {
        if (window.opener) {
            window.opener.postMessage(location.hash, location.origin)
            window.close()
        }
        if (location.hash || opt_hash) {
            const jws = new KJUR.jws.JWS()
            jws.parseJWS(getHashParams(opt_hash || location.hash)['id_token'])
            window.location.hash = ''
            const responsData = JSON.parse(jws.parsedJWS['payloadS'])
            // Check nonce against stored in session and remove it prevent replay attacks
            const nonce = sessionStorage.getItem('nonce')
            sessionStorage.removeItem('nonce')
            if (responsData['nonce'] === nonce) {
                return responsData
            } else {
                console.log('Nonce is not the same!')
            }
        }
    }

    /**
     * Load script JS RSA sign library.
     * @returns {Boolean} True if library was loaded.
     */
    loadRSALibrary() {
        // Join jsrsasign library:
        const node = document.getElementById("mojeid-connect-script")
        if (node) {
            const jsrsasign = node.dataset.jsrsasign
            if (jsrsasign) {
                const mojeID = this
                const script = document.createElement('script')
                script.src = jsrsasign
                // Make sure the script is loaded before we use it
                script.onload = (function() {
                    mojeID.callbacks.formCallback.call(mojeID, mojeID.parseToken())
                })
                document.querySelector("head").appendChild(script)
                return true
            } else {
                console.error('Path to script "JS RSA Sign Library" was not found.')
                this.callbacks.registrationFailureCallback()
            }
        } else {
            console.log('Element #mojeid-connect-script was not found. It must load "JS RSA Sign Library" maually.')
        }
        return false
    }

    /**
     * Register client if ID is not set.
     *
     */
    registerClient() {
        if (this.clientId) {
            this.callbacks.registrationSuccessCallback.call(this)
        } else {
            this.register()
        }
    }

}