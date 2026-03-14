const PassportRepository = require('../repositories/passportRepository');
const VaccinationRepository = require('../repositories/vaccinationRepository');

class PassportService {
  async getPassportByPetId(petId) {
    return await PassportRepository.findByPetId(petId);
  }

  async searchPassport(number) {
    const passport = await PassportRepository.searchByNumber(number);
    if (!passport) throw new Error('Passport not found');
    return passport;
  }

  async createPassport(data) {
    return await PassportRepository.create(data);
  }

  async deletePassport(id) {
    const passport = await PassportRepository.delete(id);
    if (!passport) throw new Error('Passport not found');
    return { message: 'Passport deleted' };
  }
}

module.exports = new PassportService();