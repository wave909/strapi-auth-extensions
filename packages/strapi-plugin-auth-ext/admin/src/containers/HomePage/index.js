/*
 *
 * HomePage
 *
 */

import React, {memo, useState, useEffect, useMemo} from 'react';
import ProvidersPage from "../Providers";
import {request, useNotification} from "@strapi/helper-plugin"
import {Button} from '@strapi/design-system/Button';
import {Option, Select} from '@strapi/design-system/Select';
import {ToggleCheckbox} from '@strapi/design-system/ToggleCheckbox';
import {getRequestURL} from "../../utils";


const HomePage = () => {
  const {data, isLoading, error, send} = useRequest("providers-owners")
  const {
    data: model,
    isLoading: isModelLoading,
    error: modelError,
    send: sendPrepare
  } = useRequest("auth/prepare-user-model", "POST")
  const [_defaultState, setDefaultState] = useState(null)
  const [currentProvidersList, setCurrentProvidersList] = useState(1)
  const toggleNotification = useNotification()
  useEffect(() => {
    send()
  }, [])
  useEffect(() => {
    if (model) {
      toggleNotification({message: "Поля добавлены"})
    }
  }, [model])
  return (
    <div style={{marginTop: 120}}>
      <div>Включить 2х-факторную аутентификацию по умолчанию</div>
      <ToggleCheckbox onLabel={"treue"} offLabel={"Off"} name="toggle" value={!!_defaultState}
                      onChange={(value) => {
                        setDefaultState(value)
                      }}><></>
      </ToggleCheckbox>
      <Button isLoading={isModelLoading} onClick={() => sendPrepare({default: _defaultState})}>Добавить
        поля</Button>

      <Select
        name="select"
        onChange={(value) => {
          setCurrentProvidersList(value);
        }}

        value={currentProvidersList}>
        <Option value="1">1</Option>
        <Option value="2">2</Option>
      </Select>
      {data && data && data.map(owner => <>
        {owner}
        <ProvidersPage key={owner + ":" + currentProvidersList} pluginName={owner}
                       secondStep={currentProvidersList == 2}/>
      </>)}

    </div>
  );
};

export default memo(HomePage);
export const useRequest = (endPoint, method = "GET") => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(null)
  const send = useMemo(() => (body) => setSending({body}), [setSending])
  useEffect(() => {
    if (sending) {
      setSending(false);
      (async () => {
        setIsLoading(true)
        try {
          const _data = await request(getRequestURL(endPoint), {method, body: sending.body})
          setIsLoading(false)
          setData(_data)
        } catch (e) {
          setIsLoading(false)
          setError(e)
        }
      })()
    }
  }, [sending])
  return {data, isLoading, error, send}
}
