const AnalyticsService = require('../analyticsService');
const pool = require('../../config/db');

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return summary counts', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: 5 }] }) // owners
        .mockResolvedValueOnce({ rows: [{ count: 10 }] }) // pets
        .mockResolvedValueOnce({ rows: [{ count: 2 }] }); // expiring

      const result = await AnalyticsService.getSummary();
      expect(result).toEqual({ owners: 5, pets: 10, expiringVaccinations: 2 });
    });
  });
});