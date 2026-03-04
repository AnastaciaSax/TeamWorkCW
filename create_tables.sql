-- Листинг 1. Скрипт создания таблиц для PostgreSQL 18
CREATE TABLE Animal_Type (
    id_type SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL
);

CREATE TABLE Breed (
    id_breed SERIAL PRIMARY KEY,
    breed_name VARCHAR(50) NOT NULL,
    id_animal_type INTEGER NOT NULL,
    FOREIGN KEY (id_animal_type) REFERENCES Animal_Type(id_type)
);

CREATE TABLE Owner (
    id_owner SERIAL PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    address VARCHAR(200)
);

CREATE TABLE Pet (
    id_pet SERIAL PRIMARY KEY,
    pet_name VARCHAR(50) NOT NULL,
    birthdate DATE,
    gender VARCHAR(10),
    unique_traits TEXT,
    id_owner INTEGER NOT NULL,
    id_breed INTEGER NOT NULL,
    FOREIGN KEY (id_owner) REFERENCES Owner(id_owner),
    FOREIGN KEY (id_breed) REFERENCES Breed(id_breed)
);

CREATE TABLE Pet_Passport (
    id_passport SERIAL PRIMARY KEY,
    issue_date DATE NOT NULL,
    id_pet INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (id_pet) REFERENCES Pet(id_pet) ON DELETE CASCADE
);

CREATE TABLE Vaccine (
    id_vaccine SERIAL PRIMARY KEY,
    vaccine_name VARCHAR(100) NOT NULL
);

CREATE TABLE Vaccination (
    id_vaccination SERIAL PRIMARY KEY,
    id_passport INTEGER NOT NULL,
    id_vaccine INTEGER NOT NULL,
    vaccination_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (id_passport) REFERENCES Pet_Passport(id_passport) ON DELETE CASCADE,
    FOREIGN KEY (id_vaccine) REFERENCES Vaccine(id_vaccine)
);

CREATE TABLE Photo (
    id_photo SERIAL PRIMARY KEY,
    id_pet INTEGER NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    upload_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id_pet) REFERENCES Pet(id_pet) ON DELETE CASCADE
);

CREATE TABLE Medical_Record (
    id_record SERIAL PRIMARY KEY,
    id_pet INTEGER NOT NULL,
    record_date DATE NOT NULL,
    record_type VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (id_pet) REFERENCES Pet(id_pet) ON DELETE CASCADE
);

CREATE TABLE Special_Need (
    id_need SERIAL PRIMARY KEY,
    id_pet INTEGER NOT NULL,
    need_type VARCHAR(50) NOT NULL,
    description TEXT,
    FOREIGN KEY (id_pet) REFERENCES Pet(id_pet) ON DELETE CASCADE
);