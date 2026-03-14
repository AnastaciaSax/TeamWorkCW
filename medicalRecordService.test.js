const MedicalRecordService = require('../medicalRecordService');
const MedicalRecordRepository = require('../../repositories/medicalRecordRepository');

jest.mock('../../repositories/medicalRecordRepository');

describe('MedicalRecordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMedicalRecords', () => {
    it('should return records for pet', async () => {
      const mockRecords = [{ id_record: 1, record_type: 'Checkup' }];
      MedicalRecordRepository.findByPetId.mockResolvedValue(mockRecords);

      const result = await MedicalRecordService.getMedicalRecords(1);
      expect(result).toEqual(mockRecords);
      expect(MedicalRecordRepository.findByPetId).toHaveBeenCalledWith(1);
    });
  });

  describe('createMedicalRecord', () => {
    it('should create and return record', async () => {
      const data = { id_pet: 1, record_date: '2023-01-01', record_type: 'Checkup' };
      const saved = { id_record: 1, ...data };
      MedicalRecordRepository.create.mockResolvedValue(saved);

      const result = await MedicalRecordService.createMedicalRecord(data);
      expect(result).toEqual(saved);
      expect(MedicalRecordRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe('updateMedicalRecord', () => {
    it('should update and return record', async () => {
      const data = { notes: 'updated' };
      const updated = { id_record: 1, ...data };
      MedicalRecordRepository.update.mockResolvedValue(updated);

      const result = await MedicalRecordService.updateMedicalRecord(1, data);
      expect(result).toEqual(updated);
      expect(MedicalRecordRepository.update).toHaveBeenCalledWith(1, data);
    });

    it('should throw if not found', async () => {
      MedicalRecordRepository.update.mockResolvedValue(null);
      await expect(MedicalRecordService.updateMedicalRecord(999, {})).rejects.toThrow('Record not found');
    });
  });

  describe('deleteMedicalRecord', () => {
    it('should delete and return message', async () => {
      MedicalRecordRepository.delete.mockResolvedValue({ id_record: 1 });
      const result = await MedicalRecordService.deleteMedicalRecord(1);
      expect(result).toEqual({ message: 'Record deleted' });
      expect(MedicalRecordRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      MedicalRecordRepository.delete.mockResolvedValue(null);
      await expect(MedicalRecordService.deleteMedicalRecord(999)).rejects.toThrow('Record not found');
    });
  });
});