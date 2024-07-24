import axios, { HttpStatusCode } from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
