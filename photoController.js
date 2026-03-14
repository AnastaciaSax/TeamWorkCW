const PhotoService = require('../services/photoService');

exports.getPhotos = async (req, res, next) => {
  try {
    const photos = await PhotoService.getPhotos(req.query.petId);
    res.json(photos);
  } catch (err) {
    next(err);
  }
};

exports.createPhoto = async (req, res, next) => {
  try {
    const photo = await PhotoService.createPhoto(req.body);
    res.status(201).json(photo);
  } catch (err) {
    if (err.message === 'Photo filename is required') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const result = await PhotoService.deletePhoto(req.params.id);
    res.json(result);
  } catch (err) {
    if (err.message === 'Photo not found') {
      return res.status(404).json({ error: 'Photo not found' });
    }
    next(err);
  }
};