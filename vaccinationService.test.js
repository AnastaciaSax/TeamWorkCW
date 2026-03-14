const VaccinationService = require('../vaccinationService');
const VaccinationRepository = require('../../repositories/vaccinationRepository');

jest.mock('../../repositories/vaccinationRepository');

describe('VaccinationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getVaccinations', () => {
    it('should return vaccinations for passport', async () => {
      const mockVaccs = [{ id_vaccination: 1, vaccine_name: 'Rabies' }];
      VaccinationRepository.findByPassportId.mockResolvedValue(mockVaccs);

      const result = await VaccinationService.getVaccinations(1);
      expect(result).toEqual(mockVaccs);
      expect(VaccinationRepository.findByPassportId).toHaveBeenCalledWith(1);
    });
  });

  describe('createVaccination', () => {
    it('should create and return vaccination', async () => {
      const data = { id_passport: 1, id_vaccine: 1, vaccination_date: '2023-06-01', expiration_date: '2024-06-01' };
      // Возвращаем объекты Date, созданные от UTC-строк
      const saved = {
        id_vaccination: 1,
        ...data,
        vaccination_date: new Date('2023-06-01T00:00:00Z'),
        expiration_date: new Date('2024-06-01T00:00:00Z')
      };
      VaccinationRepository.create.mockResolvedValue(saved);

      const result = await VaccinationService.createVaccination(data);
      expect(result.id_vaccination).toBe(1);
      // Извлекаем дату из ISO-строки
      expect(result.vaccination_date.toISOString().split('T')[0]).toBe('2023-06-01');
      expect(result.expiration_date.toISOString().split('T')[0]).toBe('2024-06-01');
      expect(VaccinationRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe('updateVaccination', () => {
    it('should update and return vaccination', async () => {
      const data = { notes: 'updated' };
      const updated = { id_vaccination: 1, ...data };
      VaccinationRepository.update.mockResolvedValue(updated);

      const result = await VaccinationService.updateVaccination(1, data);
      expect(result).toEqual(updated);
      expect(VaccinationRepository.update).toHaveBeenCalledWith(1, data);
    });

    it('should throw if not found', async () => {
      VaccinationRepository.update.mockResolvedValue(null);
      await expect(VaccinationService.updateVaccination(999, {})).rejects.toThrow('Vaccination not found');
    });
  });

  describe('deleteVaccination', () => {
    it('should delete and return message', async () => {
      VaccinationRepository.delete.mockResolvedValue({ id_vaccination: 1 });
      const result = await VaccinationService.deleteVaccination(1);
      expect(result).toEqual({ message: 'Vaccination deleted' });
      expect(VaccinationRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      VaccinationRepository.delete.mockResolvedValue(null);
      await expect(VaccinationService.deleteVaccination(999)).rejects.toThrow('Vaccination not found');
    });
  });
});