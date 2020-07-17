import test from 'ava'
import sinon from 'sinon'
import {
    getHashParams,
    generateNonce,
    parseClaims,
    fillFormElementById,
    fillFormQuerySelectorAllInputName,
    temporaryFixAddress,
    incomingMessage
} from '../src/utils'


test('getHashParams with opt_hash', t => {
    t.deepEqual(getHashParams("foo=oof"), {foo: "oof"})
})

test('getHashParams with opt_hash starting with hash', t => {
    t.deepEqual(getHashParams("#foo=oof"), {foo: "oof"})
})

test('getHashParams without params', t => {
    window.location.hash = "#foo=oof"
    t.deepEqual(getHashParams(), {foo: "oof"})
})

test('generateNonce', t => {
    const mathMock = sinon.mock(Math)
    mathMock.expects('random').exactly(16).returns(0.14)
    t.is(generateNonce(), "n-8888888888888888")
    mathMock.verify()
    mathMock.restore()
})

test('parseClaims', t => {
    t.deepEqual(parseClaims(["foo", "oof"]), {foo: {essential: true}, oof: {essential: true}})
})

test('fillFormElementById without element', t => {
    const decodeValue = sinon.mock().never()
    const setValueToElements = sinon.mock().never()
    const mojeID = {
        fillFormElementById: fillFormElementById,
        attrDict: {},
        decodeValue: decodeValue,
        setValueToElements: setValueToElements,
    }
    mojeID.fillFormElementById({foo: 42})
    t.true(decodeValue.verify())
    t.true(setValueToElements.verify())
})

test('fillFormElementById', t => {
    const input = document.createElement('INPUT')
    input.setAttribute("id", "foo")
    document.body.append(input)
    const decodeValue = sinon.mock().once().withArgs(42).returns(42)
    const setValueToElements = sinon.mock().once().withArgs([input], 42)
    const mojeID = {
        fillFormElementById: fillFormElementById,
        attrDict: {},
        decodeValue: decodeValue,
        setValueToElements: setValueToElements,
    }
    mojeID.fillFormElementById({foo: 42})
    t.true(decodeValue.verify())
    t.true(setValueToElements.verify())
})

test('fillFormQuerySelectorAllInputName without elements', t => {
    const decodeValue = sinon.mock().never()
    const setValueToElements = sinon.mock().never()
    const mojeID = {
        fillFormQuerySelectorAllInputName: fillFormQuerySelectorAllInputName,
        attrDict: {},
        decodeValue: decodeValue,
        setValueToElements: setValueToElements,
    }
    mojeID.fillFormQuerySelectorAllInputName({foo: 42})
    t.true(decodeValue.verify())
    t.true(setValueToElements.verify())
})

test('fillFormQuerySelectorAllInputName', t => {
    const inputs = [
        document.createElement("INPUT"),
        document.createElement("SELECT"),
        document.createElement("TEXTAREA"),
    ]
    for(let i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("name", "foo")
        document.body.append(inputs[i])
    }
    const decodeValue = sinon.mock().once().withArgs(42).returns(42)
    const setValueToElements = sinon.mock().once().withArgs(inputs, 42)
    const mojeID = {
        fillFormQuerySelectorAllInputName: fillFormQuerySelectorAllInputName,
        attrDict: {},
        decodeValue: decodeValue,
        setValueToElements: setValueToElements,
    }
    mojeID.fillFormQuerySelectorAllInputName({foo: 42})
    t.true(decodeValue.verify())
    t.true(setValueToElements.verify())
})

test('incomingMessage location does not match', t => {
    const parseToken = sinon.mock().never()
    const formCallback = sinon.mock().never()
    const mojeID = {
        incomingMessage: incomingMessage,
        parseToken: parseToken,
        callbacks: {
            "formCallback": formCallback
        }
    }
    const event = {
        origin: "http://foo",
        data: "foo"
    }
    mojeID.incomingMessage(event)
    t.true(parseToken.verify())
    t.true(formCallback.verify())
})

test('incomingMessage location matches', t => {
    const parseToken = sinon.mock().once()
    const formCallback = sinon.mock().once().returns({data: "ok"})
    const formFailureCallback = sinon.mock().once()
    const mojeID = {
        incomingMessage: incomingMessage,
        parseToken: parseToken,
        callbacks: {
            formCallback: formCallback,
            formFailureCallback: formFailureCallback,
        }
    }
    const event = {
        origin: location.origin,
        data: "foo"
    }
    mojeID.incomingMessage(event)
    t.true(parseToken.verify())
    t.true(formCallback.verify())
    t.true(formFailureCallback.verify())
})

// TODO: Remote tests temporaryFixAddress when OIDC will be fixed.
test('temporaryFixAddress not address', t => {
    t.is(temporaryFixAddress('not_address', 'foo'), 'foo')
})

test('temporaryFixAddress mojeid_address_def json string', t => {
    const data = temporaryFixAddress('mojeid_address_def', '{"street": "Street", "city": "City", "postcode": "12300"}')
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})

test('temporaryFixAddress mojeid_address_def object', t => {
    const data = temporaryFixAddress('mojeid_address_def', {"street": "Street", "city": "City", "postcode": "12300"})
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})

test('temporaryFixAddress mojeid_address_bill json string', t => {
    const data = temporaryFixAddress('mojeid_address_bill', '{"street": "Street", "city": "City", "postcode": "1230"}')
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "1230"})
})

test('temporaryFixAddress mojeid_address_bill object', t => {
    const data = temporaryFixAddress('mojeid_address_bill', {"street": "Street", "city": "City", "postcode": "12300"})
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})

test('temporaryFixAddress mojeid_address_ship json string', t => {
    const data = temporaryFixAddress('mojeid_address_ship', '{"street": "Street", "city": "City", "postcode": "1230"}')
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "1230"})
})

test('temporaryFixAddress mojeid_address_ship object', t => {
    const data = temporaryFixAddress('mojeid_address_ship', {"street": "Street", "city": "City", "postcode": "12300"})
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})

test('temporaryFixAddress mojeid_address_ship2 json string', t => {
    const data = temporaryFixAddress('mojeid_address_ship2', '{"street": "Street", "city": "City", "postcode": "123"}')
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "123"})
})

test('temporaryFixAddress mojeid_address_ship2 object', t => {
    const data = temporaryFixAddress('mojeid_address_ship2', {"street": "Street", "city": "City", "postcode": "12300"})
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})

test('temporaryFixAddress mojeid_address_ship3 json string', t => {
    const data = temporaryFixAddress('mojeid_address_ship3', '{"street": "Street", "city": "City", "postcode": "12300"}')
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})

test('temporaryFixAddress mojeid_address_ship3 object', t => {
    const data = temporaryFixAddress('mojeid_address_ship3', {"street": "Street", "city": "City", "postcode": "12300"})
    t.deepEqual(data, {"street": "Street", "city": "City", "postcode": "12300"})
})
