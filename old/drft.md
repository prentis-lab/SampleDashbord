```mermaid
erDiagram
    PLANT {
        string PK "PLANT#plant_id"
        string SK "#METADATA"
        string GSI1PK "TAXON#taxon"
        string GSI1SK "variety#plant_id"
        string parent_1
        string parent_2
        string taxon
        string variety
        string abs
        string seed
        string rind
        string dwarf
        string juvenility
        string notes
    }

    SAMPLE {
        string PK "PLANT#plant_id"
        string SK "SAMPLE#date#sample_id"
        string GSI2PK "PROJECT#project_id"
        string GSI2SK "SAMPLE#date#sample_id"
        string sample_id
        string collector_name
        string tissue
        string developmental_stage
        string treatment
        string location
        string country
        string notes
    }

    PROJECT {
        string PK "PROJECT#project_id"
        string SK "#METADATA"
        string GSI1PK "PROJECT#project_id"
        string description
        string chief_investigator
        string team_members
    }

    DATA {
        string PK "PLANT#plant_id"
        string SK "DATA#molecule#date#data_id"
        string GSI2PK "PROJECT#project_id"
        string GSI2SK "DATA#molecule#date#data_id"
        string data_id
        string hpc_location
        string rdss_location
        string file_prefix
        string molecule
        string library
        string md5
    }

    PLANT ||--o{ SAMPLE : "has many"
    PLANT ||--o{ DATA : "has many"
    PROJECT ||--o{ SAMPLE : "contains"
    PROJECT ||--o{ DATA : "contains"
```
