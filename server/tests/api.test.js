const request = require('supertest');
const app = require('../index');

describe('Server API Endpoints', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('ok');
        expect(res.body.message).toEqual('Server is healthy');
    });

    it('POST /api/check-crib should return "blacklisted" for 9000-inclusive CRIB number', async () => {
        const res = await request(app)
            .post('/api/check-crib')
            .send({ cribNumber: '1239000123' });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('blacklisted');
    });
    
    it('POST /api/check-crib should return "error" for invalid CRIB string', async () => {
        const res = await request(app)
            .post('/api/check-crib')
            .send({ cribNumber: '123' });
        
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual('error');
    });

    it('POST /api/calculate-emi should correctly calculate EMI', async () => {
        const res = await request(app)
            .post('/api/calculate-emi')
            .send({ amount: 100000, rate: 12, tenure: 12 });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('success');
        expect(res.body.emi).toBeDefined();
        // roughly 8885
        expect(res.body.emi).toBeGreaterThan(8800);
        expect(res.body.emi).toBeLessThan(8900);
    });
});
