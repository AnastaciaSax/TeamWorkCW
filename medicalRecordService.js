const MedicalRecordRepository = require('../repositories/medicalRecordRepository');

class MedicalRecordService {
  async getMedicalRecords(petId) {
    return await MedicalRecordRepository.findByPetId(petId);
  }

  async createMedicalRecord(data) {
    return await MedicalRecordRepository.create(data);
  }

  async updateMedicalRecord(id, data) {
    const record = await MedicalRecordRepository.update(id, data);
    if (!record) throw new Error('Record not found');
    return record;
  }

  async deleteMedicalRecord(id) {
    const record = await MedicalRecordRepository.delete(id);
    if (!record) throw new Error('Record not found');
    return { message: 'Record deleted' };
  }
}

module.exports = new MedicalRecordService();