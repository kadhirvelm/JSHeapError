import { mapObjIndexed, values, sort, map, filter } from 'ramda'

const removeDisplay = ( template ) => { return template.display !== 'none' }

const addNameField = (value, key) => { value['name'] = key; return value }

const sort_order = (a, b) => { return a.order - b.order }

const getRequired = (template) => { return template.required ? template.name : '' }

export function renderFields(props, createFields) {
	const removedDisplay = filter(removeDisplay, props.fields)
	const mappedFields = mapObjIndexed(addNameField, removedDisplay)
	const sorted_fields = sort(sort_order, values(mappedFields))
	const fields = map(createFields, sorted_fields)
	const requiredFields = map(getRequired, sorted_fields)
	return [ fields, requiredFields ]
}