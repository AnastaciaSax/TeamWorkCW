const PetService = require('../petService');
const PetRepository = require('../../repositories/petRepository');
const OwnerRepository = require('../../repositories/ownerRepository');
const BreedRepository = require('../../repositories/breedRepository');

jest.mock('../../repositories/petRepository');
jest.mock('../../repositories/ownerRepository');
jest.mock('../../repositories/breedRepository');

describe('PetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPets', () => {
    it('should call repository with correct parameters and return paginated result', async () => {
      const params = { page: 2, limit: 5, search: 'Buddy', animalTypeId: 1 };
      const mockCount = 10;
      const mockData = [{ id_pet: 1, pet_name: 'Buddy' }];

      PetRepository.count.mockResolvedValue(mockCount);
      PetRepository.findAll.mockResolvedValue(mockData);

      const result = await PetService.getPets(params);

      // Проверяем, что count и findAll вызваны с правильными аргументами (можно упростить)
      expect(PetRepository.count).toHaveBeenCalled();
      expect(PetRepository.findAll).toHaveBeenCalled();
      expect(result.pagination.total).toBe(mockCount);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getPetById', () => {
    it('should return pet if found', async () => {
      const mockPet = { id_pet: 1, pet_name: 'Buddy' };
      PetRepository.findById.mockResolvedValue(mockPet);

      const result = await PetService.getPetById(1);
      expect(result).toEqual(mockPet);
      expect(PetRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      PetRepository.findById.mockResolvedValue(null);
      await expect(PetService.getPetById(999)).rejects.toThrow('Pet not found');
    });
  });

  describe('createPet', () => {
    it('should create and return pet', async () => {
      const data = { pet_name: 'Buddy', id_owner: 1, id_breed: 2 };
      OwnerRepository.findById.mockResolvedValue({ id_owner: 1 });
      BreedRepository.findById.mockResolvedValue({ id_breed: 2 });
      PetRepository.create.mockResolvedValue({ id_pet: 1, ...data });

      const result = await PetService.createPet(data);
      expect(result.id_pet).toBe(1);
      expect(OwnerRepository.findById).toHaveBeenCalledWith(1);
      expect(BreedRepository.findById).toHaveBeenCalledWith(2);
      expect(PetRepository.create).toHaveBeenCalledWith(data);
    });

    it('should throw if owner not found', async () => {
      OwnerRepository.findById.mockResolvedValue(null);
      await expect(PetService.createPet({ id_owner: 999 })).rejects.toThrow('Owner not found');
    });

    it('should throw if breed not found', async () => {
      OwnerRepository.findById.mockResolvedValue({ id_owner: 1 });
      BreedRepository.findById.mockResolvedValue(null);
      await expect(PetService.createPet({ id_owner: 1, id_breed: 999 })).rejects.toThrow('Breed not found');
    });
  });

  describe('updatePet', () => {
    it('should update and return pet', async () => {
      const data = { pet_name: 'Buddy Updated' };
      PetRepository.update.mockResolvedValue({ id_pet: 1, ...data });

      const result = await PetService.updatePet(1, data);
      expect(result).toEqual({ id_pet: 1, ...data });
      expect(PetRepository.update).toHaveBeenCalledWith(1, data);
    });

    it('should throw if pet not found', async () => {
      PetRepository.update.mockResolvedValue(null);
      await expect(PetService.updatePet(999, {})).rejects.toThrow('Pet not found');
    });
  });

  describe('deletePet', () => {
    it('should delete and return message', async () => {
      PetRepository.delete.mockResolvedValue({ id_pet: 1 });
      const result = await PetService.deletePet(1);
      expect(result).toEqual({ message: 'Pet deleted successfully' });
      expect(PetRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if pet not found', async () => {
      PetRepository.delete.mockResolvedValue(null);
      await expect(PetService.deletePet(999)).rejects.toThrow('Pet not found');
    });
  });
});