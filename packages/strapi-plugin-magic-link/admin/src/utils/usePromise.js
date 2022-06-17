import {useCallback, useState} from 'react'

export const usePromise = (promiseFactory) => {
  const [status, setStatus] = useState({
    loading: false,
    errorMessage: null,
    value: null,
  })
  const request = useCallback(() => {
    setStatus({
      loading: true,
      errorMessage: null,
      statusCode: null,
      value: null,
    })
    promiseFactory()
      .then((response) => {
        setStatus({
          loading: false,
          errorMessage: null,
          value: response,
        })
      })
      .catch((error) => {
        setStatus({
          loading: false,
          errorMessage: error,
          value: null,
        })
      })
  }, [promiseFactory])

  return [status, request]
}
