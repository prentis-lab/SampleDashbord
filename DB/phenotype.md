## overview 
This page is used to design phenotype item, and link them to samples

- possible phenotype are

| Phenotype                      | Possible Values                          |
|--------------------------------|------------------------------------------|
| Alternaria brown spot          | susceptible / tolerant / resistant / unknown |
| Fruit seed count               | wildtype / reduced / low / unknown      |
| Rind colour                    | wildtype / improved / high / unknown    |
| dwarf                          | wildtype / dwarf / unknown               |
| short juvenility               | wildtype / short / unknown               |

- item for Alternaria Brown Spot
```
{
  "PartitionKey": "PHENOTYPE#Alternaria-Brown-Spot",
  "SortKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "Alternaria brown spot",
  "category": "Disease Resistance",
  "possibleValues": "susceptible/tolerant/resistant/unknown",
  "defaultValue": "susceptible",
  "displayName": "Alternaria Brown Spot"
}

```

- Fruit Seed Count
```
{
  "PartitionKey": "PHENOTYPE#Fruit-Seed-Count",
  "SortKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "Fruit seed count",
  "category": "Fruit Quality",
  "possibleValues": "wildtype/reduced/low/unknown",
  "defaultValue": "low",
  "displayName": "Fruit Seed Count"
}
```

- item of Rind Colour
```
{
  "PartitionKey": "PHENOTYPE#Rind-Colour",
  "SortKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "Rind colour",
  "category": "Fruit Appearance",
  "possibleValues": "wildtype/improved/high/unknown",
  "defaultValue": "wildtype",
  "displayName": "Rind Colour"
}
```

- item of Dwarf
```
{
  "PartitionKey": "PHENOTYPE#Dwarf",
  "SortKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "dwarf",
  "category": "Plant Architecture",
  "possibleValues": "wildtype/dwarf/unknown",
  "defaultValue": "dwarf",
  "displayName": "Dwarf"
}
```

- item of Short Juvenility
```
{
  "PartitionKey": "PHENOTYPE#Short-Juvenility",
  "SortKey": "#METADATA",
  "EntityType": "Phenotype",
  "phenotypeName": "short juvenility",
  "category": "Growth Habit",
  "possibleValues": "wildtype/short/unknown",
  "defaultValue": "short",
  "displayName": "Short Juvenility"
}
```
