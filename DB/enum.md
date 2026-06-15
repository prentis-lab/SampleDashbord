## purchase
the EnumDefinition items will be created and stored in DDB, which won't link to any sample/data items, but for web application to validate the input type.

- Tissue Sampled (may rename to tissueFrom)
```
{
  "PartitionKey": "METADATA#Enum#tissue_sampled",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "tissue_sampled",
  "displayName": "Tissue Sampled",
  "possibleValues": ["leaf", "stem", "flower", "root", "seed", "callus", "fruit"],
  "defaultValue": "leaf",
  "description": "Type of plant tissue collected for the sample"
}
```

- Sample Developmental Stage (may rename to developStage)
```
{
  "PartitionKey": "METADATA#Enum#developmental_stage",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "developmental_stage",
  "displayName": "Developmental Stage",
  "possibleValues": ["Mature", "juvenile"],
  "defaultValue": "juvenile",
  "description": "Developmental stage of the sample"
}
```

- Sample Purpose 

```
{
  "PartitionKey": "METADATA#Enum#sample_purpose",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "sample_purpose",
  "displayName": "Sample Purpose",
  "possibleValues": ["Gene expression experiment", "Breeding", "Disease screening", "Phenotyping", "Other"],
  "defaultValue": "Other",
  "description": "Purpose of collecting this sample"
}
```

- Library Type
```
{
  "PartitionKey": "METADATA#Enum#library_type",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "library_type",
  "displayName": "Library Type",
  "possibleValues": ["illumina", "nanopore", "HiFi", "pacbio", "rnaseq", "unknown"],
  "defaultValue": "unknown",
  "description": "Sequencing library preparation type"
}

```

- Molecule Type
```
 {
  "PartitionKey": "METADATA#Enum#molecule",
  "SortKey": "#DEFINITION",
  "EntityType": "EnumDefinition",
  "fieldName": "molecule",
  "displayName": "Molecule Type",
  "possibleValues": ["DNA", "RNA", "unknown"],
  "defaultValue": "unknown",
  "description": "Type of molecule (DNA or RNA)"
}
```

- there are enum definition in phenotype items, but they are linked to sample or plant, hence we won't list them here.
