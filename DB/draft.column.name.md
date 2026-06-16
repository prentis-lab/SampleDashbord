# Sample Metadata Columns

|belongs| Column Name              | Description                                                                 | Example                                      |
|-|--------------------------|-----------------------------------------------------------------------------|----------------------------------------------|
|sequence/data (molecule)| mollecure                   | DNA / RNA  (unsorted as warning)                                                   | dna                                          |
|sequence/data (library)| library type          | illumina / nanopore / HiFi / pacbio / rnaseq / unknown                     | illumina                                     |
|-| group                    | citrus / mango / others                                                     | citrus                                       |
| sample (sampleName)| sample_name              | Any pattern                                                                 | Juice vesicle cell line #1                   |
| sample (notes)| notes              | more sample info note                                                            | Juice vesicle cell line #1                   |
| plant (displayName etc) |parent_1                 | Parent 1                                                                    | Murcott (irradiated)                         |
| plant (subType, irradiationDose etc)| parent_2                 | Parent 2 (both, single, or empty)                                           | .                                            |
| plant (taxon or GenusSpecies)| species/variety          | Species or variety (more specific than group)                               | Citrus reticulata (21465)                    |
| phenotype | phenotype/treatment      | Phenotype or treatment    (need flixible for more treatment)                                                  | Susceptible                                  |
| sample (tissue or tissueFrom)| tissue_sampled           | leaf / stem / flower / root / seed / callus / fruit                        | Callus                                       |
| sample (collectOn)| date                     | when the sample collected                | 45717                                        |
|-| data_location            | Sequence data location (file system path)                                   | /work/ePGL/sequencing/dna/illumina/citrus/NGS_647_Maiko |
|-| file_prefix              | Meaningful and unique file prefix      (follow pattern)                                     | Maiko_1_S1                                   |
|-| project_leaders          | Project leaders (multiple allowed)                                          | Andrew Miles; Alexie Papanicolaou; Peter Prentis |
|-| project_investigators    | Project investigators (first.last format, auto-created from email)          | Maiko Kato / Zachary Stewart                 |
|-| project_id               | Project identifier                                                          | MaikoHistogenLayers                          |
|-| project_details          | Additional project details                                                  |                                              |
|-| other_notes              | Any other notes                                                             | PTC-generated 21465 seedless variety         |
|-| rdss_location            | Research data storage location (different from data_location)               | \\rstore.qut.edu.au\Projects\ULJQSK8720\... |
|-| run-id                   | Run ID from sequencing machine (manual input or barcode scan)               |      eg.          NGS_647_Maiko                              |

### Additional Columns (To Do)

| Column Name     | Description                  |
|-----------------|------------------------------|
| createdAt       | Date record was created      |
| updatedAt       | Date record was last updated |
| importedBy      | User who imported the data   |
| other plants??    | flexible data structure  |


## Project TODO List

### 1. Web Application

- Develop a dedicated interface for Andrew’s team:
  - Support **single** and **bulk** sample information input
  - No manual approval needed after data upload
  - Automatically detect duplicates based on unique `sample_name`
  - Allow additional sample columns in the UI; the system will automatically combine them into one readable and meaningful string for storage

- User Roles:
  - Admin
  - Biologist
  - Bioinformatician
  - View-only

- Implement full audit logging:
  - Record `createdBy`, `updatedBy`, `createdAt`, and `updatedAt` for every record

### 2. Database Table – Sample Information (Biologists)

- Plants have a unique identifier; each **sample** represents a specific block/section/part of a plant
- Sample names are defined by Andrew’s team
  - If a sample name does not follow the agreed naming convention, display a warning and prompt the user to link it correctly
  - **Naming convention example**: `b44r63nrane`
    - `B` = Block number
    - `R` = Row number
    - `T` = Tree number
    - `S/N/E/W` = Direction (South, North, East, West, etc.)

- Add `sample_collection_date` to help track sample origin
- Rename `parent` → `parents` (support single or multiple parents)
- Support multiple values for:
  - `species/variety`
  - `phenotype/treatment`
    - One plant can have multiple samples with different phenotypes or treatments (e.g., seedless vs. seeded)

### 3. Database Table – Sequence Information (Bioinformaticians)

- Record the date when sequence data arrived
- Support flexible/various downstream pipeline information
- Allow the same sample to be sequenced multiple times (different machines, technologies, or runs)
- Store sequence run information separately as it is generally more stable


