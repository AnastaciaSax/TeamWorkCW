-- 1. Animal_Type (виды животных)
INSERT INTO Animal_Type (type) VALUES
    ('Cat'),
    ('Dog'),
    ('Hamster');

-- 2. Vaccine (вакцины)
INSERT INTO Vaccine (vaccine_name) VALUES
    ('Rabies Vaccine'),
    ('Distemper Vaccine'),
    ('Parvovirus Vaccine'),
    ('Bordetella Vaccine'),
    ('Leptospirosis Vaccine');

-- 3. Owner (владельцы)
INSERT INTO Owner (owner_name, phone, email, address) VALUES
    ('John Smith', '+1-212-555-1234', 'john.smith@email.com', '123 Main St, New York, NY 10001'),
    ('Emily Johnson', '+1-310-555-5678', 'emily.j@email.com', '456 Oak Ave, Los Angeles, CA 90001'),
    ('Michael Brown', '+1-415-555-9012', 'michael.b@email.com', '789 Pine St, San Francisco, CA 94101'),
    ('Jessica Davis', '+1-305-555-3456', 'jessica.d@email.com', '321 Elm St, Miami, FL 33101'),
    ('David Wilson', '+1-713-555-7890', 'david.w@email.com', '654 Maple Dr, Houston, TX 77001'),
    ('Sarah Miller', '+1-312-555-2345', 'sarah.m@email.com', '987 Cedar Ln, Chicago, IL 60601'),
    ('James Taylor', '+1-206-555-6789', 'james.t@email.com', '147 Birch St, Seattle, WA 98101'),
    ('Linda Anderson', '+1-617-555-0123', 'linda.a@email.com', '258 Spruce Ave, Boston, MA 02101'),
    ('Robert Thomas', '+1-404-555-4567', 'robert.t@email.com', '369 Willow Rd, Atlanta, GA 30301'),
    ('Patricia Jackson', '+1-303-555-8901', 'patricia.j@email.com', '753 Aspen Ct, Denver, CO 80201');

-- 4. Breed (породы) – привязка к Animal_Type
INSERT INTO Breed (breed_name, id_animal_type) VALUES
    ('Siamese', 1),   -- Cat
    ('Persian', 1),
    ('Maine Coon', 1),
    ('Labrador Retriever', 2), -- Dog
    ('German Shepherd', 2),
    ('Golden Retriever', 2),
    ('Bulldog', 2),
    ('Syrian Hamster', 3), -- Hamster
    ('Dwarf Hamster', 3);

-- 5. Pet (животные)
INSERT INTO Pet (pet_name, birthdate, gender, unique_traits, id_owner, id_breed) VALUES
    ('Whiskers', '2020-03-15', 'Male', 'White with gray patches', 1, 1),
    ('Mittens', '2019-07-22', 'Female', 'Black with white paws', 1, 2),
    ('Buddy', '2018-11-05', 'Male', 'Golden fur, very friendly', 2, 6),
    ('Luna', '2021-01-10', 'Female', 'Black lab, energetic', 2, 4),
    ('Max', '2017-05-20', 'Male', 'German shepherd, trained', 3, 5),
    ('Bella', '2020-09-12', 'Female', 'Small, loves cuddles', 4, 3),
    ('Charlie', '2019-12-03', 'Male', 'Bulldog with a snore', 5, 7),
    ('Daisy', '2022-02-28', 'Female', 'Hamster, brown and white', 6, 8),
    ('Oliver', '2021-06-17', 'Male', 'Siamese with blue eyes', 7, 1),
    ('Molly', '2018-08-30', 'Female', 'Golden retriever, senior', 8, 6),
    ('Hammy', '2023-01-05', 'Male', 'Dwarf hamster, very active', 9, 9),
    ('Sophie', '2020-10-10', 'Female', 'Persian cat, fluffy', 10, 2);

-- 6. Pet_Passport (ветеринарные паспорта)
INSERT INTO Pet_Passport (issue_date, id_pet) VALUES
    ('2020-04-01', 1),
    ('2019-08-15', 2),
    ('2018-12-10', 3),
    ('2021-02-20', 4),
    ('2017-06-05', 5),
    ('2020-10-01', 6),
    ('2020-01-15', 7),
    ('2022-03-10', 8),
    ('2021-07-01', 9),
    ('2018-09-15', 10),
    ('2023-02-01', 11),
    ('2020-11-20', 12);

-- 7. Vaccination (прививки)
INSERT INTO Vaccination (id_passport, id_vaccine, vaccination_date, expiration_date, notes) VALUES
    (1, 1, '2023-04-01', '2024-04-01', 'Rabies booster'),
    (1, 2, '2023-04-01', '2024-04-01', 'Distemper combo'),
    (2, 1, '2022-08-15', '2023-08-15', 'Annual rabies'),
    (2, 3, '2022-08-15', '2023-08-15', 'Parvo shot'),
    (3, 1, '2023-01-10', '2024-01-10', 'Rabies'),
    (3, 4, '2023-01-10', '2024-01-10', 'Bordetella'),
    (4, 1, '2022-02-20', '2023-02-20', 'Rabies'),
    (4, 5, '2022-02-20', '2023-02-20', 'Lepto'),
    (5, 1, '2023-06-05', '2024-06-05', 'Rabies'),
    (5, 2, '2023-06-05', '2024-06-05', 'DHPP'),
    (6, 1, '2023-10-01', '2024-10-01', 'Rabies'),
    (6, 3, '2023-10-01', '2024-10-01', 'Parvo'),
    (7, 1, '2023-01-15', '2024-01-15', 'Rabies'),
    (7, 4, '2023-01-15', '2024-01-15', 'Kennel cough'),
    (8, 1, '2023-03-10', '2024-03-10', 'Rabies (small dose)'),
    (9, 1, '2022-07-01', '2023-07-01', 'Rabies'),
    (10, 1, '2022-09-15', '2023-09-15', 'Rabies'),
    (10, 2, '2022-09-15', '2023-09-15', 'DHPP'),
    (11, 1, '2023-02-01', '2024-02-01', 'Rabies (hamster)'),
    (12, 1, '2022-11-20', '2023-11-20', 'Rabies');

-- 8. Photo (фотографии) – URL заглушки
INSERT INTO Photo (id_pet, photo_url, upload_date) VALUES
    (1, 'https://storage.example.com/pets/whiskers1.jpg', '2023-01-10'),
    (1, 'https://storage.example.com/pets/whiskers2.jpg', '2023-02-15'),
    (2, 'https://storage.example.com/pets/mittens1.jpg', '2022-05-20'),
    (3, 'https://storage.example.com/pets/buddy1.jpg', '2021-11-03'),
    (4, 'https://storage.example.com/pets/luna1.jpg', '2022-03-22'),
    (5, 'https://storage.example.com/pets/max1.jpg', '2023-04-18'),
    (6, 'https://storage.example.com/pets/bella1.jpg', '2022-12-01'),
    (7, 'https://storage.example.com/pets/charlie1.jpg', '2023-01-30'),
    (8, 'https://storage.example.com/pets/daisy1.jpg', '2023-05-05'),
    (9, 'https://storage.example.com/pets/oliver1.jpg', '2022-08-12'),
    (10, 'https://storage.example.com/pets/molly1.jpg', '2022-10-10'),
    (11, 'https://storage.example.com/pets/hammy1.jpg', '2023-03-01'),
    (12, 'https://storage.example.com/pets/sophie1.jpg', '2023-02-28');

-- 9. Medical_Record (медицинские записи)
INSERT INTO Medical_Record (id_pet, record_date, record_type, notes) VALUES
    (1, '2023-04-01', 'Vaccination', 'Routine rabies shot'),
    (1, '2022-04-01', 'Checkup', 'Annual wellness exam'),
    (2, '2022-08-15', 'Vaccination', 'Rabies and parvo'),
    (3, '2023-01-10', 'Vaccination', 'Booster'),
    (4, '2022-02-20', 'Vaccination', 'First shots'),
    (5, '2023-06-05', 'Checkup', 'Senior wellness'),
    (6, '2023-10-01', 'Vaccination', 'Annual'),
    (7, '2023-01-15', 'Vaccination', 'Kennel cough vaccine'),
    (8, '2023-03-10', 'Vaccination', 'Rabies'),
    (9, '2022-07-01', 'Checkup', 'Healthy'),
    (10, '2022-09-15', 'Vaccination', 'DHPP booster'),
    (11, '2023-02-01', 'Vaccination', 'First rabies'),
    (12, '2022-11-20', 'Checkup', 'Regular check');

-- 10. Special_Need (особые потребности)
INSERT INTO Special_Need (id_pet, need_type, description) VALUES
    (3, 'Diet', 'Grain-free food only'),
    (5, 'Medication', 'Daily joint supplement'),
    (7, 'Allergy', 'Allergic to chicken'),
    (10, 'Diet', 'Senior diet, soft food'),
    (12, 'Behavior', 'Needs extra attention, shy'),
    (2, 'Allergy', 'Allergic to dust mites');