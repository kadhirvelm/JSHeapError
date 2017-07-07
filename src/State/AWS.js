import AWS from 'aws-sdk'

import { map, curry } from 'ramda'

class AWSHandler {

	constructor(userID, email){
		this.userID = userID + '_' + email

		AWS.config.region = 'us-east-1'
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: 'us-east-1',
		})

		this.s3 = new AWS.S3({
			apiVersion: '2006-03-01',
			params: { Bucket: 'ui' },
		})

		this.filesFolder = 'Files'
		this.imageFolder = this._returnURL('Images')
		this.stlFolder = this._returnURL('STL')
		this.gCodeFolder = this._returnURL('gcode')
		this.videoFolder = this._returnURL('Videos')

		const allFolderPromises = map(this._curryCreateFolders(this.s3), [ this.imageFolder, this.stlFolder, this.gCodeFolder, this.videoFolder ])
		Promise.all(allFolderPromises)
	}

	_returnURL(folderName){
		return encodeURIComponent(this.filesFolder) + '/' + encodeURIComponent(folderName) + '/' + (this.userID) + '/'
	}

	_createFolder(s3, url){
		return new Promise( function(resolve){
			s3.headObject({ Key: url }, function(err) {
				if (!err) { return }
				if (err.code === 'NotFound'){
					s3.putObject({ Key: url }, function(err, data) {
						if (err) {
							console.log('There was an error creating your album: ' + err.message + '. Please contact BioBots support.')
						} else {
							resolve(data)
						}
					})
				}
			})
		})
	}

	_curryCreateFolders = curry(this._createFolder)

	uploadFile(file, id){
		const s3 = this.s3
		const imageFolder = this.imageFolder
		return new Promise( function(resolve, reject) {
			s3.upload({
				Key: imageFolder + encodeURIComponent(id + '_' + file.name.replaceAll(' ', '%20')),
				Body: file,
				ACL: 'public-read',
			}, function(error, data) {
				if (error){
					reject(error)
				} else {
					resolve(data)
				}
			})
		})
	}

	uploadSTLFile(file, id){
		const s3 = this.s3
		const stlFolder = this.stlFolder
		return new Promise( function(resolve, reject) {
			s3.upload({
				Key: stlFolder + encodeURIComponent(id + '_' + file.name.replaceAll(' ', '%20')),
				Body: file,
				ACL: 'public-read-write',
			}, function(error, data) {
				if (error){
					reject(error)
				} else {
					resolve(data)
				}
			})
		})
	}

	retrieveAllSTLFiles() {
		const s3 = this.s3
		const stlFolder = this.stlFolder
		return new Promise( function(resolve, reject) {
			s3.listObjects({ Prefix: stlFolder }, function(error, data) {
				if (error) {
					reject(error) 
				} else {
					resolve(data)
				}
			})
		})
	}

	uploadGcodeFile(file, id){
		const s3 = this.s3
		const gCodeFolder = this.gCodeFolder
		return new Promise( function(resolve, reject) {
			s3.upload({
				Key: gCodeFolder + encodeURIComponent(id + '_' + file.name.replaceAll(' ', '%20')),
				Body: file,
				ACL: 'public-read-write',
			}, function(error, data) {
				if (error){
					reject(error)
				} else {
					resolve(data)
				}
			})
		})
	}

	retrieveAllGcodeFiles() {
		const s3 = this.s3
		const gCodeFolder = this.gCodeFolder
		return new Promise( function(resolve, reject) {
			s3.listObjects({ Prefix: gCodeFolder }, function(error, data) {
				if (error) {
					reject(error) 
				} else {
					resolve(data)
				}
			})
		})
	}

	downloadS3Object(key) {
		const s3 = this.s3
		return new Promise( function(resolve, reject) {
			s3.getObject({ Key: key }, function(error, data) {
				if (error) {
					reject(error)
				} else {
					resolve(data)
				}
			})
		})
	}

}

export default AWSHandler

String.prototype.replaceAll = function(str1, str2, ignore) {
	// eslint-disable-next-line
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,'\\$&'),(ignore?'gi':'g')),(typeof(str2)=='string')?str2.replace(/\$/g,'$$$$'):str2)
}