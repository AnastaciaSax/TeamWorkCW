const PetRepository = require('../repositories/petRepository');
const OwnerRepository = require('../repositories/ownerRepository');
const BreedRepository = require('../repositories/breedRepository');

class PetService {
  async getPets(params) {
    const {
      page = 1,
      limit = 12,
      search = '',
      animalTypeId,
      breedId,
      gender,
      ageGroup,
      sortBy = 'pet_name',
      sortOrder = 'asc',
    } = params;

    const offset = (page - 1) * limit;
    const values = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      values.push(`%${search}%`);
      whereClause += ` AND Pet.pet_name ILIKE $${values.length}`;
    }
    if (animalTypeId) {
      values.push(animalTypeId);
      whereClause += ` AND Breed.id_animal_type = $${values.length}`;
    }
    if (breedId) {
      values.push(breedId);
      whereClause += ` AND Pet.id_breed = $${values.length}`;
    }
    if (gender) {
      values.push(gender);
      whereClause += ` AND Pet.gender = $${values.length}`;
    }
    if (ageGroup) {
      if (ageGroup === 'puppy') {
        whereClause += ` AND Pet.birthdate > (CURRENT_DATE - INTERVAL '1 year')`;
      } else if (ageGroup === 'young') {
        whereClause += ` AND Pet.birthdate <= (CURRENT_DATE - INTERVAL '1 year') AND Pet.birthdate > (CURRENT_DATE - INTERVAL '3 years')`;
      } else if (ageGroup === 'adult') {
        whereClause += ` AND Pet.birthdate <= (CURRENT_DATE - INTERVAL '3 years')`;
      }
    }

    const total = await PetRepository.count(whereClause, values);
    const data = await PetRepository.findAll(whereClause, values, sortBy, sortOrder, limit, offset);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPetById(id) {
    const pet = await PetRepository.findById(id);
    if (!pet) throw new Error('Pet not found');
    return pet;
  }

  async createPet(data) {
    // проверка существования владельца и породы
    const owner = await OwnerRepository.findById(data.id_owner);
    if (!owner) throw new Error('Owner not found');
    const breed = await BreedRepository.findById(data.id_breed);
    if (!breed) throw new Error('Breed not found');

    return await PetRepository.create(data);
  }

  async updatePet(id, data) {
    // аналогично можно проверить владельца и породу при желании
    const pet = await PetRepository.update(id, data);
    if (!pet) throw new Error('Pet not found');
    return pet;
  }

  async deletePet(id) {
    const pet = await PetRepository.delete(id);
    if (!pet) throw new Error('Pet not found');
    return { message: 'Pet deleted successfully' };
  }
}

module.exports = new PetService();