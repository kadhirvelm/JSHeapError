/** Taken from https://github.com/corpix/material-ui-upload/blob/master/src/Upload/index.js .*/

import React, { Component } from 'react'

import FlatButton from 'material-ui/FlatButton'

import { filter } from 'lodash'


const styles = {
    Container: {
        position: 'relative',
        display: 'inline-block',
        boxSizing: 'border-box',
    },

    FileInput: {
        opacity: '0',
        position: 'absolute',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
    },
}

export default class Upload extends Component {

    static defaultProps = {
        fileTypeRegex: /.*/,
        onFileLoad: (e) => undefined,
    }

    exclusiveProps = [
        'fileTypeRegex',
        'onFileLoad',
    ]

    onInputChange = (e) => {
        filter(
            e.target.files,
            (file) => file.type.match(this.props.fileTypeRegex) !== null
        )
            .forEach(
                (file) => {
                    let reader = new FileReader()
                    reader.onload = this.props.onFileLoad
                    reader.readAsDataURL(file)
                }
            )
    }

    componentDidMount() {
        this.refs['file-input']
            .addEventListener(
                'change',
                this.onInputChange,
                false
            )
    }

    componentWillUnmount() {
        this.refs['file-input']
            .removeEventListener(
                'change',
                this.onInputChange,
                false
            )
    }

    getControlProps() {
        return Object
            .keys(this.props)
            .filter(
                (name) => this.exclusiveProps.indexOf(name) === -1
            )
            .reduce(
                (acc, name) => {
                    acc[name] = this.props[name]
                    return acc
                },
                {}
            )
    }

    render() {
        return (
            <div className={ styles.Container }>
              {
                  React.cloneElement(
                      (
                          <FlatButton
                            containerElement='label'
                            className={ styles.Control }
                            >
                            <input
                              className={ styles.FileInput }
                              type="file"
                              ref="file-input"
                              multiple
                              style={ { display: 'none' } }
                              />
                          </FlatButton>
                      ),
                      this.getControlProps()
                  )
              }
            </div>
        )
    }

}