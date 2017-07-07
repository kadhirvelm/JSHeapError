import { _ } from 'underscore'
import { Manager } from 'socket.io-client'

export const CONNECT = 'connect'
export const IDENTIFY_CLIENT = 'IDENTIFY_CLIENT'
export const ONLINE_PRINTERS = 'ONLINE_PRINTERS'
export const EMIT_MESSAGE_FAILURE = 'EMIT_MESSAGE_FAILURE'
export const EMIT_MESSAGE_RESPONSE = 'EMIT_MESSAGE_RESPONSE'
export const UPDATE = 'UPDATE'
export const UNREACHABLE_TARGET = 'UNREACHABLE_TARGET'
export const CONNECT_PRINTER_SUCCESS = 'CONNECT_PRINTER_SUCCESS'
export const CONNECT_PRINTER_FAILURE = 'CONNECT_PRINTER_FAILURE'
export const SEND_MESSAGE = 'SEND_MESSAGE'

export class DEBUG_SOCKET_MANAGER {
    constructor(url, properties){
        this.url = url
        this.properties = properties
    }

    socket(namespace){
        return new DEBUG_SOCKET(namespace)
    }
}

export class DEBUG_SOCKET {

    constructor(namespace){
        this.namespace = namespace
        this.onCommands = {}
    }

    connect(){
        this.on(CONNECT, { 'connect': true })
    }

    on(message, secondPart){
        if(message in this.onCommands) {
            this.onCommands[message](secondPart)
        } else if (_.isFunction(secondPart)) {
            this.onCommands[message] = secondPart
        } else {
            console.log('No callback associated', message, secondPart, this.onCommands)
        }
    }

    emit(key, message){
        console.log('DEBUG socket EMIT', key, message)
    }
}

export class SocketManager {

    updateCallback(callback){
        this.callback = _.isUndefined(callback) ? function(){ return } : callback
    }

    reconnectSocket(email, callback, namespace){
        if(!_.isUndefined(this.socketManager)){
            if(_.isUndefined(this.socket)){
                this.socket = this.socketManager.socket(this.namespace || '/')
            }
            this.updateCallback(callback)
            this.handleIncomingRequests()
            this.socket.connect()
        } else if(!_.isUndefined(email)) {
            this.createSocket(email, callback, namespace)
        }
    }
 
    createSocket(email, callback, namespace){

        this.clientEmail = email
        this.namespace = namespace

        this.currentActiveExtruder = ''
        
        this.socketManager = (process.env.REACT_APP_DEBUG === 'true') ? new DEBUG_SOCKET_MANAGER(process.env.REACT_APP_CLOUD_SOCKET_MANAGER_URL, { 'autoConnect': true }) : new Manager( process.env.REACT_APP_CLOUD_SOCKET_MANAGER_URL, { 'autoConnect': true })
        this.socket = this.socketManager.socket(this.namespace || '/')
        
        this.updateCallback(callback)
        this.handleIncomingRequests()
        this.socket.connect()
    }

    handleIncomingRequests(){
        this.socket.on(CONNECT, () => {
            this.socket.emit(IDENTIFY_CLIENT, {
                clientType: 'USER',
                client: this.clientEmail,
            })
            this.callback(CONNECT, {
                clientType: 'USER',
                client: this.clientEmail,
            })
        })

        this.socket.on(CONNECT_PRINTER_SUCCESS, (data) => {
            this.callback(CONNECT_PRINTER_SUCCESS, data)
        })

        this.socket.on(CONNECT_PRINTER_FAILURE, (data) => {
            this.callback(CONNECT_PRINTER_FAILURE, data)
        })

        this.socket.on(EMIT_MESSAGE_FAILURE, (data) => {
            this.callback(EMIT_MESSAGE_FAILURE, data)
        })

        this.socket.on(EMIT_MESSAGE_RESPONSE, (data) => {
            this.callback(EMIT_MESSAGE_RESPONSE, data)
        })

        this.socket.on(UNREACHABLE_TARGET, (data) => {
            this.callback(UNREACHABLE_TARGET, data)
        })

        this.socket.on(UPDATE, (data) => {
            this.callback(UPDATE, data)
        })
    }

    connectToPrinter(targetClientType, targetClient, isDisconnect){
        this.targetClientType = targetClientType
        this.targetClient = targetClient

        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'connection',
            type: 'POST',
            body: {
                command: _.isUndefined(isDisconnect) ? 'connect' : 'disconnect',
                'port': 'AUTO',
                'baudrate': 115200,
                'printerProfile': '_default',
                'autoconnect': true,
            },
            callbackCommandSuccess: CONNECT_PRINTER_SUCCESS,
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
            callbackCommandFailure: CONNECT_PRINTER_FAILURE,
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
        })
    }

    disconnectFromPrinter(){
        if (!_.isUndefined(this.targetClientType) && !_.isUndefined(this.targetClient)){
            this.updateCallback(undefined)
            this.sendStopPressureCommand()
            this.connectToPrinter(this.targetClientType, this.targetClient, true)
        }
    }

    sendStopPressureCommand(){
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/command',
            type: 'POST',
            body: {
                commands: [ 'M42 P16 S0', 'M42 P17 S0' ],
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    resumePressureCommand(){
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/command',
            type: 'POST',
            body: {
                commands: [ 'M42 P16 S255', 'M42 P17 S255' ],
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendHomeCommand(axes){
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/printhead',
            type: 'POST',
            body: {
                command: 'home',
                axes: axes,
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendWellPlateValue(wellplate){
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/printhead',
            type: 'POST',
            body: {
                command: 'wellplate',
                wellplate: wellplate,
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    jogPrinterPosition(position){
        position = position || {}
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/command',
            type: 'POST',
            body: {
                commands: [ 'G90', 'G1 X' + (position.X || 0) + ' Y' + (position.Y || 0) + ' Z' + (position.Z || 45) + ' F1000' ],
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    setActiveExtruder(extruder, optionalZValue){
        const values = (extruder === 'A') ? { midpoint: 24, direction: -1, xTravel: 48.33, target: 46 } : { midpoint: 24, direction: 1, xTravel: 48.33, target: 0 }
        const optionalZGcode = _.isUndefined(optionalZValue) ? '' : 'G1 Z' + optionalZValue + ' F1000'
        if (this.currentActiveExtruder !== extruder) {
            this.currentActiveExtruder = extruder
            this._emitMessage(SEND_MESSAGE, {
                targetClientType: this.targetClientType,
                targetClient: this.targetClient,
                command: 'COMMAND',
                urlExtension: 'printer/command',
                type: 'POST',
                body: {
                    commands: [
                        'G90',
                        'G1 Z50 F1000',
                        'T0',
                        'M400',
                        'G1 E' + values.midpoint + ' F1000.00',
                        'M400',
                        'G91',
                        'G1 X' + values.direction * values.xTravel + ' F2000.00',
                        'G90',
                        'M400',
                        'G1 E' + values.target + ' F1000.00',
                        optionalZGcode,
                        'M400',
                    ],
                },
                callbackClientTarget: this.clientEmail,
                callbackClientType: 'USER',
                unreachableTargetCallback: UNREACHABLE_TARGET,  
                emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
                emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
            })
        }
    }

    testExtrude(extruder, isOn){
        const sValue = 'S' + (isOn ? '255' : '0')
        const command = ((extruder === 'A') ? 'M42 P16 ' : 'M42 P17 ') + sValue
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/command',
            type: 'POST',
            body: {
                commands: [ 'M400', command ],
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendPrintCalibrateValues(extruders){
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/printhead',
            type: 'POST',
            body: {
                command: 'position',
                positions: extruders,
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendPressureChange(pressureDelta, extruder){
        const extruderSelected = extruder === 'A' ? 'L' : 'R'
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/command',
            type: 'POST',
            body: {
                commands: [ 'G91', 'G1 ' + extruderSelected + ' ' + pressureDelta, 'G90', 'M18 ' + extruderSelected, 'M105' ],
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendPrintParameters(body){
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'files/api',
            type: 'POST',
            body: {
                print: true,
                command: 'select',
                entry: {
                    _id: '001',
                    content: body,
                },
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendEmergencyStop(){
        this.sendStopPressureCommand()
        this._emitMessage(SEND_MESSAGE, {
            targetClientType: this.targetClientType,
            targetClient: this.targetClient,
            command: 'COMMAND',
            urlExtension: 'printer/command',
            type: 'POST',
            body: {
                commands: [ 'M112' ],
            },
            callbackClientTarget: this.clientEmail,
            callbackClientType: 'USER',
            unreachableTargetCallback: UNREACHABLE_TARGET,  
            emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
            emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
        })
    }

    sendRunningCommand(command){
        if(_.contains([ 'start', 'pause', 'restart', 'cancel' ], command)){
            this._emitMessage(SEND_MESSAGE, {
                targetClientType: this.targetClientType,
                targetClient: this.targetClient,
                command: 'COMMAND',
                urlExtension: 'printer/command',
                type: 'POST',
                body: {
                    command: command,
                },
                callbackClientTarget: this.clientEmail,
                callbackClientType: 'USER',
                unreachableTargetCallback: UNREACHABLE_TARGET,  
                emitMessageFailureCallback: EMIT_MESSAGE_FAILURE,
                emitMessageResponseCallback: EMIT_MESSAGE_RESPONSE,
            })
        } else {
            return ('unknown command', command)
        }
    }

    _emitMessage(messageKey, data){
        if(this.socket){
            this.socket.emit(messageKey, data)
        }
    }
}