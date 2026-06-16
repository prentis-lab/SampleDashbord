## load sample to DDB
there are about 600 samples including 10 of them without sample id or name.
- sample can only link to one plant
- sample can link to multi projects, and multi sequence data
- sequence data can only link to one sample
- one plant can has multi-phenotype; one phenotyp item can link to many plant


## item
```
{
  "pKey": "SAMPLE#S00060",
  "sKey": "#METADATA",
  "EntityType": "Sample",
  "sampleCode": "S00060",
  "sampleLabel":"11.6.26-1",

  "plantId": "PLANT#PL21466",    // only one plant
  "projectIds": ["PROJECT#PR00020", "PROJECT#PR00025"],  // Optional list

  "tissueFrom": "leaf",
  "developStage": "juvenile"
  "treatment": "???",
  "collectedOn": "2023-03",
  "location": "Bay 3, Row 6, Tree 52 south"
  "country":"Florida",
  "collectedBy":"Andrew Miles",
  "notes": "Juice vesicle cell line #1"
  "createdAt": "2026-06-16T...",
  "createdBy": "USER#Zachary_Stewart",
  "importedBy": "USER#christina_xu"
}
```

