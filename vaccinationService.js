const VaccinationRepository = require('../repositories/vaccinationRepository');

class VaccinationService {
  async getVaccinations(passportId) {
    return await VaccinationRepository.findByPassportId(passportId);
  }

  async createVaccination(data) {
    return await VaccinationRepository.create(data);
  }

  async updateVaccination(id, data) {
    const vacc = await VaccinationRepository.update(id, data);
    if (!vacc) throw new Error('Vaccination not found');
    return vacc;
  }

  async deleteVaccination(id) {
    const vacc = await VaccinationRepository.delete(id);
    if (!vacc) throw new Error('Vaccination not found');
    return { message: 'Vaccination deleted' };
  }
}

module.exports = new VaccinationService();