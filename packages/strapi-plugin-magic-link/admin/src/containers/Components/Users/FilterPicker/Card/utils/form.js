const textFilters = [
  {
    id: 'components.FilterOptions.FILTER_TYPES.=',
    value: '',
  },
  {
    id: 'components.FilterOptions.FILTER_TYPES._ne',
    value: '_ne',
  },
  {
    id: 'components.FilterOptions.FILTER_TYPES._contains',
    value: '_contains',
  },
  {
    id: 'components.FilterOptions.FILTER_TYPES._containss',
    value: '_containss',
  },
]
const numberFilters = []
const form = {
  id: {
    type: 'number',
    defaultValue: '',
    allowedFilters: textFilters,
  },
  username: {
    type: 'text',
    defaultValue: '',
    allowedFilters: textFilters,
  },
  email: {
    type: 'email',
    defaultValue: '',
    allowedFilters: textFilters,
  },
}

export default form
