## Overview
This page is used to design Plant item. the values of parent1 and parent2 extracted from excel are
```
.	.
21465 (irradiated Murcott bud)	.
Daisy	.
Fortune	.
Grace (irradiated seed)	.
Grace (seed)	.
Grace Mother	.
Grace Mother 	.
Grace seedling	.
Minneola	.
Murcott	.
Murcott (irradiated bud)	.
Murcott (irradiated bud)	Irradiation dose 35Gy
Murcott (irradiated bud)	Irradiation dose 45Gy
Murcott (irradiated bud)	Irradiation dose 55Gy
Murcott (irradiated bud)	Irradiation dose 65Gy
Murcott (irradiated bud)	Irradiation dose 75Gy
Murcott (irradiated seed)	.
Murcott (irradiated)	.
Nova	.
Phoenix (Irradiated bud)	.
Phoenix (irradiated seed)	.
WT Murcott	.
```
## items
around 20 items will be created, each items with compulsary attributes, eg.

- Plant item for "Murcott (irradiated bud)	Irradiation dose 75Gy", (assume code is 21466)

```
{
  "pKey": "PLANT#Murcott#21466",           // Best balance
  "sKey": "#METADATA",
  "EntityType": "Plant",
  "GenusSpecies":"Citrus reticulata x Citrus sinensis"
  
  "baseVariety": "Murcott",
  "parentCode": "21466",
  "displayName": "21466 Murcott Bud (Irradiation dose 75Gy)",
  "isIrradiated": true,
  "subType": "Bud",
  "irradiationDose": "75Gy"

  "createdAt": "2026-06-15T...",
  "createdBy": "Andrew Miles",
  "importedBy": "USER#christina_xu"

}
```
- Plant item for "Grace Mother" missing parentCode, createdBy, isIrradiated etc. But it is ok in DDB
  
```

{
  "pKey": "PLANT#Grace#Mother",
  "sKey": "#METADATA",
  "EntityType": "Plant",
  "GenusSpecies":"Citrus reticulata x Citrus sinensis"
  "baseVariety": "Grace",
  "displayName": "Grace Mother",
  "subType": "Mother"
  "importedBy": "USER#christina_xu"
}
```
