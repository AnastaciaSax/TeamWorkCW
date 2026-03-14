const PhotoService = require('../photoService');
const PhotoRepository = require('../../repositories/photoRepository');

jest.mock('../../repositories/photoRepository');

describe('PhotoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPhotos', () => {
    it('should return photos for pet', async () => {
      const mockPhotos = [{ id_photo: 1, photo_url: 'url' }];
      PhotoRepository.findByPetId.mockResolvedValue(mockPhotos);

      const result = await PhotoService.getPhotos(1);
      expect(result).toEqual(mockPhotos);
      expect(PhotoRepository.findByPetId).toHaveBeenCalledWith(1);
    });
  });

  describe('createPhoto', () => {
    it('should create and return photo', async () => {
      const data = { id_pet: 1, photo_url: 'url' };
      const saved = { id_photo: 1, ...data };
      PhotoRepository.create.mockResolvedValue(saved);

      const result = await PhotoService.createPhoto(data);
      expect(result).toEqual(saved);
      expect(PhotoRepository.create).toHaveBeenCalledWith(data);
    });

    it('should throw if photo_url missing', async () => {
      await expect(PhotoService.createPhoto({ id_pet: 1 })).rejects.toThrow('Photo filename is required');
    });
  });

  describe('deletePhoto', () => {
    it('should delete and return message', async () => {
      PhotoRepository.delete.mockResolvedValue({ id_photo: 1 });
      const result = await PhotoService.deletePhoto(1);
      expect(result).toEqual({ message: 'Photo deleted' });
      expect(PhotoRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      PhotoRepository.delete.mockResolvedValue(null);
      await expect(PhotoService.deletePhoto(999)).rejects.toThrow('Photo not found');
    });
  });
});