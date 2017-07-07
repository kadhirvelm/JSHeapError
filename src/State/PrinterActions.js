import $ from 'jquery'
import { loadState } from './StateStoreLoad.js'

import { map, keys, head } from 'ramda'

import { SocketManager }  from '../Sockets/SocketManager'

export const RETRIEVE_PRINTERS_FAILURE = 'RETRIEVE_PRINTERS_FAILURE'
export const RETRIEVE_PRINTERS_REQUEST = 'RETRIEVE_PRINTERS_REQUEST'
export const RETRIEVE_PRINTERS_SUCCESS = 'RETRIEVE_PRINTERS_SUCCESS'
export const CONNECT_PRINTER_REQUEST = 'CONNECT_PRINTER_REQUEST'
export const CONNECT_PRINTER_SUCCESS = 'CONNECT_PRINTER_SUCCESS'
export const CONNECT_PRINTER_FAILURE = 'CONNECT_PRINTER_FAILURE'
export const DISCONNECT_PRINTER_REQUEST = 'DISCONNECT_PRINTER_REQUEST'
export const DISCONNECT_PRINTER_SUCCESS = 'DISCONNECT_PRINTER_SUCCESS'
export const RESET_CURRENT_PRINTER = 'RESET_CURRENT_PRINTER'

//Printer Status {ONLINE/OFFLINE/ERROR}
export const UPDATE_PRINTER_STATUS_REQUEST = 'UPDATE_PRINTER_STATUS_REQUEST'
export const UPDATE_PRINTER_STATUS_SUCCESS = 'UPDATE_PRINTER_STATUS_SUCCESS'
export const UPDATE_PRINTER_STATUS_FAILURE = 'UPDATE_PRINTER_STATUS_FAILURE'
export const INITIALIZING = 'INITIALIZING'

const axios = require('axios')

const retrievePrintersRequest = () => {
  return {
      type: RETRIEVE_PRINTERS_REQUEST,
      fetchStatus: 'FETCHING',
      printers: [],
  }
}

const retrievePrintersSuccess = (printers) => {
  return {
    type: RETRIEVE_PRINTERS_SUCCESS,
      fetchStatus: 'SUCCESSFUL',
      printers,
  } 
}

const resetCurrentPrinter = () => {
  return {
    type: RESET_CURRENT_PRINTER,
  }
}

export const preRetrievePrintersRequest = (token, predicate, callback) => {
  const filters ={}
  predicate['sortBy'] = head(keys(predicate)) 
  filters['filters'] = predicate

  return dispatch => {
    dispatch(resetCurrentPrinter())
    dispatch(retrievePrintersRequest())
    $.ajax({
      url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all',
      method: 'post', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + loadState().auth.auth_token,
      },
      data: JSON.stringify(filters),
      type: 'POST',
      dataType: 'json',
      cache: false,
      success: function(data) {
        dispatch(retrievePrintersSuccess(data))
        if (callback) {
          callback(data)
        }
      },
      error: function(xhr, status, err) {
        console.log('Errors getting printer template', err)
      },
    })
  }
}

const disconnectPrinterSuccess = (id) => {
  return {
    type: DISCONNECT_PRINTER_SUCCESS,
    id,
  }
}

export function updatePrinterStatus(printers) {
  return dispatch => {
    const dispatchHandler = (printer) =>{
        dispatch(updatePrinterStatusRequest(printer._id))
        dispatch(disconnectPrinterSuccess(printer._id))
    }
    map(dispatchHandler, printers)
  }
}

function updatePrinterStatusRequest(id) {
  SocketManager.emitMessage('ONLINE_PRINTERS', id)
  return {
    type: UPDATE_PRINTER_STATUS_REQUEST,
    id,
  }
}

export function updatePrinterStatusSuccess(id, isOnline) {
  return {
    type: UPDATE_PRINTER_STATUS_SUCCESS,
    id,
    isOnline,
  }
}


export const connectPrinterRequest = (id, target) => {
  SocketManager.emitMessage('SEND_MESSAGE', {
      targetClientType: 'PRINTER',
      targetClient: id,
      command: 'COMMAND',
      content: {
          //Required Data
          callbackCommandSuccess: CONNECT_PRINTER_SUCCESS,
          callbackCommandFailure: CONNECT_PRINTER_FAILURE,
          callbackTarget: target,

          //Request Data
          urlExtension: 'connection',
          type: 'POST',
          body: {
               'command': 'connect',
                'port': 'AUTO',
                'baudrate': 115200,
                'printerProfile': '_default',
                'autoconnect': true,
          },

          //Extra Data
          printerId: id,
      },
  })

  return {
    type: CONNECT_PRINTER_REQUEST,
    id,
  }
}

export const connectPrinterSuccess = (id) => {
  return {
    type: CONNECT_PRINTER_SUCCESS,
    id,
  }
}
export const connectPrinterFailure = (id) =>{
  return {
    type: CONNECT_PRINTER_FAILURE,
    id,
  }
}

//Control

const sendPrintHeadCommand = (id, target, data) => {
  SocketManager.emitMessage('SEND_MESSAGE', {
    targetClientType: 'PRINTER',
    targetClient: id,
    command: 'COMMAND',
    content: {
        //Required Data
        callbackCommandSuccess: 'sendPrintHeadCommandSuccess',
        callbackCommandFailure: 'sendPrintHeadCommandFailure',
        callbackTarget: target,

        //Request Data
        urlExtension: 'printer/printhead',
        type: 'POST',
        body: data,

        //Extra Data
        printerId: id,
    },
  })
}

export const sendJogCommand = (id, target, axis, multiplier, distance) => {
  let data = {
    command: 'jog',
  }
  data[axis] = distance * multiplier

  sendPrintHeadCommand(id, target, data)
  return {
    type: 'UPDATE AXIS', //TODO: Define state management
  }
}


//Print Panel
export const RETRIEVE_USER_FILES_REQUEST = 'RETRIEVE_USER_FILES_REQUEST'
export const RETRIEVE_USER_FILES_SUCCESS = 'RETRIEVE_USER_FILES_SUCCESS'
export const RETRIEVE_USER_FILES_FAILURE = 'RETRIEVE_USER_FILES_FAILURE'
export const SLICE_SETUP = 'SLICE_SETUP'
export const SLICE_REQUEST = 'SLICE_REQUEST'
export const SLICE_SUCCESS = 'SLICE_SUCCESS'
export const SLICE_FALIURE = 'SLICE_FALIURE'
export const SET_CURRENT_PRINTER = 'SET_CURRENT_PRINTER'
export const ADD_FILE_TO_PRINTER = 'ADD_FILE_TO_PRINTER'
export const SETUP_PRINTER_MODEL = 'SETUP_PRINTER_MODEL'

//  User Files

export const retrieveUserFilesSuccess = (files) => {
  return {
    type: RETRIEVE_USER_FILES_SUCCESS,
    requestStatus: 'SUCCESSFUL',
    files,
  }
}

export const retrieveUserFilesFailure = () => {
  return {
    type: RETRIEVE_USER_FILES_REQUEST,
    requestStatus: 'FAILED',
  }
}

export const retrieveUserFilesRequest = () => {
   return {
      type: RETRIEVE_USER_FILES_REQUEST,
      requestStatus: 'FETCHING',
    }
}


export const preRetrieveUserFilesRequest = (token) => {

  return dispatch => {  
    dispatch(retrieveUserFilesRequest(token))
    
    axios({
      url: process.env.REACT_APP_BIOBOTS_API_URL + '/template/all',
      method: 'post', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      data: {
        'filters': {
                    /*
          ST: templateId: 58dc34329fa0cb0001cf8dc1
          GCOD templateId: 58dc3468e871df0001bcf8d1
          */
          _id: '58dc34329fa0cb0001cf8dc1', //this is the STL template id. rfTodo: Ask kadhir how to store this globally
        },
      },
      }
    ).then((templateFetchResponse) => {
        if (templateFetchResponse.data.length <= 0){
          return 'Couldn\'t fetch file template'
        }
        
        return axios({
          url: process.env.REACT_APP_BIOBOTS_API_URL + '/entry/all',
          method: 'post', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loadState().auth.auth_token,
          },
          data: {
            filters: {
              'templateId': templateFetchResponse.data[0]._id,
            },
          },
        })

    }).then((entryFetchResponse) => {
      dispatch(retrieveUserFilesSuccess(entryFetchResponse.data))
    }).catch((error) => {
      dispatch(retrieveUserFilesFailure(error)  )
    })


  }
}

export const addFileToPrinter = (currentPrinter, file) => {
  return {
    type: ADD_FILE_TO_PRINTER,
    currentPrinter,
    file,
  }
}


// Current Printer
export const setCurrentPrinter = (id) => {
  console.log('id',id)
  return {
    type: SET_CURRENT_PRINTER,
    currentPrinter: id,
  }
}


const sendSliceSetup = () => {
  return ({
    type: SLICE_REQUEST,
    status: 'SETUP',
  })
}

export const sliceSetup = () => {
  return dispatch => { 
    dispatch(sendSliceSetup())
  }
}

const sendSliceCommand = () => {
  return ({
    type: SLICE_REQUEST,
    status: 'SLICING',
  })
}

export const sliceSuccess = () => {
  return {
    type: SLICE_SUCCESS,
    status: 'SLICED',
    slicedFileUrl: '', //Add dummy sliced file url here
  }
}

export const sliceRequest = () => {
  return dispatch => { 
    dispatch(sendSliceCommand())
    setTimeout(function() {
      dispatch(sliceSuccess())
    }, 3000)
  }
}

export const sliceFaliure = () => {
  return {
    type: SLICE_FALIURE,
  }
}

