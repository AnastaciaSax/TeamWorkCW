const OwnerService = require('../ownerService');
const OwnerRepository = require('../../repositories/ownerRepository');

// Mock the repository
jest.mock('../../repositories/ownerRepository');

describe('OwnerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOwners', () => {
    it('should call repository with correct parameters and return paginated result', async () => {
      const mockParams = { page: 2, limit: 5, search: 'john', sortBy: 'owner_name', sortOrder: 'asc' };
      const mockCount = 10;
      const mockData = [{ id: 1, owner_name: 'John' }];

      OwnerRepository.count.mockResolvedValue(mockCount);
      OwnerRepository.findAll.mockResolvedValue(mockData);

      const result = await OwnerService.getOwners(mockParams);

      expect(OwnerRepository.count).toHaveBeenCalledWith('%john%');
      expect(OwnerRepository.findAll).toHaveBeenCalledWith(
        '%john%',
        'owner_name',
        'asc',
        5,
        5 // offset = (page-1)*limit = 5
      );
      expect(result).toEqual({
        data: mockData,
        pagination: {
          page: 2,
          limit: 5,
          total: mockCount,
          totalPages: 2,
        },
      });
    });

    it('should handle default parameters', async () => {
      OwnerRepository.count.mockResolvedValue(0);
      OwnerRepository.findAll.mockResolvedValue([]);

      const result = await OwnerService.getOwners({});

      expect(OwnerRepository.count).toHaveBeenCalledWith('%%');
      expect(OwnerRepository.findAll).toHaveBeenCalledWith(
        '%%',
        'owner_name',
        'asc',
        10,
        0
      );
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('getOwnerById', () => {
    it('should return owner if found', async () => {
      const mockOwner = { id: 1, owner_name: 'John' };
      OwnerRepository.findById.mockResolvedValue(mockOwner);

      const result = await OwnerService.getOwnerById(1);
      expect(result).toEqual(mockOwner);
      expect(OwnerRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error if not found', async () => {
      OwnerRepository.findById.mockResolvedValue(null);

      await expect(OwnerService.getOwnerById(999)).rejects.toThrow('Owner not found');
    });
  });

  describe('createOwner', () => {
    it('should create and return owner', async () => {
      const mockData = { owner_name: 'John', phone: '+123456789' };
      const savedOwner = { id: 1, ...mockData };
      OwnerRepository.create.mockResolvedValue(savedOwner);

      const result = await OwnerService.createOwner(mockData);
      expect(result).toEqual(savedOwner);
      expect(OwnerRepository.create).toHaveBeenCalledWith(mockData);
    });
  });

  describe('updateOwner', () => {
    it('should update and return owner', async () => {
      const mockData = { owner_name: 'John Updated' };
      const updatedOwner = { id: 1, ...mockData };
      OwnerRepository.update.mockResolvedValue(updatedOwner);

      const result = await OwnerService.updateOwner(1, mockData);
      expect(result).toEqual(updatedOwner);
      expect(OwnerRepository.update).toHaveBeenCalledWith(1, mockData);
    });

    it('should throw error if owner not found', async () => {
      OwnerRepository.update.mockResolvedValue(null);

      await expect(OwnerService.updateOwner(999, {})).rejects.toThrow('Owner not found');
    });
  });

  describe('deleteOwner', () => {
    it('should delete owner if they have no pets', async () => {
      OwnerRepository.checkPets.mockResolvedValue([]);
      OwnerRepository.delete.mockResolvedValue({ id: 1 });

      const result = await OwnerService.deleteOwner(1);
      expect(result).toEqual({ message: 'Owner deleted successfully' });
      expect(OwnerRepository.checkPets).toHaveBeenCalledWith(1);
      expect(OwnerRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if owner has pets', async () => {
      OwnerRepository.checkPets.mockResolvedValue([{ id_pet: 1 }]);

      await expect(OwnerService.deleteOwner(1)).rejects.toThrow('Cannot delete owner with existing pets');
      expect(OwnerRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if owner not found', async () => {
      OwnerRepository.checkPets.mockResolvedValue([]);
      OwnerRepository.delete.mockResolvedValue(null);

      await expect(OwnerService.deleteOwner(999)).rejects.toThrow('Owner not found');
    });
  });
});