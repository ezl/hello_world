import axios from 'axios'

const API_URL = 'http://localhost:5001/api' // Update this if your backend is hosted elsewhere

export const createName = async (name) => {
  const response = await axios.post(`${API_URL}/names`, { name })
  return response.data
}

export const getNames = async () => {
  const response = await axios.get(`${API_URL}/names`)
  return response.data
}
