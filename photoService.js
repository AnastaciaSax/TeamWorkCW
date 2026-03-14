const PhotoRepository = require('../repositories/photoRepository');

class PhotoService {
  async getPhotos(petId) {
    return await PhotoRepository.findByPetId(petId);
  }

  async createPhoto(data) {
    if (!data.photo_url) throw new Error('Photo filename is required');
    return await PhotoRepository.create(data);
  }

  async deletePhoto(id) {
    const photo = await PhotoRepository.delete(id);
    if (!photo) throw new Error('Photo not found');
    return { message: 'Photo deleted' };
  }
}

module.exports = new PhotoService();