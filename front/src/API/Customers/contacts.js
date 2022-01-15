import { url } from "../../constants/constants";
import axios from "axios";
import { token } from "../utils";

const getCustomerContacts = async () =>
  axios.get(`${url}/customers/contacts`, {
    headers: { Authorization: `Bearer ${token()}` },
  });

export { getCustomerContacts };
