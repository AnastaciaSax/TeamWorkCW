const PassportService = require('../passportService');
const PassportRepository = require('../../repositories/passportRepository');

jest.mock('../../repositories/passportRepository');

describe('PassportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPassportByPetId', () => {
    it('should return passport if found', async () => {
      const mockPassport = { id_passport: 1, issue_date: '2023-01-01' };
      PassportRepository.findByPetId.mockResolvedValue(mockPassport);

      const result = await PassportService.getPassportByPetId(1);
      expect(result).toEqual(mockPassport);
      expect(PassportRepository.findByPetId).toHaveBeenCalledWith(1);
    });
  });

  describe('searchPassport', () => {
    it('should return passport if found', async () => {
      const mockPassport = { id_passport: 1, pet_name: 'Buddy' };
      PassportRepository.searchByNumber.mockResolvedValue(mockPassport);

      const result = await PassportService.searchPassport(1);
      expect(result).toEqual(mockPassport);
      expect(PassportRepository.searchByNumber).toHaveBeenCalledWith(1);
    });

    it('should throw error if not found', async () => {
      PassportRepository.searchByNumber.mockResolvedValue(null);
      await expect(PassportService.searchPassport(999)).rejects.toThrow('Passport not found');
    });
  });

  describe('createPassport', () => {
    it('should create and return passport', async () => {
      const data = { id_pet: 1, issue_date: '2023-01-01' };
      const saved = { id_passport: 1, ...data };
      PassportRepository.create.mockResolvedValue(saved);

      const result = await PassportService.createPassport(data);
      expect(result).toEqual(saved);
      expect(PassportRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe('deletePassport', () => {
    it('should delete and return message', async () => {
      PassportRepository.delete.mockResolvedValue({ id_passport: 1 });
      const result = await PassportService.deletePassport(1);
      expect(result).toEqual({ message: 'Passport deleted' });
      expect(PassportRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      PassportRepository.delete.mockResolvedValue(null);
      await expect(PassportService.deletePassport(999)).rejects.toThrow('Passport not found');
    });
  });
});