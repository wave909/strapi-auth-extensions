/*
 *
 * HomePage
 *
 */

import React, {memo, useEffect} from 'react'
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId'

import ListPage from '../Components/Users/List'

const HomePage = (props) => {
  return (
    <div
      style={{
        paddingTop: 18,
        paddingLeft: 30,
        paddingBottom: 66,
        paddingRight: 30,
      }}
    >
      <h1>{pluginId}&apos;s Page</h1>
      <p>Click generate to generate new auth-link for the user. Link is copied to clipboard.</p>
      <p></p>
      <ListPage/>
    </div>
  )
}

export default memo(HomePage)
