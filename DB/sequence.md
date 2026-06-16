## load sequence to DDB
there are about 600 sequence data including 10 of them without sample id or name. Here each sample can be processed to different sequence process. 


## item
```
{
  "PartitionKey": "SEQUENCE#NGS-498-5_S5",
  "SortKey": "#METADATA",
  "EntityType": "SequenceData",
  "sample": "SAMPLE#NGS-498-5_S5",    //link
  "project":"PROJECT#HistogenLayersGenome2#PR00020" // (Denormalization)
  "plant": "PLANT#Murcott#21466",    // denormalization

  "libraryType/sequencer": "rnaseq",
  "molecule": "RNA",
  "hpcLocation": "/local/ePGL/sequencing/rna/data/ok/Pete_NGS_498",
  "rdssLocation": "\\rstore.edu.au\Projects\ULWWWW\Superior Program\SUPER Data - to be sorted\2025-03-01 NGS_AAA_444 WGS",
  "md5/runid":"...",
  "notes": "Juice vesicle cell line #1"
  "createdAt": "2026-06-16T...",
  "createdBy": "USER#Zachary_Stewart",
  "importedBy": "USER#christina_xu"
}
```
