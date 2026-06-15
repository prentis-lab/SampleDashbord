
## Enum Definitions Overview
the EnumDefinition items will be created and stored in DDB, which won't link to any sample/data items, but for web application to validate the input type.

| fieldName       | displayName (Suggested)     | possibleValues                                      | Description |
|-----------------|-----------------------------|-----------------------------------------------------|-----------|
| `tissueFrom`    | Tissue Sampled From         | `leaf`, `stem`, `flower`, `root`, `seed`, `callus`, `fruit` | Type of plant tissue collected for the sample |
| `stageOn`       | Developmental Stage         | `Mature`, `juvenile`                                | Sample developmental stage |
| `libraryType`   | Library Type                | `illumina`, `nanopore`, `HiFi`, `pacbio`, `rnaseq`, `unknown` | Sequencing library preparation type |
| `moleculeType`      | Molecule Type               | `DNA`, `RNA`                                        | Type of molecule (DNA or RNA) |


## Enum Definitions Items
-  Tissue Sampled From (may rename to tissueFrom)
```
{
  "PartitionKey": "METADATA#Enum#tissueFrom",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "tissueFrom",
  "possibleValues": ["leaf", "stem", "flower", "root", "seed", "callus", "fruit"],
  "description": "Type of plant tissue collected for the sample"
}
```

- Sample Developmental Stage (may rename to developStage)
```
{
  "PartitionKey": "METADATA#Enum#growthStage",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "stageOn",
  "possibleValues": ["Mature", "juvenile"],
  "description": "Sample Developmental stage of the sample"
}
```

- Library Type
```
{
  "PartitionKey": "METADATA#Enum#libraryType",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "libraryType",
  "possibleValues": ["illumina", "nanopore", "HiFi", "pacbio", "rnaseq", "unknown"],
  "description": "Sequencing library preparation type"
}

```

- Molecule Type
```
 {
  "PartitionKey": "METADATA#Enum#moleculeType",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "moleculeType",
  "possibleValues": ["DNA", "RNA"],
  "description": "Type of molecule (DNA or RNA)"
}
```

- there are enum definition in phenotype items, but they are linked to sample or plant, hence we won't list them here.
