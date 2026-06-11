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
- decided by Andrew team, if not follow pattern then show warning
  - B: block number
  - R: row number
  - T: tree number
  - S/N/E/W: south etc
- to identify which plant to link
- eg. eg. b44r63nrane
- each plant have uniq name, then sample be block of the plant
- ask the sample name convention/pattern: sample name not always


### Additional Columns (To Do)

| Column Name     | Description                  |
|-----------------|------------------------------|
| createdAt       | Date record was created      |
| updatedAt       | Date record was last updated |
| importedBy      | User who imported the data   |
| other plants??    | flexible data structure  |


#### notes
- same sample may sequence with different machine
- biology table: more flexible
  - phenoty talbe various : eg. seedless, seeding
  - 2 sample
  - one plant may multi sample id
- sequence table: more fixed
  - one sample with multi runs
- Species/Variety : now item may coming
- parent to parents 

### another interface for andrew team
- input sample information single or bulk 
