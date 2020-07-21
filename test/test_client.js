import test from 'ava'
import sinon from 'sinon'
import 'mock-local-storage'
import {parseClaims, fillFormElementById} from '../src/utils'
import MojeidConnect from '../src/client'

const loadRSALibraryMock = sinon.stub(MojeidConnect.prototype, "loadRSALibrary")
const registerClientMock = sinon.stub(MojeidConnect.prototype, "registerClient")
const consoleMock = sinon.stub(console, "log")
global.fetch = sinon.mock()


function checkClientDefaultOptions(t, options) {
    const client = new MojeidConnect(options)
    t.is(client.clientId, null)
    t.is(client.callbacks["parseClaimsCallback"], parseClaims)
    t.is(client.callbacks["formCallback"], fillFormElementById)
    t.deepEqual(client.attrDict, {})
    t.deepEqual(client.urlSetup, {
        'registration-endpoint': 'https://mojeid.cz/oidc/registration/',
        'authorization-endpoint': 'https://mojeid.cz/oidc/authorization/',
        'client-authorization-redirect-uri': 'nullblank'
    })
    t.is(client.clientName, 'null')
    t.is(client.display, 'popup')
    t.deepEqual(client.scope, ['openid'])
    t.is(client.claims, undefined)
    t.is(client.clientIdName, 'clientId')
    t.true(loadRSALibraryMock.calledOnce)
    t.false(registerClientMock.called)
}

test.beforeEach(t => {
	consoleMock.reset()
})

test('Unknown options', t => {
    loadRSALibraryMock.reset()
    registerClientMock.reset()
    checkClientDefaultOptions(t)
})

test('Empty options', t => {
    loadRSALibraryMock.reset()
    registerClientMock.reset()
    checkClientDefaultOptions(t, {})
})

test('Set parseClaimsCallback', t => {
    const fnc = () => {}
    const client = new MojeidConnect({parseClaimsCallback: fnc})
    t.is(client.callbacks["parseClaimsCallback"], fnc)
})

test('Set formCallback', t => {
    const fnc = () => {}
    const client = new MojeidConnect({formCallback: fnc})
    t.is(client.callbacks["formCallback"], fnc)
})

test('Set registrationSuccessCallback', t => {
    const fnc = () => {}
    const client = new MojeidConnect({registrationSuccessCallback: fnc})
    t.is(client.callbacks["registrationSuccessCallback"], fnc)
})

test('Set registrationFailureCallback', t => {
    const fnc = () => {}
    const client = new MojeidConnect({registrationFailureCallback: fnc})
    t.is(client.callbacks["registrationFailureCallback"], fnc)
})

test('Set attrDict', t => {
    const data = {foo: "oof"}
    const client = new MojeidConnect({attrDict: data})
    t.deepEqual(client.attrDict, data)
})

test('Set urlSetup registration-endpoint', t => {
    const client = new MojeidConnect({regEndpoint: "http://foo"})
    t.is(client.urlSetup["registration-endpoint"], "http://foo")
})

test('Set urlSetup authorization-endpoint', t => {
    const client = new MojeidConnect({authEndpoint: "http://foo"})
    t.is(client.urlSetup["authorization-endpoint"], "http://foo")
})

test('Set urlSetup client-authorization-redirect-uri', t => {
    const client = new MojeidConnect({redirectUri: "http://foo"})
    t.is(client.urlSetup["client-authorization-redirect-uri"], "http://foo")
})

test('Set clientName', t => {
    const client = new MojeidConnect({clientName: "foo"})
    t.is(client.clientName, "foo")
})

test('Set display', t => {
    const client = new MojeidConnect({display: "foo"})
    t.is(client.display, "foo")
})

test('Set scope', t => {
    const client = new MojeidConnect({scope: ["foo"]})
    t.deepEqual(client.scope, ["foo", "openid"])
})

test('Set claims', t => {
    const client = new MojeidConnect({claims: "foo"})
    t.is(client.claims, "foo")
})

test('Set clientIdName', t => {
    const client = new MojeidConnect({clientIdName: "foo"})
    t.is(client.clientIdName, "foo")
})

test('Call registerClient automatically', t => {
    loadRSALibraryMock.reset()
    registerClientMock.reset()
    loadRSALibraryMock.returns(true)
    new MojeidConnect()
    t.true(loadRSALibraryMock.calledOnce)
    t.true(registerClientMock.calledOnce)
})

test('Set registerClientManualy', t => {
    loadRSALibraryMock.reset()
    registerClientMock.reset()
    new MojeidConnect({registerClientManualy: true})
    t.false(loadRSALibraryMock.called)
})

test('Set runRegisterInsideListener', t => {
    loadRSALibraryMock.reset()
    registerClientMock.reset()
    new MojeidConnect({runRegisterInsideListener: "DOMContentLoaded"})
    t.false(loadRSALibraryMock.called)
    t.false(registerClientMock.called)
    document.dispatchEvent(new Event("DOMContentLoaded"))
    t.true(loadRSALibraryMock.calledOnce)
    t.false(registerClientMock.called)
})

test('Set runRegisterInsideListener and registerClient', t => {
    loadRSALibraryMock.reset()
    registerClientMock.reset()
    loadRSALibraryMock.returns(true)
    new MojeidConnect({runRegisterInsideListener: "DOMContentLoaded"})
    t.false(loadRSALibraryMock.called)
    t.false(registerClientMock.called)
    document.dispatchEvent(new Event("DOMContentLoaded"))
})

test('setValueToElements', t => {
    document.body.innerHTML = `
        <input type="text" name="foo">
        <input type="radio" name="foo" value="yes">
        <input type="radio" name="foo" value="no">
    `
    const client = new MojeidConnect()
    client.setValueToElements(document.querySelectorAll("input[name=foo]"), "yes")
    t.is(document.querySelector("input[name=foo][type=text]").value, "yes")
    t.true(document.querySelector("input[name=foo][value=yes]").checked)
})

test('decodeValue not object', t => {
    const client = new MojeidConnect()
    t.is(client.decodeValue(42), 42)
})

test('decodeValue object with formatted', t => {
    const client = new MojeidConnect()
    t.is(client.decodeValue({formatted: "foo", status: "ok"}), "foo")
})

test('decodeValue object without formatted', t => {
    const client = new MojeidConnect()
    t.is(client.decodeValue({foo: "yes", status: "ok"}), "foo: yes\nstatus: ok")
})

// TODO: Remote this test when OIDC will be fixed.
test('fillFormElementById mojeid_address_def json string', t => {
    document.body.innerHTML = `<textarea id="mojeid_address_def"></textarea>`
    const client = new MojeidConnect({registerClientManualy: true})
    client.callbacks["formCallback"].bind(client)({
        'mojeid_address_def': '{"street": "Street", "city": "City", "postcode": "12300"}'
    })
    t.is(document.getElementById("mojeid_address_def").value, "street: Street\ncity: City\npostcode: 12300")
})

test('fillFormElementById mojeid_address_def object', t => {
    document.body.innerHTML = `<textarea id="mojeid_address_def"></textarea>`
    const client = new MojeidConnect({registerClientManualy: true})
    client.callbacks["formCallback"].bind(client)({
        'mojeid_address_def': {"street": "Street", "city": "City", "postcode": "12300"}
    })
    t.is(document.getElementById("mojeid_address_def").value, "street: Street\ncity: City\npostcode: 12300")
})

test('fillFormElementById mojeid_address_def object with formatted', t => {
    document.body.innerHTML = `<textarea id="mojeid_address_def"></textarea>`
    const client = new MojeidConnect({registerClientManualy: true})
    client.callbacks["formCallback"].bind(client)({
        'mojeid_address_def': {"street": "Street", "city": "City", "formatted": "The address:\nStreet\n123 00 City"}
    })
    t.is(document.getElementById("mojeid_address_def").value, "The address:\nStreet\n123 00 City")
})

test('parseToken without opt_hash', t => {
    const client = new MojeidConnect()
    client.parseToken()
    t.pass()
})

test('parseToken window.opener', t => {
    window.opener = {
        postMessage: sinon.mock().once().withArgs("", "null").returns(true)
    }
    window.close = sinon.mock().once()
    const client = new MojeidConnect()
    client.parseToken()
    t.pass()
    window.opener.postMessage.verify()
    window.opener = null
})

test('parseToken with opt_hash', t => {
    const JWS = sinon.stub()
    JWS.prototype.parseJWS = sinon.stub().withArgs("42")
    JWS.prototype.parsedJWS = {payloadS: '{"nonce": "n-foo"}'}
    const KJUR = {
        jws: {
            JWS: JWS
        }
    }
    global.KJUR = KJUR
    sessionStorage.setItem("nonce", "n-foo")
    const client = new MojeidConnect()
    t.deepEqual(client.parseToken("id_token=42"), {nonce: 'n-foo'})
    delete global.KJUR
})

test('parseToken nonce des not match', t => {
    const JWS = sinon.stub()
    JWS.prototype.parseJWS = sinon.stub().withArgs("42")
    JWS.prototype.parsedJWS = {payloadS: '{"nonce": "n-foo"}'}
    const KJUR = {
        jws: {
            JWS: JWS
        }
    }
    global.KJUR = KJUR
    sessionStorage.setItem("nonce", "invalid")
    window.location.hash = '#id_token=42'
    const client = new MojeidConnect()
    t.falsy(client.parseToken())
    t.true(consoleMock.calledOnce)
    t.true(consoleMock.calledWith('Nonce is not the same!'))
    delete global.KJUR
})

test('requestAuthentication display top', t => {
    const mathMock = sinon.mock(Math)
    mathMock.expects('random').exactly(16).returns(0.14)
    const url = "https://mojeid.cz/oidc/authorization/?" + [
        "response_type=id_token",
        "scope=openid",
        "client_id=42",
        "redirect_uri=NaN",
        "nonce=n-8888888888888888",
        "claims=" + encodeURIComponent('{"id_token":{"given_name":{"essential":true}}}')
    ].join("&")
    const location = window.top.location
    delete window.top.location
    window.top.location = {
        assign: sinon.stub()
    }
    const client = new MojeidConnect({display: "top", claims: ["given_name"]})
    client.clientId = "42"
    t.true(client.requestAuthentication())
    t.true(window.top.location.assign.calledOnceWith(url))
    t.is(sessionStorage.getItem("nonce"), "n-8888888888888888")
    window.top.location = location
    mathMock.verify()
    mathMock.restore()
})

function testRequestAuthentication(t) {
    const mathMock = sinon.mock(Math)
    mathMock.expects('random').exactly(16).returns(0.14)
    const url = "https://mojeid.cz/oidc/authorization/?" + [
        "response_type=id_token",
        "scope=openid",
        "client_id=42",
        "redirect_uri=nullblank",
        "nonce=n-8888888888888888"
    ].join("&")
    const focusMock = {
        focus: sinon.mock().once()
    }
    const params = [
        "width=850",
        "height=550",
        "toolbar=no",
        "directories=no",
        "status=no",
        "menubar=no",
        "scrollbars=no",
        "resizable=no",
        "top=-275",
        "left=-425"
    ].join(",")
    const windowMock = sinon.mock(window)
    windowMock.expects("open").once().withArgs(url, "mojeID", params).returns(focusMock)
    const client = new MojeidConnect()
    client.clientId = "42"
    t.true(client.requestAuthentication())
    t.is(sessionStorage.getItem("nonce"), "n-8888888888888888")
    mathMock.verify()
    windowMock.verify()
    windowMock.restore()
    mathMock.restore()
}

test('requestAuthentication display popup', t => {
    testRequestAuthentication(t)
})

test('requestAuthentication display popup with windowReadsMessage is true', t => {
    global.windowReadsMessage = true
    testRequestAuthentication(t)
})

test.serial('Call register with response failure', async t => {
    const successFnc = sinon.mock().never()
    const failureFnc = sinon.mock().once()
    const postData = {
        application_type: 'web',
        request_object_signing_alg: 'RS256',
        redirect_uris: ['nullblank'],
        response_types: ['id_token'],
        client_name: 'null'
    }
    const postParams = {
        body: JSON.stringify(postData),
        method: "POST"
    }
    const response = () => {throw "Error"}
    global.fetch.reset()
    global.fetch.once().withArgs("https://mojeid.cz/oidc/registration/", postParams).returns(
        new Promise((resolve, reject) => {reject(response)}))

    const client = new MojeidConnect({
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    await client.register()

    t.true(global.fetch.calledOnce)
    global.fetch.verify()
    successFnc.verify()
    failureFnc.verify()
})

test.serial('Call register with response does not have the client_id', async t => {
    const successFnc = sinon.mock().never()
    const failureFnc = sinon.mock().once()
    const postData = {
        application_type: 'web',
        request_object_signing_alg: 'RS256',
        redirect_uris: ['nullblank'],
        response_types: ['id_token'],
        client_name: 'null'
    }
    const postParams = {
        body: JSON.stringify(postData),
        method: "POST"
    }
    const response = {json: () => {return {foo: 42}}}
    global.fetch.reset()
    global.fetch.once().withArgs("https://mojeid.cz/oidc/registration/", postParams).returns(
        new Promise((resolve, reject) => {resolve(response)}))

    const client = new MojeidConnect({
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    await client.register()

    global.fetch.verify()
    successFnc.verify()
    failureFnc.verify()
    t.true(consoleMock.calledOnce)
    t.true(consoleMock.calledWith('Registration of the client failed.'))
})

test.serial('Call register with response ok', async t => {
    const successFnc = sinon.mock().once()
    const failureFnc = sinon.mock().never()
    const postData = {
        application_type: 'web',
        request_object_signing_alg: 'RS256',
        redirect_uris: ['nullblank'],
        response_types: ['id_token'],
        client_name: 'null'
    }
    const postParams = {
        body: JSON.stringify(postData),
        method: "POST"
    }
    const response = {json: () => {return {client_id: 42}}}
    global.fetch.reset()
    global.fetch.once().withArgs("https://mojeid.cz/oidc/registration/", postParams).returns(
        new Promise((resolve, reject) => {resolve(response)}))

    const client = new MojeidConnect({
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    await client.register()

    global.fetch.verify()
    successFnc.verify()
    failureFnc.verify()
    t.true(consoleMock.calledOnce)
    t.true(consoleMock.calledWith('Registration of the client succeeded. clientId("clientId") is 42.'))
})
