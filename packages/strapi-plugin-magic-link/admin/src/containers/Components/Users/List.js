import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'

import {useNotification} from '@strapi/helper-plugin';

const BaselineAlignment = styled.div`
  padding-top: 3.4rem;
`;

import {
  //BaselineAlignment,
  useQuery,
  request,
  LoadingIndicatorPage,
  DynamicTable,
} from '@strapi/helper-plugin'
import {useHistory, useLocation} from 'react-router-dom'
import {Button, Flex, Padded, Text, Picker, Table} from '@buffetjs/core'

import {Footer, Filter, FilterPicker, SortPicker} from './index'
import getFilters from '../utils/getFilters'
import init from './init'
import {initialState, reducer} from './reducer'
import styled from 'styled-components'

const ListPage = () => {
  const query = useQuery()
  const {push} = useHistory()
  const {search} = useLocation()
  const filters = useMemo(() => {
    return getFilters(search)
  }, [search])

  const [
    {
      data,
      isLoading,
      pagination: {total, pageCount},
    },
    dispatch,
  ] = useReducer(reducer, initialState, init)
  const pageSize = parseInt(query.get('pageSize') || 10, 10)
  const page = parseInt(query.get('page') || 0, 10)
  const _sort = decodeURIComponent(query.get('_sort'))
  const _q = decodeURIComponent(query.get('_q') || '')
  const getDataRef = useRef()
  const toggleNotification = useNotification();

  getDataRef.current = async () => {
    // Show the loading state and reset the state
    dispatch({
      type: 'GET_DATA',
    })
    try {
      const {
        results,
        pagination,
      } = await request(
        `/content-manager/collection-types/plugin::users-permissions.user${search}`,
        {method: 'GET'},
      )
      console.log(pagination)

      dispatch({
        type: 'GET_DATA_SUCCEEDED',
        data: results,
        pagination,
      })
    } catch (err) {
      console.error(err.response)
      console.log({
        type: 'warning',
        message: {id: 'notification.error'},
      })
    }
  }

  const handleChangeFilter = ({filter, name, value}) => {
    const filterName = `${name}${filter}`

    updateSearchParams(filterName, encodeURIComponent(value), true)
  }

  const handleChangeFooterParams = ({target: {name, value}}) => {
    let paramName = name.split('.')[1].replace('_', '')

    if (paramName === 'limit') {
      paramName = 'pageSize'
    }

    updateSearchParams(paramName, value)
  }

  const handleChangeSort = ({target: {name, value}}) => {
    updateSearchParams(name, value)
  }

  const handleClickDeleteFilter = ({target: {name}}) => {
    const currentSearch = new URLSearchParams(search)

    currentSearch.delete(name)

    push({search: currentSearch.toString()})
  }

  useEffect(() => {
    getDataRef.current()
  }, [search])

  const updateSearchParams = (name, value, shouldDeleteSearch = false) => {
    const currentSearch = new URLSearchParams(search)
    // Update the currentSearch
    currentSearch.set(name, value)

    if (shouldDeleteSearch) {
      currentSearch.delete('_q')
    }

    push({
      search: currentSearch.toString(),
    })
  }
  useEffect(() => {
    !search &&
    push({
      search: 'pageSize=10&page=1',
    })
  }, [search])

  if (isLoading) {
    return <LoadingIndicatorPage/>
  }

  const adapterComponent =
    ({id}) => {
      return (
        <Button
          label={'Generate'}
          onClick={() =>
            request(`/auth-link/${id}`, {method: 'GET'})
              .then((request) =>
                navigator.clipboard.writeText(request.magicLink.magicLink),
              )
              .then(() => {

                toggleNotification({
                  type: 'success',
                  message: {
                    id: 'Magic link copied to clipboard',
                    message: 'Magic link copied to clipboard',
                  },
                })
              })
              .catch((err) =>
                toggleNotification({
                  type: 'warning',
                  message: {
                    id: err.toString(),
                    message: 'Magic link copied to clipboard',
                  },
                }),
              )
          }
        />
      )
    }

  const headers = [
    {
      name: 'id',
      value: 'id',
    },
    {
      name: 'username',
      value: 'username',
    },
    {
      name: 'email',
      value: 'email',
    },
    {
      name: 'roles',
      value: 'roles',
    },
    {
      // eslint-disable-next-line react/prop-types
      cellAdapter: adapterComponent,
      name: 'generate link',
      value: 'id',
    },

  ]

  return (
    <div>
      <Flex flexWrap="wrap">
        <Table isLoading={isLoading} rows={data} headers={headers}/>
        <Footer
          pagination={{"total": total, "pageSize": pageSize, "page": page, "pageCount": pageCount}}></Footer>
      </Flex>
    </div>
  )

}

const ActiveStatus = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-bottom: 2px;
    margin-right: 10px;
    border-radius: 50%;
    background-color: ${({isActive}) => (isActive ? '#38cd29' : '#f64d0a')};
  }
`

export default ListPage
