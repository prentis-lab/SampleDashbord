# Sample Metadata Columns

| Column Name              | Description                                                                 | Example                                      |
|--------------------------|-----------------------------------------------------------------------------|----------------------------------------------|
| type                     | DNA / RNA  (unsorted as warning)                                                   | dna                                          |
| technology               | illumina / nanopore / HiFi / pacbio / rnaseq / unknown                     | illumina                                     |
| group                    | citrus / mango / others                                                     | citrus                                       |
| sample_id                | UUID (0-9, a-z, 10 characters)                                              | (e.g. `a1b2c3d4e5`)                          |
| sample_name              | Any pattern                                                                 | Juice vesicle cell line #1                   |
| parent_1                 | Parent 1                                                                    | Murcott (irradiated)                         |
| parent_2                 | Parent 2 (both, single, or empty)                                           | .                                            |
| species/variety          | Species or variety (more specific than group)                               | Citrus reticulata (21465)                    |
| phenotype/treatment      | Phenotype or treatment    (need flixible for more treatment)                                                  | Susceptible                                  |
| tissue_sampled           | leaf / stem / flower / root / seed / callus / fruit                        | Callus                                       |
| date                     | Sequence arrival date, analysis date, or record created date                | 45717                                        |
| data_location            | Sequence data location (file system path)                                   | /work/ePGL/sequencing/dna/illumina/citrus/NGS_647_Maiko |
| file_prefix              | Meaningful and unique file prefix                                           | Maiko_1_S1                                   |
| project_leaders          | Project leaders (multiple allowed)                                          | Andrew Miles; Alexie Papanicolaou; Peter Prentis |
| project_investigators    | Project investigators (first.last format, auto-created from email)          | Maiko Kato / Zachary Stewart                 |
| project_id               | Project identifier                                                          | MaikoHistogenLayers                          |
| project_details          | Additional project details                                                  |                                              |
| other_notes              | Any other notes                                                             | PTC-generated 21465 seedless variety         |
| rdss_location            | Research data storage location (different from data_location)               | \\rstore.qut.edu.au\Projects\ULJQSK8720\... |
| run-id                   | Run ID from sequencing machine (manual input or barcode scan)               |                                              |

### Additional Columns (To Do)

| Column Name     | Description                  |
|-----------------|------------------------------|
| createdAt       | Date record was created      |
| updatedAt       | Date record was last updated |
| importedBy      | User who imported the data   |
| other plants??    | flexible data structure  |
