import {axiosInstance} from '@strapi/plugin-users-permissions/admin/src/utils';
import {getRequestURL} from '../../../utils';

// eslint-disable-next-line import/prefer-default-export
export const fetchData = (pluginName, secondStep) => async (toggleNotification) => {
  try {
    const endPoint = `${secondStep ? "second-step-" : ""}providers/${pluginName}`

    const {data} = await axiosInstance.get(getRequestURL(endPoint));

    return data;
  } catch (err) {
    toggleNotification({
      type: 'warning',
      message: {id: 'notification.error'},
    });

    throw new Error('error');
  }
};

export const putProvider = (pluginName, secondStep) => body => {
  const endPoint = `${secondStep ? "second-step-" : ""}providers/${pluginName}`

  return axiosInstance.put(getRequestURL(endPoint), body);
};
