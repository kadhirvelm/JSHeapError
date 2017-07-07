import { sliceSTL, checkOnSlice } from '../../../../../../State/EntryActions'

import { _ } from 'underscore'
import { mapObjIndexed } from 'ramda'

export class SlicerManager {

    constructor(id, token, dispatch, gcodeTemplate, properties, callback){
        this.id = id
        this.token = token
        this.dispatch = dispatch
        this.gcodeTemplateId = gcodeTemplate._id

        this.currentPrinter = properties.currentPrinter
        this.welltype = properties.welltype
        this.wellPlateProperties = _.first(properties.wellsFileAndExtruderMapping[_.first(properties.currSelectedWells).toString()])
        console.log(properties.wellsFileAndExtruderMapping, this.wellPlateProperties)
        this.needleGauge = properties.needleGauge

        this.callback = callback
    }

    updateProperties(properties){
        this.properties = properties
    }
    
    updateCallback(callback){
        this.callback = callback
    }

    sliceFile(){
        this.wellPlateProperties.slicingProfileObject.content.Properties = _.extend( this.wellPlateProperties.slicingProfileObject.content.Properties, { 'NozzleDiameters' : mapObjIndexed( (gauge) => parseFloat((0.127 * Math.pow(92, (36 - gauge) / 39)).toFixed(4), 10), this.needleGauge) } )
        this.dispatch(sliceSTL(this.token, this.gcodeTemplateId,
            this.wellPlateProperties, 
            this.currentPrinter,
            this.welltype, 
            this.setSTLTaskID)
        )
    }

    setSTLTaskID = (response) => {
        this.taskID = response.id
        this.callback(this.id, this.taskID, 'TASK ID')
    }

    startUpdates(){
        this.pushUpdates = true
        this.checkOnSlice()
    }

    stopUpdates(){
        this.pushUpdates = false
    }

    checkOnSlice = () => {
        this.dispatch(checkOnSlice(this.taskID, (response) => {
            this.callback(this.id, response, 'UPDATE')
            _.delay( () => {
                if(this.pushUpdates){
                    this.checkOnSlice()
                }
            }, 10000)
        }))
    }

}