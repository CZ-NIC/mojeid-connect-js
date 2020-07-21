import test from 'ava'
import sinon from 'sinon'
import MojeidConnect from '../src/client'

const registerClientMock = sinon.stub(MojeidConnect.prototype, "registerClient")


test('loadRSALibrary without node #mojeid-connect-script', t => {
    const consoleMock = sinon.stub(console, "log")
    const client = new MojeidConnect({registerClientManualy: true})
    t.false(client.loadRSALibrary())
    t.true(consoleMock.calledOnce)
    t.true(consoleMock.calledWith('Element #mojeid-connect-script was not found. It must load "JS RSA Sign Library" maually.'))
    consoleMock.restore()
})

test('loadRSALibrary with node #mojeid-connect-script without jsrsasign', t => {
    const successFnc = sinon.mock().never()
    const failureFnc = sinon.mock().once()
    const consoleMock = sinon.stub(console, "error")
    document.body.innerHTML = `<script id="mojeid-connect-script">`
    const client = new MojeidConnect({
        registerClientManualy: true,
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    t.false(client.loadRSALibrary())
    successFnc.verify()
    failureFnc.verify()
    t.true(consoleMock.calledOnce)
    t.true(consoleMock.calledWith('Path to script "JS RSA Sign Library" was not found.'))
    consoleMock.restore()
})

test('loadRSALibrary with node #mojeid-connect-script with jsrsasign', t => {
    const successFnc = sinon.mock().never()
    const failureFnc = sinon.mock().never()
    const token = "foo.foo"
    const formCallbackMock = sinon.mock().once().withArgs(token)
    document.body.innerHTML = `<head><script id="mojeid-connect-script" data-jsrsasign="/foo.js"></head>`
    const client = new MojeidConnect({
        registerClientManualy: true,
        formCallback: formCallbackMock,
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    const parseTokenMock = sinon.stub(client, "parseToken").returns(token)
    t.true(client.loadRSALibrary())
    successFnc.verify()
    failureFnc.verify()
    t.truthy(document.querySelector("head > script[src='/foo.js']"))
    document.querySelector("head > script[src='/foo.js']").onload()
    formCallbackMock.verify()
    parseTokenMock.restore()
})

test('registerClient ID is set', t => {
    registerClientMock.restore()
    const successFnc = sinon.mock().once()
    const failureFnc = sinon.mock().never()
    const registerMock = sinon.stub(MojeidConnect.prototype, "register")
    const client = new MojeidConnect({
        registerClientManualy: true,
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    client.clientId = 42
    client.registerClient()
    successFnc.verify()
    failureFnc.verify()
    t.false(registerMock.called)
    registerMock.restore()
})

test('registerClient ID is not set', t => {
    registerClientMock.restore()
    const successFnc = sinon.mock().never()
    const failureFnc = sinon.mock().never()
    const registerMock = sinon.stub(MojeidConnect.prototype, "register")
    const client = new MojeidConnect({
        registerClientManualy: true,
        registrationSuccessCallback: successFnc,
        registrationFailureCallback: failureFnc
    })
    client.registerClient()
    successFnc.verify()
    failureFnc.verify()
    t.true(registerMock.calledOnce)
    registerMock.restore()
})
