const SpecialNeedRepository = require('../repositories/specialNeedRepository');

class SpecialNeedService {
  async getSpecialNeeds(petId) {
    return await SpecialNeedRepository.findByPetId(petId);
  }

  async createSpecialNeed(data) {
    return await SpecialNeedRepository.create(data);
  }

  async updateSpecialNeed(id, data) {
    const need = await SpecialNeedRepository.update(id, data);
    if (!need) throw new Error('Need not found');
    return need;
  }

  async deleteSpecialNeed(id) {
    const need = await SpecialNeedRepository.delete(id);
    if (!need) throw new Error('Need not found');
    return { message: 'Need deleted' };
  }
}

module.exports = new SpecialNeedService();