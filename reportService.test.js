const ReportService = require('../reportService');
const pool = require('../../config/db');

// Мокаем pool.query
jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('animalsByType', () => {
    it('should return aggregated data', async () => {
      const mockRows = [{ type: 'Cat', count: 2 }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await ReportService.animalsByType();
      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('ownerReport', () => {
    it('should return owner and pets with vaccinations', async () => {
      // Мокаем несколько запросов
      pool.query
        .mockResolvedValueOnce({ rows: [{ id_owner: 1, owner_name: 'John' }] }) // ownerCheck
        .mockResolvedValueOnce({ rows: [{ id_pet: 1, pet_name: 'Buddy', id_passport: 1 }] }) // pets
        .mockResolvedValueOnce({ rows: [{ id_vaccination: 1, vaccine_name: 'Rabies' }] }); // vaccinations

      const result = await ReportService.ownerReport(1);
      expect(result.owner).toEqual({ id_owner: 1, owner_name: 'John' });
      expect(result.pets).toHaveLength(1);
      expect(result.pets[0].vaccinations).toHaveLength(1);
    });

    it('should throw if owner not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      await expect(ReportService.ownerReport(999)).rejects.toThrow('Owner not found');
    });
  });

  describe('expiringVaccinations', () => {
    it('should return list of expiring vaccinations', async () => {
      const mockRows = [{ pet_name: 'Buddy' }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await ReportService.expiringVaccinations(30);
      expect(result).toEqual(mockRows);
    });
  });

  describe('expiredVaccinations', () => {
    it('should return list of expired vaccinations', async () => {
      const mockRows = [{ pet_name: 'Old Buddy' }];
      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await ReportService.expiredVaccinations();
      expect(result).toEqual(mockRows);
    });
  });
});