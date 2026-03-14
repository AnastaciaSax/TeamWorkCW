const AnimalTypeRepository = require('../repositories/animalTypeRepository');
const BreedRepository = require('../repositories/breedRepository');
const VaccineRepository = require('../repositories/vaccineRepository');

class DictionaryService {
  async getAnimalTypes() {
    return await AnimalTypeRepository.findAll();
  }

  async getBreeds(animalTypeId) {
    return await BreedRepository.findAll(animalTypeId);
  }

  async getVaccines() {
    return await VaccineRepository.findAll();
  }
}

module.exports = new DictionaryService();