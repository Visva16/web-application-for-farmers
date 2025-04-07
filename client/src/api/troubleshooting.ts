import api from './api';

// Description: Get client-side troubleshooting guide
// Endpoint: GET /api/troubleshooting/client
// Request: {}
// Response: {
//   title: string,
//   issues: Array<{
//     id: string,
//     title: string,
//     description: string,
//     steps: Array<{
//       title: string,
//       command: string,
//       description: string
//     }>
//   }>,
//   additionalResources: Array<{
//     title: string,
//     url: string
//   }>
// }
export const getClientTroubleshootingGuide = async () => {
  try {
    const response = await api.get('/api/troubleshooting/client');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};