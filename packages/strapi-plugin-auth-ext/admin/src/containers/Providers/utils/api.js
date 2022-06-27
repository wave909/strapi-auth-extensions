import { axiosInstance } from "@strapi/plugin-users-permissions/admin/src/utils";
import { getRequestURL } from "../../../utils";

// eslint-disable-next-line import/prefer-default-export
export const fetchData = (step) => async (toggleNotification) => {
  try {
    const endPoint = `providers/${step}`;

    const { data } = await axiosInstance.get(getRequestURL(endPoint));

    return data;
  } catch (err) {
    toggleNotification({
      type: "warning",
      message: { id: "notification.error" },
    });

    throw new Error("error");
  }
};

export const putProvider = (step) => (body) => {
  const endPoint = `providers/${step}`;

  return axiosInstance.put(getRequestURL(endPoint), body);
};
