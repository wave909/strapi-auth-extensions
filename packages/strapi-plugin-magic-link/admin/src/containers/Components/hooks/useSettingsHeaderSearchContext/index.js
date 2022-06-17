import {useContext} from 'react'
import {createContext} from 'react'

const SettingsHeaderSearchContext = createContext({})

const useSettingsHeaderSearchContext = () =>
  useContext(SettingsHeaderSearchContext)

export default useSettingsHeaderSearchContext
