const DictionaryService = require('../dictionaryService');
const AnimalTypeRepository = require('../../repositories/animalTypeRepository');
const BreedRepository = require('../../repositories/breedRepository');
const VaccineRepository = require('../../repositories/vaccineRepository');

jest.mock('../../repositories/animalTypeRepository');
jest.mock('../../repositories/breedRepository');
jest.mock('../../repositories/vaccineRepository');

describe('DictionaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnimalTypes', () => {
    it('should return all animal types', async () => {
      const mockTypes = [{ id_type: 1, type: 'Cat' }];
      AnimalTypeRepository.findAll.mockResolvedValue(mockTypes);

      const result = await DictionaryService.getAnimalTypes();
      expect(result).toEqual(mockTypes);
      expect(AnimalTypeRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getBreeds', () => {
    it('should return breeds filtered by animalTypeId if provided', async () => {
      const mockBreeds = [{ id_breed: 1, breed_name: 'Siamese' }];
      BreedRepository.findAll.mockResolvedValue(mockBreeds);

      const result = await DictionaryService.getBreeds(1);
      expect(result).toEqual(mockBreeds);
      expect(BreedRepository.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('getVaccines', () => {
    it('should return all vaccines', async () => {
      const mockVaccines = [{ id_vaccine: 1, vaccine_name: 'Rabies' }];
      VaccineRepository.findAll.mockResolvedValue(mockVaccines);

      const result = await DictionaryService.getVaccines();
      expect(result).toEqual(mockVaccines);
      expect(VaccineRepository.findAll).toHaveBeenCalled();
    });
  });
});