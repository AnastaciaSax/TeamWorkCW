const SpecialNeedService = require('../specialNeedService');
const SpecialNeedRepository = require('../../repositories/specialNeedRepository');

jest.mock('../../repositories/specialNeedRepository');

describe('SpecialNeedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpecialNeeds', () => {
    it('should return special needs for pet', async () => {
      const mockNeeds = [{ id_need: 1, need_type: 'Diet', description: 'Grain-free' }];
      SpecialNeedRepository.findByPetId.mockResolvedValue(mockNeeds);

      const result = await SpecialNeedService.getSpecialNeeds(1);
      expect(result).toEqual(mockNeeds);
      expect(SpecialNeedRepository.findByPetId).toHaveBeenCalledWith(1);
    });
  });

  describe('createSpecialNeed', () => {
    it('should create and return special need', async () => {
      const data = { id_pet: 1, need_type: 'Medication', description: 'Daily pill' };
      const saved = { id_need: 1, ...data };
      SpecialNeedRepository.create.mockResolvedValue(saved);

      const result = await SpecialNeedService.createSpecialNeed(data);
      expect(result).toEqual(saved);
      expect(SpecialNeedRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe('updateSpecialNeed', () => {
    it('should update and return special need', async () => {
      const data = { description: 'Updated description' };
      const updated = { id_need: 1, need_type: 'Diet', description: 'Updated description' };
      SpecialNeedRepository.update.mockResolvedValue(updated);

      const result = await SpecialNeedService.updateSpecialNeed(1, data);
      expect(result).toEqual(updated);
      expect(SpecialNeedRepository.update).toHaveBeenCalledWith(1, data);
    });

    it('should throw if not found', async () => {
      SpecialNeedRepository.update.mockResolvedValue(null);
      await expect(SpecialNeedService.updateSpecialNeed(999, {})).rejects.toThrow('Need not found');
    });
  });

  describe('deleteSpecialNeed', () => {
    it('should delete and return message', async () => {
      SpecialNeedRepository.delete.mockResolvedValue({ id_need: 1 });
      const result = await SpecialNeedService.deleteSpecialNeed(1);
      expect(result).toEqual({ message: 'Need deleted' });
      expect(SpecialNeedRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      SpecialNeedRepository.delete.mockResolvedValue(null);
      await expect(SpecialNeedService.deleteSpecialNeed(999)).rejects.toThrow('Need not found');
    });
  });
});