import { fetchReports, createReport } from '../../server/lib/reports';

export const handler = async (event: any) => {
  if (event.httpMethod === 'GET') {
    const res = await fetchReports();
    return { statusCode: 200, body: JSON.stringify(res) };
  } else if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const res = await createReport(body);
      return { statusCode: res.success ? 201 : 500, body: JSON.stringify(res) };
    } catch (e: any) {
      return { statusCode: 400, body: JSON.stringify({ error: e.message }) };
    }
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
};
