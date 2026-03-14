const OwnerRepository = require('../repositories/ownerRepository');

class OwnerService {
  async getOwners(params) {
    const { page = 1, limit = 10, search = '', sortBy = 'owner_name', sortOrder = 'asc' } = params;
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;

    const total = await OwnerRepository.count(searchPattern);
    const data = await OwnerRepository.findAll(searchPattern, sortBy, sortOrder, limit, offset);

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

  async getOwnerById(id) {
    const owner = await OwnerRepository.findById(id);
    if (!owner) throw new Error('Owner not found');
    return owner;
  }

  async createOwner(data) {
    return await OwnerRepository.create(data);
  }

  async updateOwner(id, data) {
    const owner = await OwnerRepository.update(id, data);
    if (!owner) throw new Error('Owner not found');
    return owner;
  }

  async deleteOwner(id) {
    const pets = await OwnerRepository.checkPets(id);
    if (pets.length > 0) throw new Error('Cannot delete owner with existing pets');
    const owner = await OwnerRepository.delete(id);
    if (!owner) throw new Error('Owner not found');
    return { message: 'Owner deleted successfully' };
  }
}

module.exports = new OwnerService();