/*
 *
 * HomePage
 *
 */

import React, { memo, useState, useEffect, useMemo } from "react";
import ProvidersPage from "../Providers";
import { request, useNotification } from "@strapi/helper-plugin";
import { Button } from "@strapi/design-system/Button";
import { Option, Select } from "@strapi/design-system/Select";
import { ToggleCheckbox } from "@strapi/design-system/ToggleCheckbox";
import { getRequestURL } from "../../utils";

const HomePage = () => {
  const { data, isLoading, error, send } = useRequest("providers-steps");
  const {
    data: addData,
    isLoading: isLoadingAdd,
    error: errorAdd,
    send: sendAdd,
  } = useRequest("add-providers-step", "POST");
  const {
    data: removeData,
    isLoading: isLoadingRemove,
    error: errorRemove,
    send: sendRemove,
  } = useRequest("remove-providers-step", "POST");

  const [_defaultState, setDefaultState] = useState(null);
  const [currentProvidersList, setCurrentProvidersList] = useState(0);
  const toggleNotification = useNotification();
  useEffect(() => {
    send();
  }, [addData, removeData]);

  return (
    <div style={{ marginTop: 120 }}>
      <div>Количество шагов: {(data || []).length}</div>
      <Button onClick={() => sendAdd({})}>Добавить</Button>
      <Button onClick={() => sendRemove({})}>Убрать</Button>
      <div>Включить 2х-факторную аутентификацию по умолчанию</div>
      <ToggleCheckbox
        onLabel={"treue"}
        offLabel={"Off"}
        name="toggle"
        value={!!_defaultState}
        onChange={(value) => {
          setDefaultState(value);
        }}
      >
        <></>
      </ToggleCheckbox>
      <Select
        name="select"
        onChange={(value) => {
          setCurrentProvidersList(value);
        }}
        value={currentProvidersList}
      >
        {(data || []).map((it, index) => (
          <Option value={index}> {index}</Option>
        ))}
      </Select>

      <ProvidersPage step={currentProvidersList} />
    </div>
  );
};

export default memo(HomePage);
export const useRequest = (endPoint, method = "GET") => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(null);
  const send = useMemo(() => (body) => setSending({ body }), [setSending]);
  useEffect(() => {
    if (sending) {
      setSending(false);
      (async () => {
        setIsLoading(true);
        try {
          const _data = await request(getRequestURL(endPoint), {
            method,
            body: sending.body,
          });
          setIsLoading(false);
          setData(_data);
        } catch (e) {
          setIsLoading(false);
          setError(e);
        }
      })();
    }
  }, [sending]);
  return { data, isLoading, error, send };
};
