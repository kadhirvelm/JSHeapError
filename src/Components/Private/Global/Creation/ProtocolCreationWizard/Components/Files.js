import React from 'react'
import Flexbox from 'flexbox-react'

import STLManager from './STLManager'
import STLViewer from 'stl-viewer'

import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table'
import CircularProgress from 'material-ui/CircularProgress'
import AutoComplete from 'material-ui/AutoComplete'
import IconButton from 'material-ui/IconButton'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Dialog from 'material-ui/Dialog'

import { svgIcon } from '../../../Display/icons'

import { createNewEntry, updateEntry, getAllEntries } from '../../../../../../State/EntryActions'

import { curry, match, length, map, prop, uniqBy, propEq, reject, forEach, keys, findIndex, whereEq, isNil, filter, dissoc } from 'ramda'

export class Files extends React.Component{

    constructor(props) {
      super(props)
      this.state = Object.assign({}, {
        searchText: '',
        allUserFiles : [],
        openSlicingProfile: false,
      }, this.propsConst(props))
    }

    propsConst(props){
      return({
        dispatch: props.dispatch,
        token: props.token,
        awsHandler: props.awsHandler,
        stlTemplate: props.stlTemplate,
        gcodeTemplate: props.gcodeTemplate,
        slicingProfileTemplate: props.slicingProfileTemplate,
        sendProperties: props.sendProperties,
        properties: props.properties,
        availableExtruders: props.availableExtruders,
        selectedFiles: prop('wellsFileAndExtruderMapping', props.properties) ? this.checkProperties(props.properties) : [],
      })
    }

    checkProperties = (properties) => {
      var wellsFileAndExtruderMappingSettings = prop('wellsFileAndExtruderMapping', properties) ? properties.wellsFileAndExtruderMapping : {}
      var finalWellsFileAndExtruderMappingSettings
      const checkIfAllSame = (selectedWell) => {
        const settings = prop(selectedWell, wellsFileAndExtruderMappingSettings)
        if (!isNil(finalWellsFileAndExtruderMappingSettings)) {
          finalWellsFileAndExtruderMappingSettings = whereEq(finalWellsFileAndExtruderMappingSettings)(settings ? settings : {}) ? finalWellsFileAndExtruderMappingSettings : []
        } else {
          finalWellsFileAndExtruderMappingSettings = !isNil(settings) ? settings : []
        }
      }
      forEach(checkIfAllSame, properties.currSelectedWells)
      return finalWellsFileAndExtruderMappingSettings
    }

    componentWillMount() {
      this.fetchAllUserSTLFiles()
      this.fetchAllUserSlicingProfiles()
    }

    componentWillReceiveProps(nextProps) {
      this.setState(this.propsConst(nextProps))
    }

    fetchAllUserSTLFiles = () => {
      const setAvailableEntries = (entries) => this.setState({ allUserFiles: map(this.makeAutocompleteFromDB, entries) })
      this.fetchAllFiles([ this.state.stlTemplate._id, this.state.gcodeTemplate._id ], setAvailableEntries)
    }

    fetchAllUserSlicingProfiles = () => {
      const setAvailableProfiles = (entries) => this.setState({ allUserSlicingProfiles: entries })
      this.fetchAllFiles([ this.state.slicingProfileTemplate._id ], setAvailableProfiles)
    }

    fetchAllFiles = (templateIDs, callback) => {
      const filters = {
        templateId: templateIDs,
      }
      this.state.dispatch(getAllEntries(this.state.token, filters, callback))
    }

    makeAutocompleteFromDB = (entry) => {
      return this.makeAutoCompleteItem(prop('Name', entry.content), entry._id, prop('Url', entry.content), prop('Bucket', entry.content), prop('Key', entry.content))
    }

    addToAvailableFiles = (name, value) => {
      var currentAllUserFiles = this.state.allUserFiles
      const selectedItem = this.makeAutoCompleteItem(name, value._id, value.content.Url, value.content.Bucket, value.content.Key)
      currentAllUserFiles.unshift(selectedItem)
      var currSelectedItems = this.state.selectedFiles
      currSelectedItems.unshift({ id: selectedItem.id, file: selectedItem, infill: '', outfill: '' })
      this.setState({ allUserFiles: currentAllUserFiles, isLoading: false })
      this.updateUserSelectedFiles(currSelectedItems)
      this.state.sendProperties('extruderSelectedTab', 1)
      this.state.sendProperties('globalStep', 3)
    }

    makeAutoCompleteItem = (name, id, url, bucket, key) => {
      return({
        text: name.replaceAll(' ', '%20'),
        id: id,
        url: url,
        bucket: bucket,
        key: key,
        value: ( <MenuItem primaryText={ name } /> ),
      })
    }

    curryAddToAvailableFiles = curry(this.addToAvailableFiles)

    onFileLoad = (inputFile) => {
      const file = inputFile.target.files.item(0)
      if (length(match(/.*\.stl/g, file.name)) === 1) {
        this.createEntryAndUploadFiles(file, this.state.stlTemplate, false)
      } else if (length(match(/.*\.gcode/g, file.name)) === 1) {
        this.createEntryAndUploadFiles(file, this.state.gcodeTemplate, true)
      } else {
        this.setState({ uploadError: 'Error: Can only accept .stl and .gcode files', isLoading: false })
      }
    }

    createEntryAndUploadFiles = (file, template, isGcode) => {
      this.setState({ uploadError: '', isLoading: true })
      const submission = {
        templateId: template._id,
        access: 'PRIVATE',
        content: {
          Name: file.name,
        },
        parents: [],
        children: [],
      }
      const createFile = (data) => {
        const uploadPromise = isGcode ? this.state.awsHandler.uploadGcodeFile(file, data._id) : this.state.awsHandler.uploadSTLFile(file, data._id)
        uploadPromise.then( (values) => {
          data.content.Url = values.Location
          data.content.Bucket = values.Bucket
          data.content.Key = values.Key
          this.state.dispatch(updateEntry(this.state.token, data, this.curryAddToAvailableFiles(file.name)))
        })
      }
      this.state.dispatch(createNewEntry(this.state.token, submission, createFile))
    }

    renderSelectField = (fileEntry, isInFill) => {
      return(
        <SelectField value={ isInFill ? fileEntry.infill : fileEntry.outfill } onChange={ this.curryHandleSelectFieldChange(fileEntry, isInFill) } floatingLabelText={ isInFill ? 'Extruder' : 'Perimeter Extruder' }>
          { keys(this.state.availableExtruders).map( (entry, index) => (
            <MenuItem key={ index } value={ entry } label={ entry } primaryText={ entry } />
            ))
          }
        </SelectField>
      )
    }

    handleSelectFieldChange = (fileEntry, isInFill, event, index, value) => {
      fileEntry[isInFill ? 'infill' : 'outfill'] = value
      var currSelectedFiles = this.state.selectedFiles
      currSelectedFiles[findIndex(propEq('id', fileEntry.id))(currSelectedFiles)] = fileEntry
      this.updateUserSelectedFiles(currSelectedFiles)
    }

    curryHandleSelectFieldChange = curry(this.handleSelectFieldChange)

    renderSlicingSelectField = (fileEntry) => {
      return(
      <SelectField value={ fileEntry.slicingProfile && fileEntry.slicingProfile } onChange={ this.curryHandleSelectFieldChangeSlicingProfiles(fileEntry) } floatingLabelText='Slicing Profile'>
        <MenuItem key={ -1 } value={ -1 } label='Create New' primaryText='Create New' />
        { this.state.allUserSlicingProfiles &&
          this.state.allUserSlicingProfiles.map( (entry, index) => (
          <MenuItem key={ index } value={ index } label={ entry.content.Properties.Name } primaryText={ entry.content.Properties.Name } />
          ))
        }
      </SelectField>
      )
    }

    handleSelectFieldChangeSlicingProfiles = (fileEntry, event, index, value) => {
      if(value === -1){ 
        this.setState({ openSlicingProfile: true })
      } else {
        fileEntry.slicingProfile = value
        fileEntry.slicingProfileObject = this.state.allUserSlicingProfiles[value]
        var currSelectedFiles = this.state.selectedFiles
        currSelectedFiles[findIndex(propEq('id', fileEntry.id))(currSelectedFiles)] = fileEntry
        this.updateUserSelectedFiles(currSelectedFiles)
      }
    }

    curryHandleSelectFieldChangeSlicingProfiles = curry(this.handleSelectFieldChangeSlicingProfiles)

    handleUpdateInput = (value) => {
      if (value.id){
        var currSelectedFiles = this.state.selectedFiles
        currSelectedFiles.unshift({ id: value.id, file: value, infill: '', outfill: '' })
        this.updateUserSelectedFiles(uniqBy(prop('id'), currSelectedFiles), true)
        this.state.sendProperties('extruderSelectedTab', 1)
        this.state.sendProperties('globalStep', 3)
      } else {
        this.setState({ searchText: '' })
      }
    }

    removeFile = (fileEntry, event) => {
      const rejectID = (entry) => entry.id === fileEntry.id
      this.updateUserSelectedFiles(reject(rejectID, this.state.selectedFiles))
    }

    updateSearchText = (searchText) => {
      this.setState({ searchText: searchText })
    }

    autoCompleteFilter = (searchText, key) => (key.indexOf(searchText) !== -1)

    curryRemoveFile = curry(this.removeFile)

    updateUserSelectedFiles = (selectedFiles, display) => {
      this.setState({ searchText: '', selectedFiles: selectedFiles })
      var wellsFileAndExtruderMapping = prop('wellsFileAndExtruderMapping', this.state.properties) ? this.state.properties.wellsFileAndExtruderMapping : {}
      const assignProperties = (selectedWell) => wellsFileAndExtruderMapping[selectedWell] = selectedFiles
      forEach(assignProperties, this.state.properties.currSelectedWells)
      this.state.sendProperties('wellsFileAndExtruderMapping', wellsFileAndExtruderMapping)
      this.updateCompletedWells(wellsFileAndExtruderMapping)
    }

    updateCompletedWells = (wellsFileAndExtruderMapping) => {
      if ( !isNil(this.state.properties.completedWells) ) {
        var currCompletedWells = this.state.properties.completedWells
        const removeAllNonZero = (well) => length(well) === 0
        const removeIndexes = (removeWell) => currCompletedWells = dissoc(removeWell.toString(), currCompletedWells)
        forEach(removeIndexes, keys(filter(removeAllNonZero, wellsFileAndExtruderMapping)))
        this.state.sendProperties('completedWells', currCompletedWells)
      }
    }

    handleSlicingSettingsClose = () => this.setState({ openSlicingProfile: false })

    handleSlicingSettingsSubmit = (slicerSettings) => {
      if(slicerSettings.Name){
        const submission = {
          templateId: this.state.slicingProfileTemplate._id,
          access: 'PRIVATE',
          content: {
            Properties: slicerSettings,
          },
          parents: [],
          children: [],
        }
        console.log(submission)
        const setCurrentSettings = (settings) => console.log(settings)
        this.state.dispatch(createNewEntry(this.state.token, submission, setCurrentSettings))
        this.handleSlicingSettingsClose()
      }
    }

    render() {
      const actions = [
        <FlatButton key='Cancel'
          label='Cancel'
          secondary={ true }
          onTouchTap={ this.handleSlicingSettingsClose }
        />,
      ]

      return(
        <Flexbox flexDirection='column' flexGrow={ 1 }>
          <Flexbox alignItems='center' flexDirection='column'>
            <Flexbox>
              <font size={ 3 }> <b> Select Files to Print </b> </font>
              { this.state.isLoading &&
                <CircularProgress style={ { marginLeft: '10px' } } />
              }
            </Flexbox>
            <font color='red' size={ 2 }> { this.state.uploadError } </font>
          </Flexbox>
          <Flexbox alignItems='center' flexDirection='row' style={ { padding: '5px', borderStyle: 'solid', borderWidth: '1px', borderColor: 'black', marginTop: '10px', marginBottom: '10px' } }>
            <Flexbox flexGrow={ 1 }>
              <AutoComplete
                hintText='Search for your file'
                searchText={ this.state.searchText }
                onUpdateInput={ this.updateSearchText }
                dataSource={ this.state.allUserFiles }
                onNewRequest={ this.handleUpdateInput }
                filter={ this.autoCompleteFilter }
                disableFocusRipple={ false }
                openOnFocus={ true }
                style={ { padding: '5px' } }
                fullWidth={ true } />
            </Flexbox>
            <Flexbox>
              <RaisedButton
                containerElement='label'
                label='Upload'
                labelColor='#FFFFFF'
                backgroundColor='#00796B'
                >
                <input
                  type='file'
                  onChange={ this.onFileLoad }
                  style={ { display: 'none' } }
                  />
              </RaisedButton>
            </Flexbox>
          </Flexbox>
          <Table height='300px' selectable={ false }>
            <TableBody displayRowCheckbox={ false }>
            { this.state.selectedFiles.map( (fileEntry, index) => (
              <TableRow key={ index }>
                <TableRowColumn style={ { whiteSpace: 'normal', wordWrap: 'break-word' } }> { fileEntry.file.text.replaceAll('%20', ' ') } </TableRowColumn>
                <TableRowColumn>
                { fileEntry.file.text.endsWith('gcode') ?
                  <img alt='Tool Path' src='https://biobots-ui.s3.amazonaws.com/Files/Images/590771b22206c9130039d2f6_admin%40admin.com/591aa5d211f98e19002f2b50_Screenshot%25202017-05-15%252016.55.48.png' style={ { maxHeight: '125px', maxWidth: '150px', height: 'auto', width: 'auto' } } />
                  :
                  <STLViewer
                    url={ fileEntry.file.url }
                    rotate={ true }
                    width={ 150 }
                    height={ 125 }
                    orbitControls={ true } />
                }
                </TableRowColumn>
                { !fileEntry.file.text.endsWith('gcode') ?
                  <TableRowColumn>
                    { this.renderSelectField(fileEntry, true) }
                  </TableRowColumn>
                  :
                  <TableRowColumn> -- </TableRowColumn>
                }
                { !fileEntry.file.text.endsWith('gcode') ?
                  <TableRowColumn>
                    { this.renderSlicingSelectField(fileEntry) }
                  </TableRowColumn>
                  :
                  <TableRowColumn> -- </TableRowColumn>
                }
                <TableRowColumn> 
                  <IconButton tooltip='Remove' iconStyle={ { width: '10px', height: '10px' } } onClick={ this.curryRemoveFile(fileEntry) }>
                    { svgIcon('cancel') }
                  </IconButton>
                </TableRowColumn>
              </TableRow>
              ))
            }
            </TableBody>
          </Table>
          <Dialog title='Slicing Profile' actions={ actions } autoScrollBodyContent={ true } open={ this.state.openSlicingProfile } modal={ true } onRequestClose={ this.handleSlicingProfileClose } contentStyle={ { width: '85%', maxWidth: 'none' } }>
            <STLManager dispatch={ this.state.dispatch } token={ this.state.token } properties={ this.state.properties }  sendProperties={ this.state.sendProperties } handleSlicingSettingsSubmit={ this.handleSlicingSettingsSubmit } />
          </Dialog>
        </Flexbox>                   
      )
    }
}

export default (Files)