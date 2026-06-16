## Overview
This page is used to design Plant item. the values of plant1 and plant2 extracted from excel. These items will be linked to sample item.

| #  | baseVariety | plantCode | subType     | isIrradiated | irradiationDose | Suggested displayName                              | Original Entry |
|----|-------------|------------|-------------|--------------|-----------------|----------------------------------------------------|----------------|
| 1  | Murcott     | 21465      | Bud         | true         | -               | 21465 Murcott (irradiated bud)                     | 21465 (irradiated Murcott bud) |
| 2  | Daisy       | -          | -           | false        | -               | Daisy                                              | Daisy |
| 3  | Fortune     | -          | -           | false        | -               | Fortune                                            | Fortune |
| 4  | Grace       | -          | Seed        | true         | -               | Grace (irradiated seed)                            | Grace (irradiated seed) |
| 5  | Grace       | -          | Seed        | false        | -               | Grace (seed)                                       | Grace (seed) |
| 6  | Grace       | -          | Mother      | false        | -               | Grace Mother                                       | Grace Mother |
| 7  | Grace       | -          | Seedling    | false        | -               | Grace seedling                                     | Grace seedling |
| 8  | Minneola    | -          | -           | false        | -               | Minneola                                           | Minneola |
| 9  | Murcott     | -          | -           | false        | -               | Murcott                                            | Murcott |
| 10 | Murcott     | -          | Bud         | true         | -               | Murcott (irradiated bud)                           | Murcott (irradiated bud) |
| 11 | Murcott     | -          | Bud         | true         | 35Gy            | Murcott (irradiated bud) 35Gy                      | Murcott (irradiated bud) Irradiation dose 35Gy |
| 12 | Murcott     | -          | Bud         | true         | 45Gy            | Murcott (irradiated bud) 45Gy                      | Murcott (irradiated bud) Irradiation dose 45Gy |
| 13 | Murcott     | -          | Bud         | true         | 55Gy            | Murcott (irradiated bud) 55Gy                      | Murcott (irradiated bud) Irradiation dose 55Gy |
| 14 | Murcott     | -          | Bud         | true         | 65Gy            | Murcott (irradiated bud) 65Gy                      | Murcott (irradiated bud) Irradiation dose 65Gy |
| 15 | Murcott     | -          | Bud         | true         | 75Gy            | Murcott (irradiated bud) 75Gy                      | Murcott (irradiated bud) Irradiation dose 75Gy |
| 16 | Murcott     | -          | Seed        | true         | -               | Murcott (irradiated seed)                          | Murcott (irradiated seed) |
| 17 | Murcott     | -          | -  | true         | -               | Murcott (irradiated)                               | Murcott (irradiated) |
| 18 | Nova        | -          | -           | false        | -               | Nova                                               | Nova |
| 19 | Phoenix     | -          | Bud         | true         | -               | Phoenix (Irradiated bud)                           | Phoenix (Irradiated bud) |
| 20 | Phoenix     | -          | Seed        | true         | -               | Phoenix (irradiated seed)                          | Phoenix (irradiated seed) |
| 21 | Murcott     | -          | Wild Type   | false        | -               | WT Murcott                                         | WT Murcott |


## items
around 20 items will be created, each items with compulsary attributes, eg.

- Plant item for "Murcott (irradiated bud)	Irradiation dose 75Gy", (assume code is 21466)

```
{
  "pKey": "PLANT#PL21466", 
  "sKey": "#METADATA",
  "EntityType": "Plant",
  "GenusSpecies":"Citrus reticulata x Citrus sinensis"
  
  "baseVariety": "Murcott",
  "plantCode": "PL21466",
  "displayName": "PL21466 Murcott Bud (Irradiation dose 75Gy)",
  "isIrradiated": true,
  "subType": "Bud",
  "irradiationDose": "75Gy"

  "createdAt": "2026-06-15T...",
  "createdBy": "Andrew Miles",
  "importedBy": "USER#christina_xu"

}
```
- Plant item for "Grace Mother" missing plantCode, createdBy, isIrradiated etc. But it is ok in DDB
  
```

{
  "pKey": "PLANT#Grace#Mother",
  "sKey": "#METADATA",
  "EntityType": "Plant",
  "GenusSpecies/taxon":"Citrus reticulata x Citrus sinensis"
  "baseVariety": "Grace",
  "displayName": "Grace Mother",
  "subType": "Mother"
  "importedBy": "USER#christina_xu"
}
```
## link items
assume PLANT#PL21466 have two phenotype: 
- Link 1: Plant → ABS Phenotype
  ```
    {
      "pKey": "PLANT#21466",
      "sKey": "PHENOTYPE#PH00001",
      "EntityType": "PlantPhenotype",
      "relationshipType": "hasPhenotype",
      "createdAt": "2026-06-16T...",
      "createdBy": "USER#christina_xu"
    }
  ```
- Link 2: Plant → Seed Phenotype
  ```
    {
        "pKey": "PLANT#21466",
        "sKey": "PHENOTYPE#PH00010",
        "EntityType": "PlantPhenotype",
        "relationshipType": "hasPhenotype",
        "createdAt": "2026-06-16T...",
        "createdBy": "USER#christina_xu"
    }
  ```
  - QUery: Get Plant + All its Phenotypes
  ```
    response = table.query(
        KeyConditionExpression="pKey = :pk AND begins_with(sKey, :prefix)",
        ExpressionAttributeValues={
            ":pk": "PLANT#21466",
            ":prefix": "PHENOTYPE#"
        }
    )
  ```
