const MedicalRecordService = require('../services/medicalRecordService');

exports.getMedicalRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecordService.getMedicalRecords(req.query.petId);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.createMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecordService.createMedicalRecord(req.body);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

exports.updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecordService.updateMedicalRecord(req.params.id, req.body);
    res.json(record);
  } catch (err) {
    if (err.message === 'Record not found') {
      return res.status(404).json({ error: 'Record not found' });
    }
    next(err);
  }
};

exports.deleteMedicalRecord = async (req, res, next) => {
  try {
    const result = await MedicalRecordService.deleteMedicalRecord(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Record not found') {
      return res.status(404).json({ error: 'Record not found' });
    }
    next(err);
  }
};