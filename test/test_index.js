import test from 'ava'
import sinon from 'sinon'
import 'mock-local-storage'
import {createMojeidConnect} from '../src/index'


test('createMojeidConnect with clientId', t => {
    sessionStorage.setItem("clientId", "42")
    const consoleMock = sinon.stub(console, "log")
    const mojeID = createMojeidConnect({registerClientManualy: true})
    t.is(mojeID.clientId, "42")
    t.true(consoleMock.calledOnce)
    t.true(consoleMock.calledWith('clientId("clientId") is 42'))
    consoleMock.restore()
})

test('createMojeidConnect without clientId', t => {
    sessionStorage.removeItem("clientId")
    const consoleMock = sinon.stub(console, "log")
    const mojeID = createMojeidConnect({registerClientManualy: true})
    t.is(mojeID.clientId, null)
    t.false(consoleMock.called)
    consoleMock.restore()
})
