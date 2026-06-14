- composite keys, sort keys, and item types.
- Partition Key (PK) and Sort Key (SK) must be defined when create table. other attribute no need defined, can change at any time.
- GSI = Global Secondary Index: "Copy these attributes into a new index and use them as keys"
- The main table uses PK + SK.
- You can have up to 20 GSIs per table.
    - eg. Add radio to the Plant item (as we discussed before).
    - Denormalize (copy) the radio value into every Sample item that belongs to that plant.
    - Add two new attributes in Sample items for the GSI:
      ```
        // Sample Item Example
        {
          "PK": "PLANT#P123",
          "SK": "SAMPLE#2025-06-10#S456",
          
          "radio": true,                    // ← copied from Plant
          
          "GSI_Radio_PK": true,             // ← GSI Partition Key
          "GSI_Radio_SK": "SAMPLE#2025-06-10#S456",   // ← GSI Sort Key (for sorting)
          
          "tissue": "tissueAA",
          ...
        }
      // query by python
      response = table.query(
            IndexName="GSI_Radio",
            KeyConditionExpression="#radio = :r",
            ExpressionAttributeNames={"#radio": "GSI_Radio_PK"},
            ExpressionAttributeValues={":r": True}
        )
      ```
```mermaid
erDiagram
    PLANT {
        string PPK "PLANT#plant_id"
        string SK "#METADATA"
        boolean radio
    }

    SAMPLE {
        string PPK "PLANT#plant_id"
        string SK "SAMPLE#date#sample_id"
        boolean radio
        string GSI_Radio_PK "true or false"
        string GSI_Radio_SK "SAMPLE#date#sample_id"
        string tissue
    }

    PLANT ||--o{ SAMPLE : "has"
```

## design
```mermaid
erDiagram
    PLANT {
        string PPK "PLANT#plant_id"
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
        string PPK "PLANT#plant_id"
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
        string PPK "PROJECT#project_id"
        string SK "#METADATA"
        string GSI1PK "PROJECT#project_id"
        string description
        string chief_investigator
        string team_members
    }

    DATA {
        string PPK "PLANT#plant_id"
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
