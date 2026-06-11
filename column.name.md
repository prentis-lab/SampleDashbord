# Sample Metadata Columns

|belongs| Column Name              | Description                                                                 | Example                                      |
|-|--------------------------|-----------------------------------------------------------------------------|----------------------------------------------|
|-| mollecure                   | DNA / RNA  (unsorted as warning)                                                   | dna                                          |
|-| library type          | illumina / nanopore / HiFi / pacbio / rnaseq / unknown                     | illumina                                     |
|-| group                    | citrus / mango / others                                                     | citrus                                       |
|-| record id                | UUID (0-9, a-z, 10 characters)                                              | (e.g. `a1b2c3d4e5`)                          |
| biological| sample_name              | Any pattern                                                                 | Juice vesicle cell line #1                   |
| biological| notes              | more sample info note                                                            | Juice vesicle cell line #1                   |
| biological |parent_1                 | Parent 1                                                                    | Murcott (irradiated)                         |
| biological| parent_2                 | Parent 2 (both, single, or empty)                                           | .                                            |
| biological| species/variety          | Species or variety (more specific than group)                               | Citrus reticulata (21465)                    |
| biological| phenotype/treatment      | Phenotype or treatment    (need flixible for more treatment)                                                  | Susceptible                                  |
| biological| tissue_sampled           | leaf / stem / flower / root / seed / callus / fruit                        | Callus                                       |
| biological| date                     | when the sample collected                | 45717                                        |
|-| data_location            | Sequence data location (file system path)                                   | /work/ePGL/sequencing/dna/illumina/citrus/NGS_647_Maiko |
|-| file_prefix              | Meaningful and unique file prefix      (follow pattern)                                     | Maiko_1_S1                                   |
|-| project_leaders          | Project leaders (multiple allowed)                                          | Andrew Miles; Alexie Papanicolaou; Peter Prentis |
|-| project_investigators    | Project investigators (first.last format, auto-created from email)          | Maiko Kato / Zachary Stewart                 |
|-| project_id               | Project identifier                                                          | MaikoHistogenLayers                          |
|-| project_details          | Additional project details                                                  |                                              |
|-| other_notes              | Any other notes                                                             | PTC-generated 21465 seedless variety         |
|-| rdss_location            | Research data storage location (different from data_location)               | \\rstore.qut.edu.au\Projects\ULJQSK8720\... |
|-| run-id                   | Run ID from sequencing machine (manual input or barcode scan)               |      eg.          NGS_647_Maiko                              |

### sample name



### Additional Columns (To Do)

| Column Name     | Description                  |
|-----------------|------------------------------|
| createdAt       | Date record was created      |
| updatedAt       | Date record was last updated |
| importedBy      | User who imported the data   |
| other plants??    | flexible data structure  |


### todo list
- web application 
  - another interface for andrew team
     - eg. input sample information single or bulk
     - no need approval after data uploads but check whether it is duplicated or not based on sample name unique or not
     - list more clolumns for the sample, software will convert them into a single readable and meaningful string
  - users: admin, biologist, bioinformatics, view only,
  - record who created, updated these records  
- DB table for biologist to store sample information
  - plant have uniqe name, then sample may be a block of the plant
  - sample name will be decided by Andrew team, if not follow pattern then show warning to identify which plant to link
      -ask the sample name convention/pattern: eg. b44r63nrane
        - B: block number
        - R: row number
        - T: tree number
        - S/N/E/W: south etc
  - date for sample collection, it can be used to track where the sample from
  - change parent to parents, allow single or multi parents
  - Species/Variety and phenotype/treatment allows multi value, eg. various treatments with various attributes
      - one plant or plant body may have multi samples, eg. with different treatments
      - phenoty are various, eg. seedless, seeding
- DB table for bioinformatic to store sequence information
  - date for sequence data arrived
  - downstream pipeline information will be various
  - same sample may be sequened by different machine
  - sequence run infromation are more stable
  
