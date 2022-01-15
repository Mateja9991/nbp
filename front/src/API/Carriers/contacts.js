import { url } from "../../constants/constants";
import axios from "axios";
import { token } from "../utils";

const getCarrierContacts = async () =>
  axios.get(`${url}/carriers/contacts`, {
    headers: { Authorization: `Bearer ${token()}` },
  });

export { getCarrierContacts };
