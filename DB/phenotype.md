## overview 
This page is used to design phenotype item, and link them to plant (maybe sample).

|phenotype| Description          | Category              | Possible Values                          |  
|---|-------------------------|-----------------------|------------------------------------------| 
|abs| Alternaria brown spot   | Disease Resistance    | susceptible / tolerant / resistant |  
|seed| Fruit seed count        | Fruit Quality         | wildtype / reduced / low      |  
|rind| Rind colour             | Fruit Appearance      | wildtype / improved / high   | 
|dwarf| dwarf                   | Plant Architecture    | wildtype / dwarf               |  
|juvenility| short juvenility        | Growth Habit          | wildtype / short              |  

## create main items
- item for Alternaria Brown Spot
```
{
  "pKey": "PHENOTYPE#PH00001",        
  "sKey": "#METADATA",
  "EntityType": "Phenotype",
  
  "phenotypeCode": "PH00001",
  "phenotypeName": "ABS",
  "displayName": "ABS (Alternaria Brown Spot)",
  "description": "Alternaria Brown Spot",
  "category": "Disease Resistance",
  "possibleValues": ["susceptible", "tolerant", "resistant", "unknown"],
  "defaultValue": "susceptible",
  
  "createdAt": "2026-06-16T...",
  "createdBy": "USER#AM",
  "importedBy": "USER#Christina_xu"
}

```

- Fruit Seed Count
```
{
  "pKey": "PHENOTYPE#PH00010",
  "sKey": "#METADATA",
  "EntityType": "Phenotype",
  
  "phenotypeCode": "PH00010",
  "phenotypeName": "seed",
  "description":  "Fruit Seed Count",
  "displayName": "seed (Fruit Seed Count)",
  "category": "Fruit Quality",
  "possibleValues": ["wildtype", "reduced", "low", "unknown"],
  "defaultValue": "low",
  
  "createdAt": "2026-06-16T...",
  "createdBy": "USER#AM",
  "importedBy": "USER#Christina_xu"
}
```

- item of Rind Colour
```
{
  "pKey": "PHENOTYPE#Rind-Colour",
  "sKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "Rind colour",
  "category": "Fruit Appearance",
  "possibleValues": ["wildtype", "improved", "high", "unknown"],
  "defaultValue": "wildtype",
  "displayName": "Rind Colour"
}
```

- item of Dwarf
```
{
  "pKey": "PHENOTYPE#Dwarf",
  "sKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "dwarf",
  "category": "Plant Architecture",
 "possibleValues": ["wildtype", "dwarf", "unknown"],
  "defaultValue": "dwarf",
  "displayName": "Dwarf"
}
```

- item of Short Juvenility
```
{
  "pKey": "PHENOTYPE#Short-Juvenility",
  "sKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "short juvenility",
  "category": "Growth Habit",
  "possibleValues": ["wildtype", "short", "unknown"],
  "defaultValue": "short",
  "displayName": "Short Juvenility"
}
```

## link itmes
- example - one sample linked to 2 phenotypes
```
// Link 1 to overwrite the default value
{
  "pKey": "SAMPLE#S12345",
  "sKey": "PHENOTYPE#Alternaria-Brown-Spot",
  "EntityType": "SamplePhenotype",
  "phenotypeName": "Alternaria brown spot",
  "value": "tolerant"
}

// Link 2 to use default value
{
  "pKey": "SAMPLE#S12345",
  "sKey": "PHENOTYPE#Dwarf",
  "EntityType": "SamplePhenotype",
  "phenotypeName": "dwarf",
}

```
- example of query: Get one Sample + All its Phenotypes

```
response = table.query(
    KeyConditionExpression="pKey = :pk AND begins_with(sKey, :prefix)",
    ExpressionAttributeValues={
        ":pk": "SAMPLE#S12345",
        ":prefix": "PHENOTYPE#"
    }
)

```
## item validation
DynamoDB is schemaless — it does not validate attribute names or values. So your item will be stored exactly even if typos exists. eg.
`"phenotypeNae": "Alternaria brown drawf",   // ← Typo in key name`

- Consequences of typo
    - Your application code looking for phenotypeName will not find the value
    - Data is incorrect. Later queries/filters will return wrong results (drawf)
- Best Practice to Avoid This in Future
  - Always double-check attribute names before inserting.
  - Use conditional writes or check first if the item already exists.
  - Consider adding basic validation in your application code before writing to DDB.
- you could also simplize the linked item, but may have to query second time after get the phenotype details. to increase the query efficiency, it is better to put most frequent access information in the item (Denormalization)
